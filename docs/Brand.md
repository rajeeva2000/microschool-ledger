# Microschool Ledger — Brand Guide
**For use by Claude Code and other development sessions**
Last updated: March 2026

---

## Product Identity

**Product name:** Microschool Ledger  
**Always written as:** Two words, title case — "Microschool Ledger"  
**Never:** "MicroschoolLedger", "MSL App", "Grow ERP", "the ledger"  
**Short form in UI:** "MSL" (mark/favicon only — never in prose)  
**Tagline:** "Financial management for microschools and homeschool co-ops"

**What it is:** A multi-tenant financial management platform — billing, enrollment, Step-Up reconciliation, and family self-service portal.  
**Built by:** The Grow Co-op, Boca Raton, FL  
**Contact:** info@microschoolledger.com  
**Website:** microschoolledger.com  

---

## Color Palette

These are the exact hex values used across the app, marketing site, and all communications. Always use these — never approximate.

| Name | Hex | Usage |
|------|-----|-------|
| **Deep Green** | `#1a3a2a` | Primary brand color. Nav bars, headers, primary buttons, logo background |
| **Mid Green** | `#2d6a4f` | Section headings, secondary buttons, hover states |
| **Fresh Green** | `#52b788` | Accents, checkmarks, success states, "synced" indicators |
| **Pale Green** | `#d8f3dc` | Light backgrounds, callout fills, highlight rows |
| **Faint Green** | `#f0faf3` | Page backgrounds, alternating table rows |
| **Gold** | `#c9a84c` | CTAs, highlights, the margin line in the logo mark |
| **Gold Light** | `#f7f0e0` | Gold-tinted backgrounds, featured card backgrounds |
| **Cream** | `#faf8f3` | Page background (marketing site) |
| **Ink** | `#1a1a1a` | Body text |
| **Muted** | `#5a6b5a` | Secondary text, labels, captions |
| **Rule** | `#dde8df` | Dividers, borders, table rules |

### Semantic colors (for status UI)
| State | Color |
|-------|-------|
| Paid in full / success | `#52b788` (Fresh Green) |
| Balance due / warning | `#f4b942` (amber) |
| Overdue / error | `#e05c5c` (red) |
| Step-Up / EMA badge | `#1a6aad` bg, `#dbeeff` text |
| Stripe badge | `#5a3fcf` bg, `#e8e4ff` text |

---

## Typography

| Role | Font | Weight | Notes |
|------|------|--------|-------|
| Display / headings | **Lora** (Google Fonts serif) | 700 | Used for all H1–H3, logo wordmark |
| Display italic | **Lora** | 400 italic | Emphasis within headings |
| Body / UI | **DM Sans** (Google Fonts) | 300, 400, 500, 600 | All body text, labels, buttons, inputs |

**Font import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&display=swap" rel="stylesheet">
```

**Type scale (marketing/email):**
- H1: Lora 700, ~2.5–3.5rem
- H2: Lora 700, ~1.8–2.5rem  
- H3: Lora 600, ~1.2–1.5rem
- Body: DM Sans 400, 1rem, line-height 1.7
- Small/label: DM Sans 500, 0.75–0.85rem, letter-spacing 0.1–0.2em uppercase for eyebrows

---

## The Logo Mark

The MSL mark is an SVG ledger book icon. It consists of:
- A dark green rounded rectangle (the book cover)
- A gold vertical line at ~30% from the left (the ledger margin column)
- Three faint horizontal white lines (ruled ledger rows)
- "MSL" text in white Georgia serif, centered in the right portion

### SVG — on dark background (nav, email headers):
```svg
<svg width="40" height="40" viewBox="0 0 40 40">
  <rect x="0.5" y="0.5" width="39" height="39" rx="6"
    fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="0.75"/>
  <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" stroke-width="2" opacity="0.9"/>
  <line x1="0" y1="13" x2="40" y2="13" stroke="white" stroke-width="0.6" opacity="0.2"/>
  <line x1="0" y1="21" x2="40" y2="21" stroke="white" stroke-width="0.6" opacity="0.2"/>
  <line x1="0" y1="29" x2="40" y2="29" stroke="white" stroke-width="0.6" opacity="0.2"/>
  <text x="26" y="25" font-family="Georgia, serif" font-size="10" font-weight="700"
    fill="white" text-anchor="middle" dominant-baseline="middle">MSL</text>
