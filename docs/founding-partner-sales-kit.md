# Founding Partner Sales Kit

Use this guide with the public `/founding-partners/` Fit Check. It translates a submission into a warm, consistent next step without turning the process into an automated rejection funnel.

## Fit bands

The contact email includes an automatically suggested fit band and internal score. These are starting points only. Review every submission personally before replying.

### Strong fit now

Typical signals:

- Full-time microschool or homeschool co-op.
- Defined recurring or annual tuition.
- Approximately 10-100 students.
- Current financial or scholarship pain.
- At least three onboarding inputs available.
- Named implementation owner.
- Weekly availability during the first month.
- Desired implementation within approximately 90 days.

### Discovery required

Typical signals:

- Private school, hybrid model, multiple sites, custom pricing, or multiple scholarship organizations.
- A potentially strong need with important workflow questions still unanswered.
- Some implementation readiness but incomplete source information or ownership.

### Future fit / nurture

Typical signals:

- Primarily tutoring, enrichment, hourly, or marketplace-style services outside the current wedge.
- No current implementation owner or working-session availability.
- Source information is not available.
- The school is researching without a timeline.

Do not describe a school as a poor fit in the response. Explain honestly what MSL supports today and preserve the relationship.

## Response template: strong fit

**Subject:** Next step for [School Name] and Microschool Ledger

Hi [First Name],

Thanks for telling us about [School Name]. Based on what you shared—especially [specific operating detail]—it sounds like there may be a strong fit for a Founding Partner conversation.

The next step is a short working conversation about your programs, pricing, payment plans, and current billing process. We will focus on whether Microschool Ledger can responsibly support the way your school operates, rather than giving you a generic product tour.

Would either of these work for a 20-minute conversation?

- [Option 1]
- [Option 2]

If neither works, reply with a better time and we will work around your schedule.

Thanks,

Austin
Microschool Ledger
Built by The Grow Co-op

## Response template: discovery required

**Subject:** A couple of questions about [School Name]

Hi [First Name],

Thanks for completing the Founding Partner Fit Check. [Specific detail] is especially helpful.

Your school may be a fit, but I would like to understand [one or two genuine uncertainties] before suggesting an implementation. Could you tell me:

1. [Specific question]
2. [Specific question]

You can reply by email, or we can compare notes for 20 minutes if that is easier. Once we understand those pieces, we can show you only the parts of Microschool Ledger that are relevant.

Thanks,

Austin
Microschool Ledger
Built by The Grow Co-op

## Response template: future fit / nurture

**Subject:** Thanks for telling us about [School Name]

Hi [First Name],

Thanks for sharing how [School Name] operates. Based on what you described, I do not want to push you into an implementation before either the timing or workflow is right.

[Choose one honest, specific explanation: MSL is currently deepest for full-time recurring tuition programs; the school is still selecting an internal owner; the source information is not ready; the requested model needs more discovery.]

I would still be glad to stay in touch and share useful information as Microschool Ledger develops. In the meantime, [link one relevant guide or the live demo].

Would it be okay if I checked back around [specific month/date]?

Thanks,

Austin
Microschool Ledger
Built by The Grow Co-op

## Twenty-minute fit conversation

The purpose is to understand whether an implementation is responsible and timely. It is not a full feature tour.

### Suggested agenda

1. What programs does the school operate?
2. What does each program cost?
3. How do families agree to pay?
4. Which scholarships and payment sources are involved?
5. Which systems contain the current records?
6. What is unreliable, time-consuming, or financially risky today?
7. What must be working for the implementation to feel successful?
8. Who owns setup and validation?
9. Which onboarding inputs are actually available?
10. When does the school want to use the new process in real operations?

### Close the conversation with one of three explicit outcomes

- **Invite to onboarding:** agree on owner, inputs, secure handoff, and kickoff date.
- **Discovery follow-up:** name the unanswered question, owner, and date.
- **Nurture:** state honestly why now is not the right implementation window and set a future follow-up date.

## Secure onboarding-input checklist

Do not collect student or family records through the public Fit Check or ordinary analytics. After mutual fit is established, arrange an agreed secure transfer method and request only what is required.

Potential inputs:

- Current roster.
- Program catalog and pricing.
- Deposit and payment-plan rules.
- Discounts, financial-aid rules, and relevant contract terms.
- Recent scholarship payment report, when applicable.
- Current balances or transaction history needed for validation.
- School-year dates and desired go-live timing.
- Named implementation owner and accountant/bookkeeper contact when relevant.

Before importing, confirm which file is authoritative for each fact. A roster is authoritative for student identity only when the school confirms it; a scholarship report does not universally define a program, family, or operating school year.

## Recommended Streak stages

| Stage | Required next action |
|---|---|
| Target identified | Research one relevant fact and send personal outreach |
| Contacted | Schedule the next follow-up date |
| Engaged | Complete missing Fit Check information |
| Fit information complete | Assign Strong / Discovery / Nurture after personal review |
| Qualified | Schedule fit conversation |
| Fit conversation scheduled | Prepare school-specific questions |
| Onboarding invited | Send secure input checklist |
| Inputs requested | Confirm owner and due date |
| Inputs received | Review completeness and schedule kickoff |
| Kickoff scheduled | Prepare workflow map and staged-import plan |
| Configuration / import | Track exceptions and school validation owner |
| Initial validation complete | Agree on full-roster or live-workflow step |
| Active founding partner | Track weekly use and activation milestone |
| Paid | Request feedback and assess reference readiness |
| Nurture / not now | Record reason and specific follow-up date |

## Weekly pipeline review

For every active opportunity, record:

- Current stage.
- Strongest reason it may fit.
- Primary uncertainty or blocker.
- Next action.
- Owner.
- Due date.

Review the conversions that matter:

- Fit Check submitted -> qualified conversation.
- Qualified conversation -> onboarding invitation.
- Onboarding invitation -> inputs received.
- Inputs received -> validated records.
- Validated records -> active weekly use.

Do not use demos completed, emails sent, or social followers as substitutes for implementation progress.

## Analytics events

The page emits:

- `founding_partner_page_viewed`
- `fit_check_started`
- `fit_check_step_completed`
- `fit_check_submitted`
- `fit_check_schedule_clicked`

The homepage Founding Partner CTA emits `founding_partner_cta_clicked`. Pricing-page clicks continue through the existing `pricing_cta_clicked` event with `cta: founding_partner_fit`.

Analytics events contain page, step, CTA location, pathname, and campaign attribution. They must never contain names, email addresses, phone numbers, school names, free-text responses, or source records.
