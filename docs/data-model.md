# Grow ERP — Data Model

**Last updated:** April 2026 (Feature 2: short-term / adult programs)

All data lives in a single shared Firestore collection called **`appdata`**. Each logical entity type is stored as a JSON-serialized string in a named field on a shared document (not as individual Firestore documents). The `storage` adapter handles the get/set against this structure.

---

## Firestore Key Reference

| Key | Contents | Notes |
|-----|---------|-------|
| `grow-families` | `Family[]` JSON | All family records; each record includes `invoicePrefix` (4-char billing code) |
| `grow-students` | `Student[]` JSON | All student records (compacted on save) |
| `grow-enrollments-a` | First half of `Enrollment[]` JSON (compacted) | Split to stay under Firestore 1MB limit |
| `grow-enrollments-b` | Second half of `Enrollment[]` JSON (compacted) | Merged with `-a` on load |
| `grow-payments` | `Payment[]` JSON | Manual tuition/fee payment records |
| `grow-stepup-payments` | `StepUpPayment[]` JSON | State scholarship disbursements |
| `grow-programs` | `Program[]` JSON | Program definitions and payment plans |
| `grow-pricing-rules` | `PricingRule[]` JSON | Annual tuition per familyType × siblingPosition × programId × year |
| `grow-expenses` | `Expense[]` JSON | Expense records |
| `grow-expense-categories` | `Category[]` JSON | Expense category tree |
| `grow-invoices` | `Invoice[]` JSON | Invoice records and sequential counter |
| `grow-charges` | `Charge[]` JSON | Flat charge records (not tied to enrollments); semester fees, registration, materials, etc. |
| `grow-year-config` | `{ [year]: YearConfig }` JSON | Per-year settings (budget lock dates, etc.) |
| `grow-access-list` | `AccessEntry[]` JSON | Email → role mapping |
| `grow-audit-log` | `AuditEntry[]` JSON | Full change history |
| `grow-migrations-applied` | `string[]` JSON | IDs of migrations that have already run |
| `grow-reminders` | `{ [familyId]: { lastSent, sentCount } }` JSON | Per-family reminder cooldown log |
| `grow-reminder-queue` | `ReminderQueueEntry[]` JSON | Current admin-review queue of families queued for reminder emails |
| `grow-session-heartbeat` | ISO timestamp string | Updated every 5 minutes; used to detect abandoned sessions |
| `grow-pending-logout` | boolean or timestamp | Written on `beforeunload`; used when unload event fires |

---

## Schemas

### Family

```js
{
  id: string,                     // e.g. 'fam-abc123'
  primaryParentName: string,      // Display name for the family
  familyType: 'Founding' | 'Non-Founding' | 'Teacher',
  email: string,
  phone: string,
  address: string,
  portalEmail: string,            // optional — email used for parent portal login
  invoicePrefix: string,          // 4-char billing code derived from last name, e.g. 'SMIT'
                                  // Used to generate invoice numbers: SMIT-2627-DEP, SMIT-2627-JUN, …
                                  // Backfilled by migration v10; auto-assigned on new family creation
  createdAt: string,              // ISO timestamp
}
```

### Student

```js
{
  id: string,                     // e.g. 'stu-abc123'
  familyId: string,               // FK → Family.id
  firstName: string,
  lastName: string,
  dateOfBirth: string,            // 'YYYY-MM-DD'
  grade: string,                  // e.g. '3rd', 'K', '10th'
  siblingOrder: 1 | 2 | 3,       // 1 = pays full price; 2 = 2nd sibling; 3 = 3rd sibling
  studentSequenceNumber: string,  // matches StepUp portal CSV field — used for payment matching
  systemStudentId: string,        // internal sequential ID
}
```

**Sibling order notes:**
- `siblingOrder` is per-family, not per-program
- 1 = full price, 2 = 2nd sibling discount, 3 = 3rd sibling discount
- The "Sibling Order" admin tool auto-assigns order by age (youngest = 1)

### Enrollment

Stored in a compacted format in Firestore (field names shortened, `monthlyCharges` as ordered array). Expanded to full form on load.

