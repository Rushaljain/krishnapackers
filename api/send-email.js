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

// Clean executive B2B correspondence template designed to land in Primary Inbox
function generateBrandedHtml(content, subject, senderName = "Baachko Sales Team", attachments = []) {
  const formattedBody = (content || '')
    .split('\n\n')
    .map(p => `<p style="margin: 0 0 16px 0; line-height: 1.65; color: #1e293b; font-size: 15px;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const attachmentsListHtml = (attachments && Array.isArray(attachments) && attachments.length > 0)
    ? `
      <div style="margin-top: 24px; padding: 12px 16px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px;">Attached Documents (${attachments.length}):</p>
        <ul style="margin: 0; padding-left: 20px; color: #334155; font-size: 13px; line-height: 1.6;">
          ${attachments.map(a => `<li><strong>${a.filename || a.name || 'Document'}</strong>${a.size ? ` <span style="color: #64748b;">(${Math.round(a.size / 1024)} KB)</span>` : ''}</li>`).join('')}
        </ul>
      </div>
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 24px 16px; background-color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
  <div style="max-width: 620px; margin: 0 auto;">
    
    <!-- Clean Minimalist Business Letterhead -->
    <div style="padding-bottom: 14px; margin-bottom: 22px; border-bottom: 2px solid #C95A08;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td align="left">
            <span style="font-size: 20px; font-weight: 800; color: #0B1730; letter-spacing: 0.5px;">BAACHKO</span>
            <span style="font-size: 12px; color: #64748b; font-weight: 500; margin-left: 8px;">| Industrial Packaging</span>
          </td>
          <td align="right">
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">Est. 1974</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Direct Message Body (Front & Center) -->
    <div style="font-size: 15px; line-height: 1.65; color: #1e293b;">
      ${formattedBody}
    </div>

    <!-- Attached Files Info -->
    ${attachmentsListHtml}

    <!-- Corporate Business Signature -->
    <div style="margin-top: 32px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
      <p style="margin: 0; color: #0f172a; font-weight: 700; font-size: 15px;">${senderName}</p>
      <p style="margin: 2px 0 0 0; color: #64748b; font-size: 13px;">Baachko Pvt. Ltd. (Krishna Packers)</p>
      <p style="margin: 3px 0 0 0; font-size: 13px;">
        <a href="https://www.baachko.com" style="color: #C95A08; text-decoration: none; font-weight: 600;">www.baachko.com</a>
      </p>
      <div style="margin-top: 12px; font-size: 12px; line-height: 1.5; color: #64748b;">
        <span style="font-weight: 600; color: #475569;">Manufacturing Plant & Corporate Office:</span><br/>
        W-234, Khairane Road, TTC Industrial Area, Khairane MIDC, Navi Mumbai - 400705, Maharashtra, India<br/>
        Phone: <a href="tel:+919324635279" style="color: #64748b; text-decoration: none;">+91 93246 35279</a> / <a href="tel:+917303077339" style="color: #64748b; text-decoration: none;">+91 73030 77339</a>
      </div>
    </div>

  </div>
</body>
</html>`.trim();
}

function generatePlainText(content, senderName = "Baachko Sales Team", attachments = []) {
  let text = (content || '').trim();
  if (attachments && Array.isArray(attachments) && attachments.length > 0) {
    text += `\n\nAttached Documents (${attachments.length}):\n`;
    attachments.forEach(a => {
      const name = a.filename || a.name || 'Document';
      const sizeStr = a.size ? ` (${Math.round(a.size / 1024)} KB)` : '';
      text += `- ${name}${sizeStr}\n`;
    });
  }
  text += `\n--\n${senderName}\nBaachko Pvt. Ltd. (Krishna Packers)\nwww.baachko.com\nW-234, Khairane Road, TTC Industrial Area, Khairane MIDC, Navi Mumbai - 400705\nPhone: +91 93246 35279 / +91 73030 77339\n`;
  return text;
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
      cc,
      bcc,
      subject, 
      message, 
      html, 
      fromName = 'Baachko Industrial Packaging', 
      fromEmail, 
      replyTo,
      inReplyTo,
      apiKey: customApiKey,
      attachments
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
    const apiKey = getResendApiKey(customApiKey);

    if (!apiKey) {
      return res.status(400).json({ 
        error: 'Resend API Key is missing. Please configure RESEND_API_KEY in your Vercel project Environment Variables.' 
      });
    }

    const resend = new Resend(apiKey);

    // Sender formatting (align reply-to to avoid spam classification)
    const senderAddress = fromEmail || process.env.RESEND_FROM_EMAIL || 'sales@baachko.com';
    const formattedFrom = `${fromName} <${senderAddress}>`;
    const resolvedReplyTo = replyTo || senderAddress;

    const emailHtml = html || generateBrandedHtml(message, subject, fromName, attachments);
    const plainText = generatePlainText(message || subject, fromName, attachments);

    // Parse CC list if provided
    let ccList = undefined;
    if (cc) {
      if (Array.isArray(cc)) {
        ccList = cc.map(c => typeof c === 'string' ? c.trim() : '').filter(Boolean);
      } else if (typeof cc === 'string' && cc.trim()) {
        ccList = cc.split(/[,;]/).map(c => c.trim()).filter(Boolean);
      }
      if (ccList && ccList.length === 0) ccList = undefined;
    }

    // Parse BCC list if provided
    let bccList = undefined;
    if (bcc) {
      if (Array.isArray(bcc)) {
        bccList = bcc.map(b => typeof b === 'string' ? b.trim() : '').filter(Boolean);
      } else if (typeof bcc === 'string' && bcc.trim()) {
        bccList = bcc.split(/[,;]/).map(b => b.trim()).filter(Boolean);
      }
      if (bccList && bccList.length === 0) bccList = undefined;
    }

    // ==========================================
    // ROBUST BASE64 ATTACHMENTS HANDLING
    // (Resend API expects pure Base64 string for content)
    // ==========================================
    let formattedAttachments = undefined;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      formattedAttachments = attachments.map(att => {
        let base64String = '';
        if (typeof att.content === 'string') {
          base64String = att.content.replace(/^data:[^;]+;base64,/, '').trim();
        } else if (typeof att.dataUrl === 'string') {
          base64String = att.dataUrl.replace(/^data:[^;]+;base64,/, '').trim();
        } else if (typeof att.url === 'string' && att.url.startsWith('data:')) {
          base64String = att.url.replace(/^data:[^;]+;base64,/, '').trim();
        } else if (Buffer.isBuffer(att.content)) {
          base64String = att.content.toString('base64');
        }

        const filename = att.filename || att.name || 'attachment';
        const contentType = att.contentType || att.type || undefined;

        return {
          filename: filename,
          content: base64String,
          contentType: contentType
        };
      }).filter(att => Boolean(att.content));

      if (formattedAttachments.length === 0) {
        formattedAttachments = undefined;
      }
    }

    // Email headers for threading into recipient's Primary inbox
    const headers = {};
    if (inReplyTo && typeof inReplyTo === 'string' && inReplyTo.trim()) {
      headers['In-Reply-To'] = inReplyTo.trim();
      headers['References'] = inReplyTo.trim();
    }
    headers['X-Entity-Ref-ID'] = `baachko-${Date.now()}`;

    const emailPayload = {
      from: formattedFrom,
      to: Array.isArray(to) ? to : [to],
      cc: ccList,
      bcc: bccList,
      subject: subject,
      html: emailHtml,
      text: plainText,
      replyTo: Array.isArray(resolvedReplyTo) ? resolvedReplyTo : [resolvedReplyTo],
      headers: headers,
      attachments: formattedAttachments
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
      subject: subject,
      attachmentCount: formattedAttachments ? formattedAttachments.length : 0
    });

  } catch (error) {
    console.error('Unexpected error in send-email handler:', error);
    return res.status(500).json({ 
      error: error.message || 'Internal server error while sending email.',
      details: String(error)
    });
  }
}
