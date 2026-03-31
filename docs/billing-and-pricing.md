# Grow ERP — Billing & Pricing

**Last updated:** March 2026 (flat charges)

This document covers the canonical billing logic. Read it before touching any enrollment creation, charge calculation, or migration code.

---

## Two Authoritative Sources — Never Hardcode Dollar Amounts

| Source | Firestore key | What it controls |
|--------|--------------|-----------------|
| `pricingRules` | `grow-pricing-rules` | Annual tuition per **familyType × siblingPosition × programId × schoolYear** |
| `programs[].paymentPlansByYear[year][]` | `grow-programs` | Payment structure: `depositPct`, `depositMonth`, `paymentMonths`, `startMonth` |

If a dollar amount doesn't come from one of these two sources, it's wrong.

---

## The monthlyCharges Schema

Every enrollment record has a `monthlyCharges` object:

```js
{
  'enrollment-reserve': 1920.00,  // deposit = annualTuition × depositPct/100
  june:      640.00,              // paymentMonths consecutive months
  july:      640.00,              // starting at plan.startMonth
  august:    640.00,
  september: 640.00,
  october:   640.00,
  november:  640.00,
  december:  640.00,
  january:   640.00,
  february:  640.00,
  march:     640.00,
  april:     640.00,
  may:       640.00,              // last month absorbs rounding
}
```

**Key rules:**
- `'enrollment-reserve'` is a special key — NOT a calendar month. It holds the deposit due in `plan.depositMonth`.
- Regular month keys are lowercase English month names (`june` through `may` in school year order).
- `annualTuition === enrollment-reserve + sum(all month values)` must always hold exactly.
- Months outside the payment window are `0`, never omitted.
- The last payment month absorbs any rounding remainder so the annual total is exact.

---

## The Canonical Calculation Functions

These live in `calculations.js` and are loaded before the React app. **Never reimplement this logic inline.**

### `calcDeposit(annual, pct)`

```js
function calcDeposit(annual, pct) {
  return Math.round(annual * (pct / 100) * 100) / 100;
}
```

Returns the deposit amount as a rounded-to-cent percentage of annual tuition.

### `buildMonthlyCharges(annual, deposit, paymentMonths, startMonth)`

```js
buildMonthlyCharges(9600, 1920, 12, 'june')
// → {
//     'enrollment-reserve': 1920,
//     june: 640, july: 640, ..., april: 640, may: 640
//   }
```

Builds the complete `monthlyCharges` object. Arguments:
- `annual` — from pricing rules lookup
- `deposit` — from `calcDeposit(annual, plan.depositPct)`
- `paymentMonths` — from `plan.paymentMonths`
- `startMonth` — from `plan.startMonth`

The remaining balance (`annual - deposit`) is divided evenly across `paymentMonths` months. The last month gets any rounding remainder.

### `computeFamilyBalances(familyId, schoolYearFilter, data, now)`

Returns `{ currentBalance, totalAR, totalOwed, totalPaid, currentOwed }` for a family. Used in Collections and the Families tab to show balance status.

```js
computeFamilyBalances(familyId, schoolYearFilter, {
  students, enrollments, payments, stepUpPayments,
  families,       // used for invoice-prefix StepUp matching
  charges = [],   // optional flat charge records; defaults to [] (Grow-safe)
}, now = new Date())
```

- `currentOwed` — enrollment charges due through the current calendar month, plus all flat charges (always current)
- `totalOwed` — full annual enrollment charges + all flat charges regardless of current date
- `currentBalance` — `max(0, currentOwed - totalPaid)`
- `totalAR` — `max(0, totalOwed - totalPaid)` (full year A/R)

**Flat charges** are filtered by `familyId` and `schoolYear` (or included for all years on `'All Time'`). They contribute to both `totalOwed` and `currentOwed` immediately — there is no month-by-month drip. Passing `charges = []` (the default) makes the function behave identically to before this feature was added.

### `buildInvoicePrefix(lastName, existingPrefixes)`

```js
buildInvoicePrefix('Smith', new Set(['SMIT']))
// → 'SMI2'   (collision handling — appends digit)

buildInvoicePrefix('Smith', new Set())
// → 'SMIT'
```

Generates a unique 4-character uppercase prefix from a family last name. Rules:
- Take up to 4 letters from the last name (uppercase, non-alpha stripped)
- Pad to 4 chars with `X` if name is shorter than 4 letters (e.g. `Lee` → `LEEX`)
- If the base prefix is already in `existingPrefixes`, append a digit: `SMIT` → `SMI2` → `SMI3` … `SMI9`
- Stored as `family.invoicePrefix` in Firestore

