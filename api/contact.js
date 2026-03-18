export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { school, name, email, phone, notes } = req.body ?? {};

  if (!school || !name || !email) {
    return res.status(400).json({ error: 'school, name, and email are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Missing RESEND_API_KEY' });
  }

  const payload = {
    from: 'Microschool Ledger <info@microschoolledger.com>',
    to: 'info@microschoolledger.com',
    reply_to: email,
    subject: `Demo Request — ${school}`,
    text: [
      `School: ${school}`,
      `Name:   ${name}`,
      `Email:  ${email}`,
      `Phone:  ${phone || '—'}`,
      '',
      'Current setup / notes:',
      notes || '—',
    ].join('\n'),
  };

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return res.status(500).json({ error: errorText || 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
}
