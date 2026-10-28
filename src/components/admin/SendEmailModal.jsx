import React, { useState, useEffect } from 'react';
import { X, Send, Mail, CheckCircle2, AlertCircle, Loader2, Sparkles, Eye, Edit3 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SendEmailModal({ isOpen, onClose, lead, onEmailSent }) {
  if (!isOpen || !lead) return null;

  const [to, setTo] = useState(lead.email || '');
  const [fromName, setFromName] = useState('Baachko Industrial Packaging');
  const [fromEmail, setFromEmail] = useState(
    localStorage.getItem('resend_sender_email') || 'sales@baachko.com'
  );
  const [subject, setSubject] = useState(
    `Quotation & Specifications for ${lead.target_product_sku || 'Packaging Sacks'} - Baachko`
  );
  const [message, setMessage] = useState('');
  const [activeTemplate, setActiveTemplate] = useState('quote');
  const [isSending, setIsSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [previewMode, setPreviewMode] = useState(false);

  // Load template content
  useEffect(() => {
    applyTemplate(activeTemplate);
  }, [lead, activeTemplate]);

  const applyTemplate = (type) => {
    setActiveTemplate(type);
    const name = lead.contact_name || 'Customer';
    const company = lead.company_name ? ` at ${lead.company_name}` : '';
    const sku = lead.target_product_sku || 'Industrial Packaging Sacks';
    const qty = lead.estimated_qty ? ` for approximately ${lead.estimated_qty}` : '';

    if (type === 'quote') {
      setSubject(`Quotation & Specifications: ${sku} - Baachko`);
      setMessage(
`Dear ${name},

Thank you for reaching out to Baachko Pvt. Ltd. regarding your packaging requirement for ${sku}${company}.

We are pleased to provide our commercial quotation${qty}:

Product Specifications:
• Item: ${sku}
• Build Quality: Heavy-duty, automated high-speed filling grade
• Certification: ISO 9001:2015 Certified Manufacturing
• Available Packaging: 25 Kg / 50 Kg / Custom specifications

We can immediately dispatch physical product samples to your facility for tensile and drop testing.

Please let us know your required delivery schedule or if you have specific custom printing requirements.

Looking forward to working together.`
      );
    } else if (type === 'details') {
      setSubject(`Specifications Clarification for ${sku} - Baachko`);
      setMessage(
`Dear ${name},

Thank you for your inquiry with Baachko regarding ${sku}.

To ensure we formulate the exact technical specifications and deliver the most competitive pricing, could you kindly confirm a few details?

1. Target Dimensions / Bag Size: (e.g. Width x Height x Gusset)
2. Material & Construction: (Multiwall Kraft Paper, HDPE Coated, or PP Woven)
3. Bag Type: (Self-closing Valve Sack or Open Mouth)
4. Inner Protection: (Standard or Inner PE Liner for moisture barrier)
5. Custom Printing: (Plain or Flexo/DTG branded graphics)

Once confirmed, we will share the complete technical datasheet and proforma quotation.

Thank you for your time.`
      );
    } else if (type === 'sample') {
      setSubject(`Sample Dispatch Confirmation: ${sku} - Baachko`);
      setMessage(
`Dear ${name},

We are pleased to confirm that sample units of ${sku} have been prepared by our quality assurance team at our Navi Mumbai facility.

Sample Package Details:
• Product: ${sku}
• Purpose: Laboratory and industrial filling trial
• Manufacturing Facility: TTC Industrial Area, Khairane MIDC, Navi Mumbai

The package is being dispatched via courier. We will share the tracking consignment number as soon as it is picked up.

Please do not hesitate to reach out if you have any questions.`
      );
    } else if (type === 'custom') {
      setSubject(`Inquiry Follow-up: ${sku} - Baachko`);
      setMessage(
`Dear ${name},

Thank you for contacting Baachko Pvt. Ltd.

We have reviewed your request regarding ${sku}${company}.

[Enter custom response message here]

Best regards,`
      );
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setIsSending(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const customKey = localStorage.getItem('resend_api_key') || undefined;

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          to: to.trim(),
          subject: subject.trim(),
          message: message.trim(),
          fromName: fromName.trim(),
          fromEmail: fromEmail.trim(),
          apiKey: customKey,
          leadId: lead.id
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to send email via Resend.');
      }

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
        text: `Email successfully delivered to ${to} (Resend ID: ${data.id})` 
      });

      // Save to local sent log
      const sentHistory = JSON.parse(localStorage.getItem('sent_emails_history') || '[]');
      sentHistory.unshift({
        id: data.id,
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
        text: err.message || 'Error communicating with Resend serverless function.' 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0B1730] text-white px-6 py-4 flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-lg">
              <Mail className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Reply via Resend (Custom Domain)</h3>
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

        {/* Template Selector Bar */}
        <div className="bg-slate-50 border-b border-gray-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-gray-500 flex items-center gap-1 flex-shrink-0">
            <Sparkles size={13} className="text-amber-600" /> Templates:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate('quote')}
            className={`px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
              activeTemplate === 'quote' 
                ? 'bg-[#0B1730] text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Quotation & Commercials
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('details')}
            className={`px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
              activeTemplate === 'details' 
                ? 'bg-[#0B1730] text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Request Technical Specs
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('sample')}
            className={`px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
              activeTemplate === 'sample' 
                ? 'bg-[#0B1730] text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Sample Dispatch
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('custom')}
            className={`px-3 py-1 rounded-full font-medium transition flex-shrink-0 ${
              activeTemplate === 'custom' 
                ? 'bg-[#0B1730] text-white shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Custom Message
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 overflow-y-auto flex-1 space-y-4">
          
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
                From (Custom Domain)
              </label>
              <input 
                type="text" 
                value={fromEmail}
                onChange={(e) => {
                  setFromEmail(e.target.value);
                  localStorage.setItem('resend_sender_email', e.target.value);
                }}
                className="w-full text-xs font-mono px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-gray-50"
                placeholder="sales@baachko.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Sender Name
              </label>
              <input 
                type="text" 
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                placeholder="Baachko Industrial Packaging"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Recipient Email (To)
            </label>
            <input 
              type="email" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Email Subject
            </label>
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-sm font-semibold text-gray-900 px-3.5 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
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
                className="text-xs font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                {previewMode ? <Edit3 size={13} /> : <Eye size={13} />}
                {previewMode ? 'Switch to Edit' : 'Preview Branded Email'}
              </button>
            </div>

            {previewMode ? (
              <div className="border border-gray-200 rounded-lg p-4 bg-slate-50 text-xs sm:text-sm text-gray-800 space-y-3 font-sans max-h-64 overflow-y-auto">
                <div className="border-b border-gray-200 pb-2 mb-2">
                  <span className="font-bold text-[#0B1730]">BAACHKO</span> — Industrial Packaging
                </div>
                {message.split('\n\n').map((para, i) => (
                  <p key={i} className="leading-relaxed">{para}</p>
                ))}
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
                placeholder="Compose your email response..."
                required
              />
            )}
          </div>

          {/* Footer Action */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              ⚡ Powered by Resend API • Automatically updates lead to <strong className="text-amber-700">Contacted</strong>
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="px-5 py-2 bg-[#C95A08] hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-md transition flex items-center gap-2 disabled:opacity-60"
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
