# Accounting Integrity — Full Specification

> Status: **planned — not yet built**
> Written: March 2026
> Pick this up when ready; implement in phases (each phase ships independently).

---

## The Problem

The current system is single-entry. Payments and charges are recorded as independent
documents. Nothing structurally prevents a payment from being silently deleted,
edited to the wrong year, or allocated to the wrong family — and if it happens,
the audit log records the event but the financial impact is already done.

Specific failure modes we want to eliminate:

- Admin accidentally deletes a payment → family balance jumps with no paper trail of why
- Payment saved with wrong `appliedYear` → shows up in wrong year's P&L
- Payment saved with wrong `familyId` → one family overpays, another looks delinquent
- Firestore document corruption / partial write → one side of a transaction lands, the other doesn't
- No way to prove at any moment that the books are balanced

---

## Design Principles

1. **Additive, not replacement.** The existing payments/enrollments data model stays.
   The journal is a parallel verification layer — existing balance calculations continue
   to work. We can always cross-check journal totals against `computeFamilyBalances`.

2. **Immutability first.** The single highest-value change is making payments immutable.
   Void-and-reverse instead of edit-or-delete. This alone eliminates most data loss risk.

3. **Atomic writes.** Every financial event that touches the journal uses a Firestore
   batch write — debit and credit land together or not at all. No half-written
   transactions.

4. **Phased delivery.** Each phase is independently valuable and ships on its own.
   Phase 1 is safe to build any time. Later phases build on it.

5. **Grow safety.** No changes to enrollment creation, `buildMonthlyCharges`,
   `computeFamilyBalances`, or any existing data. Purely additive.

---

## Chart of Accounts

A minimal account structure that covers all microschool financial events:

| Code | Account | Type | Normal balance |
|------|---------|------|---------------|
| 1100 | Cash / Bank | Asset | Debit |
| 1200 | Accounts Receivable | Asset | Debit |
| 1210 | StepUp Receivable | Asset | Debit |
| 2100 | Deferred Revenue | Liability | Credit |
| 4100 | Tuition Revenue — Core Program | Revenue | Credit |
| 4110 | Tuition Revenue — Enrichment | Revenue | Credit |
| 4120 | Tuition Revenue — Other | Revenue | Credit |
| 4200 | Flat Charge Revenue | Revenue | Credit |
| 5000 | Expense — [category] | Expense | Debit |

Revenue accounts are created per-program dynamically (4100–4199 range).
Expense accounts mirror the existing expense categories.

The chart of accounts is stored in `{slug}-chart-of-accounts` and editable
in Setup. A default set is seeded on first use.

---

## The Journal

### Firestore document

`{slug}-journal` — array of journal entries, same split-doc pattern as enrollments
(`{slug}-journal-a` / `{slug}-journal-b`) if the 1MB limit is approached.

Each entry:

```js
{
  id:          'je-uuid',
  date:        '2026-03-15',            // ISO date of the economic event
  createdAt:   '2026-03-15T14:32:00Z', // wall-clock timestamp of the write
  type:        'payment',               // see Event Types below
  memo:        'March payment — Smith family',
  sourceId:    'pmt-uuid',             // ID of the source record (payment, enrollment, etc.)
  sourceType:  'payment',              // 'payment' | 'enrollment' | 'charge' | 'expense' | 'void'
  createdBy:   'admin@email.com',
  voidedBy:    null,                   // ID of the voiding journal entry, if voided
  lines: [
    { account: '1100', label: 'Cash',                 debit: 614.00, credit: 0 },
    { account: '1200', label: 'Accounts Receivable',  debit: 0,      credit: 614.00 },
  ]
}
```

**Invariant:** `sum(lines[].debit) === sum(lines[].credit)` must always hold.
Any entry that violates this is rejected before write.

### Event Types and their journal entries

**Enrollment created** (charges the family for the year):
```
Debit  1200  Accounts Receivable     annual tuition
Credit 4100  Tuition Revenue         annual tuition
```
One entry per enrollment. The AR debit equals exactly what the family owes.

**Deposit / monthly payment received** (manual payment):
```
Debit  1100  Cash                    payment amount
Credit 1200  Accounts Receivable     payment amount
```

**StepUp scholarship payment received:**
```
Debit  1210  StepUp Receivable       amount  (when recorded — not yet in bank)
Credit 1200  Accounts Receivable     amount
```
When the StepUp funds actually hit the bank (separate reconciliation step):
```
Debit  1100  Cash                    amount
Credit 1210  StepUp Receivable       amount
```

**Flat charge added:**
```
Debit  1200  Accounts Receivable     charge amount
Credit 4200  Flat Charge Revenue     charge amount
```

**Expense recorded:**
```
Debit  5000  Expense — [category]    amount
Credit 1100  Cash                    amount
```

**Payment voided** (reversing entry — exact mirror of original):
```
Debit  1200  Accounts Receivable     original amount   (reverses the credit)
Credit 1100  Cash                    original amount   (reverses the debit)
```
The voiding entry references `voidedBy: original-entry-id`.
The original entry gets `voidedBy: voiding-entry-id`.
Neither entry is ever deleted.

---

## Phase 1 — Immutable Payments

**What changes:** Payment edit and delete are replaced by void-and-reenter.

**UI changes:**
- PaymentModal: "Edit" button replaced by "Void & Correct" — this voids the original
  and opens a pre-filled new payment modal with the corrected values
- ManualPaymentsList: delete (trash icon) replaced by "Void" with a confirmation:
  *"This will mark the payment as voided. The record is kept permanently. Are you sure?"*
- Voided payments show in the list with a strikethrough and "VOIDED" badge; they
  contribute $0 to any balance calculation