</svg>
```

### SVG — standalone/favicon (solid dark background):
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <rect x="0.5" y="0.5" width="39" height="39" rx="6" fill="#1a3a2a"/>
  <line x1="12" y1="0" x2="12" y2="40" stroke="#c9a84c" stroke-width="2.5"/>
  <line x1="0" y1="13" x2="40" y2="13" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <line x1="0" y1="21" x2="40" y2="21" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <line x1="0" y1="29" x2="40" y2="29" stroke="white" stroke-width="0.7" opacity="0.25"/>
  <text x="26" y="25" font-family="Georgia, serif" font-size="10" font-weight="700"
    fill="white" text-anchor="middle" dominant-baseline="middle">MSL</text>
</svg>
```

### Full lockup (logo + wordmark):
Mark at 40–44px, followed by:
- "Microschool" in Lora 400 italic
- "Ledger" in Lora 700

---

## Voice & Tone

**Who we're talking to:** Microschool founders and homeschool co-op administrators. They wear many hats — teacher, coordinator, billing admin — and have limited time. They're non-technical but smart and mission-driven.

**Voice:** Direct, warm, knowledgeable. Like a trusted colleague who happens to understand both education and finance. Never corporate, never condescending.

**Tone by context:**
| Context | Tone |
|---------|------|
| Marketing copy | Confident, empathetic, slightly playful |
| Onboarding emails | Warm, encouraging, practical |
| Error messages | Direct, never alarming, always actionable |
| Invoice/statement | Professional, clean, compliance-aware |
| Collections emails | Firm but warm — never aggressive |
| Family portal | Friendly, clear, reassuring |

**Writing rules:**
- Use "your co-op" or "your school" — never "the user" or "the customer"
- Use "families" not "clients" or "customers"
- Use "students" not "children" (more professional in context)
- Prefer active voice: "Microschool Ledger reconciles" not "is reconciled by"
- Keep sentences short in UI — one idea per sentence
- Never use jargon like "onboarding flow", "friction", "CTA" in user-facing copy
- Florida Step-Up is always "Florida Step-Up for Students" on first mention, "Step-Up" thereafter
- EMA disbursements are "scholarship payments" in family-facing copy

---

## Email Templates

All emails sent from the app should follow this structure and use these styles.

### Email design system

```
Background:     #faf8f3 (Cream) — outer wrapper
Card:           white, max-width 600px, centered
Header:         #1a3a2a (Deep Green) background, logo mark + wordmark in white
Body:           DM Sans 400, 16px, #1a1a1a, line-height 1.7
Headings:       Lora 700, #1a3a2a
Links:          #2d6a4f (Mid Green), underlined
Buttons:        #c9a84c (Gold) background, #1a3a2a text, DM Sans 600, 14px, 8px radius
Footer:         #1a3a2a background, white/muted text, 14px DM Sans
Divider:        3px gradient: gold → fresh green → gold (the "gold stripe")
```

### Email header HTML snippet:
```html
<table width="100%" cellpadding="0" cellspacing="0">
  <tr>
    <td style="background:#1a3a2a; padding:24px 32px;">
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-right:12px; vertical-align:middle;">
            <!-- MSL mark SVG at 36px -->
          </td>
          <td style="vertical-align:middle;">
            <span style="font-family:Georgia,serif; font-size:18px; font-weight:700;
              color:white; line-height:1;">Microschool Ledger</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <!-- Gold stripe -->
  <tr>
    <td style="background:linear-gradient(90deg,#c9a84c,#52b788,#c9a84c); height:3px;
      font-size:0; line-height:0;">&nbsp;</td>
  </tr>
</table>
```

### Email footer HTML snippet:
```html
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
  <tr>
    <td style="background:#1a3a2a; padding:20px 32px; text-align:center;">
      <p style="font-family:Arial,sans-serif; font-size:13px; color:rgba(255,255,255,0.5);
        margin:0 0 4px;">Microschool Ledger · Built by The Grow Co-op, Boca Raton, FL</p>
      <p style="font-family:Arial,sans-serif; font-size:13px;
        color:rgba(255,255,255,0.35); margin:0;">
        Questions? <a href="mailto:info@microschoolledger.com"
          style="color:#c9a84c; text-decoration:none;">info@microschoolledger.com</a>
      </p>
    </td>
  </tr>
</table>
```

---

## Specific Email Types

### 1. Family portal invitation (sent by admin to parent)

**Subject:** `Your [School Name] account is ready — sign in here`

**Tone:** Warm, simple, one clear action.

**Key elements:**
- Brief explanation of what the portal shows (balance, payment history, invoices)
- One prominent "Sign In" button linking to the magic link URL
- Note that no password is needed
- Note that they can generate their own invoices for Step-Up documentation

**Do not include:**
- Anything alarming about balances owed
- Technical language about how the auth works
- More than one CTA

