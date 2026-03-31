# Grow ERP — Component Reference

**Last updated:** March 2026 (flat charges)

All components are defined in `src/App.jsx`. Pure financial logic lives in `calculations.js`.

---

## Root Components

### `MSLMark`

```
function MSLMark({ size = 40, className = '' })
```

Platform logo component. Used in the navigation bar, login screen, onboarding wizard, and email templates. Located at `src/assets/MSLMark.jsx`. Replaces the tenant-specific `GrowLogo` in all platform-level surfaces.

### `GrowLogo`

```
function GrowLogo({ size = 40, className = '' })
```

SVG leaf logo with Grow Co-op branding. Retained as a tenant-specific placeholder; should not appear in any platform-level UI.

---

### `GrowERP`

```
const GrowERP = function({ currentUser })
```

Root application shell. All state lives here. Renders the navigation bar, tab content, and all modal overlays. Owns the debounced auto-save effect, the migration runner, and session tracking.

**Key derived values:**
- `canEdit` = `userRole === 'owner' || userRole === 'editor'`
- `isOwner` = `userRole === 'owner'`

**Filter helpers (defined just above `GrowERP`):**

```js
filterPaymentsByYear(payments, yr)
// → payments[] filtered by appliedYear or date range (Jul 1 y1 → Jul 1 y2)

filterStepUpByYear(stepUpPayments, yr)
// → paid-only StepUp payments filtered by same date range
```

These are used consistently across all tabs to ensure revenue numbers agree.

---

## Modal Components

### `ProgramModal`

```
const ProgramModal = ({ show, onClose, program, onSave })
```

Add/edit a program. Has two tabs: "Info" (name, year-specific display names) and "Payment Plans" (deposit configuration and monthly schedule per school year). Also shows a weekly schedule configuration per year.

---

### `FamilyModal`

```
const FamilyModal = ({ show, onClose, family, onSave, onPortalInviteSent })
```

Add/edit a family record. Fields: primary parent name, family type, email, phone, address, portal email (+ invite button).

On **new family creation**, the `GrowERP` `onSave` handler auto-derives `invoicePrefix` from the last word of `primaryParentName` using `buildInvoicePrefix`, deduplicating against all existing family prefixes. The prefix is stored on the family record and used for invoice number generation.

---

### `StudentModal`

```
const StudentModal = ({ show, onClose, student, families, onSave })
```

Add/edit a student record. Fields: first name, last name, date of birth, grade, family (dropdown), sibling order, student sequence number (for StepUp matching).

---

### `PaymentModal`

```
const PaymentModal = ({ show, onClose, families, students, programs, payment, onSave, enrollments })
```

Add/edit a manual payment. Fields: family, date, amount, method, reference, program attribution, `appliedYear`, notes. Includes the `MonthAllocationPicker` for assigning the payment to specific billing months.

---

### `StepUpEditModal`

```
const StepUpEditModal = ({ show, onClose, payment, programs, selectedYear, onSave })
```

Edit an existing StepUp scholarship payment record. Mainly used to correct `programId` attribution or fix import errors.

---

### `StepUpImportModal`

```
const StepUpImportModal = ({ show, onClose, onImport, existingStepUpPayments })
```

