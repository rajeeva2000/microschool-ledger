# Grow ERP v3 — Design Document
**Status:** Planning / Pre-development
**Last updated:** March 2026
**Author:** Rajeev @ The Grow Co-op

---

## Vision

Grow ERP started as a tool built for one co-op's exact situation. v3 is the first step toward making it something any microschool or homeschool co-op could pick up and use — without needing a developer, without a spreadsheet migration project, and without a learning curve that eats up a Saturday.

The design inspiration is **Gusto** — specifically how Gusto turns HR, payroll, and benefits administration (a legitimately complex domain full of edge cases, regulations, and one-time-per-year events) into something that a 5-person company's part-time office manager can run confidently. Gusto does this through:

1. **Wizards for high-stakes, low-frequency tasks** — payroll runs, new hire onboarding, benefits enrollment. These only happen a few times a year but they have to be right.
2. **Action-oriented home screens** — "Here's what needs your attention today." Not a dashboard full of charts. A list of things to do.
3. **Progressive disclosure** — the app looks simple until you need the complexity. Settings and edge cases live behind a "More options" link.
4. **Guardrails, not just forms** — before you finish a task, the app sanity-checks your work. "You're about to process payroll. Here's what will be charged. Confirm?"

For a homeschool co-op, the equivalent high-stakes events are:
- **Opening enrollment for a new school year** (happens once a year, takes hours if done manually)
- **Getting a brand-new co-op started on the system** (one-time, overwhelming without guidance)
- **Monthly billing cycles** (recurring, moderate stakes, error-prone if rushed)

v3 targets all three.

---

## What's Changing from v2

v2 (current production) has 9 tabs organized by data type (Families, Students, Enrollments, Payments, etc.). This was right for the early build when we were figuring out what we needed. It's now limiting.

**The problem:** administrators think in tasks, not tables. "I need to enroll next year's students" is not the same mental model as "I need to go to Enrollments, then Programs, then Pricing Rules, then run the wizard."

v3 reorganizes around **workflows and roles**, not data types.

---

## Navigation: 7 Tabs

The 9 current tabs consolidate to 7, with the biggest wins coming from merging Students into Families and splitting the current bloated Setup tab into more purposeful sections.

| # | Tab | What It Replaces | Core Purpose |
|---|-----|-----------------|--------------|
| 1 | **Home** | Home (enhanced) | Action items for today; year-at-a-glance health |
| 2 | **Families** | Families + Students | Single unified record per family including all students |
| 3 | **Enrollments** | Enrollments | Enrollment management + wizard; annual roster |
| 4 | **Payments** | Payments | All money in: manual, Stripe, StepUp |
| 5 | **Finances** | Finances | All money out: expenses, P&L, budget |
| 6 | **Reports** | Reports + Collections | Revenue, enrollment counts, overdue, invoices |
| 7 | **Setup** | Setup (restructured) | Programs, pricing, access, admin tools |

The two wizards (Onboarding and Next Year Setup) are **not tabs** — they're modal-style flows launched from contextual prompts, similar to how Gusto surfaces "Run Payroll" as a prominent button rather than a nav item.

---

## Tab 1: Home

### Current State
The current Home tab shows enrollment counts and overdue alerts. Useful, but passive.

### v3 Home: The Action List

Inspired directly by Gusto's dashboard, v3 Home is organized around **"What needs your attention right now?"**

#### Priority Tiers

**Urgent (red banner, top)**
- Families with overdue balance > 30 days
- StepUp imports that have payments with unmatched students
- Any failed data migration

**This Month (amber section)**
- Families with payment due this month who haven't paid yet
- Families with deposits due this month who haven't paid
- Upcoming enrollment deadlines (if configured)

**Good to Know (gray section, collapsible)**
- Total enrolled students by program
- YTD revenue vs. projection
- Next payment plan milestone

#### Year Health Summary (sidebar or top strip)
A compact set of numbers:
- Total enrolled (this year) / capacity (if set)
- Revenue collected / projected
- Families: # paid in full / # with balance / # overdue
- Days until end of school year

#### Quick Actions
Persistent shortcuts regardless of state:
- Record a Payment
- View Collections
- Run Next Year Setup (if not yet done for upcoming year)

---

## Tab 2: Families

### Merging Students In

Students don't exist without families. The current separation forces admins to context-switch between tabs to understand a family's situation. v3 makes the student list a section within the family record.

