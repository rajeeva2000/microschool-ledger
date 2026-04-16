# Microschool Ledger — Product Overview
**Source of truth for brochures, whitepapers, and website copy**
Last updated: April 2026

---

## What It Is

Microschool Ledger is a multi-tenant financial management platform for microschools and homeschool co-ops. It replaces spreadsheets and general-purpose accounting tools with a purpose-built app that understands how a homeschool co-op actually runs: families with multiple enrolled students, state scholarship programs, tiered pricing, semester fees, and a small administrative team doing it all.

The live app runs at: https://msledger-a2525.web.app

The first tenant is **The Grow Co-op**, a homeschool cooperative in South Florida.

---

## The Problem It Solves

Running a homeschool co-op involves a level of financial complexity that most off-the-shelf tools handle poorly:

- **Families, not individuals** — tuition is charged per family with sibling discount tiers
- **Two revenue streams** — direct family payments (check, Stripe) and state scholarship disbursements (Florida's EMA/StepUp program)
- **Multiple charge types** — annual tuition enrollments AND flat semester fees for elective classes
- **Multiple programs** — each with its own pricing, payment schedule, and enrollment roster
- **Small team** — the administrators doing billing are also the teachers and coordinators; they can't afford a steep learning curve
- **No IT department** — the tool has to run without servers, DevOps, or maintenance contracts
- **Families want visibility** — parents ask for balance confirmations, invoices, and payment history; answering those requests manually takes admin time

---

## What It Does

### Home Dashboard
- At-a-glance enrollment counts by program and school year
- **Collection Progress card** — inline progress bar (green/amber/red) showing % of past-due expected revenue collected; links to Finances → Cash Flow on click
- Overdue balance alerts surfaced immediately on login
- **StepUp import reminder** — amber action item appears when no StepUp import has run in ≥ 7 days; if the last import had payments skipped for non-paid status (Authorized, InProcess), the card shows the pending count and prompts a re-import; "Import Now" shortcut opens the modal directly
- Quick-action shortcuts to the most common workflows
- Session tracking and login/logout audit trail

### Families & Students
- Maintains a directory of co-op families with contact info and family type (Founding, Non-Founding, Teacher)
- Tracks students linked to each family, including sibling order for discount calculation and student sequence numbers for StepUp matching
- Supports three family types with different tuition tiers; Teacher families pay a fixed rate
- Family cards show a unified view: students, enrollments, **flat charges**, current balance, and payment status at a glance
- Smart status badges: Paid in Full, Balance Due, Payment Overdue
- Auto-sorted by balance (highest owed first) for easy prioritization
- Search and filter by name, status, or balance across all families
- Globe badge indicates which families have portal access enabled

### Flat Charges *(unlocks enrichment and elective providers)*
- Add a charge that isn't tied to an enrollment — a $300 Writing Workshop semester fee, a $50 registration fee, a $150 materials charge
- Each charge has: description, amount, due date, school year, category (Tuition / Registration / Materials / Other), and optional student link
- Charge amounts flow into the family balance automatically — no separate reconciliation needed
- Appear as "Other Charges" section on invoices (section hidden when no flat charges exist)
- The same family can have both enrollment-based annual tuition AND flat charges simultaneously
- Hidden entirely for Grow until a charge is deliberately added — Grow's billing experience is unchanged

### Enrollment & Tuition
- Enrolls students in programs for a given school year via a guided multi-step wizard
- Generates monthly tuition charges automatically from data-driven pricing rules
- Supports two payment plan options per program: 10-month (Aug–May) and 12-month (Jun–May)
- Deposit tracked separately as `enrollment-reserve` (typically 20% of annual tuition, due in March)
- Sibling discounts calculated per program: 2nd sibling (configurable %, e.g. 5%), 3rd sibling (configurable %, e.g. 7%)
- All pricing data-driven — rates stored and editable in Setup, never hardcoded
- Supports multiple simultaneous school years; view and filter enrollments by year or program
- **Roster import with optional auto-enrollment** (create families, students, and enrollments in one step); accepts JotForm CSV exports with `"Student Applicant(s)"` multi-student fields and `"Parent/Guardian …"` column naming variants, as well as Google Sheets tab-delimited pastes; flexible column detection with partial-match fallback handles form variants automatically
- **Mid-year join**: specify a start month and optional custom annual tuition when enrolling a student who joins partway through the year

### Short-term / Semester Courses *(unlocks structured class providers)*
- Programs can be flagged as **short-term** — they use configurable terms (e.g. "Fall 2026", "Spring 2027") instead of a school year × payment plan
- Each term has a label, flat fee amount, and school year; terms are defined per program in Setup → Programs
- **Class-level participant type**: programs are either `student` (enroll a student) or `adult` (enroll a whole family) — no "parent as student" pollution of the student list
- Adult-type programs (e.g. parent workshops) enroll a family contact; charges flow into that family's balance automatically
- **Roster view**: toggle between List and Roster in the Enrollments tab; Roster groups by program → term, showing enrolled count, paid count, outstanding count, and a Paid/Outstanding badge per row
- Student headcount in Reports filters to student-type programs only — adult classes don't inflate enrollment counts
- Grow's existing annual programs are completely unaffected — short-term UI only appears for programs explicitly flagged as short-term

### Payments
- Records manual payments (check, Stripe, other) and applies them to school years
- `appliedYear` field allows explicit year tagging to override date-based attribution
- Month-level allocation: payments can be tagged to specific billing months
- StepUp/EMA scholarship disbursements imported by pasting tab-delimited data from the state portal; import skips non-paid rows (Authorized, InProcess) and shows a count of pending payments with a reminder to re-import once they clear
- 3-tier StepUp matching: invoice prefix → student sequence number → student name
- CSV import for bulk Stripe payments with fuzzy family name matching
- **Fill StepUp Invoice CSV** — paste the EMA Service Orders export to auto-populate Business Invoice # for each row; derives invoice numbers from enrollment data; defaults Start/End Date columns to today; handles mixed-case column headers from any EMA export variant

### Invoicing & Collections
- Generates a printable year-to-date statement per family showing all charges (enrollment + flat), payments, and balance due
- Account Ref and per-charge invoice numbers for 2026-2027+ (e.g. `SMIT-2627-DEP`, `SMIT-2627-JUN`)
- **Customizable invoice templates** — each school sets its own invoice title (e.g. "STATEMENT", "TUITION INVOICE"), payment instructions block (Venmo handle, check payable-to, bank info), header note, and footer note; all stored per-tenant
- **Automated payment reminders** — nightly job queues overdue families with portal email into an admin-review queue; 28-day cooldown; admin reviews and clicks "Review & Send" to preview the email (To, Subject, balance amount) before it fires; "Check Now" rebuilds queue on demand; $0-balance families auto-purged when families pay
- Collections dashboard sorted by balance; direct Add Payment shortcut per row
- Celebration card ("All families are current! 🌟") shown when all balances are $0; progress bar in Current stat card shows fraction of families paid through this month

### Family Portal *(passwordless, read-only)*
- Families access their own account at `yourdomain.com?view=portal` — no admin login required
- **Passwordless sign-in**: admin sends an email link; parent clicks and is signed in instantly
- Balance summary, enrollment detail, payment history, and self-serve printable invoice (including flat charges)
- Read-only enforced at Firestore rules level — database-level restriction independent of the UI

### Finances
- **Expense tracking** with configurable categories and subcategories; CSV import
- **Budget tab**: set per-category budget targets for the year
- **P&L Overview**: Revenue (projected vs. collected vs. variance) × Expenses (budget vs. actual vs. variance)
- **Cash Flow view**: month-by-month table of expected income (from enrollment `monthlyCharges`) vs. actual received; variance and cumulative columns; deposit month driven by program payment plan config

### Reports
- Revenue summary by program and school year
- Enrollment counts by program, year, and family type

### Setup & Administration
- **Programs**: payment plan schedules (deposit %, deposit month, payment months, start month) per year
- **Pricing Rules**: annual tuition per family type × sibling position × program × school year
- **School Info & Branding**: school name, address, contact email, logo URL — appear on invoices and in portal emails
- **Invoice customization**: custom title, payment instructions, header/footer notes — all per-tenant, no code changes required
- **Email reply-to**: set a school email address so families who reply to reminders and portal links reach the school directly instead of the platform
- **Access Control**: email-based role assignment (admin / viewer)
- **Audit Log**: full history of every change with before/after state and user email; filterable by action type (IMPORT / CREATE / UPDATE / DELETE / LOGIN) and entity topic (stepup / payment / family / student / …)
- **Data Migrations**: versioned, idempotent migrations run on app load
- **Onboarding Wizard**: guided multi-step setup for new tenants; saves school name directly to tenant config so it flows into invoices and emails immediately
- **Admin Tools**: Merge Duplicate Students, Payment Program Audit, Sibling Order rebalancing, data export/backup
- **Automated Backups**: nightly GCS backup runs at 2 AM ET; only writes when data has actually changed; up to 30 days of backups listed in Setup → Data Tools with one-click restore; manual JSON backup and restore also available at any time

---

## Programs (2025–2026 / 2026–2027)

| Program | Description |
|---------|-------------|
| Core Program (Tue/Wed) | Main recurring academic program; primary revenue driver |
| Enrichment: Film | Elective film workshop |
| Enrichment: Art & Learning | Elective art & learning program |

Year-specific display names are supported per program. Founding member families receive a lower tuition tier. Teacher families pay a fixed rate.

---

## Market Context

Over 54% of the 2,921 StepUp providers in Florida's scholarship program are enrichment/PE/elective providers who charge flat semester fees rather than annual tuition grids. Microschool Ledger's flat charge feature and short-term course enrollment directly address this majority. A single tenant may have some students on annual tuition (Grow's model) and others on semester fees — the platform handles both simultaneously.

| Provider type | Count | % of market | MSLedger fit |
|---|---|---|---|
| Enrichment / electives / PE | 1,594 | 54.6% | Flat charges ✓ · Short-term courses ✓ |
| Home ed instructional program | 1,027 | 35.2% | Annual tuition ✓ |
| Part-time / hybrid school | 208 | 7.1% | Both models ✓ |
| Full-time private school | 155 | 5.3% | Annual tuition ✓ |

---

## Who Uses It

- **Co-op administrator** — manages enrollment, billing, and collections day-to-day
- **Board / finance committee** — reviews P&L, expense reports, and revenue projections
- **Viewers** (read-only) — committee members who need visibility without edit access
- **Families / parents** — access their own account via the family portal
- **Platform super-user** — manages tenant onboarding (`rarora2005@gmail.com`)

---

## Technology

- **No installation required** — runs entirely in a web browser
- **No server to maintain** — hosted on Firebase (Google's cloud infrastructure)
- **Multi-tenant** — each school gets its own isolated data partition; one codebase serves all tenants
- **Auto-save** — writes to Firestore debounced (800ms) to consolidate rapid edits
- **Demo mode** — anyone can explore the full app with realistic seed data, no account required
- **CI/CD** — PRs auto-deploy preview URLs; merging to `main` deploys to production

Built with React 18, Vite, Tailwind CSS, Firebase, and Cloud Functions (Node 22). Pure financial logic lives in `calculations.js` with 108 Jest unit tests covering charge calculations, balance logic, invoice numbering, slug validation, auto-save data protection invariants, and payment reminder helpers.

**Security model:** Each tenant's data is isolated at the Firestore database layer, not just in the UI. Admin users require a server-side grant (`userTenants/{uid}`) set by a Cloud Function after verifying access-list membership. Family portal users get a separate read-only `'portal'` grant scoped to an explicit allowlist of documents. Platform super-user identity is verified via a Firebase custom claim (set server-side via Admin SDK) in addition to email. Sensitive tenant fields (`ownerEmail`) are stored in a private `tenantSecrets` collection, not the publicly-readable `tenants` collection. Sign-in link requests are rate-limited (5 min / address) and pre-validated against the tenant's family list before a link is generated.

---

## Key Facts for Marketing Copy

- Handles the full billing lifecycle: enrollment → charge generation → flat fees → payment → collections → family self-service
- Reconciles two separate payment streams (family checks + state scholarships) into one unified balance
- **Family portal**: parents check their own balance, view payment history, and print invoices without contacting the school
- **Flat charges**: semester fees and one-time charges work alongside enrollment-based tuition in the same invoice
- **Customizable invoices**: each school sets its own invoice title, payment instructions, and branding — no code changes required
- **Cash flow view**: know exactly which months you're behind on collections and by how much
- **Automated reminders**: overdue families get reminder emails; admin reviews the queue before any email sends; replies go directly to the school's inbox
- **Automated nightly backups**: data is backed up to Google Cloud Storage every night; one-click restore from any of the last 30 days — no Firebase console needed
- Full audit trail: every data change logged with who made it, when, and what changed
- Supports multiple school years simultaneously with year-specific pricing

---

## What's Next

See **`docs/ROADMAP.md`** for the full prioritized roadmap.

---

*This document is maintained alongside the codebase. Update it when significant features ship.*
