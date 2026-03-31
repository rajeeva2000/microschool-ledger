# Grow ERP — Operational Workflow Guide

**Last updated:** March 2026

This guide describes how the co-op administrator uses Grow ERP day-to-day and year-to-year. It's written for the person doing the actual work, not a developer.

---

## School Year Calendar

The Grow Co-op school year runs **June through May**.

| Period | What happens |
|--------|-------------|
| January–February | Begin planning the next school year |
| March | Enrollment opens for next year; deposit invoices sent to families |
| March–May | Deposits collected; returning families re-enrolled |
| June | Year begins; monthly tuition starts for 12-month plan families |
| August | Monthly tuition starts for 10-month plan families |
| May | Year ends; final payments collected |
| June (new year) | Cycle repeats |

---

## The Annual Workflow

### Phase 1: Opening the Next Year (January–March)

This happens before families have paid anything for the new year.

**In Setup → Programs:**
1. Verify each program has the correct payment plans configured for the new year
2. Check `depositPct`, `depositMonth`, `paymentMonths`, `startMonth` for each plan

**In Setup → Pricing:**
3. Add or update pricing rules for the new year (familyType × siblingPosition × programId)
4. Never delete old pricing rules — they're historical record

**In Enrollments → Enrollment Wizard:**
5. Enroll each returning student in the new year
6. The wizard looks up annual tuition from pricing rules automatically
7. Select the correct payment plan (12-month or 10-month) per family
8. Confirm the enrollment-reserve (deposit) amount shown is correct before saving

**In Collections:**
9. Generate an invoice for each family showing their deposit due in March
10. Send deposit invoice via the pre-filled email link

---

### Phase 2: Collecting Deposits (March–May)

As families pay their deposits:

**In Payments → Record Payment:**
1. Click "+ Add Payment"
2. Select the family
3. Enter the amount, date, and method (check/Stripe)
4. Set `appliedYear` to the new school year (e.g. `2026-2027`) — **critical** so the payment counts in the right year
5. Allocate to `enrollment-reserve` in the month allocation picker if desired

**Reconciliation check (Collections tab):**
- Filter by the new year
- Families who have paid their deposit will show a reduced balance
- Families with no payment will still show the full annual charge as the balance

---

### Phase 3: Monthly Billing (June–May)

There is no automated billing — the co-op currently sends monthly payment requests manually (via Found.com or the invoice tool). Payments are recorded as they arrive.

**For each payment received:**
1. Payments tab → Add Payment
2. Select family, enter amount and date
3. Set `appliedYear` to the current school year
4. Optionally allocate to specific months using the month allocation picker

**StepUp scholarship payments:**
1. Export CSV from the StepUp portal
2. Payments tab → Import StepUp → paste tab-delimited data
3. Review matched/unmatched records
4. Unmatched records (no student sequence number match) need manual assignment
5. Save — payments are added to the family's balance automatically

**Checking who's current:**
- Collections tab → shows all families sorted by balance
- Families with overdue balances are flagged
- Click "View Invoice" for a printable year-to-date statement
- Click the email icon to pre-fill a collections email

---

### Phase 4: End of Year (April–May)

1. **Reconcile StepUp payments** — do a final import of all StepUp disbursements to ensure nothing was missed
2. **Final collections push** — Collections tab → sort by balance → send reminders to families with open balances
3. **Run year-end P&L** — Finances tab → P&L Overview → filter to the current year; verify revenue totals match expectations
4. **Export data** — Setup → Data Tools → export families, students, enrollments, and payments as CSV backup

---

## Day-to-Day Tasks

### Recording a Payment

1. Payments tab → click "+ Add Payment"
2. Select family
3. Enter: amount, date, method, reference (check number or Stripe ID)
4. Set `appliedYear` — this is the most important field for accurate reporting
5. Optional: allocate to specific months using the allocation picker
6. Save

### Viewing a Family's Balance

Two ways:
- **Families tab** — find the family; the card shows current balance and status badge
- **Collections tab** — shows all families sorted by balance

For a full statement: click "View Invoice" on any family.

### Adding a New Family

1. Families tab → "+ Add Family"
2. Enter: family name, type (Founding/Non-Founding/Teacher), email, phone, address
3. Save
4. Then add students: Students tab → "+ Add Student" → link to the new family

### Enrolling a Student

