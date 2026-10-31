import React, { useState, useEffect } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Check, Clock } from 'lucide-react';

function generateBrandedHtml(content, subject, senderName = "Baachko Sales Team") {
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
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;" cellspacing="0" cellpadding="0">
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
          <tr>
            <td style="padding: 36px 32px 28px 32px; background-color: #ffffff;">
              ${formattedBody}
              <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #111827; font-weight: 700; font-size: 15px;">${senderName}</p>
                <p style="margin: 2px 0 0 0; color: #6b7280; font-size: 13px;">Baachko Pvt. Ltd. (Krishna Packers)</p>
                <p style="margin: 2px 0 0 0; color: #C95A08; font-size: 13px; font-weight: 500;">
                  <a href="https://www.baachko.com" style="color: #C95A08; text-decoration: none;">www.baachko.com</a>
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: left; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Manufacturing Plant & Corporate Office:</p>
              <p style="margin: 0 0 8px 0;">W-234, Khairane Road, TTC Industrial Area, Khairane MIDC, Navi Mumbai - 400705, Maharashtra, India</p>
              <p style="margin: 0;">Phone: +91 93246 35279 / +91 73030 77339</p>
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

export default function EmailCenterPage() {
  const senderEmail = 'sales@baachko.com';
  const senderName = 'Baachko Industrial Packaging';

  // Composer state
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('Quotation & Technical Specifications - Baachko');
  const [message, setMessage] = useState(
`Dear Customer,

Thank you for your interest in Baachko Industrial Packaging solutions.

We manufacture heavy-duty Multiwall Kraft Paper Sacks, Valve Bags, HDPE Coated Sacks, PP Woven Bags, and FIBC Jumbo Bulk Bags built to stringent ISO 9001:2015 quality standards.

Please let us know your required dimensions, ply count, or target capacity (25 Kg / 50 Kg / Bulk) so we can issue an official proforma quotation and dispatch complimentary trial samples.

Best regards,
Sales Engineering Team
Baachko Pvt. Ltd. (Krishna Packers)
W-234, Khairane Road, TTC Industrial Area, Navi Mumbai - 400705`
  );
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState({ type: '', text: '' });

  // Sent history
  const [sentHistory, setSentHistory] = useState([]);

  useEffect(() => {
    loadSentHistory();
  }, []);

  const loadSentHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('sent_emails_history') || '[]');
      setSentHistory(history);
    } catch (e) {}
  };

  const handleSendCustom = async (e) => {
    e.preventDefault();
    if (!to) {
      setSendResult({ type: 'error', text: 'Recipient email is required.' });
      return;
    }

    setIsSending(true);
    setSendResult({ type: '', text: '' });

    try {
      let emailId = null;

      // Send via serverless endpoint (uses RESEND_API_KEY from Vercel)
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
          fromName: senderName,
          fromEmail: senderEmail
        })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to dispatch email.');
        }
        emailId = data.id;
      } else {
        throw new Error('Server returned an invalid response. Please verify Vercel deployment.');
      }

      setSendResult({
        type: 'success',
        text: `Email successfully dispatched to ${to} (Resend ID: ${emailId || 'sent'})`
      });

      const updatedHistory = [
        {
          id: emailId,
          to: to,
          contactName: to.split('@')[0],
          company: 'Direct Dispatch',
          subject: subject,
          sentAt: new Date().toISOString(),
          from: `${senderName} <${senderEmail}>`
        },
        ...sentHistory
      ].slice(0, 50);

      setSentHistory(updatedHistory);
      localStorage.setItem('sent_emails_history', JSON.stringify(updatedHistory));
      setTo('');

    } catch (err) {
      setSendResult({
        type: 'error',
        text: err.message || 'Error occurred while sending email.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-gray-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold text-[#0B1730]">Mailing Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Resend Active
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Dispatch quotations, technical specifications, and official responses directly from <span className="font-semibold text-gray-700">{senderEmail}</span>.
          </p>
        </div>
        <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3.5 py-2 rounded-xl flex items-center gap-2">
          <Mail size={15} className="text-amber-700" />
          <span>Sending as: <strong>{senderName} &lt;{senderEmail}&gt;</strong></span>
        </div>
      </div>

      {/* Direct Custom Email Dispatcher */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-200">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 bg-orange-50 text-orange-700 rounded-xl">
            <Send size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Direct Email Composer</h2>
            <p className="text-xs text-gray-500">Send an instant quotation or official response from <span className="font-semibold text-gray-700">{senderEmail}</span>.</p>
          </div>
        </div>

        {sendResult.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm flex items-start gap-3 ${
            sendResult.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {sendResult.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <span className="font-medium">{sendResult.text}</span>
          </div>
        )}

        <form onSubmit={handleSendCustom} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Recipient Email *
              </label>
              <input 
                type="email" 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="client@company.com"
                className="w-full text-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Subject *
              </label>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-sm font-semibold px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Content
            </label>
            <textarea 
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-sm px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-sans leading-relaxed"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-[#C95A08] hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Dispatching...
                </>
              ) : (
                <>
                  <Send size={16} /> Send via Resend
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sent Emails History Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-500" />
            <h3 className="font-bold text-sm text-gray-800">Recent Admin Sent Emails</h3>
          </div>
          <span className="text-xs text-gray-500">
            {sentHistory.length} recorded dispatches
          </span>
        </div>

        {sentHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
              <thead className="bg-slate-50 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-3 text-left">Date & Time</th>
                  <th className="px-6 py-3 text-left">Recipient</th>
                  <th className="px-6 py-3 text-left">Subject</th>
                  <th className="px-6 py-3 text-left">Sender</th>
                  <th className="px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sentHistory.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-3 whitespace-nowrap text-gray-500">
                      {new Date(item.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-semibold text-gray-900 block">{item.contactName || item.to}</span>
                      <span className="text-xs text-gray-500">{item.to}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-800 max-w-xs truncate" title={item.subject}>
                      {item.subject}
                    </td>
                    <td className="px-6 py-3 text-xs text-gray-600 font-mono">
                      {item.from}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                        <Check size={12} /> Dispatched
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-gray-500">
            No emails have been sent from this admin panel yet. Select a lead in the Leads tab or compose a message above to send your first email.
          </div>
        )}
      </div>

    </div>
  );
}
