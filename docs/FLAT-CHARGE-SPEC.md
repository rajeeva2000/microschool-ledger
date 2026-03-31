# Flat Charge Type — Full Specification

> Status: **built and shipped** in branch `claude/build-flat-charge-feature-twGjS`. All steps 1–4 implemented and tests passing (44 unit tests). See `CHANGELOG.md` for the full list of changes.

---

## Target customers

The flat charge feature is designed for the **54.6% of StepUp providers** who sell classes and programs with a single flat fee, not annual tuition grids. Concretely:

| Provider type | Example | What they charge |
|---|---|---|
| PE provider | Gymnastics studio, swim school, martial arts | $200/semester, or $25/session |
| Elective course | Writing Workshop, Math Circle, Art class | $300/fall semester |
| After-school program | STEM club, debate, coding camp | $150 for a 6-week session |
| Co-op enrichment | A homeschool co-op running Friday classes | $75/class/semester + $50 registration fee |
| Hybrid microschool | Core curriculum (annual tuition) + electives (flat per-semester) | Mix of both |

The last row is the most important: **a single tenant may have some students on annual tuition (Grow's model) and others paying flat fees, or the same student may have both**. The flat charge system must coexist cleanly with the existing enrollment model.

---

## What a flat charge is

A flat charge is a financial obligation attached to a **family**, optionally linked to a student. It has:

- A description (free text, e.g. "Fall 2026 Writing Workshop")
- An amount (dollars)
- A due date (a specific date, or "on enrollment")
- An optional school year (for filtering in Reports and year-based balance views)
- An optional student link (for per-student charges like a course fee)
- A category (Tuition, Registration, Materials, Other)

It is **not** an enrollment. It has no `monthlyCharges` grid, no program, no payment plan. It is a simpler primitive: "this family owes us $X for this reason."

---

## What it is NOT

- Not a replacement for enrollments — Grow's annual tuition model stays exactly as-is
- Not a payment — charges are what's owed; payments (manual or StepUp) remain the credit side
- Not a recurring item — if a provider charges monthly, they use the existing enrollment + `paymentMonths` model

---

## Data model

### Firestore document: `{slug}-charges`

Single document containing an array, same pattern as `{slug}-payments`.

```js
// {slug}-charges document
{
  charges: [
    {
      id: 'chg-abc123',           // generated: 'chg-' + nanoid
      familyId: 'fam-xyz',        // required
      studentId: 'stu-xyz',       // optional — null for family-level charges
      description: 'Fall 2026 Writing Workshop',  // required, free text
      amount: 300.00,             // required, positive number
      dueDate: '2026-09-01',      // required, ISO date string
      schoolYear: '2026-2027',    // required for year-based filtering
      category: 'tuition',        // 'tuition' | 'registration' | 'materials' | 'other'
      createdAt: <timestamp>,
      createdBy: 'admin@example.com',
    },
    // ...
  ]
}
```

**Why a single document?** Consistent with how `{slug}-payments` and `{slug}-expenses` work. Firestore 1MB document limit is not a concern for charges (enrichment providers typically have dozens, not thousands, of charge records per year). If it ever becomes an issue, the same `-a`/`-b` split pattern used for enrollments applies.

**Grow impact:** Grow's `grow-charges` document will not exist until a charge is created. The app treats a missing document as an empty array. Zero impact on Grow's balance calculations or UI.

---

## Balance calculation changes

### Current logic (in `calculations.js → computeFamilyBalances`)

```
totalOwed = sum of all monthlyCharges across all enrollments
```

### New logic

```
totalOwed = sum of all monthlyCharges across all enrollments
          + sum of all flat charges for this family (filtered by schoolYear)
```

The `computeFamilyBalances` function gains a new optional `charges` parameter:

```js
computeFamilyBalances(familyId, schoolYearFilter,
  { students, enrollments, payments, stepUpPayments, charges = [] },
  now = new Date()
)
```

Flat charges are always "past due" once created (like `enrollment-reserve`) — there's no month-by-month drip. So they contribute to both `totalOwed` and `currentOwed` immediately.

```js
// New block inside computeFamilyBalances, after the enrollment loop:
const familyCharges = charges.filter(c =>
  c.familyId === familyId &&
  (schoolYearFilter === 'All Time' || c.schoolYear === schoolYearFilter)
);
familyCharges.forEach(c => {
  const amt = parseFloat(c.amount) || 0;
  totalOwed   += amt;
  currentOwed += amt;
});
```

**No other changes to `calculations.js`.** `buildMonthlyCharges`, `calcDeposit`, `getInvoiceNumber` are untouched.

---

## UI surface areas

### 1. New: `ChargeModal` — add / edit a flat charge

A simple modal with:
- Family selector (pre-filled when opened from a family card)
- Student selector (optional, scoped to that family's students; "Family-level" default)
- Description (text input)
- Amount (number input)
- Due date (date picker, defaults to today)
- School year (select, defaults to `selectedYear`)
- Category (select: Tuition / Registration / Materials / Other)
- Save / Cancel

No payment plan logic, no `buildMonthlyCharges`, no pricing rules lookup.

### 2. Updated: `FamilyCardV2` — charges list within the card

When a family has flat charges, show them in the card's detail view alongside enrollments. Each charge row:
- Description + category badge
- Amount + due date
- Edit / Delete icons (admin only)
- "Add Charge" button at the bottom of the section (opens `ChargeModal` pre-filled with this family)

If a family has no charges, the section is hidden entirely — Grow sees nothing new.

### 3. Updated: `InvoiceModal` — charges appear as line items

After the enrollment charges table, a second section "Other Charges" lists flat charges for the selected year. Each row:
- Description
- Due date
- Amount

The invoice total already sums from `computeFamilyBalances`; since charges now feed into that function, the total is automatically correct.

### 4. Updated: `CollectionsTab` — overdue balance includes charges

`getFamilyBalances` calls `computeFamilyBalances` which will now include charges. No changes needed in `CollectionsTab` itself — it already uses `totalAR` from `getFamilyBalances`.

### 5. Updated: `GrowERP` state — load `{slug}-charges`

`GrowERP` loads `charges` from Firestore on mount alongside families, students, enrollments, payments. Passes `charges` into `getFamilyBalances` and into `FamilyCardV2`, `InvoiceModal`, `CollectionsTab`.

---

## Build sequence

The steps below are ordered to keep Grow's app green at every commit. Each step is independently deployable.

### Step 1 — Data layer (no UI yet, no Grow impact)

1. Add `charges` state to `GrowERP` (`useState([])`)
2. Load `{slug}-charges` from Firestore on mount; write back on save (same pattern as payments)
3. Add `saveCharge(charge)` and `deleteCharge(id)` helpers that update Firestore + local state
4. Update `computeFamilyBalances` in `calculations.js` to accept and sum `charges`
5. Update the `getFamilyBalances` wrapper in `GrowERP` to pass `charges` through
6. **Tests:** add unit tests to `tests/calculations.test.js` covering:
   - Family with no charges — result identical to today
   - Family with one charge — `totalOwed` and `currentOwed` increase correctly
   - Family with charges filtered by `schoolYear` — only matching year included
   - `All Time` filter — all charges included regardless of year

**Commit checkpoint:** all existing tests still pass. Grow's balance display is pixel-identical — `charges` defaults to `[]`.

### Step 2 — `ChargeModal` component

1. Build `ChargeModal` (new component, ~80 lines)
2. Wire "Add Charge" button into `FamilyCardV2` detail view — visible only when family card is expanded
3. Wire edit/delete per charge row
4. **Tests (E2E):** add to `families.spec.js`:
   - Add a flat charge to a test family — appears in card
   - Edit charge — description and amount update
   - Delete charge — removed from card
   - Balance on family card increases by charge amount

**Commit checkpoint:** Grow has an "Add Charge" button they'll never click, hidden inside the expanded family detail view. No visual change at normal usage.

### Step 3 — `InvoiceModal` integration

1. Pass `charges` into `InvoiceModal`
2. Add "Other Charges" section after enrollment line items — renders only when `familyCharges.length > 0`
3. Verify invoice total matches `computeFamilyBalances` total
4. **Tests (E2E):** add to `collections.spec.js`:
   - Open invoice for family with a charge — charge appears as line item
   - Invoice total matches balance shown on family card

**Commit checkpoint:** Grow's invoices look identical — section is hidden when no charges exist.

### Step 4 — Audit log + export

1. Log charge create/update/delete events to `{slug}-audit-log` (same format as family/payment events)
2. Include flat charges in the family CSV export (new "Charges" sheet or appended rows)
3. **Tests:** audit log entry appears after charge creation (E2E)

---

## Grow safety checklist

Before each step ships:

- [ ] `npx jest` passes with no failures
- [ ] `npx playwright test` passes with no failures
- [ ] Open Grow's tenant in the app — no visible UI change unless a charge was deliberately added
- [ ] `computeFamilyBalances` with `charges = []` produces byte-for-byte identical output to today

---

## Open questions (resolve before building)

1. **Can a charge be partially paid?** Today, payments are credited against the family's total balance — there's no allocation to a specific charge line. For a first version, keep that model: charges increase the balance, payments reduce it, allocation is implicit. Explicit charge-level payment allocation is a future enhancement.

2. **Should charges appear in Reports → Revenue summary?** Probably yes, bucketed by `category`. Defer to the Reports session.

3. **Viewer role** — viewers should see charges but not be able to add/edit/delete. The existing viewer-role pattern applies; implement consistently with however that pattern is resolved.

4. **"On enrollment" due date** — for co-op registration fees due immediately when a family joins, `dueDate` defaults to today. No special handling needed; it's just a date.

---

## Validate before building

Before any code is written, talk to at least 2 enrichment providers from the StepUp directory (`stepup_providers_filtered.xlsx - stepup_providers.csv`). Key questions:

- "Walk me through how you bill a family for a semester class."
- "Do you charge registration or materials fees separately? How do you track those?"
- "What do you do when a family is in more than one class?"
- "What does your current invoicing look like?"

If the answers match the model above, proceed. If they reveal something unexpected (e.g. families want to pre-pay for multiple semesters at once, or providers need to issue refunds for dropped classes), update this spec before building.
