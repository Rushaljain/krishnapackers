import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, Send, CheckCircle2, AlertCircle, Loader2, Check, Clock, 
  Plus, Search, Filter, ChevronDown, User, Building, Paperclip, 
  Reply, ArrowRight, X, Sparkles, Tag, ShieldCheck, CornerDownRight, 
  RefreshCw, FileText, MoreVertical, Inbox, SendHorizonal, ArrowLeft
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// ==========================================
// 3-TIER DOMAIN SEPARATION ARCHITECTURE
// ==========================================
export const SENDER_TIERS = [
  {
    id: 'tier-2',
    tierNumber: 2,
    name: 'Transactional',
    subdomain: 'mail.baachko.com',
    email: 'quotes@mail.baachko.com',
    fromName: 'Baachko Quotations & Specs',
    role: 'Quotations, Technical Spec Sheets, Sample Confirmations',
    badge: 'Transactional',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    dotColor: 'bg-amber-500'
  },
  {
    id: 'tier-1',
    tierNumber: 1,
    name: 'Corporate',
    subdomain: 'baachko.com',
    email: 'sales@baachko.com',
    fromName: 'Baachko Industrial Packaging',
    role: 'Executive Deals & Commercial Inquiries',
    badge: 'Corporate',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
    dotColor: 'bg-purple-500'
  },
  {
    id: 'tier-3',
    tierNumber: 3,
    name: 'Outreach & Vendors',
    subdomain: 'reach.baachko.com',
    email: 'updates@reach.baachko.com',
    fromName: 'Baachko Partner Operations',
    role: 'Vendor Follow-ups & Supplier Pricing',
    badge: 'Vendors',
    color: 'bg-cyan-100 text-cyan-900 border-cyan-300',
    dotColor: 'bg-cyan-500'
  }
];

// ==========================================
// PACKAGING EMAIL TEMPLATES
// ==========================================
export const EMAIL_TEMPLATES = [
  {
    title: 'Formal Price Quotation',
    tierId: 'tier-2',
    category: 'quote',
    subject: 'Proforma Quotation - Baachko Industrial Packaging',
    body: `Dear [Contact Name],

Thank you for your inquiry regarding our industrial packaging solutions.

Please find below our formal quotation based on your required specifications:
- Target Product: [Product / SKU]
- Estimated Quantity: [Quantity]
- Material & Construction: Heavy-duty Kraft Paper / Woven Multiwall Sacks
- Price Ex-Factory (Navi Mumbai): ₹[Rate] per unit + GST
- Lead Time: 5 to 7 business days from PO confirmation

Kindly confirm your dispatch schedule so our production engineering team can initiate lot scheduling.

Warm regards,
Sales Engineering Team
Baachko Pvt. Ltd. (Krishna Packers)`
  },
  {
    title: 'Vendor Material Follow-up',
    tierId: 'tier-3',
    category: 'vendor',
    subject: 'Procurement Follow-up: Raw Material Supply & Spot Rates - Baachko',
    body: `Dear Partner / Vendor,

Following up on our procurement requirement for raw material supply.

Could you please confirm the current spot rate, batch test certificates (COA), and dispatch availability for delivery to our Khairane MIDC manufacturing unit in Navi Mumbai?

Please share the proforma invoice or revised rate matrix at your earliest convenience so we can issue our Purchase Order.

Best regards,
Procurement & Vendor Operations
Baachko Pvt. Ltd. (Krishna Packers)`
  },
  {
    title: 'Technical Specifications Sheet',
    tierId: 'tier-2',
    category: 'quote',
    subject: 'Technical Specification Sheet - Baachko Industrial Bags',
    body: `Dear [Contact Name],

As requested, here are the technical specifications and testing standards for our industrial sacks:
- Tensile & Bursting Strength: Compliant with ISO 9001:2015 & ASTM D828 standards
- Moisture Resistance: PE-lined / HDPE laminated moisture barrier
- Closure & Filling: Automated valve closure / Stitched open-mouth
- Drop Test Endurance: 1.8-meter drop test verified for heavy powder containment

We would be pleased to send physical sample bags to your facility for QA evaluation. Please confirm your delivery address.

Warm regards,
Technical Sales Team
Baachko Pvt. Ltd.`
  },
  {
    title: 'Trial Sample Feedback Follow-up',
    tierId: 'tier-1',
    category: 'outreach',
    subject: 'Follow-up: Trial Sample Evaluation - Baachko Packaging',
    body: `Dear [Contact Name],

I am checking in to see if you have received the complimentary trial sample sacks dispatched to your facility last week.

Did your packing line and warehouse team have an opportunity to test the automated filling, drop resistance, and stackability?

I would love to arrange a brief call this week to review any adjustments needed to your bag dimensions or printing requirements.

Warm regards,
Commercial Accounts Director
Baachko Pvt. Ltd. (Krishna Packers)`
  }
];