```js
{
  id: string,                     // e.g. 'enr-abc123'
  studentId: string,              // FK → Student.id; absent for adult-type program enrollments
  familyId: string,               // FK → Family.id; present instead of studentId for adult programs
  programId: string,              // FK → Program.id
  schoolYear: string,             // e.g. '2026-2027'; matches term.schoolYear for short-term programs
  term: string,                   // term ID (e.g. 'fall-2026'); only present for short-term programs
  status: 'active' | 'inactive',
  startDate: string,              // 'YYYY-MM-DD', optional
  endDate: string,                // 'YYYY-MM-DD', set when status = 'inactive'
  endType: 'withdrawn' | 'graduated' | string,   // reason for deactivation
  planId: string,                 // e.g. 'pplan-tuewed-2026-12mo'; absent for short-term enrollments
  annualTuition: number,          // total annual charge (snapshot from pricing rules)
  depositAmount: number,          // deposit portion = annualTuition × depositPct/100; 0 for short-term
  monthlyCharges: {               // keyed object; values are dollar amounts
    'enrollment-reserve': number, // upfront deposit, NOT a calendar month (annual programs only)
    june: number,                 // present for annual programs
    // ... july through may ...
    may: number,
    // OR for short-term programs, a single term-ID key:
    'fall-2026': number,          // flat fee for this term; key is the term's id from program.termsByYear
  }
}
```

**monthlyCharges invariants — annual programs:**
- `enrollment-reserve + sum(all month values) === annualTuition` must always hold
- `enrollment-reserve` is the deposit, due in `plan.depositMonth` (currently March for 2026-2027)
- Regular month slots that are outside the payment window are `0`, not omitted
- Last payment month absorbs any rounding remainder so the sum is exact

**monthlyCharges for short-term programs:**
- Contains a single key equal to the term's `id` (e.g. `{ 'fall-2026': 200 }`)
- Keys that are not `enrollment-reserve` or a calendar month name are treated as **flat term charges** — always counted as current regardless of date
- `computeFamilyBalances` sums all unknown keys as immediately current

**Enrollment identity rules:**
- Annual / student programs: `studentId` is required; `familyId` is absent or derived from the student
- Short-term / adult programs: `familyId` is present; `studentId` is absent (`!e.studentId`)
- An enrollment with both `studentId` and `familyId` is treated as a student enrollment (studentId takes precedence)