### `getInvoiceNumber(invoicePrefix, monthKey, schoolYear)`

```js
getInvoiceNumber('SMIT', 'enrollment-reserve', '2026-2027')
// → 'SMIT-2627-DEP'

getInvoiceNumber('SMIT', 'august', '2026-2027')
// → 'SMIT-2627-AUG'

getInvoiceNumber('', 'june', '2026-2027')
// → ''   (missing prefix → silent no-op)
```

Formats a full invoice number from prefix + school year + charge type. Month codes:

| `monthKey` | Code |
|------------|------|
| `enrollment-reserve` | `DEP` |
| `june` … `may` | `JUN` … `MAY` |

**Only rendered in the UI for `invoiceYear >= '2026-2027'`** — 2025-2026 invoices are unaffected.

---

## Invoice Numbers in the InvoiceModal

The InvoiceModal renders invoice numbers when `invoiceYear >= '2026-2027'`:

| UI location | What is shown |
|-------------|--------------|
| Invoice header (top-right metadata block) | "Account Ref: `SMIT-2627`" (prefix + year, no month code) |
| Per-student monthly charges table (detail pages) | "Invoice #" column: `SMIT-2627-DEP`, `SMIT-2627-JUN`, etc. per row |

The Account Ref is the prefix-year stem. Individual charge line items append the month code.

---

## Payment Plans

Payment plans are stored on program records in `paymentPlansByYear`. Each plan has:

| Field | Type | Example |
|-------|------|---------|
| `id` | string | `'pplan-tuewed-2026-12mo'` |
| `label` | string | `'12-month'` |
| `depositPct` | number | `20` (percent) |
| `depositMonth` | string | `'march'` |
| `paymentMonths` | number | `12` |
| `startMonth` | string | `'june'` |

### Current 2026-2027 Plans

| Program | Plan ID | depositPct | depositMonth | paymentMonths | startMonth |
|---------|---------|-----------|-------------|---------------|-----------|
| Core Program | `pplan-tuewed-2026-12mo` | 20% | march | 12 | june |
| Core Program | `pplan-tuewed-2026-10mo` | 20% | march | 10 | august |
| Enrichment | `pplan-enrich-2026-12mo` | 20% | march | 12 | june |
| Enrichment | `pplan-enrich-2026-10mo` | 20% | march | 10 | august |

### 2025-2026 Plans (historical reference — do not recreate charges)

| Program | Plan ID | depositPct | depositMonth | paymentMonths | startMonth |
|---------|---------|-----------|-------------|---------------|-----------|
| Core Program | `pplan-tuewed-2025-std` | 33% | may | 10 | august |
| Film Workshop | `pplan-film-2025-std` | 100% | august | 0 | — |

---

## Family Types and Sibling Discounts

### Family Types

| Type | Description | Tuition behavior |
|------|-------------|-----------------|
| `Founding` | Founding member families | Lower tuition tier; sibling discounts apply |
| `Non-Founding` | Standard families | Standard tuition; sibling discounts apply |
| `Teacher` | Staff/teacher families | Fixed rate ($6,000/student for 2025-2026); NO sibling discount |

### Sibling Discounts

- Discounts apply to the 2nd and 3rd enrolled sibling **within each program**, not globally
- `Student.siblingOrder` (1, 2, or 3) determines the sibling position
- Discount percentages (`sibDisc2`, `sibDisc3`) are configurable in Setup
- Annual tuition for a sibling = `baseAnnual × (1 - discPct / 100)`
- Teacher families: `tier.sibDisc = false` — fixed rate, no discount regardless of sibling order

**Critical:** Sibling position is per-program. If Child A and Child B are in different programs, they're both Position 1 in their respective programs. If both are in the same program, the child with `siblingOrder = 1` (youngest by convention) is Position 1.

---

## Current Rate Structure (2026-2027)

Annual tuition stored in `grow-pricing-rules`:

### Core Program (`prog-tuewed`)

| Family Type | Sibling | Annual | Deposit (20%) | 12-mo monthly | 10-mo monthly |
|-------------|---------|--------|---------------|---------------|---------------|
| Founding | #1 | $7,200 | $1,440 | $480.00 | $576.00 |
| Founding | #2 | $6,840 | $1,368 | $456.00 | $547.20 |
| Founding | #3 | $6,696 | $1,339.20 | $446.40 | $535.68 |
| Non-Founding | #1 | $9,600 | $1,920 | $640.00 | $768.00 |
| Non-Founding | #2 | $9,120 | $1,824 | $608.00 | $729.60 |
| Non-Founding | #3 | $8,928 | $1,785.60 | $595.20 | $714.24 |
| Teacher | #1 | $6,000 | $1,200 | $400.00 | $480.00 |

