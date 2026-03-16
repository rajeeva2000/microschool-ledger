# Microschool Ledger — Brand Guide
**For use by Claude Code and all development sessions**
Last updated: March 2026

> **App session:** This file is the canonical brand reference. Read it before
> building any UI, email template, login page, or user-facing copy.
> If you need a brand decision not covered here, append to
> `docs/BRAND-REQUESTS.md` and flag it to Rajeev.

---

## Product Identity

**Product name:** Microschool Ledger
**Always written as:** Two words, title case — "Microschool Ledger"
**Never:** "MicroschoolLedger", "MSL App", "Grow ERP", "the ledger"
**Short form in UI:** "MSL" (mark/favicon only — never in prose)
**Tagline:** "Financial management for microschools and homeschool co-ops"
**Built by:** The Grow Co-op, Boca Raton, FL
**Contact:** info@microschoolledger.com
**Website:** microschoolledger.com

---

## Audience

The primary user of both the app and the marketing site is a **microschool
founder or homeschool co-op administrator**. Every design and copy decision
should be made with this person in mind — not a generic SaaS user.

- **Age/gender:** Typically 35–52, majority women
- **Background:** Former teacher or curriculum designer; left traditional
  schooling to do education their way
- **Tech relationship:** Competent but not enthusiastic. Comfortable with
  Google Docs, email, Canva. Intimidated by anything that feels like
  "accounting software" or "enterprise tools"
- **Emotional state:** Stretched thin and mission-driven. Teaching,
  coordinating, and running billing simultaneously. Wants to feel capable
  and organized — not overwhelmed or talked down to

**What this audience trusts visually:**
- Warm, natural tones — not cold corporate blues or dark "bank" greens
- Serif headings — signals care, craft, and permanence
- Clean but not sterile — "organized home" not "hospital"
- Real specificity: real numbers, real places, real pain points

**What makes them bounce:**
- Anything that feels like enterprise software or a law firm
- Dense feature lists before emotional connection
- Jargon: "ERP", "multi-tenant", "reconciliation" in hero copy
- Aggressive or masculine design energy

**The governing question for any new UI, copy, or email:**
*Does this make a stretched-thin microschool founder feel more capable,
or does it add cognitive load?*

---

## Color Palette

**Decision:** The app's `grow-*` palette is the canonical palette for the
entire product — app and marketing site unified. It is warmer and more
appropriate for the audience than the colder deep greens previously on
the marketing site. The marketing site will be migrated to this palette.

### Core palette

| Token | Hex | Tailwind name | Usage |
|-------|-----|---------------|-------|
| Pine | `#3C4535` | `grow-pine` | Primary brand color. Nav, headers, primary buttons, logo background, email headers |
| Pine Dark | `#2d3528` | `grow-pine-dark` | Hover state on pine buttons and nav |
| Sand | `#F8EDDD` | `grow-sand` | Page background — warm and welcoming |
| Off-white | `#F0EDE8` | `grow-offwhite` | Alternating table rows, light card fills |
| Rock | `#DDDFDE` | `grow-rock` | Borders, dividers, table rules, card edges |
| Grass | `#ADB76D` | `grow-grass` | Eyebrow labels, decorative accents, section separators |
| Sky | `#6E9CDA` | `grow-sky` | Secondary action buttons — see note below |
| Gold | `#c9a84c` | `grow-gold` | Primary CTAs, MSL logo margin line, featured elements |
| Gold Light | `#f7f0e0` | — | Gold-tinted backgrounds, featured card fills |

> **Note on `grow-pine-dark` and `grow-offwhite`:** These tokens are now
> named. Add them to `tailwind.config.js` if not already present.

> **Note on `grow-sky`:** A legitimate secondary action color used in CSV
> import, Setup panels, and enrollment wizard. Not deprecated. Some
> instances have `hover:bg-purple-700` — a leftover placeholder that
> should be cleaned up to `hover:bg-blue-600`. New screens use gold for
> primary CTAs and sky only for secondary/supplementary actions.

### Status and semantic colors