**Firestore compacted format** (what's actually stored):
```js
{
  id, si, pi, yr, st, sd, ed, et,  // abbreviated field names
  mc: [june, july, aug, sep, oct, nov, dec, jan, feb, mar, apr, may]  // ordered array, no enrollment-reserve
}
```
The `enrollment-reserve` is not in the compacted `mc` array — it is derived on load from `depositAmount` or rebuilt via migration if missing.

### Payment (Manual)

```js
{
  id: string,
  familyId: string,               // FK → Family.id
  date: string,                   // 'YYYY-MM-DD' — payment date
  amount: number,                 // gross amount received
  amountNet: number,              // net after processing fees (Stripe payments)
  processingFee: number,          // difference between amount and amountNet
  method: 'check' | 'stripe' | 'other',
  reference: string,              // check number or Stripe transfer ID
  programId: string,              // optional — tags payment to a specific program
  appliedYear: string,            // e.g. '2025-2026' — explicit year attribution
                                  // if set, overrides date-based year detection
  monthsAllocated: string[],      // e.g. ['august', 'september'] — optional month coverage
  notes: string,
  createdAt: string,
}
```

### StepUp Payment

Imported from the Florida EMA/StepUp scholarship portal (tab-delimited CSV paste).

```js
{
  firstName: string,
  lastName: string,
  status: 'Paid' | 'Canceled' | 'Pending' | 'InProcess',
  datePaid: string,               // 'YYYY-MM-DD'
  purchaseAmount: number,         // dollar amount of scholarship disbursement
  businessInvoiceNumber: string,  // co-op's invoice number from the portal
  lineItemNumber: string,
  tipaltiPaymentNumber: string,   // dedup key component
  studentSequenceNumber: string,  // matches Student.studentSequenceNumber
  servicePeriodStartDate: string, // 'YYYY-MM-DD'
  servicePeriodEndDate: string,
  categoryDetailName: string,     // 'Other Fees' = Film Workshop; anything else = Core Program
  programId: string,              // optional — derived from categoryDetailName or set manually
}
```

**Deduplication key:** `tipaltiPaymentNumber|lineItemNumber|businessInvoiceNumber`

**Program attribution:**
- `categoryDetailName === 'Other Fees'` → Film Workshop (`prog-film`)
- Anything else → Core Program (`prog-tuewed`)

### Program

```js
{
  id: string,                     // e.g. 'prog-tuewed'
  name: string,                   // default display name
  color: string,                  // hex color for UI display, e.g. '#4F46E5'

  // ── Annual programs (shortTerm: false or absent) ─────────────────────────
  shortTerm: false,               // absent or false → annual program with pricingRules + payment plans
  participantType: 'student',     // default; annual programs always enroll students
  paymentPlansByYear: {
    '2025-2026': [
      {
        id: string,               // e.g. 'pplan-tuewed-2025-std'
        label: string,            // e.g. 'Standard'
        depositPct: number,       // percentage of annual tuition due as deposit
        depositMonth: string,     // calendar month when deposit is due, e.g. 'march'
        paymentMonths: number,    // number of monthly installments
        startMonth: string,       // first month of installments, e.g. 'august'
      },
      // ...additional plans
    ],
    '2026-2027': [ /* ... */ ],
  },

  // ── Short-term programs (shortTerm: true) ─────────────────────────────────
  shortTerm: true,                // true → term-based; no pricingRules lookup, no payment plans
  participantType: 'student' | 'adult',
  //   'student' → enrollment stores studentId; shows in student-type roster
  //   'adult'   → enrollment stores familyId (no studentId); excluded from student headcount in Reports
  termsByYear: {
    '2025-2026': [
      {
        id: string,               // e.g. 'fall-2025'; used as the key in enrollment.monthlyCharges
        label: string,            // e.g. 'Fall 2025'
        amount: number,           // flat fee for this term, e.g. 200
        schoolYear: string,       // '2025-2026' (mirrors the outer key; stored for convenience)
      },
    ],
    '2026-2027': [ /* ... */ ],
  },

  // ── Shared ────────────────────────────────────────────────────────────────
  scheduleByYear: {
    '2025-2026': {
      days: string[],             // e.g. ['Tuesday', 'Wednesday']
      startTime: string,
      endTime: string,
      location: string,
    },
    // ...
  },
}
```

**Short-term vs annual — key differences:**

| | Annual | Short-term |
|---|---|---|
| `shortTerm` field | `false` / absent | `true` |
| Tuition source | `pricingRules` lookup | `program.termsByYear[year][term].amount` |
| Payment structure | `paymentPlansByYear` | flat fee per term, no deposit |
| Enrollment key | `studentId` (student-type) | `studentId` or `familyId` (adult-type) |
| `monthlyCharges` shape | `{ 'enrollment-reserve', june … may }` | `{ [termId]: amount }` |
| Appears in Reports headcount | always | only when `participantType: 'student'` |
| Appears in Roster view | no | yes |

**Year-specific display names** are NOT stored on the program record. They come from the `PROGRAM_NAMES_BY_YEAR` constant in `index.html`:

```js
const PROGRAM_NAMES_BY_YEAR = {
  'prog-tuewed': {
    '2025-2026': 'Tue/Wed Program',
    '2026-2027': 'Core Program',
  },
  'prog-film': {
    '2025-2026': 'Film Workshop',
  },
  'prog-enrichment': {
    '2026-2027': 'Enrichment',
  },
};
```

A program is only "active" in a school year if it has an entry in `PROGRAM_NAMES_BY_YEAR`.

### Pricing Rule

```js
{
  id: string,
  programId: string,              // FK → Program.id
  schoolYear: string,             // e.g. '2026-2027'
  familyType: 'Founding' | 'Non-Founding' | 'Teacher',
  siblingPosition: 1 | 2 | 3,    // matches Student.siblingOrder
  annualTuition: number,          // total annual charge for this combination
}
```

This table is the authoritative source for annual tuition amounts. Every enrollment creation path must look up annual tuition here — never hardcode dollar amounts.

### Expense

```js
{
  id: string,
  date: string,                   // 'YYYY-MM-DD'
  amount: number,                 // positive = expense, negative = income/refund
  description: string,
  categoryId: string,             // FK → Category.id
  programId: string,              // optional program attribution
  schoolYear: string,             // e.g. '2025-2026'
  vendor: string,
  receiptUrl: string,
  notes: string,
}
```

### Expense Category

```js
{
  id: string,
  name: string,
  color: string,                  // hex color for display
  subcategories: [
    { id: string, name: string }
  ],
  budgetByYear: {
    '2025-2026': number,          // budget amount for that year
    '2026-2027': number,
  },
}
```

### Invoice

```js
{
  id: string,
  familyId: string,
  schoolYear: string,
  invoiceNumber: string,          // e.g. '1052' or '1052-R-003'
  date: string,
  dueDate: string,
  issuedAt: string,               // ISO timestamp
  notes: string,
}
```

### Charge (Flat)

A charge record that is NOT tied to an enrollment. Used for semester course fees, registration fees, materials, and other one-time family-level charges.

```js
{
  id: string,                     // 'chg-' + timestamp + random suffix
  familyId: string,               // FK → Family.id (required)
  studentId: string | null,       // FK → Student.id (optional — null for family-level charges)
  description: string,            // free text, e.g. 'Fall 2026 Writing Workshop'
  amount: number,                 // positive dollar amount
  dueDate: string,                // 'YYYY-MM-DD' — when the charge is due
  schoolYear: string,             // e.g. '2026-2027' — used for year-based filtering
  category: 'tuition' | 'registration' | 'materials' | 'other',
  createdAt: string,              // ISO timestamp
  updatedAt: string,              // ISO timestamp
}
```

**Balance impact:** Flat charges always add to both `totalOwed` and `currentOwed` immediately (they are always "past due" once created — no month-by-month drip). They are filtered by `schoolYear` the same way enrollment charges are. With `charges = []` (default), `computeFamilyBalances` behaves identically to before this feature was added.

**Document:** All charges for a tenant are stored in a single `{slug}-charges` document. Missing document = empty array (Grow's document will not exist until a charge is deliberately created).

### Access Entry

```js
{
  email: string,
  role: 'admin' | 'viewer',      // admin = full read/write; viewer = read-only
  addedAt: string,
  addedBy: string,
}
```

The owner email (`rajeev@thegrowcoop.org`) is hardcoded in the app and always has full access regardless of this list.

### Audit Entry

```js
{
  id: string,
  timestamp: string,             // ISO timestamp
  userEmail: string,
  action: 'create' | 'update' | 'delete' | 'login' | 'logout',
  entityType: string,            // e.g. 'family', 'enrollment', 'payment'
  entityId: string,
  before: object | null,         // snapshot before change
  after: object | null,          // snapshot after change
}
```

---

## Enrollment Split Rationale

Firestore documents have a 1MB hard limit. With ~50+ students across multiple programs and 2 school years, a single enrollment document would exceed this limit. The app splits enrollments across two documents (`grow-enrollments-a`, `grow-enrollments-b`), each holding half the array. The split point is recalculated on every save as `Math.ceil(enrollments.length / 2)`.

On load, both documents are fetched and their arrays merged. The old single-document key `grow-enrollments` is deleted if it still exists.

---

## Backup & Export

### In-app JSON backup (Setup → Data Tools → Backup JSON)

Full snapshot of all Firestore data. The `downloadBackup()` function in `src/App.jsx` must stay in sync with the `dataKeys` array in `loadData()` — the CLAUDE.md collection checklist enforces this.

| Field in backup JSON | Source collection | Notes |
|----------------------|------------------|-------|
| `families` | `{slug}-families` | |
| `students` | `{slug}-students` | |
| `programs` | `{slug}-programs` | Includes payment plans per year |
| `enrollments` | `{slug}-enrollments-a` + `-b` | Merged on export; re-split on restore |
| `payments` | `{slug}-payments` | |
| `stepUpPayments` | `{slug}-stepup-payments` | |
| `pricingRules` | `{slug}-pricing-rules` | Tuition costs, sibling discount percentages |
| `expenses` | `{slug}-expenses` | |
| `expenseCategories` | `{slug}-expense-categories` | |
| `charges` | `{slug}-charges` | Flat charges |
| `invoices` | `{slug}-invoices` | |

The JSON backup is sufficient for a complete restore. The restore function (`restoreFromBackup`) re-splits enrollments into a/b format and overwrites all collections.

### Excel export (Setup → Data Tools → Export Excel)

Human-readable financial workbook. Suitable for accountant handoffs and year-end review. Does **not** include programs, pricing rules, or configuration data — those are nested objects that don't flatten sensibly into rows.

| Sheet | Contents |
|-------|---------|
| Family Ledger | One row per family — totals charged, paid, balance |
| Enrollment Detail | Per-student enrollment with monthly charge breakdown |
| Manual Payments | All tuition/fee payments with method, reference, month allocation |
| StepUp Payments | State scholarship disbursements |
| Students | Student roster with sibling order |
| Families | Family contact info |
| Expenses | Expenses with category, vendor, program, academic year |

### Firebase-level recovery

- **Firestore PITR** (point-in-time recovery): enabled, 7-day window. Allows restoring any document to any point in the past 7 days via the Firebase console.
- **Daily automated backups**: enabled with 98-day retention. Stored in a Firebase Storage bucket.
- These are independent of the in-app JSON backup and require Firebase console / CLI access to use.