**Family card (collapsed view):**
- Family name + type badge
- Primary contact email + phone
- # students enrolled (this year)
- Balance: amount, status badge (Paid / Due / Overdue), last payment date

**Family card (expanded view):**

*Students section*
- Each student listed with: name, grade, programs enrolled this year, sibling position
- + Add Student inline

*Enrollments section*
- Active enrollments this year with program, plan type, annual tuition, and deposit status
- Expandable to show monthlyCharges breakdown
- + Enroll button opens wizard pre-filled with this family

*Payments section*
- All payments this year (manual + StepUp) in chronological order
- Month allocations shown inline where set
- + Record Payment button

*Balance section*
- Total annual charges
- Total paid (manual + StepUp separately)
- Balance due
- View Full Invoice button → opens printable statement

---

## Tab 3: Enrollments

Largely unchanged from current. Key v3 improvements:

**Roster view** (new default): a table of all enrolled students this year, grouped by program. Useful for attendance sheets, substitutes, and general "who's in what" questions.

**Enrollment cards** (existing): existing detail view, available as secondary view.

**Year switcher** prominently placed — switching years should be a one-click action, not a dropdown buried in the corner.

**Inactive enrollment handling**: better UI for withdrawn students (shown in a separate "Inactive" section, not mixed with active).

---

## Tab 4: Payments

Largely unchanged. Key v3 improvements:

**Reconciliation mode** (new): a side-by-side view showing expected monthly payments vs. what's actually been recorded, per family. Makes it easy to spot who hasn't paid a given month without going family by family.

**StepUp status panel**: shows the current year's StepUp import state — date of last import, total amount imported, count of unmatched records, and a button to re-import.

---

## Tab 5: Finances

Largely unchanged. Key v3 improvement:

**Budget workflow**: currently budget amounts are entered per-category in a tab. In v3, the budget setup becomes part of the **Next Year Setup wizard** (described below), so it arrives pre-populated rather than requiring manual entry each year.

---

## Tab 6: Reports

Merging the current Reports tab and Collections into one tab with two sub-views:

**Collections sub-view** (currently its own tab)
- Overdue tracker, invoice generation, email pre-fill
- Becomes Reports → Collections

**Revenue sub-view**
- Revenue by program and year (existing)
- YTD vs. projection chart (new)
- Year-over-year comparison (new — requires 2+ years of data)

**Enrollment sub-view**
- Enrollment counts by program, year, family type
- Capacity utilization if capacity is configured

**Export**
- All export functionality consolidated here: family ledger, enrollment detail, payment logs, expense export

---

## Tab 7: Setup

Restructured into clearer sub-sections:

| Sub-tab | Contents |
|---------|---------|
| Programs | Add/edit programs, year-specific names, payment plan schedules |
| Pricing | Tuition rates per family type × sibling position × program × year |
| Discounts | Sibling discount percentages per program |
| Access | Email-based role management |
| Audit Log | Full change history |
| Data Tools | Merge duplicates, repair tools, migrations, backup/restore |

---

## Wizard 1: Onboarding — "Set Up Your Co-op"

### Who This Is For
A brand-new organization that has never used Grow ERP. Today, setting up a new co-op requires a developer who knows Firestore and can seed the initial data. The onboarding wizard makes this self-service.

### When It Appears
The first time a user logs in and the database is completely empty (no families, no programs, no pricing rules). After completing the wizard, it never appears again.

Alternatively: accessible from Setup → "Start Over / Re-onboard" for test environments.

### Design Principles
- **One decision per screen.** Don't overwhelm with a form. Each step asks for one thing.
- **Explain the "why."** Each step has a short paragraph explaining why we're asking and how it affects billing. Microschool admins are smart but they're not accountants.
- **Sane defaults.** Pre-fill everything we can. The admin can always change it later.
- **Skippable but flagged.** Steps that aren't blocking can be skipped with a "I'll set this up later" link — but they'll appear as incomplete on the Home tab.
- **Preview before commit.** At the end, show a summary of everything that will be created. Require explicit confirmation.

### Steps

---

**Step 0: Welcome**
```
Welcome to Grow ERP.

This setup wizard will help you configure your co-op in about 10–15 minutes.
You'll set up your programs, tuition rates, and payment structure.

Once you're done, you can start adding families and enrolling students.

[Let's go →]          [I'll explore on my own]
```

