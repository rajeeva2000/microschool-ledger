# Microschool Ledger — Roadmap

Single source of truth for all planned work. Update this file when items ship or priorities change.

---

## Blockers — must resolve before specific milestones

*No current blockers for onboarding a second paying customer — Firestore tenant isolation shipped in `claude/fix-tenant-security-tmA2B`.*

**Customer discovery is a standing prerequisite for any significant feature.**
We have one paying customer (Grow). Before building for a new segment or adding major features to the existing model, validate assumptions with real providers. See `docs/CUSTOMER-DISCOVERY.md` for question guides for both annual tuition schools (Segment A) and enrichment/elective providers (Segment B).

---

## Near-term (next 1–3 sessions)

- ~~**Parent portal blank page fix**~~ — **done**: `needsEmail` inline email form replaces `window.prompt`; isolated-localStorage in-app browsers now show a confirm-email form instead of failing silently
- ~~**Node.js 22 upgrade**~~ — **done**: `functions/package.json` updated to `"node": "22"`
- **Pricing tier system** — gate features by Essentials / Standard / Pro / Network subscription tier
- **"Are you on track?" Home card** — Standard-tier summary card: season progress bar, % of projected revenue collected
- **Financial health / break-even dashboard** — Pro-tier view in FinancesTab
- **Tenant onboarding wizard** — guided first-login flow for new schools; sequences existing OnboardingWizard + StepUpImportModal + RosterImportModal as post-setup steps; sets `onboardingComplete: true`
  > Brand decisions needed first — see `docs/BRAND.md` → Open Roadmap Items

### Cash flow timing view — spec note

New sub-view in FinancesTab (alongside P&L, Budget, Expenses, Categories).

**What it shows — one row per month (June → May for the selected school year):**

| Month | Expected income | Actual received | Variance | Cumulative expected | Cumulative actual |
|---|---|---|---|---|---|
| Mar 2026 (deposits) | $18,240 | $14,100 | -$4,140 | $18,240 | $14,100 |
| Jun 2026 | $9,120 | $0 | -$9,120 | $27,360 | $14,100 |
| … | | | | | |

- **Expected** = sum of `monthlyCharges[monthKey]` across all active enrollments for the year. Deposit row uses `enrollment-reserve` summed and displayed in `plan.depositMonth` (March for 2026-2027).
- **Actual** = sum of payments with `appliedYear === schoolYear` and `monthsAllocated` containing that month key. Falls back to date-based matching for payments without `monthsAllocated`.
- **Future months** shown with expected but $0 actual — not flagged as variance until the month passes.
- Clicking a month row drills into which families are behind (links to Collections tab filtered to that month).

**Grow safety:** purely additive read-only view; no changes to enrollment or payment data model.

---

## Quick wins (high value, low effort)

- ~~**Season progress bar**~~ — **done**: Collection Progress card on Home with green/amber/red progress bar
- ~~**Family health indicator dots**~~ — **done**: FamilyCardV2 shows color-coded status badge (Paid in Full / Overdue / Balance Due) + matching card border color
- **Enrollment countdown chip** — badge on Home counting down days until the deposit month opens (reads from payment plan config)
- **Quick Pay from Home** — clicking a family in the overdue list opens the payment modal pre-filled for that family

---

## Medium features

- **Home "needs attention" list** — prioritized: overdue families, students without upcoming-year enrollments, enrollments missing a payment plan
- **Payment receipt email** — after recording a payment, "Send receipt" button generates a pre-filled email via Resend
  > Email template spec in `docs/BRAND.md`; must use MSLMark, not GrowLogo
- **Payment plan automation** — generate a full expected schedule on enrollment creation; flag missed payments automatically
- **Accounting export** — QuickBooks-compatible CSV or IIF from Finances tab
- **Accounting integrity / double-entry journal** — immutable payments (void instead of delete/edit), parallel journal layer, Verify Books tool, optional period closing. Full spec: `docs/ACCOUNTING-SPEC.md`. Build in phases — Phase 1 (immutable payments) is safe to start any time.
- **"Paid in full" celebration** — confetti animation when a family's balance reaches $0

---

## Broader program type support — market-validated priority

