import React, { useState, useEffect } from 'react';
import { X, Send, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Eye, Edit3, ChevronDown, Paperclip, FileText, Image, FileSpreadsheet, File } from 'lucide-react';
import { readFileAsDataUrl, formatFileSize, getAttachmentCategory } from '../../pages/admin/EmailCenterPage';
import { supabase } from '../../lib/supabase';
import { SENDER_TIERS } from '../../pages/admin/EmailCenterPage';

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

export default function SendEmailModal({ isOpen, onClose, lead, onEmailSent }) {
  if (!isOpen || !lead) return null;

  const [to, setTo] = useState(lead.email || '');
  const [cc, setCc] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [fromName, setFromName] = useState(SENDER_TIERS[0].fromName);
  const [fromEmail, setFromEmail] = useState(
    localStorage.getItem('resend_sender_email') || SENDER_TIERS[0].email
  );
  const [subject, setSubject] = useState(
    `Quotation & Specifications: ${lead.target_product_sku || 'Industrial Packaging Sacks'} - Baachko`
  );
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [previewMode, setPreviewMode] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = React.useRef(null);

  const handleFilesSelected = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    const newAttachments = [];
    for (const file of Array.from(fileList)) {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds 5 MB. Please select files under 5 MB.`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        newAttachments.push({
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream',
          dataUrl: dataUrl
        });
      } catch (err) {
        console.error("Failed to read file", file.name, err);
      }
    }
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  useEffect(() => {
    if (lead) {
      setTo(lead.email || '');
      setSubject(`Quotation & Specifications: ${lead.target_product_sku || 'Industrial Packaging Sacks'} - Baachko`);
      setMessage('');
      setCc('');
      setShowCc(false);
      setStatusMessage({ type: '', text: '' });
      setPreviewMode(false);
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [lead]);

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const customKey = localStorage.getItem('resend_api_key') || undefined;
      let emailId = null;

      // 1. Send via backend route /api/send-email
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: to.trim(),
          cc: cc.trim() || undefined,
          subject: subject.trim(),
          message: message.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          replyTo: fromEmail.trim(),
          apiKey: customKey,
          leadId: lead.id,
          attachments: attachments.map(a => ({
            filename: a.name,
            content: a.dataUrl,
            contentType: a.type,
            size: a.size
          }))
        })
      });

      const contentType = res.headers.get('content-type') || '';
      let data = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok || data?.error) {
        throw new Error(data?.error || `Failed to dispatch email (${res.status})`);
      }

      emailId = data?.id;

      // Auto-update lead status to 'Contacted' in Supabase
      try {
        await supabase
          .from('rfq_leads')
          .update({ status: 'Contacted' })
          .eq('id', lead.id);
      } catch (err) {
        console.warn('Could not update lead status in Supabase:', err);
      }

      setStatusMessage({ 
        type: 'success', 
        text: `Email successfully delivered to ${to} (Resend ID: ${emailId || 'sent'})` 
      });

      // Save to local sent log
      const sentHistory = JSON.parse(localStorage.getItem('sent_emails_history') || '[]');
      sentHistory.unshift({
        id: emailId,
        to: to,
        contactName: lead.contact_name,
        company: lead.company_name,
        subject: subject,
        sentAt: new Date().toISOString(),
        from: `${fromName} <${fromEmail}>`
      });
      localStorage.setItem('sent_emails_history', JSON.stringify(sentHistory.slice(0, 50)));

      if (onEmailSent) {
        onEmailSent(lead.id);
      }

      setTimeout(() => {
        onClose();
      }, 1800);

    } catch (err) {
      console.error('Send error:', err);
      setStatusMessage({ 
        type: 'error', 
        text: err.message || 'Error occurred while dispatching email.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[95vh] sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B1730] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Mail className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Baachko Mailers</h3>
              <p className="text-xs text-gray-300">Sending to: <span className="text-amber-400 font-semibold">{lead.contact_name}</span> ({lead.email})</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 sm:space-y-4">
          
          {statusMessage.text && (
            <div className={`p-4 rounded-xl text-sm flex items-start gap-3 ${
              statusMessage.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <span className="leading-relaxed font-medium">{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                From *
              </label>
              <div className="relative">
                <select
                  value={fromEmail}
                  onChange={(e) => {
                    const chosen = SENDER_TIERS.find(t => t.email === e.target.value) || SENDER_TIERS[0];
                    setFromEmail(chosen.email);
                    setFromName(chosen.fromName);
                    localStorage.setItem('resend_sender_email', chosen.email);
                  }}
                  className="w-full text-xs sm:text-sm font-semibold px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white cursor-pointer pr-8"
                >
                  {SENDER_TIERS.map(tier => (
                    <option key={tier.id} value={tier.email}>
                      {tier.email} ({tier.fromName})
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sender Name
              </label>
              <input 
                type="text" 
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50"
                placeholder="Baachko Industrial Packaging"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Recipient Email (To) *
              </label>
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  + CC
                </button>
              )}
            </div>
            <input 
              type="email" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="recipient@example.com"
              required
            />
          </div>

          {showCc && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  CC (Carbon Copy)
                </label>
                <button
                  type="button"
                  onClick={() => { setShowCc(false); setCc(''); }}
                  className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Remove CC
                </button>
              </div>
              <input 
                type="text" 
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="cc1@example.com, cc2@example.com"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Subject
            </label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              placeholder="Email subject line..."
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Message Body
              </label>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
                {previewMode ? 'Switch to Edit' : 'Preview Branded Email'}
              </button>
            </div>

            {/* File Attachments Picker */}
            <div className="mb-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.csv,.xlsx,.xls,.doc,.docx,application/pdf,image/*,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => {
                  handleFilesSelected(e.target.files);
                  e.target.value = '';
                }}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition cursor-pointer ${
                  attachments.length > 0
                    ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/20'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                }`}
              >
                <Paperclip size={13} className="text-amber-700" />
                <span>Attach Documents (PDF, Images, Excel, Word)</span>
                {attachments.length > 0 && (
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {attachments.length}
                  </span>
                )}
              </button>

              {/* Attachments Chips */}
              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {attachments.map((att, idx) => {
                    const cat = getAttachmentCategory(att);
                    return (
                      <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-md border border-gray-200 text-xs shadow-2xs">
                        <span className={`p-0.5 rounded font-bold text-[9px] flex items-center gap-1 ${
                          cat === 'pdf' ? 'bg-red-100 text-red-700' :
                          cat === 'image' ? 'bg-purple-100 text-purple-700' :
                          cat === 'excel' ? 'bg-emerald-100 text-emerald-700' :
                          cat === 'word' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {cat.toUpperCase()}
                        </span>
                        <span className="font-semibold text-gray-800 truncate max-w-[140px]" title={att.name}>
                          {att.name}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          ({formatFileSize(att.size)})
                        </span>
                        <button
                          type="button"
                          onClick={() => setAttachments(prev => prev.filter((_, i) => i !== idx))}
                          className="text-gray-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {previewMode ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-slate-50 text-xs sm:text-sm text-gray-800 space-y-3 font-sans max-h-64 overflow-y-auto">
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <span className="font-bold text-[#0B1730]">BAACHKO</span> — Industrial Packaging
                </div>
                {message.trim() ? (
                  message.split('\n\n').map((para, i) => (
                    <p key={i} className="leading-relaxed">{para}</p>
                  ))
                ) : (
                  <p className="text-gray-400 italic">No message body written yet.</p>
                )}
                <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
                  W-234, Khairane Road, TTC Industrial Area, Navi Mumbai - 400705
                </div>
              </div>
            ) : (
              <textarea 
                rows={9}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none font-sans leading-relaxed"
                placeholder="Compose your email message here..."
                required
              />
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <span className="text-xs text-gray-500 text-center sm:text-left">
              ⚡ Powered by Resend API • Updates lead to <strong className="text-amber-700">Contacted</strong>
            </span>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-initial px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex-1 sm:flex-initial px-5 py-2 bg-[#C95A08] hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send via Resend
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