Multi-step wizard for importing StepUp portal data. Accepts tab-delimited text (paste from the portal's export). Deduplicates against `existingStepUpPayments` using `tipaltiPaymentNumber|lineItemNumber|businessInvoiceNumber`. Backfills `categoryDetailName` on existing records that were missing it.

---

### `PaymentsImportModal`

```
const PaymentsImportModal = ({ show, onClose, families, programs, payments, onImport })
```

Multi-step import for Stripe CSV exports or other bulk payment files. Maps columns, performs fuzzy family name matching, and shows unmatched rows for manual assignment.

---

### `RosterImportModal`

```
const RosterImportModal = ({ show, onClose, families, students, onImport })
```

Import families and students from a spreadsheet CSV. Used for initial data load or adding many families at once.

---

### `ImportModal`

```
const ImportModal = ({ show, onClose, programs, families, students, enrollments, onImport })
```

General CSV import modal for enrollment records. Maps columns to enrollment fields and supports bulk enrollment creation.

---

### `InvoiceModal`

```
const InvoiceModal = ({
  show, onClose, family, students, enrollments, payments,
  stepUpPayments, programs, selectedYear, invoiceCount,
  charges = []
})
```

Generates a printable year-to-date statement for a family. Shows:
- Header with family info, invoice number/date/due date, and **Account Ref** (e.g. `SMIT-2627`) for 2026-2027+
- Page 1: family summary table — student × program with total charges through selected date
- Page 2+: one page per student with a monthly charges breakdown table, payment history, and balance
- **"Other Charges" section** — flat charges for the selected year; hidden when `familyFlatCharges.length === 0` so Grow's invoices look unchanged

**Invoice numbers (2026-2027 and later only):**
- "Account Ref" row in the header metadata: `SMIT-2627` (prefix + year code, no month suffix)
- "Invoice #" column in the per-student monthly charges table: `SMIT-2627-DEP` (deposit), `SMIT-2627-JUN`, `SMIT-2627-AUG`, etc.
- For years before 2026-2027, neither the column nor the Account Ref row is rendered.

**Total calculation:** `totalChargesDue = enrollmentChargesDue + flatChargesTotal`. The enrollment table footer reads "Total Enrollment Charges"; the grand total includes both.

Uses `window.print()` for printing; includes print-specific CSS to hide the nav bar.

---

### `ChargeModal`

```
const ChargeModal = ({ show, onClose, charge, families, students, selectedYear, onSave })
```

Add/edit a flat charge record (not tied to an enrollment). Fields: family selector (pre-filled when opened from a family card), optional student selector (scoped to that family), description, amount, due date, school year, category (Tuition / Registration / Materials / Other).

IDs generated as `'chg-' + Date.now() + '-' + randomSuffix`. No payment plan logic, no `buildMonthlyCharges`, no pricing rules lookup.

---

### `ExpenseModal`

```
const ExpenseModal = ({ show, onClose, expense, expenseCategories, programs, selectedYear, onSave })
```

Add/edit an expense record. Fields: date, amount, description, category, subcategory, program, vendor, receipt URL, notes.

---

### `ExpensesImportModal`

```
const ExpensesImportModal = ({
  show, onClose, expenseCategories, programs, selectedYear,
  existingExpenses, onImport
})
```

Import expenses from CSV. Auto-detects income vs. expense by sign of amount.

---

### `BudgetImportModal`

```
const BudgetImportModal = ({ show, onClose, expenseCategories, selectedYear, onImport })
```

Import budget amounts by category from CSV. Sets `budgetByYear[selectedYear]` on each expense category.

---

## Tab Components

### `FinancesTab`

```
const FinancesTab = ({
  expenses, setExpenses, expenseCategories, setExpenseCategories,
  payments, stepUpPayments, programs, enrollments,
  selectedYear, selectedProgramFilter, canEdit,
  writeAudit, showConfirm, yearConfig, setYearConfig
})
```

Container for the Finances tab. Has sub-views: P&L Overview, Expenses, Budget, and **Cash Flow**. Manages the sub-view switcher and delegates to `PLOverview`, `ExpensesList`, `BudgetTab`, and the Cash Flow view.

**Cash Flow sub-view:** Month-by-month table of expected income (from enrollment `monthlyCharges`) vs. actual received (manual + StepUp payments). Columns: month, expected, actual, variance, cumulative expected, cumulative actual. Deposit row displays in `plan.depositMonth` (March for 2026-2027). Built on `computeCashFlowData` helper — do not reimplement that logic inline.

---

### `PLOverview`

```
const PLOverview = ({
  expenses, expenseCategories, payments, stepUpPayments,
  programs, selectedYear, enrollments
})
```

The P&L summary table. Revenue section shows projected (from enrollment `monthlyCharges`) vs. collected (from filtered payments) vs. variance. Expense section shows budget vs. actual vs. variance. The projection and budget columns auto-hide when no data is configured.

---

### `ExpensesList`

```
const ExpensesList = ({
  expenses, setExpenses, expenseCategories, setExpenseCategories,
  programs, selectedYear, canEdit, writeAudit, showConfirm
})
```

Table of expense records with edit/delete. Includes the `CategoryManager` for managing expense categories.

---

### `BudgetTab`

```
const BudgetTab = ({
  expenses, expenseCategories, setExpenseCategories,
  payments, stepUpPayments, programs, enrollments,
  selectedYear, canEdit, writeAudit, yearConfig, setYearConfig,
  onOpenImport
})
```

Budget entry UI. Per-category budget targets for the selected school year. Also shows budget lock configuration (prevents editing after a cutoff date).

---

### `CollectionsTab`

```
const CollectionsTab = ({
  families, students, programs, payments, stepUpPayments,
  enrollments, selectedYear, selectedProgramFilter,
  getFamilyBalances, getStudentsByFamily, canEdit,
  onAddPayment, onViewInvoice
})
```

Overdue balance tracker. Shows all families sorted by balance (highest owed first). Each row has buttons for: View Invoice, Send Statement (pre-filled email), and Add Payment. Filters by year and program.

**Automated reminder queue (admin-only amber panel):** Shows families queued for payment reminder emails. Per-family "🔔 Remind" button sends immediately via `sendPaymentReminderManual` callable. "Check Now" button triggers `buildReminderQueueNow` to rebuild the queue on demand. "Pause reminders" toggle disables the nightly scheduler. The nightly `sendPaymentReminders` Cloud Function reads `{slug}-reminder-queue` and `{slug}-reminders` to enforce the 28-day cooldown between reminders per family.

---

## Panel Components (within Setup tab)

### `AccessControlPanel`

```
const AccessControlPanel = ({ accessList, currentUser, ownerEmail, onSave })
```

Add/remove users and roles. Displays current access list; allows adding new email + role combinations. Owner email (`rajeev@thegrowcoop.org`) is always shown but cannot be removed.

---

### `AuditLogPanel`

```
const AuditLogPanel = ({ auditLog })
```

Paginated, searchable table of all audit log entries. Shows timestamp, user, action type, entity type, entity ID, and before/after state (expandable JSON diff).

---

### `MergeDuplicatesPanel`

```
const MergeDuplicatesPanel = ({ students, families, onMerge })
```

Detects students with similar names (fuzzy match) and allows merging one record into another. The merge transfers all enrollment and payment associations to the target record, then deletes the source. Non-destructive: prompts for confirmation before merging.

---

### `PaymentProgramAuditPanel`

```
const PaymentProgramAuditPanel = ({
  payments, programs, families, onUpdate, initialFilter,
  stepUpPayments, onUpdateStepUp
})
```

Find and reassign payments tagged to the wrong program. Shows payments with their current program attribution; allows bulk reassignment. Useful for fixing Film Workshop payments that were originally imported without `programId`.

---

### `NextYearSetupPanel`

```
const NextYearSetupPanel = ({ ... })
```

Guided panel for setting up the next school year's enrollments. Walks through program selection, pricing confirmation, and bulk re-enrollment of returning students.

---

## List/Table Components

### `ManualPaymentsList`

```
const ManualPaymentsList = ({
  payments, programs, getFamilyById, canEdit, selectedYear,
  onEdit, onDelete, onProgramChange
})
```

Payment table in the Payments tab. Shows each payment with family, date, amount, method, year, program, and allocated months. Month-lock indicator shows which months have received payment allocations. Supports edit and delete.

---

### `MonthAllocationPicker`

```
const MonthAllocationPicker = ({ familyId, appliedYear, enrollments, selected, onChange })
```

UI for assigning a payment to specific billing months. Shows all months from the family's enrollments for the `appliedYear`. Selected months are highlighted. Used inside `PaymentModal`.

---

### `CategoryManager`

```
const CategoryManager = ({ expenseCategories, setExpenseCategories, expenses, setExpenses, writeAudit })
```

Manage expense categories and subcategories. Add, rename, merge, or delete categories. Merging reassigns all expenses from the source category to the target before deleting.

---

## Utility and Helper Functions

### `getProgramDisplayName(progId, year)`

Returns the year-specific display name for a program from `PROGRAM_NAMES_BY_YEAR`. Falls back to the stored `program.name` if no year-specific name exists.

### `getProgramsForYear(programs, year)`

Returns only programs that are active in the given school year (i.e., have an entry in `PROGRAM_NAMES_BY_YEAR`).

### `buildMonthlyCharges(annual, deposit, paymentMonths, startMonth)`

From `calculations.js`. Builds the `monthlyCharges` object for an enrollment. See `billing-and-pricing.md` for full documentation.

### `calcDeposit(annual, pct)`

From `calculations.js`. Computes deposit amount as a rounded percentage of annual tuition.

### `computeFamilyBalances(familyId, schoolYearFilter, data, now)`

```js
computeFamilyBalances(familyId, schoolYearFilter, {
  students, enrollments, payments, stepUpPayments,
  families,
  charges = [],   // optional flat charge records; defaults to [] (Grow-safe)
}, now = new Date())
// → { currentBalance, totalAR, totalOwed, totalPaid, currentOwed }
```

From `calculations.js`. Returns balance summary for a family. Used by the `getFamilyBalances` callback passed to several tab components.

Flat charges (if passed) are filtered by `familyId` and `schoolYear` (or all years on `'All Time'`) and add to both `totalOwed` and `currentOwed` immediately — no month-by-month drip. Passing `charges = []` (the default) produces byte-identical output to before this feature was added.

### `buildInvoicePrefix(lastName, existingPrefixes)`

From `calculations.js`. Derives a unique 4-char uppercase billing code from a family last name. Appends a digit on collision (`SMIT` → `SMI2`, `SMI3`, …). Called in `GrowERP` whenever a new family is saved.

### `getInvoiceNumber(invoicePrefix, monthKey, schoolYear)`

From `calculations.js`. Formats a full structured invoice number: `SMIT-2627-DEP` for the enrollment deposit, `SMIT-2627-JUN` for the June monthly charge, etc. Returns `''` when `invoicePrefix` is absent (safe to call unconditionally). Used in `InvoiceModal` for 2026-2027+ years.