> Based on analysis of 2,921 StepUp providers (March 2026). See `docs/stepup_providers_filtered.xlsx - stepup_providers.csv` for source data.

### Market breakdown

| Provider type | Count | % of market | MSLedger fit today |
|---|---|---|---|
| Enrichment / electives / PE | 1,594 | **54.6%** | Poor — needs flat semester fee |
| Home ed instructional program | 1,027 | **35.2%** | Good — what we built for |
| Part-time / hybrid school | 208 | 7.1% | Partial |
| Tutoring | 189 | 6.5% | Poor |
| Full-time private school (annual) | 155 | 5.3% | Perfect |
| Therapy / specialized services | 124 | 4.2% | Poor — per-session billing |

Over half the market (enrichment/PE/electives) needs flat semester fees, not annual tuition grids. The two features below unlock that majority.

### Grow safety constraint

Grow's live data uses the annual tuition model. **All new enrollment types must be strictly additive** — new fields, new program flags, new UI paths — never modifying existing annual enrollment logic or `buildMonthlyCharges`. Grow should never notice these features exist unless they choose to use them.

### Feature 1: Flat charge type *(unlocks enrichment providers — 55% of market)*

> Full spec: `docs/FLAT-CHARGE-SPEC.md`

> **Status: SHIPPED** in `claude/build-flat-charge-feature-twGjS`. See `CHANGELOG.md [2026-03-30]`.

### Feature 2: Semester / short-term courses *(unlocks structured class providers)*

Introduce "term" as a first-class concept (e.g. `fall-2026`, `spring-2027`, `6wk-oct-2026`) alongside `schoolYear`.

**Implementation approach (additive, safe for Grow):**
- `term` field on enrollment records is optional; if absent, existing annual behavior is unchanged
- `buildMonthlyCharges` already handles `paymentMonths=1` with `depositPct=0` for a flat single-payment term — no changes to the function needed
- EnrollmentWizard: new optional "Term" picker shown only when program is flagged as short-term
- Enrollments and Reports: filter by term in addition to year
- Grow's programs have no `term` flag set; they see zero UI change

### Feature 3: Session log for drop-in billing *(smaller slice — 4% of market, build last)*

A `{slug}-sessions` document records attendance per student per date. A "generate charges" action converts session records into payment-due line items. Only needed for therapy/SLP/ABA providers. Low priority given market share.

---

## Larger features

- **Year-over-year comparison in Reports** — side-by-side: this year vs. last year, enrollment counts and revenue by program
- **Program capacity tracking** — seat limit per program/year; available vs. enrolled in Enrollments and Home
- **Per-tenant branding** — tenant logo alongside MSL mark; GrowLogo is The Grow Co-op's placeholder only

---

## Tech debt

- **July–June fiscal year migration** *(do before 2027-2028 enrollment setup)* — MSLedger's school year currently runs June–May (`MONTH_META` starts at june, yr:0). Grow and StepUp both operate on a July–June fiscal year. Changing mid-cycle is unsafe (existing 2026-2027 enrollments have June 2026 as first payment month; flipping it would make it look a year late). Safe window: after all 2026-2027 payments are settled, before first 2027-2028 enrollment is created.
  - Change `MONTH_META` in `calculations.js`: move june from `{yr:0}` to `{yr:1}` (last month)
  - Update default payment plan `startMonth` from `'june'` to `'july'` for new 2027-2028 plans
  - Write migration to rebuild `monthlyCharges` for any 2027-2028 enrollments using old june-start plans
  - Budget display already works for July–June (BudgetTab uses dynamic month keys, not MONTH_META)
  - Budget CSV import already supports Jul–Jun (format `Jul'27`, `Jun'28`)
- ~~**Node.js runtime upgrade**~~ — **done**: upgraded to Node 22
- **TypeScript for calculations layer** — `calculations.js` → `calculations.ts`; best done alongside a broader TS migration
- ~~**Automated backups**~~ — **done**: Firebase PITR (7-day window) + daily Firestore backups (98-day retention); **nightly GCS backup** (`scheduledDailyBackup` Cloud Function) writes `backups/{slug}/YYYY-MM-DD.json` only when data has changed (MD5 hash check); in-app "Automated Backups" section in Setup → Data Tools lists all backups and supports one-click restore; manual JSON backup + restore also available. Remaining stretch: accounting-grade export (QuickBooks CSV).
- **Viewer role UI pattern** — establish consistent hidden/disabled control patterns before adding new viewer-restricted surfaces
  > See `docs/BRAND.md` → Open Roadmap Items

