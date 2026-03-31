# Brand Requests

This file logs brand gaps, design debt, and open requests for Rajeev to review.
Add items here when you notice a surface that doesn't match the brand guide but is
out of scope for the current session.

**Format:**
```
## [Date] — [Surface / Component]
**Gap:** What's wrong
**Spec:** What the brand guide says it should be
**Status:** open | in-progress | done
```

---

## 2026-03-16 — Error messages / alert() calls

**Gap:** Many user-facing errors use `alert()` — raw Firestore error codes or generic "An error occurred" messages. These break trust and don't match brand tone.

**Spec:** Error messages should use inline error UI with `#ffe8e8` background and `#b03a2e` text. Plain language: "We couldn't save that payment. Try again, or contact info@microschoolledger.com". Never expose Firestore error codes.

**Affected locations (partial list):**
- `alert(e.message)` on Google sign-in and anonymous sign-in failures (App root)
- `alert('Failed to send invite: ' + e.message)` in FamilyModal
- `alert('Delete failed: ' + e.message)` in FamilyModal
- `alert('Error importing StepUp data...')` in StepUpImportModal
- Import complete `alert(...)` calls with raw counts — these are success, should use a toast/banner

**Status:** open

---

## 2026-03-16 — Gold stripe divider in admin modals

**Gap:** Gold-to-grass gradient stripe is added to SchoolFinder, portal login, and invoice, but not to the admin app's regular modals (FamilyModal, PaymentModal, StudentModal, etc.).

**Spec:** Brand guide calls the stripe a "signature brand element" and suggests it for header/body separators in modals.

**Status:** open — nice-to-have, implement incrementally as modals are touched

---

## 2026-03-16 — Admin login screen branding

**Gap:** The admin login page uses `GrowLogo` (Grow Co-op leaf mark) which is tenant-specific branding. Platform-level entry point should use `MSLMark`.

**Spec:** Since the admin login is the platform entry point (before a school is selected), it should show the MSLMark + "Microschool Ledger" wordmark, not the school-specific logo.

**Note:** This is a deliberate choice for now — the existing logo reinforces tenant identity for admins who use the app daily. Revisit if the platform expands to a true multi-school login page.

**Status:** open — decision needed
