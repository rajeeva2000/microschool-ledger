const FIT_OPTIONS = {
  organizationType: new Set([
    'full_time_microschool', 'full_time_coop', 'private_school', 'hybrid',
    'enrichment_tutoring', 'other',
  ]),
  studentCount: new Set(['under_10', '10_24', '25_49', '50_99', '100_plus']),
  pricingModel: new Set([
    'annual_tuition', 'program_pricing', 'monthly_membership',
    'hourly_session', 'service_marketplace', 'mixed',
  ]),
  paymentSources: new Set(['family_payments', 'step_up', 'aaa', 'other_esa']),
  currentSystems: new Set([
    'spreadsheets', 'quickbooks', 'billing_software', 'school_software', 'manual', 'other',
  ]),
  availableInputs: new Set([
    'roster', 'program_pricing', 'payment_rules', 'scholarship_report',
    'billing_records', 'not_ready',
  ]),
  implementationOwner: new Set(['me', 'administrator', 'accountant', 'undecided']),
  weeklyAvailability: new Set(['yes', 'probably', 'not_currently']),
  implementationTimeline: new Set([
    'immediately', 'within_30_days', 'within_60_90_days', 'later_this_year', 'researching',
  ]),
};

const FIT_LABELS = {
  organizationType: {
    full_time_microschool: 'Full-time microschool',
    full_time_coop: 'Full-time homeschool co-op',
    private_school: 'Private school',
    hybrid: 'Hybrid private school / homeschool program',
    enrichment_tutoring: 'Part-time enrichment or tutoring provider',
    other: 'Other',
  },
  studentCount: {
    under_10: 'Fewer than 10',
    '10_24': '10-24',
    '25_49': '25-49',
    '50_99': '50-99',
    '100_plus': '100+',
  },
  pricingModel: {
    annual_tuition: 'Annual tuition with a payment plan',
    program_pricing: 'Tuition varies by program',
    monthly_membership: 'Monthly membership',
    hourly_session: 'Hourly or per-session pricing',
    service_marketplace: 'Families combine multiple services or products',
    mixed: 'A mixture of pricing models',
  },
  paymentSources: {
    family_payments: 'Direct family payments',
    step_up: 'Florida Step-Up',
    aaa: 'AAA scholarships',
    other_esa: 'Another ESA or scholarship',
  },
  currentSystems: {
    spreadsheets: 'Spreadsheets',
    quickbooks: 'QuickBooks',
    billing_software: 'Billing or payment software',
    school_software: 'School-management software',
    manual: 'Mostly manual records',
    other: 'Something else',
  },
  availableInputs: {
    roster: 'Current student roster',
    program_pricing: 'Program names and prices',
    payment_rules: 'Payment-plan rules',
    scholarship_report: 'Recent scholarship report',
    billing_records: 'Current balances or billing records',
    not_ready: 'None are ready yet',
  },
  implementationOwner: {
    me: 'Contact submitting the form',
    administrator: 'A school administrator',
    accountant: 'A bookkeeper or accountant',
    undecided: 'Not decided',
  },
  weeklyAvailability: {
    yes: 'Yes',
    probably: 'Probably',
    not_currently: 'Not currently',
  },
  implementationTimeline: {
    immediately: 'Immediately',
    within_30_days: 'Within 30 days',
    within_60_90_days: 'Within 60-90 days',
    later_this_year: 'Later this year',
    researching: 'Just researching',
  },
};

const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

const cleanSingleLine = (value) => (
  typeof value === 'string' ? value.trim().replace(/[\r\n\t]+/g, ' ') : ''
);

const cleanNotes = (value) => (
  typeof value === 'string' ? value.trim().replace(/\0/g, '') : ''
);

const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function cleanChoice(value, field) {
  const cleaned = cleanSingleLine(value);
  return FIT_OPTIONS[field].has(cleaned) ? cleaned : '';
}

function cleanChoices(value, field) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(cleanSingleLine).filter(item => FIT_OPTIONS[field].has(item)))].slice(0, 8);
}

function labelChoice(field, value) {
  return FIT_LABELS[field][value] || value || '-';
}

function labelChoices(field, values) {
  return values.length ? values.map(value => labelChoice(field, value)).join(', ') : '-';
}

function cleanAttribution(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  return Object.fromEntries(ATTRIBUTION_KEYS.map(key => [key, cleanSingleLine(source[key]).slice(0, 200)]));
}

function classifyFit(data) {
  let score = 0;

  if (['full_time_microschool', 'full_time_coop'].includes(data.organizationType)) score += 3;
  else if (['private_school', 'hybrid'].includes(data.organizationType)) score += 2;
  else if (data.organizationType === 'other') score += 1;

  if (['10_24', '25_49', '50_99'].includes(data.studentCount)) score += 2;
  else score += 1;

  if (['annual_tuition', 'program_pricing'].includes(data.pricingModel)) score += 2;
  else if (['monthly_membership', 'mixed'].includes(data.pricingModel)) score += 1;

  if (data.paymentSources.some(source => ['step_up', 'aaa', 'other_esa'].includes(source))) score += 2;
  else if (data.paymentSources.includes('family_payments')) score += 1;

  const readyInputs = data.availableInputs.filter(value => value !== 'not_ready').length;
  score += Math.min(3, readyInputs);

  if (data.implementationOwner !== 'undecided') score += 2;
  if (data.weeklyAvailability === 'yes') score += 2;
  else if (data.weeklyAvailability === 'probably') score += 1;

  if (['immediately', 'within_30_days'].includes(data.implementationTimeline)) score += 2;
  else if (data.implementationTimeline === 'within_60_90_days') score += 1;

  const hasOwner = data.implementationOwner !== 'undecided';
  const canMeet = data.weeklyAvailability !== 'not_currently';
  const hasInputs = readyInputs >= 3;

  if (score >= 14 && hasOwner && canMeet && hasInputs) return { band: 'Strong fit now', score };
  if (score >= 8) return { band: 'Discovery required', score };
  return { band: 'Future fit / nurture', score };
}