*Monthly amounts are approximations; the last month absorbs rounding.*

---

## Year Boundaries for Payment Attribution

Payments are attributed to school years using these rules, in priority order:

1. **`appliedYear` field** — if set on the payment record, use it directly. This is the explicit business designation and overrides everything.
2. **Date range** — if `appliedYear` is absent, use the payment date. The school year boundary is **Jul 1 of year 1** through **Jul 1 of year 2** (strictly before):

```js
const [y1] = yr.split('-').map(Number);
const start = new Date(`${y1}-07-01`);
const end   = new Date(`${y1 + 1}-07-01`); // strictly before
```

For 2025-2026: July 1, 2025 ≤ date < July 1, 2026.

**StepUp payments:** Same date range, applied to `datePaid || servicePeriodStartDate || purchaseDate`. Only `status === 'Paid'` records count (empty status is treated as legacy/paid).

### Note on Older computeFamilyBalances Logic

The `computeFamilyBalances` function in `calculations.js` uses a slightly different boundary for the balance calculation: it uses January 1 of start year through May 31 of end year for date-fallback payments. This matches what was historically stored. The canonical `filterPaymentsByYear` helper (used in Finances, Reports, and P&L) uses the July 1 boundary.

---

---

## Flat Charges (Semester Fees and One-Time Charges)

Flat charges are financial obligations that are **not** tied to an enrollment. They are the correct tool for:
- Semester course fees (Writing Workshop, Math Circle, Art — flat $X due once)
- Registration fees, material fees, field trip fees
- Any one-time family-level or student-level charge

They are **not** enrollments, have no `monthlyCharges` grid, no program, no payment plan. They are simply "this family owes us $X for this reason."

**Balance impact:**
- Flat charges always add to both `totalOwed` and `currentOwed` immediately
- They are filtered by `schoolYear` when displaying year-based balances
- Payments reduce the overall family balance (no charge-level allocation in v1)

**Where they appear:**
- FamilyCardV2 expanded detail (Charges section; hidden when no charges exist)
- InvoiceModal "Other Charges" section (hidden when no charges exist)
- Collections tab balance (via `computeFamilyBalances` which now sums charges)
- Family portal InvoiceModal and balance

**What does NOT change:**
- No modifications to `buildMonthlyCharges`, `calcDeposit`, or enrollment logic
- Grow's `grow-charges` document will not exist until a charge is deliberately added — zero impact

---

## Enrollment Creation Rules — NEVER VIOLATE

1. **Annual tuition** → always look up from `pricingRules` by `(familyType, siblingPosition, programId, schoolYear)`. Never use `annualTuition` stored on an existing enrollment as the source of truth.
2. **Payment plan** → always read from `programs[id].paymentPlansByYear[schoolYear]`, matched by `planId` stored on the enrollment or falling back to `plans[0]`.
3. **Monthly charges** → always call `buildMonthlyCharges(annual, deposit, plan.paymentMonths, plan.startMonth)`. Never divide annualTuition by 12.
4. **depositAmount** on the enrollment record must equal `calcDeposit(annual, plan.depositPct)`.
5. **planId** must be stored on every new enrollment so future migrations can re-derive the correct plan.

### Enrollment creation checklist

Before modifying any enrollment creation or migration:

- [ ] `annual` comes from `pricingRules` lookup (not hardcoded, not from `enrollment.annualTuition`)
- [ ] `depositPct`, `paymentMonths`, `startMonth` come from `programs[].paymentPlansByYear[year]`
- [ ] `buildMonthlyCharges()` is called from `calculations.js`
- [ ] Migration skips records when `depositPct` is missing or 0
- [ ] `npx jest` passes

---

## Migration Safety Rules

Migrations that touch `monthlyCharges` have historically caused regressions. When writing one:

1. Before writing: verify `calcDeposit` + `buildMonthlyCharges` will produce correct results for real data
2. Run `npx jest` after any change to `calculations.js` or migration logic
3. Migrations must be idempotent — re-running must be a no-op on already-correct records
4. If migration computes `deposit = 0` because `depositPct` is missing, skip the record
5. Only touch the target school year — 2025-2026 data must never be modified by 2026-2027 migrations

The v7 migration (`v7-rebuild-2026-2027-charges-self-healing`) is the definitive example of a correct migration: it uses `buildMonthlyCharges()`, falls back to hardcoded plan parameters when Firestore plan data is corrupt, skips records with no pricing rule, and is idempotent.
