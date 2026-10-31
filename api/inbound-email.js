import { Resend } from 'resend';

export const ALLOWED_MAILBOXES = [
  'sales@baachko.com',
  'karan@baachko.com',
  'enquiry@baachko.com',
  'quotes@baachko.com'
];

function extractCleanEmail(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const match = raw.match(/<([^>]+)>/);
  if (match) return match[1].toLowerCase().trim();
  return raw.replace(/["']/g, '').toLowerCase().trim();
}

function getRecipientEmails(toField) {
  if (!toField) return [];
  const list = Array.isArray(toField) ? toField : [toField];
  return list.map(extractCleanEmail).filter(Boolean);
}

function isAllowedInboundRecipient(toField) {
  const recipients = getRecipientEmails(toField);
  if (recipients.length === 0) return false;
  return recipients.some(r => ALLOWED_MAILBOXES.includes(r));
}

// In-memory set to ensure each unauthorized email ID is only bounced once
const bouncedEmailIds = new Set();

async function sendBounceNotification(resend, item) {
  if (!item || !item.id) return;
  if (bouncedEmailIds.has(item.id)) return;
  bouncedEmailIds.add(item.id);

  // Skip retrospective bounces for emails older than 30 minutes
  if (item.created_at) {
    const ageMs = Date.now() - new Date(item.created_at).getTime();
    if (ageMs > 30 * 60 * 1000) return;
  }

  const senderRaw = typeof item.from === 'string' ? item.from : '';
  const senderEmail = extractCleanEmail(senderRaw);
  if (!senderEmail || !senderEmail.includes('@')) return;

  // Prevent bounce loops
  if (senderEmail.endsWith('@baachko.com')) return;
  if (/mailer-daemon|postmaster|noreply|no-reply|bounce/i.test(senderEmail)) return;

  const attemptedRecipients = getRecipientEmails(item.to);
  const attemptedDisplay = attemptedRecipients.length > 0 ? attemptedRecipients.join(', ') : 'unknown@baachko.com';

  try {
    await resend.emails.send({
      from: 'Mail Delivery Subsystem <postmaster@baachko.com>',
      to: senderEmail,
      subject: 'Delivery Status Notification (Failure): 550 5.1.1 User unknown',
      text: `This is an automated delivery status notification from the baachko.com mail server.

Delivery has failed to the following recipient(s):
  ${attemptedDisplay}

Reason:
550 5.1.1 Recipient address rejected: User unknown in virtual mailbox table.
The mailbox you attempted to reach does not exist or is not authorized to receive incoming mail on baachko.com.

Authorized mailboxes on baachko.com:
  • sales@baachko.com (Baachko Industrial Packaging)
  • karan@baachko.com (Karan - Baachko)
  • enquiry@baachko.com (Baachko Enquiries)
  • quotes@baachko.com (Baachko Quotations & Specs)

Please verify the destination address and try again.

--------------------------------------------------
Reporting-MTA: dns; mx.baachko.com
Arrival-Date: ${item.created_at || new Date().toUTCString()}
Original-Subject: ${item.subject || '(no subject)'}
--------------------------------------------------`,
      html: `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; line-height: 1.6; max-width: 600px; padding: 24px; border: 1px solid #e5e7eb; border-radius: 10px; background-color: #ffffff;">
  <div style="margin-bottom: 16px;">
    <h2 style="color: #b91c1c; font-size: 18px; margin: 0; font-weight: 700;">Delivery Status Notification (Failure)</h2>
  </div>
  <p style="font-size: 14px; color: #374151; margin: 0 0 16px 0;">
    Your message could not be delivered to the recipient address specified below:
  </p>
  <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
    <p style="margin: 0; font-size: 13px; font-weight: 700; color: #991b1b; font-family: monospace;">
      550 5.1.1 Recipient address rejected: User unknown
    </p>
    <p style="margin: 4px 0 0 0; font-size: 13px; color: #7f1d1d;">
      The address <strong style="font-family: monospace;">${attemptedDisplay}</strong> is not a recognized mailbox on baachko.com.
    </p>
  </div>
  <p style="font-size: 13px; color: #4b5563; margin: 16px 0 8px 0;">
    Please verify the spelling or reach out to one of our official departments:
  </p>
  <ul style="font-size: 13px; color: #374151; padding-left: 20px; margin: 0 0 16px 0; line-height: 1.8;">
    <li><strong>sales@baachko.com</strong> — Commercial &amp; Sales Inquiries</li>
    <li><strong>karan@baachko.com</strong> — Executive &amp; Partner Communications</li>
    <li><strong>enquiry@baachko.com</strong> — General Inquiries &amp; Customer Support</li>
    <li><strong>quotes@baachko.com</strong> — Quotations &amp; Technical Spec Sheets</li>
  </ul>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
  <p style="font-size: 11px; color: #9ca3af; margin: 0;">
    Reporting-MTA: dns; mx.baachko.com &bull; Original Subject: ${item.subject || '(no subject)'}
  </p>
</div>`
    });
    console.log(`[BOUNCE SENT] Bounced email ${item.id} intended for ${attemptedDisplay} back to ${senderEmail}`);
  } catch (err) {
    console.warn(`[BOUNCE ERROR] Could not dispatch bounce notification for ${item.id}:`, err?.message || err);
  }
}

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

        // Separate authorized mailboxes from unauthorized mailboxes
        const allowedItems = [];
        for (const item of detailedItems) {
          if (isAllowedInboundRecipient(item.to)) {
            allowedItems.push(item);
          } else {
            // Unauthorized mailbox: bounce back to sender with 550 User Unknown
            await sendBounceNotification(resend, item);
          }
        }

        return res.status(200).json({
          success: true,
          emails: allowedItems
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

      // Verify recipient authorization for webhook
      if (data && data.to) {
        if (!isAllowedInboundRecipient(data.to)) {
          console.log('[INBOUND BOUNCE] Rejecting and bouncing unauthorized recipient on webhook:', data.to);
          await sendBounceNotification(resend, data);
          return res.status(200).json({
            success: true,
            bounced: true,
            message: 'Recipient address rejected: User unknown. Bounce notice sent.'
          });
        }
      }

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
