# Public microschool tuition and budget calculator

Path: `/tools/microschool-tuition-calculator/`. Static HTML/CSS/JavaScript; no account, email form, backend, saved plans, app credentials, or database calls. Downloads a UTF-8 CSV generated in the browser. Unsubmitted/invalid edits disable the download and hide old results.

## Scope

- Up to six programs, each with annual tuition per enrollment, enrollment count, deposit credited toward tuition, 1–12 remaining monthly payments, and one blended estimated discount percentage.
- Programs may share students. No summed unique-student count or per-student break-even claim.
- Family categories, program combinations, and sibling discounts are represented only by an estimated allowance. The actual product supports the detailed rules; this calculator does not reproduce them.
- Annual staffing (including founder pay), monthly space/utilities, other annual recurring costs, collection percentage, and blended payment costs.
- Annual net results, approximate billed-tuition break-even target, 10% lower enrollment-revenue scenario, deposits and monthly payment schedule, and modeled additional cash needed starting from zero cash.

## Financial assumptions

Money uses integer cents. Discounts round per enrollment. Regular installments round down to cents; the final installment collects the remainder. Deposits plus installments exactly equal discounted tuition. Deposits cannot exceed that tuition. Collection percentages and payment costs apply to each period's aggregate scheduled receipts, rounding to cents. Annual totals sum the same periods shown in the schedule and export.

Operating costs cover 12 months regardless of payment count; whole-cent differences are reconciled in month 12. All deposits arrive upfront; all remaining schedules start in month 1. Receipts are assumed to precede that month's expenses. No actual calendars, late receipts, startup costs, taxes, debt, grants, or initial cash balance are modeled. The cash result is a minimum for this simplified schedule, not a recommended operating reserve. Scholarship money is a source of tuition payment, not revenue on top of the same tuition. The billed-tuition target is approximate because collections and fees round per period.

Example: 20 enrollments × $6,000 = $120,000 tuition; 20 × $500 = $10,000 deposits; remaining $110,000 over ten payments = $11,000/month. $72,000 staffing + $18,000 space + $10,000 other = $100,000 annual costs. At 100% collection and zero payment costs, projected annual surplus is $20,000.

## Analytics

Uses shared deferred PostHog initialization, limited to production marketing hosts. Events: `tuition_calculator_viewed`, `tuition_calculator_started` (first edit), `tuition_calculator_calculated` (explicit update), `tuition_calculator_downloaded`, and `tuition_calculator_cta_clicked`. Properties: calculator version, fixed page name, existing UTM campaign fields, program count on calculation, CSV format on download, and fixed CTA/location values. No financial inputs, computed amounts, or free text are explicitly captured. Input form and calculated text use `ph-no-capture` to exclude element autocapture. No free-text identity fields exist. Demo/pricing CTAs preserve the existing UTM parameters and use the homepage contact form.

## Validation

Run `node --test tests/tuition-calculator.test.cjs`. Serve the repository as static files and check desktop/mobile, keyboard navigation, add/remove programs, discounts, invalid deposits, zero enrollment, CSV download, attribution on demo links, and browser console errors. Preview and localhost do not initialize PostHog. Do not submit a real demo form during testing.
