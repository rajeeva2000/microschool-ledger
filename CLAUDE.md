# Microschool Ledger marketing site instructions

Read this file before changing any public page in this repository. These rules preserve the SEO, accessibility, analytics, security, performance, conversion, and brand work already completed.

## Sources of truth

- `BRAND.md` is the canonical brand and voice guide. Do not invent new colors, fonts, logo treatments, or product names.
- `docs/step-up-landing-page.md` documents the `/step-up` campaign flow and its analytics events.
- `vercel.json` contains production security headers. Do not weaken or replace them without a specific security review.
- `posthog-init.js` is the shared deferred PostHog initialization. Do not duplicate PostHog initialization inside a page.

## Locked brand decisions

- Keep Lora for headings and DM Sans for body/UI text.
- Keep the current Pine, Sand, Grass, Gold, and supporting brand palette from `BRAND.md`.
- Do not treat brand fonts or colors as performance optimizations. They are intentionally selected.
- Write the product name as **Microschool Ledger**. Use “MSL” only inside the mark/favicon, never as prose or as a shortened page-title brand.
- On first mention, use “Florida Step-Up for Students”; “Step-Up” is acceptable thereafter.
- When describing market depth, use **“Deepest integration for Florida Step-Up”**, not “Deepest for Florida Step-Up.”

## Required structure for every indexable public page

Before considering a new page complete, confirm all of the following:

1. A unique, descriptive `<title>` that matches search intent.
2. A unique meta description, self-referencing canonical URL on `https://www.microschoolledger.com`, and matching Open Graph and Twitter/X metadata.
3. The shared `/favicon.svg` and the standard `og-image.png` social image unless the page has an approved page-specific image.
4. Exactly one descriptive `<h1>` and a logical heading hierarchy without skipped levels.
5. Exactly one `<main id="main-content">` landmark containing the primary content.
6. A keyboard-accessible first link: `<a class="skip-link" href="#main-content">Skip to main content</a>`.
7. A primary `<nav aria-label="Primary navigation">` when navigation is present. Label additional navigation distinctly.
8. Real links for navigation. Buttons are for actions. Mobile menu triggers must expose `aria-expanded` and `aria-controls`.
9. Visible keyboard focus, sufficient contrast, and no interaction that requires a mouse.
10. Explicit `<label>` elements for form fields. Placeholders do not replace labels. Status and error messages must use an appropriate live region.
11. Meaningful image `alt` text; use empty `alt=""` or `aria-hidden="true"` only for genuinely decorative graphics.
12. Appropriate JSON-LD: Organization/SoftwareApplication on the homepage, FAQPage for FAQs, Article for editorial resources, and BreadcrumbList where a breadcrumb path exists.

The existing `.skip-link` treatment on the public pages is the reference implementation. It is visually hidden above the viewport until focused; do not use `display:none` or `visibility:hidden`.

## SEO and crawlability

- New indexable pages must be linked contextually from at least one relevant existing page and added to `sitemap.xml` with the correct canonical URL.
- Update a page’s sitemap `<lastmod>` when making a meaningful content or metadata change. Do not change it for formatting-only edits.
- Keep public pages crawlable. Do not add `noindex`, robots exclusions, or competing canonicals without an explicit reason.
- Use the `www` HTTPS origin in canonicals, schema URLs, Open Graph URLs, and the sitemap.
- Keep URL paths readable, lowercase, and stable. Avoid redirect chains and do not rename an indexed path without adding a direct permanent redirect.
- Use descriptive contextual anchor text. Avoid “click here.” Check every new internal link and fragment target.
- Search titles and descriptions must remain unique. When changing either, update the corresponding Open Graph and Twitter/X values in the same edit.

## Analytics conventions

- Every public page loads `/posthog-array.js` and `/posthog-init.js` with `defer`; keep initialization non-blocking.
- Preserve `cross_subdomain_cookie: true` so marketing and app activity can be connected.
- Do not capture names, email addresses, phone numbers, school names, form notes, or other personally identifiable form values in analytics events.
- Preserve campaign parameters when moving visitors into `/schedule` or another campaign step.
- Existing funnel events include `demo_link_clicked`, `demo_requested`, `post_submit_schedule_clicked`, `outbound_landing_viewed`, `primary_cta_clicked`, `secondary_cta_clicked`, `email_clicked`, `phone_clicked`, and `calendly_started`.
- Prefer stable explicit events for important funnel steps rather than relying only on element-text autocapture. Event names use lowercase snake_case.
- Do not rename or remove an existing event without updating its PostHog funnel/dashboard consumers.

## Conversion rules

- The canonical public offer is one complete plan at **$199 per month**. Do not introduce alternate plan names, lower-priced tiers, feature tiers, or “coming soon” packages on any page or resource.
- The Founding Partner 90-day free period is an introductory offer attached to the $199 plan, not a separate package.
- Link detailed pricing questions to `/pricing/`; keep price, included-feature, onboarding, and introductory-offer language consistent with that page.
- The homepage contact form is the primary demo-request path. Do not replace it with an immediate Calendly redirect.
- This audience includes teacher-led schools with limited technical confidence. Keep form language warm, concrete, and low-pressure.
- After successful submission, say that a real person will reply within one business day and offer “Choose a time now” as an optional next step.
- Preserve the form’s success/error behavior and its analytics events when editing the contact section.
- Use `/schedule` for Calendly CTAs so `calendly_started`, CTA location, and campaign attribution are recorded before redirecting.
- Keep client and server field-length limits aligned. The API must validate required fields and email format even when the browser already does so.
- Preserve the off-screen `website` honeypot in the form and API. It must stay outside the keyboard and accessibility trees and must not affect legitimate submissions.
- Never return Resend credentials, configuration details, or raw provider error bodies to visitors. Log delivery diagnostics server-side and return a friendly generic fallback.

## Performance and security

- Keep third-party analytics scripts deferred. Do not move them into the critical rendering path.
- Optimize new raster images before committing them and lazy-load below-the-fold images. Always reserve image dimensions to prevent layout shift.
- Do not add a large framework or dependency for behavior that the static site can implement directly.
- Preserve the security headers in `vercel.json`: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-Frame-Options`, and the existing `frame-ancestors` CSP.
- A fuller CSP should first be introduced in report-only mode and tested against PostHog, Resend/contact flows, Google Fonts, Calendly, and the app links.
- Do not add HSTS `includeSubDomains` or preload casually; that requires a separate domain-wide review.

## Validation before handoff

For every changed public page:

- Render it locally at desktop and mobile widths.
- Confirm one H1, one main landmark, a valid skip-link target, labeled navigation, and labeled controls.
- Test keyboard access to navigation, forms, and CTAs.
- Confirm title, description, canonical, Open Graph, Twitter/X, favicon, and JSON-LD are present and internally consistent.
- Check new internal links and fragment targets, and confirm no browser console errors.
- Run `git diff --check`.
- State clearly whether the work is only local, pushed to a branch, merged, or deployed. Never imply that a local edit is live.