---

**Step 1: Your Organization**
```
Tell us about your co-op.

Organization name: [The Grow Co-op          ]
School year format: [June–May ▾]   (most co-ops run June through May)
Current school year: [2025-2026 ▾]
Location (optional): [South Florida         ]

ℹ️ The school year setting affects how payments are attributed and how
   reports are filtered. You can always adjust this later in Setup.
```

---

**Step 2: Family Types**

```
What types of families does your co-op have?

Grow ERP supports multiple "family types" — each type can have its own
tuition rate. Common setups:

☑ Founding families   (lower rate for founding members)
☑ Standard families   (regular tuition)
☐ Teacher families    (staff — fixed rate, no sibling discount)

You can rename these to match your co-op's terminology.

[+ Add a custom family type]
```

Founders/members-only co-ops might only use one type. The wizard adapts.

---

**Step 3: Programs**

```
What programs does your co-op run?

A "program" is a course, class, or activity that students enroll in
separately and that generates tuition revenue.

Example: If you run a 2-day core academic program AND a Friday enrichment
class, those are two separate programs.

[+ Add a Program]

Program 1: [Core Program              ]  Type: [Recurring ▾]
Program 2: [Film Workshop             ]  Type: [One-time fee ▾]

ℹ️ "Recurring" programs have monthly charges. "One-time fee" programs
   charge a single annual amount.
```

---

**Step 4: Payment Plans**

For each recurring program, configure how billing works:

```
Payment plan for: Core Program

How do families pay for this program?

Deposit
  Deposit required? [Yes ▾]
  Deposit amount:   [20% of annual tuition ▾]
  Deposit due:      [March ▾]

Monthly payments
  Payment plan options:
  ☑ 12-month plan  (June through May)
  ☑ 10-month plan  (August through May)
  ☐ Custom...

ℹ️ Families will choose their plan at enrollment time. You can offer
   one or both options.
```

---

**Step 5: Tuition Rates**

```
Set tuition rates for Core Program — 2025-2026

Enter the annual tuition for each family type and sibling position.
Grow ERP will automatically calculate monthly charges and deposits.

                     1st student    2nd student    3rd student
Founding families:   [$7,200    ]   [$6,840    ]   [$6,696    ]
Standard families:   [$9,600    ]   [$9,120    ]   [$8,928    ]
Teacher families:    [$6,000    ]   [same ▾    ]   [same ▾    ]

ℹ️ "2nd student" rate applies to the second sibling enrolled in this
   same program (sibling discounts are per-program, not per family).
   Leave Teacher families blank to use the same rate for all siblings.
```

Repeat for each program.

---

**Step 6: Sibling Discounts (optional)**

```
Sibling discount configuration

If you entered different rates per sibling above, Grow ERP calculated
the discount automatically. But you can also define discounts as
percentages and let the system compute the rates.

Use percentage discounts instead?  [No, I entered exact rates ▾]

ℹ️ Most co-ops find it easier to enter exact dollar amounts.
   Percentage-based discounts are useful if your base rate changes
   year to year and you want discounts to adjust automatically.
```

---

**Step 7: Your First Families (optional)**

```
Add your families now, or import them later.

You can:
• [Add families one by one →]
• [Import from a spreadsheet →]   (CSV with column guide)
• [Skip — I'll add families later]

ℹ️ If you're migrating from spreadsheets, the import tool accepts
   a standard CSV format. We'll show you the column template.
```

---

**Step 8: Review & Confirm**

```
Here's what will be created:

Organization
  The Grow Co-op · School year: 2025-2026

Family types
  • Founding  • Standard  • Teacher

Programs
  • Core Program (12-month and 10-month plans, 20% deposit due March)
  • Film Workshop (one-time fee)

Tuition rates — Core Program 2025-2026
  Founding:   $7,200 / $6,840 / $6,696
  Standard:   $9,600 / $9,120 / $8,928
  Teacher:    $6,000 (fixed)

Everything looks good? You can change any of this later in Setup.

[← Back and edit]     [Create my co-op →]
```

After confirmation: Firestore is seeded, the user lands on Home, and a "Nice work! You're set up." success banner appears with links to "Add your first family" and "Enroll your first student."

---

## Wizard 2: Next Year Setup — "Open [Year] Enrollment"