| State | Background | Text | Notes |
|-------|-----------|------|-------|
| Paid in full | `#52b788` dot | — | Health dot only — see below |
| Balance due | `#f4b942` dot | — | Health dot only |
| Overdue | `#e05c5c` dot | — | Health dot only |
| Paid in Full badge | `#d8f3dc` | `#3C4535` | |
| Balance Due badge | `#fff8e6` | `#9a6000` | |
| Overdue badge | `#ffe8e8` | `#b03a2e` | |
| Step-Up / EMA | `#dbeeff` | `#1a6aad` | |
| Stripe | `#e8e4ff` | `#5a3fcf` | |
| Demo mode banner | amber-400 | amber-900 | Tailwind `bg-amber-400 text-amber-900` |

> **Health dot color note:** Health indicator dots use distinct saturated
> colors (`#52b788` green, `#f4b942` yellow, `#e05c5c` red) — intentionally
> different from `grow-grass` (#ADB76D) which is used for decorative accents.
> Using Grass for both "decoration" and "paid in full status" would create
> ambiguity as the UI grows. Keep these separate.

### Gold stripe divider

Signature brand element — use in email templates and as header/content
separator in major UI surfaces and modals:
```css
height: 3px;
background: linear-gradient(90deg, #c9a84c, #ADB76D, #c9a84c);
```

---

## Typography

**Decision:** Lora + DM Sans is the unified type system for the entire
product. The app currently uses Garet (cdnfonts.com) — migrate to DM Sans
on all new screens. Existing Garet screens migrate incrementally.

**Why DM Sans over Garet:** Same visual warmth, purpose-built for UI,
available on Google Fonts (fast, reliable, no third-party CDN risk).
Garet's dependency on cdnfonts.com is a production reliability risk.

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / headings | Lora (Google Fonts) | 700 | All H1–H3, logo wordmark, email headings |
| Display italic | Lora | 400 italic | Emphasis within headings — the `em` pattern |
| Body / UI | DM Sans (Google Fonts) | 300, 400, 500, 600 | All body text, labels, buttons, inputs |
| Legacy UI (existing) | Garet (cdnfonts.com) | — | Keep until migrated; do not use on new screens |

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap" rel="stylesheet">
```

**Email font fallbacks** (Google Fonts don't load in most email clients):
- Headings: `Georgia, 'Times New Roman', serif`
- Body/UI: `Arial, Helvetica, sans-serif`

---

## The Logo Mark

The MSL ledger mark is the **platform identity**.
`GrowLogo` (globe + "THE grow CO-OP") is a **tenant identity** asset for
The Grow Co-op specifically — a placeholder until per-tenant branding is
supported.

### When to use which

| Surface | Logo |
|---------|------|
| Marketing site nav + footer | MSL mark |
| Favicon | MSL mark |
| Login / SchoolFinder | MSL mark |
| Email headers (all emails) | MSL mark |
| Family portal header | MSL mark |
| Invoices and statements | MSL mark |
| App nav bar (tenant-authenticated) | GrowLogo (tenant placeholder) |

### SVG — on dark background
```html
<svg width="40" height="40" viewBox="0 0 40 40">
  <rect x="0.5" y="0.5" width="39" height="39" rx="6"
    fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)"
    stroke-width="0.75"/>
  <line x1="12" y1="0" x2="12" y2="40"
    stroke="#c9a84c" stroke-width="2" opacity="0.9"/>
  <line x1="0" y1="13" x2="40" y2="13"
    stroke="white" stroke-width="0.6" opacity="0.2"/>
  <line x1="0" y1="21" x2="40" y2="21"
    stroke="white" stroke-width="0.6" opacity="0.2"/>
  <line x1="0" y1="29" x2="40" y2="29"
    stroke="white" stroke-width="0.6" opacity="0.2"/>
  <text x="26" y="25" font-family="Georgia, serif" font-size="10"
    font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">MSL</text>
</svg>
```

### SVG — standalone / favicon
```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect x="0.5" y="0.5" width="39" height="39" rx="6" fill="#3C4535"/>
  <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" stroke-width="2.5"/>
  <line x1="0" y1="13" x2="40" y2="13" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <line x1="0" y1="21" x2="40" y2="21" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <line x1="0" y1="29" x2="40" y2="29" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <text x="26" y="25" font-family="Georgia, serif" font-size="10"
    font-weight="700" fill="white" text-anchor="middle"
    dominant-baseline="middle">MSL</text>
