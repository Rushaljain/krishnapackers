import { Resend } from 'resend';

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
    const apiKey = customApiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        configured: false,
        message: 'Resend API Key is not set. Add RESEND_API_KEY to your Vercel Environment Variables or configure it in Admin settings.'
      });
    }

    const resend = new Resend(apiKey);

    // Fetch domains from Resend
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

    return res.status(200).json({
      configured: true,
      validKey: true,
      domains: domains,
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
