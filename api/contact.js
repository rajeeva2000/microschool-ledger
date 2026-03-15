export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { school, name, email, phone } = req.body ?? {};

  if (!school || !name || !email) {
    return res.status(400).json({ error: 'school, name, and email are required' });
  }

  const payload = {
    from: 'Microschool Ledger <info@microschoolledger.com>',
    to: 'info@microschoolledger.com',
    reply_to: email,
    subject: `Access Request — ${school}`,
    text: [
      `School: ${school}`,
      `Name:   ${name}`,
      `Email:  ${email}`,
      `Phone:  ${phone || '—'}`,
    ].join('\n'),
  };

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return res.status(500).json({ error: 'Failed to send email' });
  }

  return res.status(200).json({ ok: true });
}
