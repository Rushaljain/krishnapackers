import React, { useState, useEffect } from 'react';
import { 
  Mail, Send, CheckCircle2, AlertCircle, Loader2, Globe, Shield, Key, 
  RefreshCw, Copy, Check, ExternalLink, Sparkles, Clock, User
} from 'lucide-react';

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
  const [apiKey, setApiKey] = useState(localStorage.getItem('resend_api_key') || '');
  const [senderEmail, setSenderEmail] = useState(
    localStorage.getItem('resend_sender_email') || 'sales@baachko.com'
  );
  const [senderName, setSenderName] = useState(
    localStorage.getItem('resend_sender_name') || 'Baachko Industrial Packaging'
  );

  const [loadingStatus, setLoadingStatus] = useState(false);
  const [resendStatus, setResendStatus] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
    checkConnection();
    loadSentHistory();
  }, []);

  const loadSentHistory = () => {
    try {
      const history = JSON.parse(localStorage.getItem('sent_emails_history') || '[]');
      setSentHistory(history);
    } catch (e) {}
  };

  const checkConnection = async (overrideKey) => {
    setLoadingStatus(true);
    const keyToUse = overrideKey !== undefined ? overrideKey : apiKey;

    // 1. Try serverless check endpoint
    try {
      const res = await fetch('/api/check-resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: keyToUse })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setResendStatus(data);
        return;
      }
    } catch (e) {}

    // 2. Direct fallback to Resend REST API if serverless route is not yet deployed
    if (keyToUse) {
      try {
        const directRes = await fetch('https://api.resend.com/domains', {
          headers: { 'Authorization': `Bearer ${keyToUse}` }
        });
        const directData = await directRes.json();
        if (directRes.ok) {
          setResendStatus({
            configured: true,
            validKey: true,
            domains: directData.data || [],
            senderEmail: senderEmail || 'sales@baachko.com',
            message: 'Connected directly to Resend API.'
          });
          return;
        } else {
          setResendStatus({
            configured: true,
            validKey: false,
            error: directData.message || 'Invalid Resend API Key',
            domains: []
          });
          return;
        }
      } catch (err) {
        setResendStatus({
          configured: true,
          validKey: false,
          error: 'Could not connect to Resend API.',
          domains: []
        });
        return;
      }
    }

    setResendStatus({
      configured: false,
      message: 'Resend API Key is not set. Enter your key below or add RESEND_API_KEY to Vercel.'
    });
    setLoadingStatus(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('resend_api_key', apiKey.trim());
    localStorage.setItem('resend_sender_email', senderEmail.trim());
    localStorage.setItem('resend_sender_name', senderName.trim());
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    checkConnection(apiKey.trim());
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

      // 1. Try serverless endpoint first
      try {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: to.trim(),
            subject: subject.trim(),
            message: message.trim(),
            fromName: senderName.trim(),
            fromEmail: senderEmail.trim(),
            apiKey: apiKey.trim() || undefined
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
          throw new Error('FALLBACK_DIRECT');
        }
      } catch (err) {
        // 2. Direct fallback to Resend REST API
        if (err.message === 'FALLBACK_DIRECT' || !emailId) {
          if (!apiKey.trim()) {
            throw new Error('Resend API key is required. Please save your API key in the settings box on the right.');
          }

          const directRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey.trim()}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: `${senderName.trim()} <${senderEmail.trim()}>`,
              to: [to.trim()],
              subject: subject.trim(),
              html: generateBrandedHtml(message.trim(), subject.trim(), senderName.trim()),
              text: message.trim()
            })
          });

          const directData = await directRes.json();
          if (!directRes.ok || directData.error) {
            throw new Error((directData.error && directData.error.message) || directData.message || 'Resend API rejected the request.');
          }
          emailId = directData.id;
        } else {
          throw err;
        }
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#0B1730]">Mailing & Resend Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              Custom Domains
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Dispatch quotations, responses, and sample confirmations from your custom domain (<span className="font-mono text-gray-700">@baachko.com</span>).
          </p>
        </div>
        <button
          onClick={() => checkConnection()}
          disabled={loadingStatus}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition"
        >
          <RefreshCw size={15} className={loadingStatus ? "animate-spin" : ""} />
          Check Live Status
        </button>
      </div>

      {/* Grid: Domain Status & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Resend Connection & Custom Domain Status */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-50 text-blue-900 rounded-xl">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Custom Domain Status</h2>
            </div>
            {resendStatus?.configured ? (
              resendStatus.validKey ? (
                <span className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                  <CheckCircle2 size={14} /> Resend Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                  <AlertCircle size={14} /> Invalid API Key
                </span>
              )
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                <AlertCircle size={14} /> API Key Needed
              </span>
            )}
          </div>

          {/* Active Domains List */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Registered Domains in Resend</h3>
            {resendStatus?.domains && resendStatus.domains.length > 0 ? (
              <div className="space-y-3">
                {resendStatus.domains.map((dom) => (
                  <div key={dom.id || dom.name} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-3 rounded-lg border border-slate-200 gap-2">
                    <div>
                      <span className="font-bold text-sm text-gray-900">{dom.name}</span>
                      <span className="text-xs text-gray-500 ml-2">Region: {dom.region || 'us-east-1'}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      dom.status === 'verified' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {dom.status === 'verified' ? '✓ Verified' : 'Pending DNS Verification'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-600 space-y-1">
                <p>No custom domains registered yet in your Resend account.</p>
                <p className="font-medium text-amber-800">
                  Target Domain: <code className="bg-amber-100 px-1 py-0.5 rounded">baachko.com</code> (or subdomain <code className="bg-amber-100 px-1 py-0.5 rounded">mail.baachko.com</code>)
                </p>
              </div>
            )}
          </div>

          {/* Setup Guide Accordion / Information */}
          <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Shield size={14} /> How to activate custom domain (@baachko.com) in Resend:
            </h4>
            <ol className="text-xs text-amber-900/90 list-decimal pl-4 space-y-1 leading-relaxed">
              <li>Open your **[Resend Dashboard](https://resend.com/domains)** and click **Add Domain** (e.g. <code className="bg-white px-1 rounded">baachko.com</code>).</li>
              <li>Resend will generate 3 DNS records: **DKIM**, **SPF (TXT)**, and **DMARC**.</li>
              <li>Add these records in your Domain Registrar (where baachko.com DNS is managed).</li>
              <li>Once verified, all emails sent from this admin panel will deliver as <code className="bg-white px-1 rounded font-bold">sales@baachko.com</code> with 100% authenticity!</li>
            </ol>
          </div>
        </div>

        {/* Card 2: Configuration & API Key Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 bg-amber-50 text-amber-800 rounded-xl">
                <Key size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Email Settings</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Resend API Key
                </label>
                <input 
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="re_123456789..."
                  className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Paste your Resend API Key here (<code className="font-mono">re_...</code>) or configure in Vercel as <code className="font-mono">RESEND_API_KEY</code>.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Default Sender Address
                </label>
                <input 
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="sales@baachko.com"
                  className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Default Sender Name
                </label>
                <input 
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="Baachko Industrial Packaging"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {saveSuccess && (
                <div className="p-2 bg-green-50 text-green-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Settings Saved Successfully!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-[#0B1730] hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition shadow-sm"
              >
                Save Settings
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>Powered by Resend SDK</span>
            <a 
              href="https://resend.com/overview" 
              target="_blank" 
              rel="noreferrer" 
              className="text-amber-700 hover:underline flex items-center gap-1"
            >
              Resend Portal <ExternalLink size={11} />
            </a>
          </div>
        </div>

      </div>

      {/* Direct Custom Email Dispatcher */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
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
              className="px-6 py-2.5 bg-[#C95A08] hover:bg-orange-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60"
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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
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
