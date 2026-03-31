# Microschool Ledger — Developer Handoff & Reference Guide

**Last updated:** March 2026
**Live app:** https://msledger-a2525.web.app
**Firebase project:** `msledger-a2525`
**GitHub:** https://github.com/rajeeva2000/msledger

---

## What This App Is

Microschool Ledger is a multi-tenant financial management platform for microschools and homeschool co-ops. The first and primary tenant is **The Grow Co-op**, a homeschool cooperative in South Florida. Each tenant gets its own isolated Firestore data partition routed by org slug.

**What it manages:**
- Families, students, and multi-program enrollments
- Annual tuition with deposit + monthly payment schedules
- Flat charges (semester fees, registration, materials — not tied to enrollments)
- Manual payments (check, Stripe) and StepUp/EMA scholarship disbursements
- Invoice generation and printable year-to-date statements
- Collections with automated payment reminder emails
- Family portal — passwordless self-service balance and invoice access
- Expense tracking, budget management, and P&L reporting
- Cash flow timing view (expected vs. actual by month)

---

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React 18 (npm) | JSX compiled by Vite at build time |
| Styling | Tailwind CSS (npm) | `grow-*` custom color palette |
| Icons | Lucide React (npm) | Accessed via `_mkIcon(name)` shim |
| Database | Firebase Firestore (compat SDK) | `appdata` collection; slug-prefixed document keys |
| Hosting | Firebase Hosting | Serves from `dist/`; all routes → `index.html` |
| Auth | Firebase Auth | Google OAuth (admins), anonymous (demo), email-link (families) |
| Functions | Firebase Cloud Functions v2, Node 20 | Resend for email delivery |
| Unit tests | Jest | Tests only `calculations.js` |
| Build | Vite | Output to `dist/`; CI runs `npm run build` before deploy |

**The entire UI is in two files:**
- `src/App.jsx` — all React components (~16,000+ lines)
- `calculations.js` — pure financial logic (no React/Firebase deps); unit-tested

---

## Project Structure

```
msledger/
├── src/
│   ├── main.jsx              # React entry point (9 lines)
│   ├── App.jsx               # All React components (~16,000+ lines)
│   ├── assets/MSLMark.jsx    # Platform logo component
│   ├── firebase.js           # Firebase init, multi-tenant storage API
│   └── index.css             # Global styles
├── calculations.js           # Pure financial logic (no React/Firebase deps)
├── tests/
│   └── calculations.test.js  # Jest unit tests (44 tests as of March 2026)
├── functions/
│   └── index.js              # Cloud Functions (reminders, portal invite, etc.)
├── docs/                     # Developer and operator documentation
├── firestore.rules           # Firestore security rules
├── firebase.json             # Firebase Hosting config
├── vite.config.js
└── CLAUDE.md                 # AI session context and architectural invariants
```

---

## Development

```bash
npm install          # install dependencies
npm run dev          # local dev server (Vite, hot reload)
npm run build        # production build → dist/
npx jest             # run unit tests
```

**Always run `npx jest` before committing changes to `calculations.js` or any migration.**

---

## Deployment

**Automated (recommended):** Open a PR on any `claude/*` branch — CI runs tests and deploys a preview URL. Merging to `main` deploys to production.

**Manual fallback:**
```bash
./deploy.sh   # stamps commit + timestamp, commits, pushes, deploys
```

---

## Multi-Tenant Architecture

All data lives in Firestore collection **`appdata`** in project `msledger-a2525`. Document keys are prefixed with the tenant slug:

```
grow-families
grow-students
grow-enrollments-a / grow-enrollments-b
grow-payments
grow-charges
grow-programs
grow-pricing-rules
...
```

Slug is resolved from: `?org=` URL param → subdomain → hardcoded fallback (`grow`).

No data ever crosses tenant boundaries. A new tenant gets their own prefix automatically.

### Firestore documents

| Key | Contents |
|-----|---------|
| `{slug}-families` | Family records |
| `{slug}-students` | Student records |
| `{slug}-enrollments-a` / `-b` | Enrollment records split across two docs (1MB limit) |
| `{slug}-payments` | Manual payment records |
| `{slug}-stepup-payments` | StepUp scholarship records |
| `{slug}-charges` | Flat charge records (missing = empty array) |
| `{slug}-programs` | Program definitions and payment plans |
| `{slug}-pricing-rules` | Tuition rates per familyType × siblingPosition × programId × year |
| `{slug}-expenses` | Expense records |
| `{slug}-expense-categories` | Category definitions |
| `{slug}-invoices` | Invoice records |
| `{slug}-access-list` | Email → role mapping |
| `{slug}-audit-log` | Full change history |
| `{slug}-migrations-applied` | IDs of already-run migrations |
| `{slug}-reminders` | Per-family reminder cooldown timestamps |
| `{slug}-reminder-queue` | Families queued for next reminder send |

---

## Authentication

| Method | Who | Can write? |
|--------|-----|-----------|
| Google OAuth | School admins | Yes |
| Anonymous | Demo visitors | Yes (demo slug only) |
| Email link | Families (portal) | **No** — enforced at Firestore rules level |

**Portal flow:** Admin sets `family.portalEmail` → clicks "Send Invite" → `sendPortalInviteEmail` Cloud Function sends branded invite via Resend → family clicks magic link → signed in instantly with no password.