### Who This Is For
Every co-op administrator, every year. This is the Gusto equivalent of "Run Payroll" — a high-stakes, structured flow that walks you through everything that needs to happen to open a new school year without missing a step.

Today, this process involves: creating a new set of pricing rules in Setup, creating new payment plans in Setup, then running the Enrollment Wizard per student. It's scattered across 3–4 different places and easy to do out of order.

### When It Appears
- **Prompted automatically** on the Home tab starting ~3 months before the upcoming school year would begin (e.g., January for a June start)
- Accessible at any time from: Home → "Set up [Year]" or Setup → "Next Year Setup"
- The prompt says: "2026-2027 setup is not yet complete. [Start setup →]"
- After completion, the prompt disappears and Home shows the new year's health stats

### Design Principles
Same as Onboarding, plus:
- **Show what's changing vs. last year.** "Last year's rate was $9,600. What's the rate for 2026-2027?" Rather than blank fields.
- **Re-enrollment as default.** Assume returning families re-enroll in the same programs unless told otherwise — let the admin confirm or remove.
- **Completion tracker.** A sidebar shows which steps are done (✓) and which remain (○), so the admin can close and come back without losing their place.

### Steps

---

**Step 0: Start**

```
Setting up 2026-2027

This wizard will walk you through:
  ✓ Updating tuition rates
  ✓ Configuring payment plans
  ✓ Setting an expense budget
  ✓ Re-enrolling returning families
  ✓ Opening enrollment for new families

Estimated time: 20–30 minutes
You can save your progress and return at any time.

[Start setup →]          [I'll do this manually]
```

---

**Step 1: Carry Over or Change Programs**

```
Which programs are you running in 2026-2027?

Based on last year:

☑ Core Program (Tue/Wed)     [Keep same name ▾] or [Rename...]
☑ Enrichment: Film           [Keep same name ▾]
☑ Enrichment: Art & Learning [Keep same name ▾]
☐ [+ Add a new program]

ℹ️ You can rename programs year-over-year — the display name is
   year-specific, so renaming won't affect historical records.
```

---

**Step 2: Update Payment Plans**

```
Payment plans for 2026-2027

Last year's plan for Core Program:
  Deposit: 20% due March · 12-month (Jun–May) or 10-month (Aug–May)

Keep the same structure for 2026-2027?  [Yes, keep the same ▾]

ℹ️ If you're changing from a 10-month to a 12-month structure
   (or vice versa), you can adjust here. You can also change the
   deposit month or percentage.
```

---

**Step 3: Set New Tuition Rates**

```
Tuition rates for Core Program — 2026-2027

Last year's rates are shown on the left. Enter new rates on the right.
Leave unchanged if rates aren't changing.

                   2025-2026        2026-2027
Founding, child 1  $7,200           [$7,200    ]  (no change ✓)
Founding, child 2  $6,840           [$6,840    ]  (no change ✓)
Founding, child 3  $6,696           [$6,696    ]  (no change ✓)
Standard, child 1  $9,600           [$9,600    ]  (no change ✓)
Standard, child 2  $9,120           [$9,120    ]  (no change ✓)
Standard, child 3  $8,928           [$8,928    ]  (no change ✓)
Teacher            $6,000           [$6,000    ]  (no change ✓)

Changed fields will be highlighted. Rates take effect immediately
for any new enrollments.
```

---

**Step 4: Set Annual Budget (optional)**

```
Expense budget for 2026-2027

Setting a budget lets Grow ERP show "Budget vs. Actual" in your P&L.

Copy from last year?  [Yes, copy last year's budget ▾]

Category              Last year budget    2026-2027 budget
Facilities            $18,000             [$18,000  ]
Curriculum            $4,500              [$4,500   ]
Staff                 $62,000             [$65,000  ]
Insurance             $2,800              [$2,800   ]
Supplies              $1,200              [$1,200   ]
...

Total: $89,700

[Skip budget for now]
```

---

**Step 5: Re-enroll Returning Students**

This is the biggest time-saver in the wizard.