1. Enrollments tab → "+ Enroll Student" (opens the Enrollment Wizard)
2. Select family → select student → select program → select school year
3. The wizard looks up the pricing rule automatically based on family type and sibling order
4. Review the annual tuition shown — verify it's correct before proceeding
5. Select payment plan (12-month or 10-month)
6. Review the monthlyCharges breakdown
7. Save

If the price shown looks wrong, check Setup → Pricing to verify the pricing rule exists for that familyType × siblingPosition × programId × year combination.

### Importing StepUp Payments

1. Log in to the StepUp portal → export the payment history as CSV
2. Payments tab → "Import StepUp"
3. Paste the tab-delimited data into the text area
4. Review the preview — check matched vs. unmatched rows
5. Unmatched rows: click to manually assign to a family, or check that the student's `studentSequenceNumber` matches the portal
6. Import — existing records are not duplicated (deduplicated by Tipalti payment number + line item)

### Adding a Flat Charge to a Family

Use flat charges for semester course fees, registration fees, materials, or any one-time family-level amount that is **not** tied to a regular enrollment.

1. Families tab → find the family → expand the family card (click to open)
2. Scroll to the **Charges** section (appears when the card is expanded; hidden if no charges exist)
3. Click **"Add Charge"** — opens the Charge modal pre-filled with this family
4. Fill in:
   - **Description** — free text (e.g. "Fall 2026 Writing Workshop")
   - **Amount** — dollar amount
   - **Due Date** — when payment is expected
   - **School Year** — used for year-based balance filtering
   - **Category** — Tuition, Registration, Materials, or Other
   - **Student** — optional; leave blank for a family-level charge
5. Save — the charge appears immediately in the family card and in the Collections balance

To edit or delete an existing charge, use the edit (pencil) or delete (trash) icon on each charge row in the family card.

**Balance impact:** A flat charge increases the family's balance immediately — there is no month-by-month drip. The charge appears in the "Other Charges" section on the printed invoice.

**Note:** This section is not visible to admins unless a charge has been added to that family (or the admin clicks Add Charge). It does not appear at all for families with no charges.

---

### Generating an Invoice

1. Collections tab → find the family → "View Invoice"
2. Set invoice date, due date, and school year filter
3. Review charges, payments, and balance
4. Print or save as PDF from the browser

### Running the P&L

1. Finances tab → P&L Overview sub-tab
2. Set year filter (top of page)
3. Revenue rows show: projected (from enrollment charges) vs. collected (from payments) vs. variance
4. Expense rows show: budget vs. actual vs. variance
5. Net income = total revenue collected - total expenses

---

## Setup Tasks

### Adding a New Program

1. Setup tab → Programs → "+ Add Program"
2. Enter name, and the year-specific display name for each year it's active
3. Add payment plan(s) for each year: set depositPct, depositMonth, paymentMonths, startMonth
4. Save

Then add pricing rules:
5. Setup tab → Pricing → "+ Add Rule"
6. Add rules for each familyType × siblingPosition combination

### Updating Tuition Rates for a New Year

1. Setup tab → Pricing
2. Filter by program and year
3. Click "+ Add Rule" for each new year's rates
4. Do not edit existing rules for past years — add new records

### Managing Access

1. Setup tab → Access Control
2. Enter the email address of the person you want to invite
3. Select role: admin (full edit) or viewer (read-only)
4. Save
5. They can now log in with that Google account

### Viewing the Audit Log

Setup tab → Audit Log → shows all create/update/delete actions with before/after state.

---

## Troubleshooting

### Balance looks wrong on Collections / Families tab

Check the `appliedYear` on the payment records. If a payment is missing `appliedYear`, it falls back to date-based attribution using the July 1 boundary. Payments dated before July 1 of the year start would NOT appear in that year.

Fix: edit the payment and set `appliedYear` explicitly.

### StepUp payment not showing up for a family

Check that `Student.studentSequenceNumber` matches the `studentSequenceNumber` in the StepUp import data. The field is on the student record in the Students tab.

If there's no sequence number, the system falls back to name matching (first + last name exact match). Check for typos in either the student record or the import data.

### Enrollment charges don't add up to the annual tuition

This indicates a data corruption issue. The admin tools include migration `v7-rebuild-2026-2027-charges-self-healing` which rebuilds charges from pricing rules. Contact the developer before running migrations.

### Payment plan shows 0% deposit

The payment plan record in Firestore has a corrupt `depositPct`. This was fixed for all known enrollments by migration v7. If it recurs, check Setup → Programs → the program's payment plan configuration for the affected year.
