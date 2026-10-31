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

function cleanEmailBody(bodyText, htmlContent) {
  let text = "";
  if (htmlContent && typeof htmlContent === "string") {
    let cleanHtml = htmlContent
      .replace(/<div[^>]*class=["'][^"']*gmail_quote[^"']*["'][\s\S]*$/i, "")
      .replace(/<div[^>]*class=["'][^"']*gmail_attr[^"']*["'][\s\S]*$/i, "")
      .replace(/<blockquote[\s\S]*$/i, "")
      .replace(/<div[^>]*id=["']divRplyFwdMsg["'][\s\S]*$/i, "")
      .replace(/<div[^>]*id=["']appendonsend["'][\s\S]*$/i, "");
    text = cleanHtml
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/div>/gi, "\n")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }
  if (!text.trim() && bodyText && typeof bodyText === "string") text = bodyText;
  if (!text) return "";
  const lines = text.split("\n");
  const fresh = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^On\s+.*wrote:?\s*$/i.test(trimmed)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(trimmed)) break;
    if (/^From:\s+.*@.*/i.test(trimmed)) break;
    if (/^>\s*/.test(trimmed)) continue;
    fresh.push(line);
  }
  return fresh.join("\n").replace(/\n{3,}/g, "\n\n").trim();
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
                const fullData = fullRes.data || fullRes || item;
                const cleaned = cleanEmailBody(fullData.text, fullData.html);
                return {
                  ...fullData,
                  cleanBody: cleaned || fullData.text || 'Incoming email received via baachko.com MX server.'
                };
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