---

### 2. Payment receipt (triggered on payment record)

**Subject:** `Receipt — $[amount] payment received · [School Name]`

**Tone:** Clean, professional, reassuring.

**Key elements:**
- Amount, date, method (check/Stripe/other)
- Student(s) the payment applies to
- Updated balance after payment
- Link to view full statement in portal
- Step-Up compliance note if relevant

---

### 3. Overdue balance reminder (triggered from Collections)

**Subject:** `A quick note about your [School Name] account`

**Tone:** Warm but clear. Not a dunning notice — more like a nudge from a friend.

**Key elements:**
- Current balance and how many months overdue
- Link to view their statement in the portal
- Payment instructions (check / Stripe link)
- Contact for questions

**Do not:**
- Use words like "past due", "delinquent", "final notice"
- Threaten enrollment consequences
- Send more than once per week

---

### 4. New school admin welcome (sent by platform on tenant creation)

**Subject:** `Welcome to Microschool Ledger — your setup checklist`

**Tone:** Encouraging, practical, action-oriented.

**Key elements:**
- What they've just unlocked
- 3-step checklist: configure programs → add families → import first payment
- Link to the onboarding wizard
- Rajeev's direct email for white-glove support

---

## UI Patterns

### Buttons
```
Primary:    bg #1a3a2a, text white, DM Sans 600, hover → #2d6a4f
CTA/gold:   bg #c9a84c, text #1a3a2a, DM Sans 600, hover → #d4b35c
Secondary:  border 1px #1a3a2a, text #1a3a2a, bg transparent
Danger:     bg #e05c5c, text white
```

### Status badges
```
Paid in Full:     bg #d8f3dc, text #2d6a4f, DM Sans 600 11px
Balance Due:      bg #fff8e6, text #9a6000, DM Sans 600 11px
Payment Overdue:  bg #ffe8e8, text #b03a2e, DM Sans 600 11px
Step-Up / EMA:    bg #dbeeff, text #1a6aad, DM Sans 600 11px
Stripe:           bg #e8e4ff, text #5a3fcf, DM Sans 600 11px
```

### Health indicator dots (family cards)
```
Green  (#52b788): Paid in full
Yellow (#f4b942): Balance due, not yet overdue
Red    (#e05c5c): 30+ days overdue
```

### The gold stripe divider
Used between header and content in emails and on the marketing site:
```css
height: 3px;
background: linear-gradient(90deg, #c9a84c, #52b788, #c9a84c);
```

---

## Multi-Tenant Architecture Notes

Each school (tenant) has:
- Its own subdomain: `[slug].microschoolledger.com`
- Its own Firestore data partition under `{slug}-*` document keys
- Its own access list: `{slug}-access-list`

**Current tenants:**
| Slug | School | URL |
|------|--------|-----|
| `grow` | The Grow Co-op | grow.microschoolledger.com |
| `demo` | Demo instance | demo.microschoolledger.com (seed data, anonymous auth) |

When sending emails from the app, always use the tenant's configured school name — never hardcode "The Grow Co-op" in email templates. Read the tenant config from `tenants/{slug}` in Firestore.

**Tenant config fields used in emails:**
- `tenants/{slug}.name` — school name
- `tenants/{slug}.adminEmail` — reply-to for outbound emails
- `tenants/{slug}.contactEmail` — displayed in footer

---

## Login Page Design

The login page (`app.microschoolledger.com` or `?view=login`) should:

- Center the MSL logo mark (64px) + full wordmark on a `#1a3a2a` background
- Show a card (white, max-width 400px, border-radius 12px) with:
  - A school name / slug input: "Enter your school's URL (e.g. grow)"
  - A "Continue" button in gold
  - OR: "Sign in with Google" button below a divider
- Footer note: "New school? Contact info@microschoolledger.com"
- No other navigation or distractions

The slug input should accept either:
- A bare slug: `grow`
- A full subdomain: `grow.microschoolledger.com`
- A school name (fuzzy match against tenant registry)

On submit → redirect to `https://[slug].microschoolledger.com`

---

## Assets

| Asset | Location |
|-------|----------|
| favicon.svg | `/favicon.svg` in marketing repo |
| Marketing site | `microschool-ledger` GitHub repo → Vercel |
| App | `msledger` GitHub repo → Firebase Hosting |
| App URL | https://msledger-a2525.web.app |
| Marketing URL | https://microschoolledger.com |
| Demo URL | https://demo.microschoolledger.com |

---

*This document should be kept in the `msledger` repo as `docs/BRAND.md` and updated whenever significant brand or design decisions change.*