</svg>
```

---

## Voice & Tone

**Voice:** Direct, warm, knowledgeable. Like a trusted colleague who
understands both education and finance. Never corporate, never
condescending, never jargon-heavy.

**The governing principle:** Lead with time and emotional relief, not
features. "So you can spend your time teaching, not chasing invoices"
lands harder than "No servers. No IT." Apply this to every piece of
copy — marketing, UI labels, empty states, error messages, emails.

| Context | Tone |
|---------|------|
| Marketing copy | Confident, empathetic — relief first, features second |
| Onboarding emails | Warm, encouraging, practical |
| In-app UI labels | Clear, direct, never clinical |
| Empty states | Warm and directive — see pattern below |
| Error messages | Direct, never alarming, always actionable |
| Invoice/statement | Professional, clean, compliance-aware |
| Collections emails | Firm but warm — never aggressive |
| Family portal | Friendly, clear, reassuring |
| Demo mode | Light, inviting — "explore freely, nothing is real" |

**Writing rules:**
- "your co-op" or "your school" — never "the user" or "the customer"
- "families" not "clients"; "students" not "children"
- Active voice: "Microschool Ledger reconciles" not "is reconciled by"
- No jargon in user-facing copy: "ERP", "multi-tenant", "reconciliation"
  stay out of headlines and UI labels
- "Florida Step-Up for Students" on first mention, "Step-Up" thereafter
- "Grow ERP" is never used — always "Microschool Ledger"

### Empty state pattern

Empty states are a brand moment — especially for a new school whose
administrator is taking a leap of faith on a new system. An empty table
is demoralizing. A warm, directive empty state keeps momentum going.

**Pattern:**
```
[Friendly one-line acknowledgement]
[Single clear next action → link or button]
```

**Examples:**
- "You haven't added any families yet — start here →"
- "No payments recorded for this year yet. Record a payment →"
- "No Step-Up payments imported. Import from the portal →"

Never show a raw empty table or a generic "No data" message.

### Error message pattern

Several places in the app currently use `alert(e.message)` or raw red text
with technical language. For an audience already nervous about software,
an unexpected technical error message breaks trust fast.

**Pattern for all in-app errors:**
- Say what happened in plain language ("We couldn't save that payment")
- Say what to do ("Try again, or contact info@microschoolledger.com")
- Never expose stack traces, Firestore error codes, or technical identifiers
- Style: `#ffe8e8` background, `#b03a2e` text, below the relevant field

### Mobile UX principle

Assume a 375px screen operated with one thumb while standing in a hallway
between classes. Specific implications:
- Tap targets minimum 44px height
- No modals that require scrolling inside the modal on mobile
- Font size minimum 14px on any interactive element
- Critical actions (Record Payment, Send Statement) reachable without
  horizontal scroll

### Home tab framing

The Home tab should feel like a **morning briefing, not a control panel**.
Framing matters as much as data:

- "3 families haven't paid this month" — ❌ clinical
- "3 families could use a follow-up" — ✓ human

Apply the audience principle to every label, card title, and status
message in the Home tab. An administrator opening the app at 7am before
school should feel informed and capable, not alarmed.

---

## URL & Multi-Tenant Routing

Two URL patterns are in use. Both are valid but serve different purposes.

| Pattern | Example | When to use |
|---------|---------|-------------|
| `?org=[slug]` | `app.microschoolledger.com?org=grow` | **The working link pattern.** Use in all programmatically constructed URLs — invitation emails, Cloud Functions, SchoolFinder redirects |
| `[slug].microschoolledger.com` | `grow.microschoolledger.com` | **The bookmark URL.** User-facing "your school's address." Requires per-domain Firebase Auth setup per tenant |

**Why both exist:** Firebase Auth does not support wildcard subdomain
authorization — each subdomain must be manually added. New tenant
subdomains should still be created for bookmarking, but all links
constructed by the app should use `?org=`.

**Current tenants:**

| Slug | School | Firebase project |
|------|--------|-----------------|
| `grow` | The Grow Co-op | grow-erp-8765c (legacy) |
| `demo` | Demo instance | msledger-a2525 |

