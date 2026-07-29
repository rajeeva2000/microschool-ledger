# Microschool Ledger "Powered by" badge

A voluntary trust badge for customer websites to acknowledge that they run on
Microschool Ledger. This is a factual acknowledgment, not a certification or
accreditation program — do not describe it as "certified," "verified," or
"approved."

## Files

| File | Use |
|------|-----|
| `powered-by-msl-light.svg` | Preferred. For light/sand backgrounds. |
| `powered-by-msl-dark.svg` | Preferred. For dark/Pine backgrounds. |
| `powered-by-msl-light.png` | Fallback only, 340×72. |
| `powered-by-msl-dark.png` | Fallback only, 340×72. |
| `powered-by-msl-light@2x.png` | Fallback only, 680×144 — display at 340×72. |
| `powered-by-msl-dark@2x.png` | Fallback only, 680×144 — display at 340×72. |

Use the SVG on the web so the badge stays crisp at every screen density.
PNGs are fallbacks for contexts that can't render SVG; when using a PNG,
prefer the `@2x` file displayed at 340×72 for sharper rendering on
high-density screens.

## Markup

```html
<a href="https://www.microschoolledger.com/customers/grow-co-op" aria-label="Powered by Microschool Ledger">
  <img
    src="/assets/badges/powered-by-msl-light.svg"
    alt="Powered by Microschool Ledger"
    width="340"
    height="72"
    style="width:100%;max-width:340px;height:auto;"
  >
</a>
```

Pick the light or dark SVG based on the actual background it sits on. Do not
recolor, crop, or otherwise alter the artwork, viewBox, `<title>`, or
`<desc>` — link to a fresh copy of these files instead of editing them
in place.

## Distribution note

This badge is currently issued to individual customers voluntarily, by
request, for genuine editorial customer stories — not distributed
automatically to every customer. If that changes (badge required by
contract, or distributed site-wide to all customers), sites embedding it
should switch the link to `rel="nofollow"`.
