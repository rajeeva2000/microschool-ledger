# Grow ERP — Year Transition Guide

**Last updated:** March 2026

This guide covers the March–May overlap period when the co-op is simultaneously finishing the current year (2025-2026) and opening the next year (2026-2027). This is the highest-risk time for data issues.

---

## The Overlap Period (March–May)

During this window, three things are happening at once:

1. **Current year (2025-2026) is still active** — families are still making monthly payments
2. **Next year deposits are being collected** — 20% deposit due in March 2026 for 2026-2027
3. **Next year enrollments are being created** — students are being re-enrolled in new year

This means the system must handle payments for two different school years at the same time, and it must attribute them correctly.

---

## What to Do, In What Order

### Step 1: Configure next year's payment plans (before enrolling anyone)

Before creating a single 2026-2027 enrollment, verify the payment plans are correct in Firestore.

Setup → Programs → for each active program:
- Check that `paymentPlansByYear['2026-2027']` exists and has correct values
- Verify: `depositPct = 20`, `depositMonth = 'march'`, and `paymentMonths` / `startMonth` per plan

If payment plans are missing or wrong, enrollments created by the wizard will have incorrect charges, and migrations will be needed to fix them (which is risky).

### Step 2: Verify pricing rules for next year

Setup → Pricing → verify rules exist for `2026-2027` for every combination of:
- `familyType` × `siblingPosition` × `programId`

If any combination is missing, the Enrollment Wizard will show $0 annual tuition for those students and warn you.

### Step 3: Create next-year enrollments

Use the Enrollment Wizard (Enrollments tab → + Enroll Student):
1. Select the student
2. Select the program
3. Select `2026-2027` as the school year
4. Select the payment plan (12-month or 10-month)
5. **Review the annual tuition shown** — if it looks wrong, stop and check pricing rules
6. **Review the deposit amount** — should be 20% of annual
7. Save

The enrollment record is created immediately with a complete `monthlyCharges` object.

### Step 4: Record 2026-2027 deposits as they arrive

When a family pays their March 2026 deposit for next year:

**Critical: Set `appliedYear` to `2026-2027`** on the payment record.

Without `appliedYear`, the payment date (March 2026) falls within the 2025-2026 date range (Jul 2025 – Jul 2026) and the payment will be attributed to the WRONG year.

In the Payment modal:
- Set `appliedYear` = `2026-2027`
- Optionally allocate to `enrollment-reserve` in the month picker
- The amount should match the deposit shown on the enrollment

### Step 5: Continue recording 2025-2026 payments normally

Regular monthly payments for the current year continue as normal. Since these are for the current year, they can use `appliedYear = '2025-2026'` or rely on date-based attribution (both will work during the overlap period since the dates still fall within Jul 2025 – Jul 2026).

---

## How Year Attribution Works During Overlap

Payments are attributed to years in this priority order:

1. **`appliedYear` field** — explicit and always correct
2. **Date range fallback** — `Jul 1, 2025` ≤ date < `Jul 1, 2026` = 2025-2026

During March–June 2026, a payment with no `appliedYear` and a March 2026 date will be attributed to **2025-2026**, not 2026-2027. This is correct for current-year payments but wrong for next-year deposits.

**The rule: always set `appliedYear` on deposit payments.**

---

## Common Mistakes and How to Fix Them

### Deposit payment counted in wrong year

**Symptom:** Collections tab shows 2026-2027 balance not reduced after deposit payment; 2025-2026 shows unexpected extra payment.

**Cause:** Payment was recorded without `appliedYear`, so it was attributed to 2025-2026 based on date.

**Fix:** Edit the payment → set `appliedYear` to `2026-2027` → save.

---

### Enrollment charges don't match expected annual tuition

**Symptom:** A 2026-2027 enrollment shows a different annual total than expected.

**Cause:** Usually one of:
- Pricing rule was missing when enrollment was created (wizard used $0 or wrong amount)
- Payment plan had `depositPct = 0` (known Firestore bug, fixed by migration v7)
- An earlier migration corrupted the charges

**Fix:**
1. Check pricing rule exists for this familyType × siblingPosition × programId × 2026-2027
2. If pricing rule is correct but charges are wrong, the enrollment needs to be rebuilt
3. Contact developer — this is a migration-level fix

---

### 2026-2027 enrollments missing `enrollment-reserve` slot

**Symptom:** Invoice for 2026-2027 doesn't show a deposit line; month allocation picker doesn't show `enrollment-reserve` as an option.

**Cause:** Enrollment was created before the deposit concept was introduced (pre-migration v4/v6).

**Fix:** Running migration v6 or v7 will add the missing slot. Check Setup → Data Tools → Migrations. If the migration is already applied and the slot is still missing, contact developer.

---

### P&L showing unexpected revenue jump

**Symptom:** Finances P&L for 2025-2026 shows revenue much higher than expected in March.

**Cause:** 2026-2027 deposit payments without `appliedYear` are being counted in 2025-2026.

**Fix:** Find the payments (Payments tab → filter by date March 2026 → look for large amounts) and set `appliedYear = '2026-2027'` on each one.

---

## Year Filter Behavior Across Tabs

All tabs use the **year selector in the top navigation bar** to filter data. When you switch years, all tabs update simultaneously.

| Tab | How it uses the year filter |
|-----|---------------------------|
| Home | Shows enrollment counts for selected year |
| Families | Balance shown is for selected year |
| Students | Unfiltered — students aren't year-specific |
| Enrollments | Shows enrollments for selected year |
| Payments | Shows payments attributed to selected year |
| Finances | P&L, expenses, and budget for selected year |
| Collections | Balances calculated for selected year |
| Reports | Revenue and enrollment counts for selected year |

The program filter (also in the nav bar) is applied in addition to the year filter.

---

## Checklist: Transitioning from 2025-2026 to 2026-2027

Use this checklist during the March–May transition period:

### Before creating any 2026-2027 enrollments

- [ ] Payment plans configured in Firestore for 2026-2027 for all active programs
- [ ] Pricing rules entered for 2026-2027 for all familyType × siblingPosition × programId combinations
- [ ] Verified that running `npx jest` still passes (if any code changes were made)

### When creating 2026-2027 enrollments

- [ ] For each enrollment, verified the annual tuition shown matches the pricing rule
- [ ] For each enrollment, verified the deposit amount = 20% of annual
- [ ] For each enrollment, selected the correct payment plan (12-month or 10-month per family)
- [ ] `planId` is stored on the enrollment (the wizard handles this automatically)

### When recording 2026-2027 deposit payments

- [ ] `appliedYear` set to `2026-2027` on every deposit payment
- [ ] Payment amount matches the `enrollment-reserve` on the enrollment record
- [ ] After recording, verify the 2026-2027 Collections tab shows the reduced balance

### End-of-year tasks for 2025-2026

- [ ] Final StepUp import done — all scholarship disbursements for 2025-2026 are in the system
- [ ] P&L for 2025-2026 reviewed and reconciled
- [ ] Collections for 2025-2026 — all overdue families contacted
- [ ] Data exported as backup (Setup → Data Tools)

---

## School Year Quick Reference

| Year | Status | Notes |
|------|--------|-------|
| 2025-2026 | Active / winding down | Payments run Aug 2025–May 2026; StepUp scholarships |
| 2026-2027 | Opening | Enrollments and deposits collected March–May 2026 |

**Current date context:** As of March 2026, the co-op is in the middle of this transition. 2025-2026 monthly payments are still arriving (through May 2026). 2026-2027 deposits should be landing now.