**Tenant config in Firestore (`tenants/{slug}`):**
- `name` — school display name (use in emails; never hardcode "The Grow Co-op")
- `ownerEmail` — the only email field currently in schema
- `adminEmail` and `contactEmail` do not yet exist — do not reference
  them until added to the schema

---

## Demo Mode

| Property | Value |
|----------|-------|
| Entry point | `app.microschoolledger.com?org=demo` or `demo.microschoolledger.com` |
| Auth | Firebase anonymous auth |
| Data | Seed data under `demo` slug — writes persist to Firestore |
| Banner background | Tailwind `bg-amber-400` |
| Banner text color | Tailwind `text-amber-900` |
| Banner copy | "DEMO MODE — Sample data only. No real families, students, or payments." |

> **Note:** The banner does NOT say "Changes are not saved" — demo writes
> do persist to Firestore under the demo slug. The correct framing is
> that the data is not real, not that changes don't save.

---

## CL Style Constants

The app uses a `CL` constants object at the top of `App.jsx` for
consistent Tailwind class strings (`CL.submitBtn`, `CL.modalOverlay`,
`CL.modalSm`, `CL.label`, `CL.input`, `CL.card`, `CL.cancelBtn`, etc.).
Always read and use these constants when building new UI components.
Do not invent new class strings — add to `CL` if a new pattern is needed.

---

## UI Patterns

### Buttons

| Type | Tailwind | Usage |
|------|----------|-------|
| Primary | `bg-grow-pine text-white hover:bg-grow-pine-dark` | Main action |
| CTA / gold | `bg-grow-gold text-grow-pine` | Waitlist, key CTAs, featured actions |
| Secondary / sky | `bg-grow-sky text-white hover:bg-blue-600` | Secondary actions |
| Cancel | `border border-grow-rock text-grow-pine bg-white` | Modal cancel/dismiss |
| Danger | `bg-red-500 text-white` | Destructive actions |

### Status badges (DM Sans 600, 11px)

| State | bg | text |
|-------|-----|------|
| Paid in Full | `#d8f3dc` | `#3C4535` |
| Balance Due | `#fff8e6` | `#9a6000` |
| Payment Overdue | `#ffe8e8` | `#b03a2e` |
| Step-Up / EMA | `#dbeeff` | `#1a6aad` |
| Stripe | `#e8e4ff` | `#5a3fcf` |

### Health indicator dots

Distinct from Grass accent color — these are status signals, not decorative.

| Color | Hex | Meaning |
|-------|-----|---------|
| Green | `#52b788` | Paid in full |
| Yellow | `#f4b942` | Balance due, not yet overdue |
| Red | `#e05c5c` | 30+ days overdue |

### Portal badge (family cards)

Small globe icon when `family.portalEmail` is set. Style: grow-sky tint,
14px. The only place `portalEmail` is visually surfaced in the admin view.

### Loading screen pattern

Sand/rock gradient background, centered spinner, "Loading Microschool
Ledger…". Should be one consistent pattern across: `index.html` initial
load, `App()` auth loading, and portal loading.

---

## Email System

### Design spec

```
Outer wrapper:  #F8EDDD (Sand) background
Card:           white, max-width 600px, centered, border-radius 8px
Header:         #3C4535 (Pine) bg, MSL mark + wordmark in white
Gold stripe:    3px gradient divider between header and body
Body text:      Arial 16px, #1a1a1a, line-height 1.7
Headings:       Georgia serif 700, #3C4535
Links:          #3C4535 underlined
Button:         #c9a84c bg, #3C4535 text, Arial 700 14px, border-radius 6px
Footer:         #3C4535 bg, muted white text, Arial 13px
```

### From-address convention

| Email type | From |
|-----------|------|
| Portal invites, receipts, reminders | `{tenantName} <info@microschoolledger.com>` |
| Platform emails (tenant welcome, system) | `Microschool Ledger <info@microschoolledger.com>` |

### CC convention

**Admin-triggered emails** (portal invites, tenant welcome):
CC `info@microschoollearning.com`

**Family-triggered emails** (magic sign-in links): do NOT CC

Document this on every new email type and opt out only intentionally.