---

## Brand-gated items

These need a design/brand decision before building. See `docs/BRAND.md` → Open Roadmap Items and `docs/BRAND-REQUESTS.md` for the protocol.

- Tenant onboarding wizard entry point and step UI pattern
- Payment receipt email template (must use MSLMark)
- Overdue reminder email template (must use MSLMark)
- Per-tenant branding — platform/tenant logo distinction
- Viewer role UI — consistent pattern for restricted controls

---

## Generalizing for broader program types

> Discussion captured from session 2026-03-25 — architectural context before building this.

### What the current model assumes

Every enrollment today is:
- One student + one program + one school year
- Fixed annual price
- Deposit + N monthly installments
- `monthlyCharges` as the single source of truth for what's owed

### What home education instructional programs actually sell

- A class (Writing Workshop, Math Circle, Art) with a flat semester fee
- Possibly multiple classes per student, each priced independently
- Possibly drop-in or per-session pricing
- Terms that don't align to a school year (fall semester, spring semester, 6-week session)
- Families who enroll mid-term and pay a prorated amount

### What's already fine (no changes needed)

Scholarship type, proration of ESA wallet drawdowns, and expected quarterly state disbursement schedules are the **family's problem, not the provider's**. A microschool just needs to know: "what does this family owe us, and what have they paid us?" It doesn't matter where the payment came from. MSLedger already works this way — StepUp payments are just credits, same as a manual payment.

The one edge case where scholarship type could matter to a provider is warning families upfront that a specific program can't be paid with certain fund types — but that's a UX nicety, not billing infrastructure.

### Concrete gaps in the current model

1. **No "charge" primitive** — only enrollments with a monthly grid. A $300 flat semester fee for one art class doesn't fit neatly into `enrollment-reserve + 12 months`.
2. **Short-term / semester courses** — a student could be in Writing (fall), Math (fall + spring), and Art (drop-in) simultaneously. The `monthlyCharges` grid gets awkward for courses shorter than a school year.
3. **No session log** — for drop-in or per-session billing there's no way to record "student attended on these dates, generate charges."
4. **No family-level one-time fee** — registration fees, material fees, etc. aren't attached to a student/enrollment in the current model.

### The good news: no full rewrite needed

The `monthlyCharges` grid is just an awkward fit for short terms. A semester course can work today with `depositPct=0` and `paymentMonths=1` (single charge, no deposit). The gaps that actually need new code are:

- **Flat charge type** — a charge record that isn't tied to an enrollment (for fees and one-time items)
- **Session log** — if true per-session billing is needed (drop-in classes)
- **Term as a first-class concept** — shorter than a school year; sits alongside `schoolYear` in the data model

### Roadmap items this unlocks

See the "Larger features" section for the implementation items derived from this discussion.

---

## Shipped (recent)

