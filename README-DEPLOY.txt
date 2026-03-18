Microschool Ledger — Repo Ready Refresh

Contents
- index.html
- api/contact.js
- resources/

What to do
1. Replace your repo contents with these files.
2. Keep your existing favicon.svg in the repo root.
3. In your hosting platform, set the environment variable:
   RESEND_API_KEY=your_resend_api_key
4. Deploy.
5. Test the homepage form.

Expected form behavior
- Successful submit shows a green success message under the form.
- Failed submit shows a red error message under the form.

Notes
- The homepage form posts to /api/contact
- The API handler sends to info@microschoolledger.com using Resend