### Header HTML snippet
```html
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="background:#3C4535; padding:24px 32px;">
      <table cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:12px; vertical-align:middle;">
          <!-- MSL mark SVG at 36px -->
        </td>
        <td style="vertical-align:middle;">
          <span style="font-family:Georgia,serif; font-size:18px;
            font-weight:700; color:white;">Microschool Ledger</span>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr>
    <td style="background:linear-gradient(90deg,#c9a84c,#ADB76D,#c9a84c);
      height:3px; font-size:0; line-height:0;">&nbsp;</td>
  </tr>
</table>
```

### Footer HTML snippet
```html
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
  <tr>
    <td style="background:#3C4535; padding:20px 32px; text-align:center;">
      <p style="font-family:Arial,sans-serif; font-size:13px;
        color:rgba(255,255,255,0.5); margin:0 0 4px;">
        Microschool Ledger · Built by The Grow Co-op, Boca Raton, FL</p>
      <p style="font-family:Arial,sans-serif; font-size:13px;
        color:rgba(255,255,255,0.35); margin:0;">
        Questions? <a href="mailto:info@microschoolledger.com"
          style="color:#c9a84c; text-decoration:none;">
          info@microschoolledger.com</a></p>
    </td>
  </tr>
</table>
```

### Email types

---

#### 1. Family portal invitation

**Subject:** `Your [School Name] account is ready — sign in here`
**From:** `{tenantName} <info@microschoolledger.com>`
**CC:** `info@microschoollearning.com`

**Body opening — match the subject energy, not a bureaucratic intro:**
> "Your [School Name] account is ready."
> (Not: "You have been invited to access the [School Name] Family Portal")

**Must include:**
- What the portal shows: balance, payment history, invoices
- One "Sign In" button linking to the magic link URL
- A note that no password is needed
- A note that they can generate their own invoices for Step-Up documentation

**Do not include:**
- Anything about balances owed
- Technical language about auth or magic links
- More than one CTA

---

#### 2. Payment receipt *(template not yet built)*

**Subject:** `Receipt — $[amount] received · [School Name]`
**From:** `{tenantName} <info@microschoolledger.com>`
**CC:** `info@microschoollearning.com`

**Tone:** Clean, professional, reassuring. This is a trust-building
moment — many families in microschool contexts have had messy payment
records before (cash in envelopes, Venmo with no receipts). Specificity
is the point.

**Must include:**
- Amount, date, payment method
- Student(s) the payment applies to, and which program
- Updated balance and what period is now covered
  (e.g. "paid through June" — not just a raw balance number)
- Link to view full statement in the portal
- Step-Up compliance note if applicable

---

#### 3. Overdue balance reminder *(template not yet built)*

**Subject:** `A quick note about your [School Name] account`
**From:** `{tenantName} <info@microschoolledger.com>`

**Tone:** Warm nudge, not a dunning notice. These are small communities
where the school director and the family probably know each other.

**Name the student, not just the balance:**
> "We wanted to touch base about Aiden's account"
> — not "Your account has a balance of $615"

**Must include:**
- Student name and current balance
- How many months overdue (in plain language, not accounting terms)
- Link to view their statement in the portal
- Payment instructions

**Do not:**
- Use "past due", "delinquent", "final notice", "collections"
- Threaten enrollment consequences
- Send more than once per week

---

#### 4. Tenant welcome

**Subject:** `Welcome to Microschool Ledger — let's get you set up`
*(Current implementation sends a different subject — update to match)*

**From:** `Microschool Ledger <info@microschoolledger.com>`
**CC:** `info@microschoollearning.com`

**Tone:** Encouraging, practical. This person just made a meaningful bet
on a new system — meet that with warmth and immediate momentum.

**Must include:**
- What they've just unlocked (brief, not a feature list)
- 3-step checklist: configure programs → add families → import first payment
- Link to the onboarding wizard
- Rajeev's direct contact as a trust signal — not just a support mechanism:
  "You can always reach Rajeev directly at [email] — most questions get a
  same-day response" signals this is a human product with a human behind it

---

## Login Page / SchoolFinder

Entry point for existing customers clicking "Log In" on the marketing
site. Platform-level screen — use MSL mark.

