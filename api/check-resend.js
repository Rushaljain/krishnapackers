import { Resend } from 'resend';

function getResendApiKey(customApiKey) {
  if (customApiKey && typeof customApiKey === 'string' && customApiKey.trim()) {
    return customApiKey.trim();
  }
  const candidates = [
    'RESEND_API_KEY',
    'VITE_RESEND_API_KEY',
    'RESEND_KEY',
    'RESEND_API',
    'RESEND_TOKEN',
    'resend_api_key',
    'resendApiKey'
  ];
  for (const k of candidates) {
    if (process.env[k] && typeof process.env[k] === 'string' && process.env[k].trim()) {
      return process.env[k].trim();
    }
  }
  for (const envKey of Object.keys(process.env)) {
    if (envKey.toUpperCase().includes('RESEND') && envKey.toUpperCase().includes('KEY')) {
      const val = process.env[envKey];
      if (val && typeof val === 'string' && val.trim()) return val.trim();
    }
  }
  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const customApiKey = req.method === 'POST' ? req.body?.apiKey : req.query?.apiKey;
    const apiKey = getResendApiKey(customApiKey);

    if (!apiKey) {
      const foundResendKeys = Object.keys(process.env).filter(k => k.toLowerCase().includes('resend'));
      return res.status(200).json({
        configured: false,
        detectedKeys: foundResendKeys,
        deployment: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
        env: process.env.VERCEL_ENV || 'unknown',
        message: 'Resend API Key is not set in this deployment.'
      });
    }

    const resend = new Resend(apiKey);

    // If query includes specific emailId, inspect it
    if (req.query?.emailId) {
      const emailRes = await resend.emails.get(req.query.emailId);
      return res.status(200).json({ emailDetails: emailRes });
    }

    // Fetch domains from Resend with full details
    const domainsResult = await resend.domains.list();

    if (domainsResult.error) {
      return res.status(200).json({
        configured: true,
        validKey: false,
        error: domainsResult.error.message || 'Invalid Resend API Key',
        domains: []
      });
    }

    const domains = domainsResult.data?.data || domainsResult.data || [];
    let detailedDomain = null;
    if (domains.length > 0) {
      const firstDomain = domains[0];
      const getRes = await resend.domains.get(firstDomain.id);
      detailedDomain = getRes.data || getRes;
    }

    return res.status(200).json({
      configured: true,
      validKey: true,
      domains: domains,
      detailedDomain: detailedDomain,
      senderEmail: process.env.RESEND_FROM_EMAIL || 'sales@baachko.com',
      message: 'Resend is connected and ready.'
    });

  } catch (err) {
    return res.status(500).json({
      configured: false,
      error: err.message || 'Internal error checking Resend status'
    });
  }
}