**Data changes:**
- Add `voided: true` and `voidedAt` / `voidedBy` fields to payment records
- `computeFamilyBalances` already filters by `p.voided !== true` (add this guard)
- No journal entries yet — Phase 1 is purely behavioral

**Why this alone is valuable:** eliminates accidental-delete risk entirely. Deleted
payment → balance jumps + audit log shows deletion. Voided payment → balance adjusts
+ voided record is permanently visible in the payment list.

**Risk:** Low. No new Firestore collections. Only UI changes.

---

## Phase 2 — Journal Entries

**What changes:** Every financial event (enrollment created, payment recorded, payment
voided, flat charge added, expense recorded) atomically writes journal entries alongside
the existing record.

**Implementation:**

All write paths that touch financial data get a `writeWithJournal(batch, slug, record, journalEntry)` helper that:
1. Writes the source record (e.g. payment) in the batch
2. Validates `sum(debit) === sum(credit)` — throws if not
3. Writes the journal entry to `{slug}-journal-a` or `-b` in the same batch
4. Commits the batch atomically

Journal entries are write-once. The only mutation allowed is setting `voidedBy`
on an existing entry when a reversing entry is created (also in the same batch).

**Migration:** Existing records get a one-time "opening balance" journal entry per family
that captures the state as of the migration date. This is clearly labeled `type: 'opening-balance'`
and is never used in ongoing balance calculations — it's a snapshot only.

**Risk:** Medium. New Firestore collection. All payment/enrollment write paths touched.
Write tests for `writeWithJournal` before implementing.

---

## Phase 3 — Verify Books Tool

**What changes:** A "Verify Books" panel in Setup → Data Tools.

**What it checks:**

1. **Journal balances:** `sum(all debit lines) === sum(all credit lines)` across all
   non-voided journal entries. Any mismatch signals a corrupted or partial write.

2. **AR cross-check:** For each family, `sum(enrollment AR debits) - sum(payment credits)`
   from the journal should equal `computeFamilyBalances(familyId).totalAR`. Discrepancies
   are listed by family with amounts.

3. **Cash cross-check:** `sum(Cash debits from payments) - sum(Cash credits from voids)`
   should equal total payments recorded in `{slug}-payments`.

4. **Orphan check:** Any journal entry whose `sourceId` no longer exists in the source
   collection is flagged (the source record was deleted outside normal flow).

**UI:** A "Run Verification" button. Results show:
- ✅ Books balance — total debits, total credits, difference ($0.00)
- ✅ AR cross-check passed — N families verified
- ⚠️ 1 discrepancy found — Smith family: journal says $4,200 AR, balance calc says $3,800 AR

**Risk:** None — read-only. Safe to ship any time after Phase 2.

---

## Phase 4 — Period Closing

**What changes:** A month can be "closed" by an admin. Once closed, no new journal
entries with a date in that period can be written without an explicit override.

**Implementation:**
- `{slug}-closed-periods`: array of closed month strings, e.g. `['2025-06', '2025-07', ...]`
- `writeWithJournal` checks if `entry.date` falls in a closed period before writing;
  throws `period-closed` error if so
- UI: Finances → P&L → "Close Period" button per month row (admin only)
- Override: super-user can write to a closed period with an explicit reason field

**Why this matters:** Once June 2025 is closed, nobody can retroactively add or void
a payment dated June 2025 without an explicit correction entry. Prevents year-end
restatements and accidental backdating.

**Risk:** Medium. Changes workflow for admins who correct old payments. Needs clear UI
affordances for "this period is closed — do you want to create a correction entry?"

---

## What Stays the Same

- `computeFamilyBalances` — unchanged, continues to be the source of truth for UI balances
- `buildMonthlyCharges`, `calcDeposit` — unchanged
- All existing Firestore collections — unchanged
- All existing UI tabs and components — Phase 1 touches PaymentModal/ManualPaymentsList only
- Balance calculations in Collections, Home, portal — unchanged

The journal is a verification layer. If the journal says the balance is X and
`computeFamilyBalances` says the balance is Y, that's a flag to investigate —
not a reason to change how balances are displayed.

---

## Implementation Order

```
Phase 1: Immutable payments          ← build first, safe, high value
Phase 2: Journal entries             ← build after Phase 1 is stable
Phase 3: Verify Books tool           ← build immediately after Phase 2
Phase 4: Period closing              ← optional, build when operationally needed
```

Do not skip to Phase 2 without Phase 1. An immutable payment system is a prerequisite
for a meaningful journal — otherwise voided entries would need to reflect records that
might have been physically deleted.

---

## Open Questions (resolve before building Phase 2)

1. **Revenue recognition timing:** Does tuition revenue recognize when the enrollment
   is created (all at once) or as each monthly charge comes due? For a cash-basis
   microschool, recognition at enrollment creation is fine. Accrual-basis would
   recognize monthly. Recommendation: cash-basis (simpler, matches how co-ops file).

2. **StepUp receivable:** When a StepUp payment is imported, the funds aren't in the
   bank yet — they're in a state portal. Do we want a separate `StepUp Receivable`
   account (1210) to track this, or just treat StepUp as Cash on import? Recommendation:
   separate receivable, with a "Mark as deposited" action when the funds arrive.

3. **Multi-year AR:** A family enrolled in both 2025-2026 and 2026-2027 has AR in both
   years. The journal needs to tag each AR entry with the school year so year-specific
   reports stay clean. Add `schoolYear` field to journal entry lines.

4. **Opening balance migration date:** What date do we call "day zero" for the journal?
   Options: (a) today — all historical data is an opening balance snapshot; (b) start
   of current school year — re-derive entries from existing records. Option (a) is safer.