**Visual spec:**
- Full-page background: `#3C4535` (Pine)
- Centered white card, max-width 400px, border-radius 12px, padding 2rem
- MSL mark 56px centered above the card
- Heading: "Sign in to your school" — Lora 700, `#3C4535`
- Gold "Continue" CTA button
- No Google sign-in button — SchoolFinder is a last-resort fallback, not
  a primary entry point. Welcome email directs users to bookmark their URL.

**Slug input behavior:**
- Accepts bare slug: `grow`
- Accepts full subdomain: `grow.microschoolledger.com`
  (strip the domain suffix automatically)
- No fuzzy school-name matching — slug only is sufficient
- On submit: validate against `tenants` collection in Firestore before
  redirecting (live — `tenants` is publicly readable)
- On success: redirect to `https://app.microschoolledger.com?org=[slug]`

**Current SchoolFinder conflicts to fix:**
- Background: sand/rock gradient → Pine `#3C4535`
- Logo: `GrowLogo` → MSL mark
- Button: update to gold CTA style
- Redirect pattern (`?org=`) is correct — keep

**Error state (school not found):**
- Message: "We couldn't find that school. Check your welcome email or
  contact info@microschoolledger.com" *(already in code verbatim)*
- Also show: "New to Microschool Ledger? Join the waitlist at
  microschoolledger.com"
- Style: `#ffe8e8` bg, `#b03a2e` text, below input field

---

## Open Roadmap Items (brand decisions needed before building)

1. **Tenant onboarding wizard** — entry point (first login? Setup tab?),
   step UI pattern, completion detection not yet designed. Discuss before
   building.
2. **Payment receipt email** — follow email system spec above.
3. **Overdue reminder email** — follow email system spec above.
4. **Per-tenant branding** — MSL mark = platform; tenant logo = their
   brand. GrowLogo is The Grow Co-op's placeholder. Preserve the
   platform/tenant distinction in all future surfaces.
5. **Viewer role UI** — consistent pattern for hidden/disabled controls
   and error messaging not yet documented. Establish before adding new
   viewer-restricted surfaces.

---

## BRAND-REQUESTS.md Protocol

When you need a brand decision not covered here, append to
`docs/BRAND-REQUESTS.md`:

```markdown
## [DATE] [Feature] — [what's needed]
**Context:** What you're building and why
**What I need:** Specific question or decision required
**My suggestion if no response:** What you'll do without a response
```

Commit the file and flag it to Rajeev. The marketing session (Claude on
claude.ai) owns `BRAND.md` and will update it with decisions.

---

## Assets

### Logo files (add to `src/assets/` in msledger repo)

| File | Use |
|------|-----|
| `msl-mark-ondark.svg` | Static SVG — nav bars, email headers, dark surfaces |
| `msl-mark-solid.svg` | Static SVG — favicon, light surfaces, standalone use |
| `msl-lockup.svg` | Static SVG — full wordmark, dark surfaces only |
| `MSLMark.jsx` | React component — preferred for use in the app |

**React component usage:**
```jsx
import { MSLMark, MSLLockup } from '../assets/MSLMark';

// Nav bar (on dark background)
<MSLMark size={28} variant="ondark" />

// Login / SchoolFinder (on dark background, larger)
<MSLMark size={56} variant="solid" />

// Full lockup with wordmark
<MSLLockup size={40} />

// Favicon — use msl-mark-solid.svg directly in index.html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

### Other assets

| Asset | Location |
|-------|----------|
| `favicon.svg` | `/favicon.svg` in `microschool-ledger` repo (copy of msl-mark-solid.svg) |
| `BRAND.md` | `docs/BRAND.md` in `msledger` repo |
| Marketing site | `microschool-ledger` → Vercel → microschoolledger.com |
| App | `msledger` → Firebase → msledger-a2525.web.app |
| Demo | demo.microschoolledger.com or `?org=demo` |
| Grow Co-op | grow.microschoolledger.com or `?org=grow` |

---

*This document is co-maintained: the marketing session (Claude on claude.ai)
owns brand decisions; the app session (Claude Code) reads, implements, and
flags gaps via BRAND-REQUESTS.md. Update whenever significant brand or
design decisions change.*