export default function EmailCenterPage() {
  // Master Threads State (Genuine leads from Supabase / real sent mail, no dummy data)
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('baachko_email_threads_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(t => !t.id?.startsWith('thread-demo'));
        }
      }
    } catch (e) {}
    return [];
  });

  const [selectedThreadId, setSelectedThreadId] = useState(null);

  // UI Navigation states
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'quotes' | 'vendors' | 'outreach'
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileViewingThread, setIsMobileViewingThread] = useState(false);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTierId, setComposeTierId] = useState('tier-2');
  const [composeTo, setComposeTo] = useState('');
  const [composeContactName, setComposeContactName] = useState('');
  const [composeCompany, setComposeCompany] = useState('');
  const [composeCategory, setComposeCategory] = useState('quote');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const [composeError, setComposeError] = useState(null);

  // Inline Quick Reply State (for active thread)
  const [replyTierId, setReplyTierId] = useState('tier-2');
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyAlert, setReplyAlert] = useState(null);

  // Sync with Supabase RFQ Leads on Mount
  useEffect(() => {
    fetchAndMergeSupabaseLeads();
  }, []);

  // Save threads to localStorage on changes & purge legacy dummy cache
  useEffect(() => {
    try {
      const cleanThreads = threads.filter(t => !t.id?.startsWith('thread-demo'));
      localStorage.setItem('baachko_email_threads_v3', JSON.stringify(cleanThreads));
      localStorage.removeItem('baachko_email_threads_v2');
      localStorage.removeItem('baachko_email_threads');
    } catch (e) {}
  }, [threads]);

  const fetchAndMergeSupabaseLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('rfq_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return;

      setThreads(prev => {
        const cleanPrev = prev.filter(t => !t.id?.startsWith('thread-demo'));
        const existingEmails = new Set(cleanPrev.map(t => t.email.toLowerCase()));
        const newThreadsFromLeads = data
          .filter(lead => lead.email && !existingEmails.has(lead.email.toLowerCase()))
          .map(lead => ({
            id: `lead-${lead.id}`,
            contactName: lead.contact_name || 'Website Inquiry',
            company: lead.company_name || 'Direct Client',
            email: lead.email,
            phone: lead.phone || '',
            targetSku: lead.target_product_sku || '',
            category: 'quote',
            status: lead.status || 'New',
            lastUpdated: lead.created_at || new Date().toISOString(),
            messages: [
              {
                id: `msg-lead-${lead.id}`,
                senderType: 'inbound',
                senderName: lead.contact_name || 'Customer',
                senderEmail: lead.email,
                recipientEmail: 'quotes@mail.baachko.com',
                tier: 'Inbound Web RFQ',
                subject: `Inquiry for ${lead.target_product_sku || 'Industrial Packaging'}`,
                body: lead.message || `Customer submitted a quotation request on baachko.com for ${lead.target_product_sku || 'Packaging Sacks'}${lead.estimated_qty ? ` (Quantity: ${lead.estimated_qty})` : ''}.`,
                timestamp: lead.created_at || new Date().toISOString(),
                status: 'Received'
              }
            ]
          }));

        const merged = [...newThreadsFromLeads, ...cleanPrev];
        if (merged.length > 0 && !selectedThreadId) {
          setSelectedThreadId(merged[0].id);
        }
        return merged;
      });
    } catch (err) {
      console.warn("Could not sync supabase leads:", err);
    }
  };

  // Filtered Threads
  const filteredThreads = useMemo(() => {
    return threads.filter(thread => {
      // Tab filter
      if (activeTab === 'quotes' && thread.category !== 'quote') return false;
      if (activeTab === 'vendors' && thread.category !== 'vendor') return false;
      if (activeTab === 'outreach' && thread.category !== 'outreach') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContact = thread.contactName?.toLowerCase().includes(q);
        const matchesCompany = thread.company?.toLowerCase().includes(q);
        const matchesEmail = thread.email?.toLowerCase().includes(q);
        const matchesSku = thread.targetSku?.toLowerCase().includes(q);
        const matchesMsg = thread.messages?.some(m => m.body?.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q));
        return matchesContact || matchesCompany || matchesEmail || matchesSku || matchesMsg;
      }
      return true;
    });
  }, [threads, activeTab, searchQuery]);

  // Currently active thread (null if no conversations)
  const activeThread = useMemo(() => {
    if (threads.length === 0) return null;
    return threads.find(t => t.id === selectedThreadId) || filteredThreads[0] || threads[0] || null;
  }, [threads, selectedThreadId, filteredThreads]);

  // Keep replyTierId aligned with active thread's category
  useEffect(() => {
    if (activeThread) {
      if (activeThread.category === 'vendor') setReplyTierId('tier-3');
      else if (activeThread.category === 'quote') setReplyTierId('tier-2');
      else setReplyTierId('tier-1');
    }
  }, [activeThread?.id]);

  // Handle Thread Status Change
  const updateThreadStatus = (newStatus) => {
    if (!activeThread) return;
    setThreads(prev => prev.map(t => {
      if (t.id === activeThread.id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  // Send an Inline Reply within Active Thread
  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeThread || !replyBody.trim()) return;

    setIsSendingReply(true);
    setReplyAlert(null);

    const chosenTier = SENDER_TIERS.find(t => t.id === replyTierId) || SENDER_TIERS[0];
    const replySubject = `Re: ${activeThread.messages[activeThread.messages.length - 1]?.subject || 'Baachko Industrial Packaging'}`;

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeThread.email,
          subject: replySubject,
          message: replyBody.trim(),
          fromName: chosenTier.fromName,
          fromEmail: chosenTier.email,
          replyTo: 'karan.apcotraders@gmail.com'
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch email via Resend.');
      }

      // Append new message to the active thread's trail
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderType: 'outbound',
        senderName: chosenTier.fromName,
        senderEmail: chosenTier.email,
        recipientEmail: activeThread.email,
        tier: chosenTier.name,
        tierId: chosenTier.id,
        subject: replySubject,
        body: replyBody.trim(),
        timestamp: new Date().toISOString(),
        status: 'Delivered'
      };

      setThreads(prev => prev.map(t => {
        if (t.id === activeThread.id) {
          return {
            ...t,
            status: t.status === 'New' ? 'Quoted' : 'In Follow-up',
            lastUpdated: new Date().toISOString(),
            messages: [...t.messages, newMessage]
          };
        }
        return t;
      }));

      setReplyBody('');
      setReplyAlert({
        type: 'success',
        text: `Sent via ${chosenTier.email} (Delivery ID: ${data.id || 'ok'})`
      });
      setTimeout(() => setReplyAlert(null), 4000);

    } catch (err) {
      setReplyAlert({
        type: 'error',
        text: err.message || 'Error occurred while sending email.'
      });
    } finally {
      setIsSendingReply(false);
    }
  };

  // Open Compose Pop-up Modal with clean defaults
  const handleOpenCompose = (prefill = {}) => {
    setComposeTierId(prefill.tierId || 'tier-2');
    setComposeTo(prefill.to || '');
    setComposeContactName(prefill.contactName || '');
    setComposeCompany(prefill.company || '');
    setComposeCategory(prefill.category || 'quote');
    setComposeSubject(prefill.subject || 'Quotation & Technical Specifications - Baachko');
    setComposeBody(prefill.body || '');
    setComposeError(null);
    setIsComposeOpen(true);
  };

  // Apply a template into compose modal
  const handleApplyTemplateToCompose = (template) => {
    setComposeTierId(template.tierId);
    setComposeCategory(template.category);
    setComposeSubject(template.subject);
    setComposeBody(template.body.replace('[Contact Name]', composeContactName || 'Customer'));
  };

  // Apply template into active thread reply box
  const handleApplyTemplateToReply = (template) => {
    setReplyTierId(template.tierId);
    setReplyBody(template.body.replace('[Contact Name]', activeThread?.contactName || 'Customer'));
  };

  // Submit Compose Modal (New Mail ID / New Conversation)
  const handleSubmitCompose = async (e) => {
    e.preventDefault();
    if (!composeTo.trim()) {
      setComposeError('Recipient email address is required.');
      return;
    }
    if (!composeSubject.trim() || !composeBody.trim()) {
      setComposeError('Please provide both subject and message body.');
      return;
    }

    setIsSendingCompose(true);
    setComposeError(null);

    const chosenTier = SENDER_TIERS.find(t => t.id === composeTierId) || SENDER_TIERS[0];

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo.trim(),
          subject: composeSubject.trim(),
          message: composeBody.trim(),
          fromName: chosenTier.fromName,
          fromEmail: chosenTier.email,
          replyTo: 'karan.apcotraders@gmail.com'
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch email via Resend.');
      }

      // Check if thread already exists for this email
      const existingThread = threads.find(t => t.email.toLowerCase() === composeTo.trim().toLowerCase());

      const newMessage = {
        id: `msg-${Date.now()}`,
        senderType: 'outbound',
        senderName: chosenTier.fromName,
        senderEmail: chosenTier.email,
        recipientEmail: composeTo.trim(),
        tier: chosenTier.name,
        tierId: chosenTier.id,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        timestamp: new Date().toISOString(),
        status: 'Delivered'
      };

      if (existingThread) {
        // Append to existing
        setThreads(prev => prev.map(t => {
          if (t.id === existingThread.id) {
            return {
              ...t,
              lastUpdated: new Date().toISOString(),
              messages: [...t.messages, newMessage]
            };
          }
          return t;
        }));
        setSelectedThreadId(existingThread.id);
      } else {
        // Create new thread
        const newThreadId = `thread-${Date.now()}`;
        const newThread = {
          id: newThreadId,
          contactName: composeContactName.trim() || composeTo.split('@')[0],
          company: composeCompany.trim() || (composeCategory === 'vendor' ? 'Supplier / Vendor' : 'Direct Inquiry'),
          email: composeTo.trim(),
          phone: '',
          targetSku: '',
          category: composeCategory,
          status: composeCategory === 'vendor' ? 'In Follow-up' : 'Quoted',
          lastUpdated: new Date().toISOString(),
          messages: [newMessage]
        };

        setThreads(prev => [newThread, ...prev]);
        setSelectedThreadId(newThreadId);
      }

      setIsComposeOpen(false);
      setIsMobileViewingThread(true);

    } catch (err) {
      setComposeError(err.message || 'Error occurred while sending email.');
    } finally {
      setIsSendingCompose(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
      
      {/* ==================================================== */}
      {/* TOP ARCHITECTURE BAR & CONTROLS                     */}
      {/* ==================================================== */}
      <div className="bg-white rounded-2xl p-4 shadow-2xs border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
        
        {/* Left: Branding & Action */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => handleOpenCompose()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-sm rounded-xl shadow-sm transition hover:shadow-md cursor-pointer"
          >
            <Plus size={18} /> Compose New Email
          </button>
        </div>

        {/* Right: Search Input & Sync */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, emails, SKUs..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={() => fetchAndMergeSupabaseLeads()}
            title="Refresh Leads from Website"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* MAIN TWO-PANE GMAIL-STYLE INTERFACE                 */}
      {/* ==================================================== */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-0">
        
        {/* -------------------------------------------------- */}
        {/* LEFT PANE: GMAIL-STYLE MAIL LIST                   */}
        {/* -------------------------------------------------- */}
        <div className={`w-full md:w-96 lg:w-[410px] border-r border-gray-200 flex flex-col bg-white shrink-0 ${
          isMobileViewingThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Category Dropdown Filter */}
          <div className="p-3 border-b border-gray-100 bg-gray-50/60">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full text-xs font-bold py-2.5 px-3 pr-8 rounded-xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer appearance-none shadow-2xs"
              >
                <option value="all">All Mails ({threads.length})</option>
                <option value="quotes">Quotes & RFQs ({threads.filter(t => t.category === 'quote').length})</option>
                <option value="vendors">Vendor Follow-ups ({threads.filter(t => t.category === 'vendor').length})</option>
                <option value="outreach">Outreach ({threads.filter(t => t.category === 'outreach').length})</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Email Conversation Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Inbox size={36} className="mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Inquiries from the website will appear here automatically, or click "Compose New Email" to send an email.
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const lastMsg = thread.messages[thread.messages.length - 1];
                const msgCount = thread.messages.length;

                return (
                  <div
                    key={thread.id}
                    onClick={() => {
                      setSelectedThreadId(thread.id);
                      setIsMobileViewingThread(true);
                    }}
                    className={`p-4 transition cursor-pointer relative group flex items-start gap-3 ${
                      isSelected 
                        ? 'bg-amber-50/70 border-l-4 border-amber-700' 
                        : 'hover:bg-gray-50/90'
                    }`}
                  >
                    {/* Avatar Initials */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
                      thread.category === 'vendor'
                        ? 'bg-cyan-100 text-cyan-800'
                        : thread.category === 'outreach'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {thread.contactName?.slice(0, 2).toUpperCase() || 'BK'}
                    </div>

                    {/* Thread Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-sm truncate ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
                          {thread.contactName}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0 text-gray-400">
                          <span className="text-[11px] font-medium">
                            {new Date(thread.lastUpdated).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          {msgCount > 1 && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
                              {msgCount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 font-medium truncate mb-0.5">
                        {thread.company}
                      </div>

                      <div className="text-xs text-gray-800 font-semibold truncate mb-0.5">
                        {lastMsg?.subject || 'Quotation & Inquiry'}
                      </div>

                      <div className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
                        {lastMsg?.body || 'No message content yet.'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* -------------------------------------------------- */}
        {/* RIGHT PANE: ACTIVE EMAIL THREAD & TRAIL            */}
        {/* -------------------------------------------------- */}
        <div className={`flex-1 flex flex-col bg-gray-50/40 min-w-0 ${
          !isMobileViewingThread ? 'hidden md:flex' : 'flex'
        }`}>
          {activeThread ? (
            <>
              {/* Thread Header Bar */}
              <div className="p-4 sm:p-5 bg-white border-b border-gray-200 flex items-center justify-between gap-3 shrink-0 shadow-2xs">
                
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileViewingThread(false)}
                    className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {activeThread.messages[activeThread.messages.length - 1]?.subject || 'Direct Conversation'}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-bold text-gray-800">{activeThread.contactName}</span>
                      <span>•</span>
                      <span className="font-medium text-gray-600">{activeThread.company}</span>
                      <span>•</span>
                      <span className="font-mono text-gray-600">{activeThread.email}</span>
                      {activeThread.phone && (
                        <>
                          <span>•</span>
                          <span className="text-gray-600">{activeThread.phone}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Thread Trail Timeline (Scrollable) */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                
                {/* Timeline Start Notice */}
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Conversation Trail Started • {new Date(activeThread.messages[0]?.timestamp || activeThread.lastUpdated).toLocaleDateString()}
                  </span>
                </div>

                {/* Trail Messages */}
                {activeThread.messages.map((msg, index) => {
                  const isInbound = msg.senderType === 'inbound';
                  const msgTier = SENDER_TIERS.find(t => t.id === msg.tierId);

                  return (
                    <div 
                      key={msg.id || index}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} space-y-1.5`}
                    >
                      {/* Message Meta Info Header */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 px-1">
                        <span className="font-bold text-gray-800">
                          {isInbound ? msg.senderName : msg.senderName || 'Baachko Team'}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-gray-400 text-[11px]">
                          {msg.senderEmail}
                        </span>
                        <span>•</span>
                        <span className="text-gray-400 text-[11px]">
                          {new Date(msg.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>

                      {/* Message Card */}
                      <div className={`max-w-2xl rounded-2xl p-5 shadow-xs border transition ${
                        isInbound 
                          ? 'bg-white border-gray-200 text-gray-800' 
                          : 'bg-[#0B1730] text-white border-gray-800'
                      }`}>
                        
                        {/* Tier Badge / Role for Outbound */}
                        {!isInbound && (
                          <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-700/70 text-xs">
                            <span className="inline-flex items-center gap-1.5 font-semibold text-amber-400">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              {msg.tier || 'Dispatched via Resend'}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono">
                              From: {msg.senderEmail}
                            </span>
                          </div>
                        )}

                        {/* Subject */}
                        <div className={`font-bold text-sm mb-2 ${isInbound ? 'text-gray-900' : 'text-amber-200'}`}>
                          {msg.subject}
                        </div>

                        {/* Body formatted */}
                        <div className={`text-sm whitespace-pre-wrap leading-relaxed ${
                          isInbound ? 'text-gray-700' : 'text-gray-200'
                        }`}>
                          {msg.body}
                        </div>

                        {/* Footer status */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100/10 flex items-center justify-between text-[11px] text-gray-400">
                          <span>To: {msg.recipientEmail}</span>
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Check size={12} /> {msg.status || 'Delivered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ==================================================== */}
              {/* INLINE QUICK REPLY BOX WITH 3-TIER DOMAIN SELECTOR   */}
              {/* ==================================================== */}
              <div className="p-4 sm:p-5 bg-white border-t border-gray-200 shrink-0 shadow-lg">
                <form onSubmit={handleSendReply} className="space-y-3">
                  
                  {/* Reply Controls: Sender Identity */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <Reply size={13} className="text-amber-700" /> From:
                    </span>
                    
                    <div className="relative">
                      <select
                        value={replyTierId}
                        onChange={(e) => setReplyTierId(e.target.value)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {SENDER_TIERS.map(tier => (
                          <option key={tier.id} value={tier.id}>
                            {tier.email} ({tier.fromName})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Reply Alert */}
                  {replyAlert && (
                    <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      replyAlert.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {replyAlert.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{replyAlert.text}</span>
                    </div>
                  )}

                  {/* Message Input & Send Button */}
                  <div className="relative">
                    <textarea 
                      rows={3}
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder={`Type your reply to ${activeThread.contactName}...`}
                      className="w-full text-xs sm:text-sm p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none leading-relaxed font-sans"
                      required
                    />
                  </div>

                  <div className="flex justify-end items-center">
                    <button
                      type="submit"
                      disabled={isSendingReply || !replyBody.trim()}
                      className="px-5 py-2 bg-[#C95A08] hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      {isSendingReply ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Dispatching...
                        </>
                      ) : (
                        <>
                          <Send size={15} /> Send Follow-up
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <Mail size={48} className="text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-700 text-base">Select a conversation</h3>
              <p className="text-xs text-gray-400 max-w-sm mt-1">
                Choose an existing thread from the left or click "Compose New Email" to send an inquiry or vendor follow-up.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ==================================================== */}
      {/* POP-UP MODAL: COMPOSE NEW EMAIL (NEW MAIL ID)        */}
      {/* ==================================================== */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#0B1730] px-6 py-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2.5">
                <SendHorizonal size={18} className="text-amber-500" />
                <h3 className="font-bold text-base">Compose New Message</h3>
              </div>
              <button 
                onClick={() => setIsComposeOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitCompose} className="p-6 overflow-y-auto space-y-4">
              
              {composeError && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{composeError}</span>
                </div>
              )}

              {/* From Address Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  From Address *
                </label>
                <div className="relative">
                  <select
                    value={composeTierId}
                    onChange={(e) => setComposeTierId(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-amber-500 outline-none pr-8 cursor-pointer"
                  >
                    {SENDER_TIERS.map(tier => (
                      <option key={tier.id} value={tier.id}>
                        {tier.email} ({tier.fromName})
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Recipient Email *
                  </label>
                  <input 
                    type="email"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    placeholder="client@company.com or vendor@supplier.com"
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Name
                  </label>
                  <input 
                    type="text"
                    value={composeContactName}
                    onChange={(e) => setComposeContactName(e.target.value)}
                    placeholder="e.g. Rameshwar Vyas"
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Company / Organization
                  </label>
                  <input 
                    type="text"
                    value={composeCompany}
                    onChange={(e) => setComposeCompany(e.target.value)}
                    placeholder="e.g. Supreme Polymers & Fab"
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={composeCategory}
                    onChange={(e) => setComposeCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none bg-white cursor-pointer"
                  >
                    <option value="quote">Customer Quote / RFQ</option>
                    <option value="vendor">Vendor Follow-up / Supplier</option>
                    <option value="outreach">Direct Outreach / Commercial</option>
                  </select>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input 
                  type="text"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Quotation & Technical Specifications - Baachko"
                  className="w-full text-xs sm:text-sm font-semibold px-3.5 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                  required
                />
              </div>

              {/* Message Body with Template Dropdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Message Body *
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-medium">Template:</span>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const tmpl = EMAIL_TEMPLATES.find(t => t.title === e.target.value);
                          if (tmpl) handleApplyTemplateToCompose(tmpl);
                          e.target.value = '';
                        }}
                        defaultValue=""
                        className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-300 bg-white text-gray-700 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer pr-7"
                      >
                        <option value="" disabled>Choose a template...</option>
                        {EMAIL_TEMPLATES.map((tmpl, idx) => (
                          <option key={idx} value={tmpl.title}>{tmpl.title}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <textarea 
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your formal message, specifications, or inquiry..."
                  className="w-full text-xs sm:text-sm p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSendingCompose}
                  className="px-6 py-2.5 bg-[#C95A08] hover:bg-orange-700 disabled:opacity-60 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  {isSendingCompose ? (
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
        </div>
      )}

    </div>
  );
}
