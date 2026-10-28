import { Resend } from 'resend';

function generateBrandedHtml(content, subject, senderName = "Baachko Sales Team") {
  // Replace line breaks with HTML paragraphs/breaks
  const formattedBody = content
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.6; color: #374151; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #0B1730; padding: 28px 32px; text-align: left; border-bottom: 3px solid #C95A08;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">BAACHKO</h1>
                    <p style="margin: 4px 0 0 0; color: #C95A08; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;">Industrial Packaging Solutions • Est. 1974</p>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(255,255,255,0.12); color: #ffffff; font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: 600;">ISO 9001:2015</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              ${formattedBody}

              <!-- Signoff -->
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #111827; font-weight: 700; font-size: 15px;">${senderName}</p>
                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Baachko Pvt. Ltd. (Krishna Packers)</p>
                <p style="margin: 2px 0 0 0; color: #C95A08; font-size: 13px; font-weight: 500;">
                  <a href="https://www.baachko.com" style="color: #C95A08; text-decoration: none;">www.baachko.com</a>
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: left; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Manufacturing Plant & Corporate Office:</p>
              <p style="margin: 0 0 8px 0;">W-234, Khairane Road, TTC Industrial Area, Khairane MIDC, Navi Mumbai - 400705, Maharashtra, India</p>
              <p style="margin: 0;">Phone: <a href="tel:+919324635279" style="color: #4b5563; text-decoration: none;">+91 93246 35279</a> / <a href="tel:+917303077339" style="color: #4b5563; text-decoration: none;">+91 73030 77339</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { 
      to, 
      subject, 
      message, 
      html, 
      fromName = 'Baachko Industrial Packaging', 
      fromEmail, 
      replyTo = 'karan.apcotraders@gmail.com',
      apiKey: customApiKey 
    } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Recipient "to" email address is required.' });
    }

    if (!subject) {
      return res.status(400).json({ error: 'Email "subject" is required.' });
    }

    if (!message && !html) {
      return res.status(400).json({ error: 'Email content ("message" or "html") is required.' });
    }

    // Determine Resend API Key (Priority: customApiKey > env vars)
    const apiKey = customApiKey || process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Resend API Key is missing. Please configure RESEND_API_KEY in your Vercel project Environment Variables or pass it in the request settings.' 
      });
    }

    const resend = new Resend(apiKey);

    // Format sender:
    // e.g. "Baachko Industrial Packaging <sales@baachko.com>"
    // If no custom domain provided, use sales@baachko.com or fallback to onboarding@resend.dev for test
    const senderAddress = fromEmail || process.env.RESEND_FROM_EMAIL || 'sales@baachko.com';
    const formattedFrom = `${fromName} <${senderAddress}>`;

    const emailHtml = html || generateBrandedHtml(message, subject, fromName);

    const emailPayload = {
      from: formattedFrom,
      to: Array.isArray(to) ? to : [to],
      subject: subject,
      html: emailHtml,
      text: message || subject,
      replyTo: replyTo ? (Array.isArray(replyTo) ? replyTo : [replyTo]) : undefined
    };

    const response = await resend.emails.send(emailPayload);

    if (response.error) {
      console.error('Resend API returned error:', response.error);
      return res.status(400).json({ 
        error: response.error.message || 'Failed to send email via Resend.',
        details: response.error 
      });
    }

    return res.status(200).json({ 
      success: true, 
      id: response.data?.id,
      from: formattedFrom,
      to: emailPayload.to,
      subject: subject
    });

  } catch (error) {
    console.error('Unexpected error in send-email handler:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error while sending email.',
      details: String(error)
    });
  }
}