function buildFoundingPartnerEmail(body) {
  const data = {
    school: cleanSingleLine(body.school),
    name: cleanSingleLine(body.name),
    email: cleanSingleLine(body.email).toLowerCase(),
    phone: cleanSingleLine(body.phone),
    state: cleanSingleLine(body.state),
    organizationType: cleanChoice(body.organizationType, 'organizationType'),
    studentCount: cleanChoice(body.studentCount, 'studentCount'),
    pricingModel: cleanChoice(body.pricingModel, 'pricingModel'),
    paymentSources: cleanChoices(body.paymentSources, 'paymentSources'),
    currentSystems: cleanChoices(body.currentSystems, 'currentSystems'),
    primaryChallenge: cleanNotes(body.primaryChallenge),
    availableInputs: cleanChoices(body.availableInputs, 'availableInputs'),
    implementationOwner: cleanChoice(body.implementationOwner, 'implementationOwner'),
    weeklyAvailability: cleanChoice(body.weeklyAvailability, 'weeklyAvailability'),
    implementationTimeline: cleanChoice(body.implementationTimeline, 'implementationTimeline'),
    attribution: cleanAttribution(body.attribution),
  };

  const required = [
    data.school, data.name, data.email, data.state, data.organizationType, data.studentCount,
    data.pricingModel, data.primaryChallenge, data.implementationOwner,
    data.weeklyAvailability, data.implementationTimeline,
  ];

  if (required.some(value => !value)
      || !data.paymentSources.length
      || !data.currentSystems.length
      || !data.availableInputs.length) {
    return { error: 'Please complete each Fit Check question.' };
  }

  if (data.availableInputs.includes('not_ready') && data.availableInputs.length > 1) {
    return { error: 'Please choose either the information you have available or "None of these are ready yet."' };
  }

  if (!validEmail(data.email)) return { error: 'Please enter a valid email address.' };

  if (data.school.length > 120
      || data.name.length > 100
      || data.email.length > 254
      || data.phone.length > 40
      || data.state.length > 60
      || data.primaryChallenge.length > 1200) {
    return { error: 'One or more fields are too long.' };
  }

  const fit = classifyFit(data);
  const attributionText = ATTRIBUTION_KEYS
    .filter(key => data.attribution[key])
    .map(key => `${key}: ${data.attribution[key]}`)
    .join('\n') || '-';

  return {
    payload: {
      from: 'Microschool Ledger <info@microschoolledger.com>',
      to: 'info@microschoolledger.com',
      reply_to: data.email,
      subject: `Founding Partner Fit Check - ${data.school} [${fit.band}]`,
      text: [
        'FOUNDING PARTNER FIT CHECK',
        '',
        `FIT BAND: ${fit.band}`,
        `Internal score: ${fit.score} (starting point only - review personally)`,
        '',
        'CONTACT',
        `School: ${data.school}`,
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        `Phone: ${data.phone || '-'}`,
        `State: ${data.state}`,
        '',
        'SCHOOL FIT',
        `Organization: ${labelChoice('organizationType', data.organizationType)}`,
        `Students: ${labelChoice('studentCount', data.studentCount)}`,
        `Pricing: ${labelChoice('pricingModel', data.pricingModel)}`,
        `Payment sources: ${labelChoices('paymentSources', data.paymentSources)}`,
        `Current systems: ${labelChoices('currentSystems', data.currentSystems)}`,
        '',
        'PRIMARY PROBLEM',
        data.primaryChallenge,
        '',
        'IMPLEMENTATION READINESS',
        `Available inputs: ${labelChoices('availableInputs', data.availableInputs)}`,
        `Implementation owner: ${labelChoice('implementationOwner', data.implementationOwner)}`,
        `Weekly working session: ${labelChoice('weeklyAvailability', data.weeklyAvailability)}`,
        `Timeline: ${labelChoice('implementationTimeline', data.implementationTimeline)}`,
        '',
        'ATTRIBUTION',
        attributionText,
      ].join('\n'),
    },
  };
}

function buildDemoEmail(body) {
  const school = cleanSingleLine(body.school);
  const name = cleanSingleLine(body.name);
  const email = cleanSingleLine(body.email).toLowerCase();
  const phone = cleanSingleLine(body.phone);
  const notes = cleanNotes(body.notes);

  if (!school || !name || !email) return { error: 'school, name, and email are required' };
  if (school.length > 120 || name.length > 100 || email.length > 254 || phone.length > 40 || notes.length > 2000) {
    return { error: 'One or more fields are too long.' };
  }
  if (!validEmail(email)) return { error: 'Please enter a valid email address.' };

  return {
    payload: {
      from: 'Microschool Ledger <info@microschoolledger.com>',
      to: 'info@microschoolledger.com',
      reply_to: email,
      subject: `Demo Request - ${school}`,
      text: [
        `School: ${school}`,
        `Name:   ${name}`,
        `Email:  ${email}`,
        `Phone:  ${phone || '-'}`,
        '',
        'Current setup / notes:',
        notes || '-',
      ].join('\n'),
    },
  };
}

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

  const result = cleanSingleLine(body.formType) === 'founding_partner_fit'
    ? buildFoundingPartnerEmail(body)
    : buildDemoEmail(body);

  if (result.error) return res.status(400).json({ error: result.error });

  if (!process.env.RESEND_API_KEY) {
    console.error('Contact form email service is not configured.');
    return res.status(500).json({ error: 'We could not send your request right now. Please email info@microschoolledger.com.' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify(result.payload),
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