| Session / Branch | What shipped |
|------------------|-------------|
| `claude/build-flat-charge-feature-twGjS` | **Data integrity & backup** — two-layer auto-save guard (length > 0 + `_loadErrorKeys` null-return fix) prevents silent data wipe across all 5 collections; clear buttons use explicit `storage.set`; nightly GCS backup (`scheduledDailyBackup`) + `listBackups` + `restoreBackup` callables; one-click restore in Setup → Data Tools |
| `claude/build-flat-charge-feature-twGjS` | **Reminder diagnostics** — `buildReminderQueueNow` returns full skip-reason breakdown (`familiesChecked`, `skippedZeroBal`, `skippedInQueue`, `skippedCooldown`, `skippedPaused`, `skippedNoPortal`); alert shows reason count per category; reminder helpers extracted to `calculations.js` (ESM) + `functions/reminderHelpers.js` (CJS) |
| `claude/build-flat-charge-feature-twGjS` | **Email branding** — tenant logo in all parent-facing emails (sign-in link, payment reminders); BCC `info@microschoolledger.com` on all outbound; CC `info@microschoollearning.com` removed |
| `claude/build-flat-charge-feature-twGjS` | **Unit tests 44 → 86** — `buildInvoicePrefix` (9), `getInvoiceNumber` (5), auto-save guard contract (5), `reminderGetCurrentSchoolYear` (4), `reminderExpandEnrollments` (6), `reminderComputeBalance` (8 incl. null familyId regression guard), `reminderResolveBalance` (3); `testMatch` widened to `tests/**/*.test.js` |
| `claude/build-flat-charge-feature-twGjS` | **UX polish** — Manual Payments list removes height cap and 50-item slice (matches StepUp list behavior); Manual Payments list now shows all records |
| `claude/build-flat-charge-feature-twGjS` | **Flat charges** — `Charge` primitive + `{slug}-charges` Firestore doc; `ChargeModal` (add/edit); `FamilyCardV2` Charges section; `InvoiceModal` "Other Charges" section; `computeFamilyBalances` charges param; portal balance + invoice updated; audit log; 6 new unit tests (44 total) |
| `claude/add-msledger-roadmap-nBGvi` | **Balance calculation centralization** — `getFamilyBalances` + `computeFamilyBalances` as single source of truth; StepUp year bucketing by invoice number; 3-tier family matching (prefix → seq# → name); `isOverdue = currentBalance > 0`; Family Ledger modal; InvoiceModal StepUp fix; Collections tab fix; 4 regression tests |
| `claude/add-msledger-roadmap-nBGvi` | **Import Roster + auto-enroll** — extended roster import to optionally create enrollments; selectors for program, year, plan, default family type; new families get invoice prefixes |
| `claude/add-msledger-roadmap-nBGvi` | **Platform branding** — replaced `GrowLogo` with `MSLMark` in header, onboarding wizard, and login page |
| `claude/add-msledger-roadmap-nBGvi` | **Automated payment reminders** — `sendPaymentReminders` scheduled nightly 8am ET; `sendPaymentReminderManual` + `buildReminderQueueNow` callables; admin approval queue in Collections tab (amber panel); "Check Now" + "🔔 Remind" buttons; MSLMark email via Resend; 28-day cooldown; "Pause reminders" toggle; `{slug}-reminder-queue` + `{slug}-reminders` Firestore docs |
| `claude/add-msledger-roadmap-nBGvi` | **Cash flow timing view** — new Finances → Cash Flow tab; month-by-month table of expected income (from `monthlyCharges`) vs actual received (manual + StepUp payments); variance + cumulative columns; deposit month pulled from program payment plan config |
| `claude/add-msledger-roadmap-nBGvi` | **Home "Collection Progress" card** — inline progress bar (green/amber/red) comparing total received vs past-due expected for selected year; links to Finances → Cash Flow on click |
| `claude/add-msledger-roadmap-nBGvi` | **Setup tab restructure** — 4 clear tabs (Programs, Data, Team, School); dangerous/Grow-specific tools moved to superuser-only Admin tab; `getProgramDisplayName` falls back to `prog.name` for tenant-defined programs |
| `claude/fix-tenant-security-tmA2B` | **Firestore tenant isolation** — `userTenants/{uid}` collection; per-tenant security rules; `grantTenantAccess` / `requestPortalAccess` / `bootstrapTenantAccess` Cloud Functions; CI manual deploy workflow; architecture diagrams |
| `claude/add-pricing-tiers-fVr9a` | Invoice prefix system (`buildInvoicePrefix` / `getInvoiceNumber`); migration v10 backfills families; InvoiceModal shows Account Ref + Invoice # column |
| `claude/add-project-documentation-TJOcX` | Parent portal — email-link auth, FamilyPortalDashboard, portal invite, Firestore write rules |
| Vite migration session | Migrated from single-file `index.html` + CDN Babel to Vite + npm |
| `claude/commit-multi-tenant-routing-k8VyZ` | Multi-tenant routing, Firestore slug-prefix partitioning, subdomain detection |

Full version history: `CHANGELOG.md`
