# Customer Discovery — MSLedger

This document tracks what we know, what we're assuming, and what we need to validate through conversations with real providers before building.

---

## How to use this

Before building any significant feature, find 2–3 providers in the relevant segment and walk through the questions below. The goal is never "would you use this feature?" — it's "do you have this problem, and how painful is it?"

**Good sources for contacts:**
- `stepup_providers_filtered.xlsx - stepup_providers.csv` in the repo — 2,921 providers with name, email, and category
- Filter by `Service Categories` for the segment you want to talk to
- Cold email template (4 sentences, no pitch):

> "Hi — I build financial management software for microschools and homeschool co-ops. I'm trying to understand how [annual tuition programs / enrichment class providers] handle billing and payments today. Would you have 20 minutes for a quick call? I'm not selling anything — just trying to understand the problem before I build anything."

---

## Segment A: Annual tuition programs (microschools, home ed co-ops)

*These are Grow-type customers. We've built for this model but validated it with only one school.*

**Target providers in the StepUp data:**
- Service Category: `Home Education Instructional Program Tuition & Fees` (1,027 providers)
- Service Category: `Eligible Private School Full-Time` (155 providers)

### Questions to ask

**Billing setup**
- Walk me through how you set tuition for the year. Is it the same for every family, or does it vary?
- Do you offer payment plans? How many options do you give families?
- Do you charge a deposit or enrollment fee upfront? When is it due?
- Do you offer sibling discounts?

**Tracking payments**
- How do you keep track of who has paid and who hasn't? What tool or system do you use today?
- How do you handle StepUp / ESA scholarship payments? Do you match them to specific families manually?
- What happens when a family is late? How do you find out, and what do you do?

**Invoicing and statements**
- Do you send families a statement or invoice? What does that look like today?
- Have families ever disputed a balance? How did you resolve it?

**Pain points**
- What's the most time-consuming part of billing and collections for you?
- What breaks down at the start of a new school year?
- If you could fix one thing about how you manage tuition today, what would it be?

### What we're assuming (needs validation)

| Assumption | Risk if wrong |
|---|---|
| Annual tuition + deposit + monthly installments is the dominant billing structure | We may need to support semester billing or quarterly plans as primary, not edge cases |
| Sibling discounts are a near-universal concern | May be less common than we think; over-engineered it |
| Families pay via manual bank transfer or check; StepUp is a secondary credit | Some schools may be primarily StepUp-funded; payment flow could be different |
| Admins want to see overdue balances at a glance | They may care more about year-end totals than month-by-month tracking |
| The parent portal (read-only balance view) is valuable to families | Families may not want or use it; could be a distraction |

---

## Segment B: Enrichment / elective / PE providers

*These are the 55% of the StepUp market we don't currently serve well. The flat charge feature is designed for them.*

**Target providers in the StepUp data:**
- Service Category: `Physical Education (PE)` (939 providers)
- Service Category: `Elective Courses` (569 providers)
- Service Category: `Specialized After-School Education Program` (128 providers)

### Questions to ask

**How they sell and price**
- Describe what you offer. Is it a semester-long class, a drop-in, a set number of sessions?
- How do you price it — flat fee per semester, per session, monthly?
- Do you charge different amounts for different classes, or is it one price for everything?
- Do you charge a registration fee or materials fee separately?

**Billing and collection**
- How do you tell a family what they owe? Do you send an invoice, an email, a form?
- When is payment due — at registration, first class, monthly?
- How do you track who has paid vs. who hasn't?
- What happens when a family registers for multiple classes? Do they get one bill or one per class?

**Mid-term situations**
- What happens if a family joins mid-semester? Do you prorate?
- What if a student drops a class? Do you issue a refund?

**StepUp / ESA payments**
- Do families pay you with StepUp funds? If so, how does that work in practice?
- Do you have to do anything special to receive or track those payments?

**Pain points**
- What's the messiest part of billing and collections for you right now?
- What do you use today — spreadsheet, QuickBooks, something else?
- How much time do you spend on billing admin per month?

### What we're assuming (needs validation)

| Assumption | Risk if wrong |
|---|---|
| A flat semester fee is the dominant pricing structure | Could be monthly or per-session; would require different data model |
| Providers want to track charges per student (not just per family) | They may bill the family as a unit regardless of how many kids are enrolled |
| Registration and materials fees are common and tracked separately | May be bundled into the class fee; separate charge type may be unnecessary |
| Providers need to generate a statement or invoice for families | Some may just send a Venmo request; "invoicing" may not be the right frame |
| StepUp payments work the same way as for annual tuition schools | ESA rules may differ by program type; needs verification |
| Enrichment providers are running their own admin (not outsourcing it) | Larger studios may have dedicated admin staff with existing tools |

---

## What to do after conversations

1. **Update the assumptions table above** — mark each as Confirmed, Invalidated, or Modified
2. **Update the spec** (`docs/FLAT-CHARGE-SPEC.md`) if the data model or UI needs to change
3. **Update the roadmap** (`docs/ROADMAP.md`) if the priority order changes
4. **Note any verbatim quotes** that capture a pain point clearly — these are useful for writing copy later

---

## Conversations log

| Date | Provider name | Category | Key findings |
|---|---|---|---|
| — | — | — | No conversations yet |
