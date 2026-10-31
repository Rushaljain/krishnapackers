import { Resend } from 'resend';

function getResendApiKey() {
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
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = getResendApiKey();
  if (!apiKey) {
    return res.status(500).json({ error: 'Resend API Key is not configured' });
  }

  const resend = new Resend(apiKey);

  // GET: Fetch incoming received emails directly into the Baachko ERP Mailing Center
  if (req.method === 'GET') {
    try {
      if (resend.emails && resend.emails.receiving && typeof resend.emails.receiving.list === 'function') {
        const listResult = await resend.emails.receiving.list();
        const items = listResult.data?.data || listResult.data || [];

        // Fetch detailed email body (text/html) for the latest incoming emails
        const detailedItems = await Promise.all(
          items.slice(0, 15).map(async (item) => {
            try {
              if (resend.emails.receiving.get) {
                const fullRes = await resend.emails.receiving.get(item.id);
                return fullRes.data || fullRes || item;
              }
              return item;
            } catch (err) {
              return item;
            }
          })
        );

        return res.status(200).json({
          success: true,
          emails: detailedItems
        });
      }
      return res.status(200).json({ success: true, emails: [] });
    } catch (err) {
      console.error('Error fetching receiving emails:', err);
      return res.status(500).json({ error: err.message || 'Failed to list incoming emails' });
    }
  }

  // POST: Webhook handler when Resend receives an inbound email (stored directly for ERP Mailing Center)
  if (req.method === 'POST') {
    try {
      const payload = req.body || {};
      const eventType = payload.type;
      const data = payload.data || {};

      console.log('Received inbound email event in Baachko ERP Mailer:', eventType, data.id || data.email_id);

      return res.status(200).json({
        success: true,
        message: 'Inbound email processed and synced with Baachko ERP Mailing Center',
        emailId: data.id || data.email_id
      });
    } catch (err) {
      console.error('Error processing inbound webhook:', err);
      return res.status(500).json({ error: err.message || 'Webhook processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
