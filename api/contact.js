export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const contentType = req.headers?.['content-type'] || '';
  if (!contentType.toLowerCase().includes('application/json')) {
    return res.status(415).json({ error: 'Please submit the contact form from the website.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid form submission.' });
    }
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ error: 'Invalid form submission.' });
  }

  // Honeypot: silently accept bot submissions without sending an email.
  if (typeof body.website === 'string' && body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const cleanSingleLine = (value) => (
    typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ') : ''
  );
  const cleanNotes = (value) => (
    typeof value === 'string' ? value.trim().replace(/\0/g, '') : ''
  );

  const school = cleanSingleLine(body.school);
  const name = cleanSingleLine(body.name);
  const email = cleanSingleLine(body.email).toLowerCase();
  const phone = cleanSingleLine(body.phone);
  const notes = cleanNotes(body.notes);

  if (!school || !name || !email) {
    return res.status(400).json({ error: 'school, name, and email are required' });
  }

  if (school.length > 120 || name.length > 100 || email.length > 254 || phone.length > 40 || notes.length > 2000) {
    return res.status(400).json({ error: 'One or more fields are too long.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('Contact form email service is not configured.');
    return res.status(500).json({ error: 'We could not send your request right now. Please email info@microschoolledger.com.' });
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
      console.error('Contact form email delivery failed.', response.status, errorText.slice(0, 500));
      return res.status(500).json({ error: 'We could not send your request right now. Please email info@microschoolledger.com.' });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Contact form email request failed.', error);
    return res.status(500).json({ error: 'We could not send your request right now. Please email info@microschoolledger.com.' });
  }
}