```
Re-enrolling returning families

28 students were enrolled in Core Program in 2025-2026.
We've pre-selected all of them for re-enrollment in 2026-2027.

Review the list and uncheck any students who are NOT returning.

☑ Anderson family         Emma (gr 4), Lily (gr 6)     12-month plan
☑ Bergmann family         Carlos (gr 8)                 10-month plan
☐ Cortez family           [not returning — removed]
☑ Davis family            Sophie (gr 3), Max (gr 5)     12-month plan
...

28 returning · 1 not returning · 0 new (add below)

[+ Add a new student for 2026-2027]

Payment plan for all re-enrollments: [Keep each family's previous plan ▾]

ℹ️ Each family's previous plan selection is shown. You can override
   to set all families to the same plan, or leave individual choices
   as-is. Families can request a plan change by contacting you.
```

---

**Step 6: Generate Charges**

```
Ready to generate 2026-2027 charges

We're about to create enrollment records and monthly charge schedules
for 27 returning students across 2 programs.

Here's a preview:

Core Program — 27 students
  Annual tuition total:    $216,480
  Deposit total (20%):     $43,296  (due March 2026)
  Monthly charges total:   $173,184 (12-month: Jun–May)

Enrichment: Film — 14 students
  Annual fee total:        $9,450

Grand total projected revenue: $225,930

Enrollment records will be created. This does NOT send any notifications
to families or generate invoices — that's a separate step.

[← Review list]          [Generate enrollments →]
```

After clicking: a progress indicator, then a success screen.

---

**Step 7: Next Steps**

```
2026-2027 is set up! ✓

What's next:

[ Send deposit invoices to all families ]
  Generate and download PDF statements showing the deposit due in March.
  → Opens invoice batch modal

[ Record deposits as they arrive ]
  As families send their deposits, record them in the Payments tab.
  → Go to Payments

[ Enroll new families ]
  Use the Enrollment Wizard to add any new families joining for 2026-2027.
  → Go to Enrollments

[ Set up automated payment reminders ]  (coming in v4)
  Send monthly email reminders from within Grow ERP.
```

---

## Additional v3 Improvements

### Batch Invoice Generation
Currently invoices are generated one family at a time. v3 adds:
- "Generate invoices for all families" → produces a ZIP of PDFs or a combined PDF
- Triggered as a "next step" from the Next Year Setup wizard

### Notification Center (simple)
A bell icon in the nav bar with a badge count. Not email — in-app alerts only.
- "3 families have overdue balances"
- "2 StepUp payments unmatched to students"
- "Next Year Setup not started — school year begins in 67 days"

### Capacity Tracking (optional)
Programs can have a maximum seat count. Setup → Programs → [Edit] → Capacity. Home and Reports show enrolled/capacity.

### Family Communication Log
A simple free-text log per family where admins can note: "Called 3/5, promised to pay by 3/15" or "Requested 10-month plan for next year." Not a full CRM — just a sticky notepad per family.

---

## What v3 Is NOT

To keep scope manageable, v3 explicitly excludes:

- **Automated email sending** — mailto: links only; no email server integration (v4 consideration)
- **Online payment collection** — no Stripe integration for families to pay directly (v4 consideration)
- **Multi-organization support** — Grow ERP is still a single-tenant app; one Firebase project per co-op
- **Mobile-first redesign** — responsive improvements only; native app is v5+
- **QuickBooks / accounting export** — manual CSV export is sufficient for now

---

## Implementation Sequence

The wizards depend on the core tabs being stable. Recommended order:

1. **Tab consolidation** — merge Students into Families, merge Collections into Reports
2. **Home tab redesign** — action list, year health strip, quick actions
3. **Next Year Setup wizard** — highest ROI; saves admins hours every spring
4. **Onboarding wizard** — enables self-service for new co-ops

Each phase ships independently and improves the product on its own.

---

## Tailoring for Microschools & Homeschool Co-ops

The design choices above reflect what makes this category different from standard school billing software:

| Standard school software assumes... | Microschool/co-op reality |
|--------------------------------------|---------------------------|
| One tuition rate per grade level | Multiple family types with founder tiers |
| Parents pay, period | Split funding: family + state scholarship programs |
| 12 months, fixed calendar | Flexible year structures (June–May, Sept–June, etc.) |
| IT staff to configure the system | Parent-volunteers with limited admin time |
| Stable enrollment; changes are exceptions | Re-enrollment happens every year as a first-class event |
| Professional billing team | One or two people wearing many hats |

The wizards, the Gusto-style action list, and the "show me what changed from last year" patterns are all in service of this: **the administrator shouldn't need to remember what they did last year or know the right order of operations — the software should guide them through it.**

---

*This document is maintained alongside the codebase. Update it as designs are refined or scope changes.*