**After sign-in:** `requestPortalAccess` Cloud Function validates `portalEmail` match and writes `userTenants/{uid}.slugs[slug] = true`. Firestore rules check this before allowing reads.

---

## Key Billing Invariants — Read Before Touching Enrollment Code

**Two authoritative sources for all charge amounts — never hardcode:**

| Source | Firestore key | Controls |
|--------|--------------|---------|
| `pricingRules` | `{slug}-pricing-rules` | Annual tuition per familyType × siblingPosition × programId × year |
| `programs[].paymentPlansByYear[year][]` | `{slug}-programs` | `depositPct`, `depositMonth`, `paymentMonths`, `startMonth` |

**Canonical functions in `calculations.js` — never reimplement inline:**

```js
calcDeposit(annual, pct)
// → Math.round(annual × pct/100 × 100) / 100

buildMonthlyCharges(annual, deposit, paymentMonths, startMonth)
// → { 'enrollment-reserve': deposit, june: X, july: X, … }

computeFamilyBalances(familyId, schoolYearFilter, {
  students, enrollments, payments, stepUpPayments, families, charges = []
}, now = new Date())
// → { currentBalance, totalAR, totalOwed, totalPaid, currentOwed }

buildInvoicePrefix(lastName, existingPrefixes)
// → 4-char uppercase billing code, e.g. 'SMIT'

getInvoiceNumber(invoicePrefix, monthKey, schoolYear)
// → 'SMIT-2627-DEP' | 'SMIT-2627-JUN' | … | '' (when prefix missing)
```

**Before touching any enrollment creation or migration, run `npx jest`.**

---

## Cloud Functions (already deployed)

All functions are in `functions/index.js` (Firebase v2, Node 20). Email via Resend (`RESEND_API_KEY` secret).

| Function | Trigger | Purpose |
|----------|---------|---------|
| `grantTenantAccess` | Every Google login | Validates email against access list; writes `userTenants/{uid}` |
| `requestPortalAccess` | Portal sign-in | Validates `portalEmail`; grants read-only tenant access |
| `bootstrapTenantAccess` | Super-user manual | One-shot backfill of `userTenants` for existing users |
| `sendPortalInviteEmail` | "Send Invite" in FamilyModal | Generates email-link + sends branded invite via Resend |
| `sendSignInLink` | ParentPortalLogin | Sends magic sign-in link via Resend |
| `sendTenantWelcomeEmail` | Super-user after new tenant | Sends welcome email to new tenant admin |
| `sendPaymentReminders` | Nightly 8am ET (scheduled) | Queues overdue families with `portalEmail` into `{slug}-reminder-queue`; 28-day cooldown |
| `sendPaymentReminderManual` | Collections "🔔 Remind" button | Sends single reminder immediately; accepts `clientBalance` + `schoolYear` from client |
| `buildReminderQueueNow` | Collections "Check Now" button | Runs queue-builder logic on demand |

To force-deploy functions: GitHub Actions → "Deploy Cloud Functions (manual)" → Run workflow → type `deploy`.

---

## Migration System

`DATA_MIGRATIONS` in `App.jsx` — versioned array. Each migration has `id`, `title`, `description`, `preview(data)`, `migrate(data)`.

**Safety rules:**
- Migrations must be idempotent
- Always run `npx jest` after changing migration logic
- Skip records when `depositPct` is missing or 0 (never write `enrollment-reserve: 0`)
- Never touch 2025-2026 data from a 2026-2027 migration

---

## Starting a New Claude Session

1. All React edits go to `src/App.jsx`. Firebase/storage edits to `src/firebase.js`.
2. Read `CLAUDE.md` — it has the active branch, architectural invariants, and pre-commit checklist.
3. Read `docs/billing-and-pricing.md` before touching any enrollment or charge calculation code.
4. Run `npx jest` before the first commit.
5. Open a PR immediately after the first commit — CI will post a preview URL to the PR automatically.

**Key context:**
- Firebase project: `msledger-a2525`
- GitHub repo: `rajeeva2000/msledger`
- Platform super-user: `rarora2005@gmail.com` (bypasses all access checks)
- Grow Co-op owner: `rajeev@thegrowcoop.org` (hardcoded in app as owner of `grow` tenant)
- Branch naming: `claude/<description>-<sessionId>` — never push to `main` directly

---

## Frequently Confused Things

| Question | Answer |
|----------|--------|
| Where does the app start? | `src/main.jsx` → renders `App` from `src/App.jsx` |
| Where do I edit components? | `src/App.jsx` only — there are no separate component files |
| What is `calculations.js`? | Pure financial logic; no React, no Firebase; fully unit-tested |
| Why are enrollments split into `-a` and `-b`? | Firestore 1MB document limit; split is recalculated on every save |
| What is `enrollment-reserve`? | The deposit key in `monthlyCharges` — NOT a calendar month |
| How do flat charges differ from enrollments? | No `monthlyCharges` grid, no program, no payment plan — just "family owes $X for reason Y" |
| Where is the invoice prefix stored? | `family.invoicePrefix` — 4-char code, e.g. `SMIT`; used for `SMIT-2627-DEP` invoice numbers |
| What is the debounce window for auto-save? | 800ms |
| How does the portal know which family to show? | Matches `family.portalEmail === currentUser.email` |
