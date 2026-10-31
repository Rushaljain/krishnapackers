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
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL || 'karan.apcotraders@gmail.com';

  // GET: List recent incoming emails
  if (req.method === 'GET') {
    try {
      if (resend.emails && resend.emails.receiving && typeof resend.emails.receiving.list === 'function') {
        const listResult = await resend.emails.receiving.list();
        return res.status(200).json({
          success: true,
          emails: listResult.data?.data || listResult.data || []
        });
      }
      return res.status(200).json({ success: true, emails: [] });
    } catch (err) {
      console.error('Error fetching receiving emails:', err);
      return res.status(500).json({ error: err.message || 'Failed to list incoming emails' });
    }
  }

  // POST: Webhook receiver for Resend 'email.received' event
  if (req.method === 'POST') {
    try {
      const payload = req.body || {};
      const eventType = payload.type;
      const data = payload.data || {};

      console.log('Incoming Resend webhook event:', eventType, data);

      if (eventType === 'email.received' || data.email_id || data.id) {
        const emailId = data.email_id || data.id;
        const sender = data.from || 'Unknown Sender';
        const recipient = Array.isArray(data.to) ? data.to.join(', ') : (data.to || 'sales@baachko.com');
        const subject = data.subject || '(No Subject)';
        const textContent = data.text || '';
        const htmlContent = data.html || `<p>${textContent || 'No message content'}</p>`;

        // Try Resend built-in forward helper first
        let forwarded = false;
        try {
          if (emailId && resend.emails.receiving?.forward) {
            await resend.emails.receiving.forward({
              emailId: emailId,
              to: adminEmail,
              from: 'sales@baachko.com'
            });
            forwarded = true;
          }
        } catch (fwdErr) {
          console.warn('resend.emails.receiving.forward failed, trying fallback dispatch:', fwdErr.message);
        }

        // If built-in forward did not execute, send a formatted notification email
        if (!forwarded) {
          await resend.emails.send({
            from: 'Baachko Inbound Mailer <sales@baachko.com>',
            to: adminEmail,
            subject: `[Incoming Baachko Mail to ${recipient}]: ${subject}`,
            replyTo: typeof sender === 'string' && sender.includes('@') ? sender : undefined,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0B1730; color: white; padding: 16px 20px;">
                  <h2 style="margin: 0; font-size: 18px;">📬 Incoming Mail Received on baachko.com</h2>
                  <p style="margin: 4px 0 0 0; font-size: 13px; color: #f59e0b;">Sent to: <strong>${recipient}</strong></p>
                </div>
                <div style="padding: 20px; background-color: #f9fafb;">
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>From:</strong> ${sender}</p>
                  <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
                  <p style="margin: 0 0 16px 0; font-size: 14px;"><strong>Received At:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;" />
                  <div style="background: white; padding: 16px; border-radius: 6px; border: 1px solid #e5e7eb; line-height: 1.6; color: #1f2937;">
                    ${htmlContent}
                  </div>
                </div>
              </div>
            `
          });
        }

        return res.status(200).json({ success: true, forwardedTo: adminEmail, emailId });
      }

      return res.status(200).json({ received: true, event: eventType });
    } catch (err) {
      console.error('Error processing inbound webhook:', err);
      return res.status(500).json({ error: err.message || 'Webhook processing failed' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
