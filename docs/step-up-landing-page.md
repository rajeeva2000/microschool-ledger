# Step Up outbound landing page

The campaign landing page lives at `/step-up`. Its primary conversion sends visitors through `/schedule`, records the Calendly start in PostHog, preserves campaign UTMs, and redirects to:

`https://calendly.com/austin-microschoolledger/30min`

## Calendly configuration

The landing-page promise is a **20-minute walkthrough**. Confirm that the Calendly event at the URL above is configured for 20 minutes even though its current slug is `30min`.

Recommended required invitee questions:

1. **How many students do you currently serve?**
   - Under 25
   - 25–50
   - 50–100
   - 100+
2. **How are you currently managing tuition and billing?**
   - Spreadsheets
   - QuickBooks
   - Brightwheel
   - FACTS
   - Bookkeeper
   - Multiple systems
   - Other

## Campaign placeholders

- The repository does not include a direct email address for Austin Murray, so the page currently uses `info@microschoolledger.com` while naming Austin as the contact.
- The repository does not include a genuine founder or school photo. The operator-credibility section uses a branded card until an approved photo of the founders or The GROW Co-op is supplied.

## Analytics

The landing page emits `outbound_landing_viewed`, `primary_cta_clicked`, `secondary_cta_clicked`, `email_clicked`, and `phone_clicked`. The `/schedule` redirect emits `calendly_started`. Each event includes campaign UTMs, page, CTA location, pathname, and the landing-page referrer when available.

Existing site-wide `demo_link_clicked` and `demo_requested` events are unchanged.

The Founding Partner path is documented separately in `docs/founding-partner-sales-kit.md`. Its optional scheduling link also routes through `/schedule`, using `cta_location=founding_partner_confirmation`, so Calendly tracking and campaign attribution remain centralized.
