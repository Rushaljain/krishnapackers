import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mail, Send, CheckCircle2, AlertCircle, Loader2, Check, Clock, 
  Plus, Search, Filter, ChevronDown, User, Building, Paperclip, 
  Reply, ArrowRight, X, Sparkles, Tag, ShieldCheck, CornerDownRight, 
  RefreshCw, FileText, MoreVertical, Inbox, SendHorizonal, ArrowLeft,
  Star, Trash2, RotateCcw, FileSpreadsheet, Image, Download, Eye, Maximize2, File
} from 'lucide-react';

// ==========================================
// FILE ATTACHMENT HELPERS
// ==========================================
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getAttachmentCategory(att) {
  if (!att) return 'file';
  const name = (att.name || att.filename || '').toLowerCase();
  const type = (att.type || att.content_type || att.contentType || '').toLowerCase();
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('image/') || /\.(png|jpe?g|webp|gif|svg)$/i.test(name)) return 'image';
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv') || /\.(xlsx|xls|csv)$/i.test(name)) return 'excel';
  return 'file';
}

export async function downloadAttachment(att) {
  if (!att) return;
  const rawUrl = att.url || att.dataUrl || att.content || att.download_url;
  const fileName = att.name || att.filename || 'attachment';

  if (!rawUrl) {
    console.warn('No attachment URL found to download:', att);
    alert('Attachment file URL is currently unavailable.');
    return;
  }

  // 1. Data URL (Base64) -> Convert to Blob and download
  if (typeof rawUrl === 'string' && rawUrl.startsWith('data:')) {
    try {
      const parts = rawUrl.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || att.type || 'application/octet-stream';
      const byteString = atob(parts[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      return;
    } catch (e) {
      console.error('Failed to create blob from data URL:', e);
    }
  }

  // 2. HTTP / HTTPS / API URL -> Fetch as blob and download with custom filename
  if (typeof rawUrl === 'string' && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://') || rawUrl.startsWith('/api/'))) {
    try {
      const res = await fetch(rawUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        return;
      }
    } catch (err) {
      console.warn('Direct fetch for download failed, attempting browser navigation:', err);
    }
  }

  // 3. Fallback: Native link click
  const link = document.createElement('a');
  link.href = rawUrl;
  link.download = fileName;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// PERSISTENT TOMBSTONE BLACKLIST FOR DELETED CONVERSATIONS
// ==========================================
export const TOMBSTONE_THREADS_KEY = 'baachko_perm_deleted_thread_ids_v2';
export const TOMBSTONE_EMAILS_KEY = 'baachko_perm_deleted_keys_v2';
export const TOMBSTONE_MSGS_KEY = 'baachko_perm_deleted_msg_ids_v2';

export function getTombstones() {
  try {
    const threadIds = new Set(JSON.parse(localStorage.getItem(TOMBSTONE_THREADS_KEY) || '[]'));
    const threadKeys = new Set(JSON.parse(localStorage.getItem(TOMBSTONE_EMAILS_KEY) || '[]'));
    const msgIds = new Set(JSON.parse(localStorage.getItem(TOMBSTONE_MSGS_KEY) || '[]'));
    return { threadIds, threadKeys, msgIds };
  } catch (e) {
    return { threadIds: new Set(), threadKeys: new Set(), msgIds: new Set() };
  }
}

export function recordTombstone(thread) {
  if (!thread) return;
  try {
    const { threadIds, threadKeys, msgIds } = getTombstones();
    if (thread.id) threadIds.add(String(thread.id));

    const normSub = normalizeSubject(thread.subject || thread.messages?.[0]?.subject || '');
    if (thread.email) {
      const cleanEmail = thread.email.toLowerCase().trim();
      if (normSub) threadKeys.add(`${cleanEmail}___${normSub}`);
      threadKeys.add(cleanEmail);
    }

    if (Array.isArray(thread.messages)) {
      for (const m of thread.messages) {
        if (m.id) {
          msgIds.add(String(m.id));
          msgIds.add(String(m.id).replace(/^msg-/, ''));
        }
      }
    }

    localStorage.setItem(TOMBSTONE_THREADS_KEY, JSON.stringify(Array.from(threadIds)));
    localStorage.setItem(TOMBSTONE_EMAILS_KEY, JSON.stringify(Array.from(threadKeys)));
    localStorage.setItem(TOMBSTONE_MSGS_KEY, JSON.stringify(Array.from(msgIds)));
  } catch (e) {
    console.warn('Could not persist tombstone:', e);
  }
}
import { supabase } from '../../lib/supabase';

// ==========================================
// MAILING LIST SENDER IDENTITIES
// ==========================================
export const SENDER_TIERS = [
  {
    id: 'sales',
    name: 'Sales',
    email: 'sales@baachko.com',
    fromName: 'Baachko Industrial Packaging',
    role: 'Commercial & Sales Inquiries',
    badge: 'Sales',
    color: 'bg-purple-100 text-purple-900 border-purple-300',
    dotColor: 'bg-purple-500'
  },
  {
    id: 'karan',
    name: 'Direct / Karan',
    email: 'karan@baachko.com',
    fromName: 'Karan - Baachko',
    role: 'Executive & Partner Communications',
    badge: 'Direct',
    color: 'bg-blue-100 text-blue-900 border-blue-300',
    dotColor: 'bg-blue-500'
  },
  {
    id: 'enquiry',
    name: 'Enquiries',
    email: 'enquiry@baachko.com',
    fromName: 'Baachko Enquiries',
    role: 'General Inquiries & Customer Support',
    badge: 'Enquiry',
    color: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    dotColor: 'bg-emerald-500'
  },
  {
    id: 'quotes',
    name: 'Quotations',
    email: 'quotes@baachko.com',
    fromName: 'Baachko Quotations & Specs',
    role: 'Quotations, Technical Spec Sheets, Sample Confirmations',
    badge: 'Quotes',
    color: 'bg-amber-100 text-amber-900 border-amber-300',
    dotColor: 'bg-amber-500'
  }
];

// Strict Whitelist of Authorized Inbound & Outbound Mailboxes
export const ALLOWED_MAILBOXES = [
  'sales@baachko.com',
  'karan@baachko.com',
  'enquiry@baachko.com',
  'quotes@baachko.com'
];

export function isAllowedInboundRecipient(toField) {
  if (!toField) return false;
  const list = Array.isArray(toField) ? toField : [toField];
  return list.some(raw => {
    if (!raw || typeof raw !== 'string') return false;
    const match = raw.match(/<([^>]+)>/)?.[1] || raw;
    const clean = match.replace(/["']/g, '').toLowerCase().trim();
    return ALLOWED_MAILBOXES.includes(clean);
  });
}

// Clean email body to remove Gmail/Outlook/Apple quote blocks and previous thread history
export function cleanEmailBody(bodyText, htmlContent) {
  let text = '';
  if (htmlContent && typeof htmlContent === 'string') {
    let cleanHtml = htmlContent
      .replace(/<div[^>]*class=["'][^"']*gmail_quote[^"']*["'][\s\S]*$/i, '')
      .replace(/<div[^>]*class=["'][^"']*gmail_attr[^"']*["'][\s\S]*$/i, '')
      .replace(/<blockquote[\s\S]*$/i, '')
      .replace(/<div[^>]*id=["']divRplyFwdMsg["'][\s\S]*$/i, '')
      .replace(/<div[^>]*id=["']appendonsend["'][\s\S]*$/i, '');
    text = cleanHtml
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'");
  }
  if (!text.trim() && bodyText && typeof bodyText === 'string') text = bodyText;
  if (!text) return '';
  const lines = text.split('\n');
  const fresh = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^On\s+.*wrote:?\s*$/i.test(trimmed)) break;
    if (/^-{2,}\s*Original Message\s*-{2,}/i.test(trimmed)) break;
    if (/^From:\s+.*@.*/i.test(trimmed)) break;
    if (/^>\s*/.test(trimmed)) continue;
    fresh.push(line);
  }
  return fresh.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export const getSenderTier = (id) => {
  if (!id) return SENDER_TIERS[0];
  const found = SENDER_TIERS.find(t => 
    t.id === id || 
    t.email === id ||
    (id === 'tier-1' && t.id === 'sales') ||
    (id === 'tier-2' && t.id === 'quotes') ||
    (id === 'tier-3' && t.id === 'enquiry')
  );
  return found || SENDER_TIERS[0];
};

export function normalizeSubject(subject = '') {
  if (!subject || typeof subject !== 'string') return '';
  return subject
    .replace(/^(\s*(re|fwd|fw):\s*)+/i, '')
    .trim()
    .toLowerCase();
}

export function matchesSenderTier(msg, tierId) {
  if (!msg || !tierId) return false;
  if (tierId === 'all') return true;
  const tier = getSenderTier(tierId);
  const targetEmail = tier.email.toLowerCase();
  const idStr = tier.id.toLowerCase();

  const sender = (msg.senderEmail || '').toLowerCase();
  const recipient = (msg.recipientEmail || '').toLowerCase();
  const tierField = (msg.tier || '').toLowerCase();
  const msgTierId = (msg.tierId || '').toLowerCase();

  if (sender === targetEmail || msgTierId === idStr) return true;
  if (recipient === targetEmail) return true;
  if (sender.includes(idStr) || recipient.includes(idStr)) return true;
  if (tierField.includes(idStr)) return true;
  if (idStr === 'quotes' && (tierField.includes('quot') || sender.includes('quote') || recipient.includes('quote'))) return true;
  if (idStr === 'sales' && (tierField.includes('sale') || tierField.includes('corporate') || sender.includes('sale') || recipient.includes('sale'))) return true;
  if (idStr === 'enquiry' && (tierField.includes('enquir') || tierField.includes('vendor') || sender.includes('enquir') || recipient.includes('enquir'))) return true;
  if (idStr === 'karan' && (tierField.includes('karan') || sender.includes('karan') || recipient.includes('karan'))) return true;

  return false;
}

// ==========================================
// PACKAGING EMAIL TEMPLATES
// ==========================================
export const EMAIL_TEMPLATES = [
  {
    title: 'Formal Price Quotation',
    tierId: 'quotes',
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
    tierId: 'enquiry',
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
    tierId: 'quotes',
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
    tierId: 'sales',
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
      const { threadIds: tombstoneIds, threadKeys: tombstoneKeys } = getTombstones();
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(t => {
              if (!t || typeof t !== 'object') return false;
              if (t.id?.startsWith('thread-demo')) return false;
              if (tombstoneIds.has(String(t.id))) return false;
              const normSub = normalizeSubject(t.subject || t.messages?.[0]?.subject || '');
              const cleanEmail = (t.email || '').toLowerCase().trim();
              const key = `${cleanEmail}___${normSub}`;
              if (tombstoneKeys.has(key) || tombstoneKeys.has(cleanEmail)) return false;
              // If it's an inbound thread, ensure recipient was one of the 4 allowed mailboxes
              const firstRecipient = t.messages?.[0]?.recipientEmail?.toLowerCase()?.trim();
              if (firstRecipient && firstRecipient.endsWith('@baachko.com')) {
                return ALLOWED_MAILBOXES.includes(firstRecipient);
              }
              return true;
            })
            .map(t => ({
              ...t,
              isStarred: Boolean(t.isStarred),
              isDeleted: Boolean(t.isDeleted),
              deletedAt: t.deletedAt || null,
              messages: Array.isArray(t.messages) ? t.messages : []
            }));
        }
      }
    } catch (e) {}
    return [];
  });

  const [selectedThreadId, setSelectedThreadId] = useState(null);

  // URL Search Params & Bin View
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => (searchParams.get('view') === 'bin' ? 'bin' : 'all'));
  const isBinView = searchParams.get('view') === 'bin' || activeTab === 'bin';
  const [isStarredFilterActive, setIsStarredFilterActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileViewingThread, setIsMobileViewingThread] = useState(false);

  // Synchronize Tab with URL search params (e.g. clicking Mail Bin in sidebar)
  useEffect(() => {
    if (searchParams.get('view') === 'bin') {
      setActiveTab('bin');
    } else if (activeTab === 'bin') {
      setActiveTab('all');
    }
  }, [searchParams]);

  // Compose Modal State
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTierId, setComposeTierId] = useState('sales');
  const [composeTo, setComposeTo] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [composeContactName, setComposeContactName] = useState('');
  const [composeCompany, setComposeCompany] = useState('');
  const [composeCategory, setComposeCategory] = useState('quote');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [isSendingCompose, setIsSendingCompose] = useState(false);
  const [composeError, setComposeError] = useState(null);

  // Inline Quick Reply State (for active thread)
  const [replyTierId, setReplyTierId] = useState('sales');
  const [senderFilter, setSenderFilter] = useState('all');
  const [replyToEmail, setReplyToEmail] = useState('');
  const [replyCc, setReplyCc] = useState('');
  const [showCcInput, setShowCcInput] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
    // Reply Alert & UI States
  const [replyAlert, setReplyAlert] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Attachments State (PDF, Images, Excel/CSV)
  const [replyAttachments, setReplyAttachments] = useState([]);
  const [composeAttachments, setComposeAttachments] = useState([]);
  const [previewAttachment, setPreviewAttachment] = useState(null);
  const [csvPreviewData, setCsvPreviewData] = useState(null);
  const replyFileInputRef = useRef(null);
  const composeFileInputRef = useRef(null);

  const handleViewAttachment = (att) => {
    const category = getAttachmentCategory(att);
    const rawUrl = att.url || att.dataUrl || att.content || att.download_url;

    if (category === 'pdf') {
      let viewerUrl = rawUrl;
      if (rawUrl && typeof rawUrl === 'string' && rawUrl.startsWith('data:')) {
        try {
          const parts = rawUrl.split(',');
          const mime = parts[0].match(/:(.*?);/)?.[1] || 'application/pdf';
          const byteString = atob(parts[1]);
          const ab = new ArrayBuffer(byteString.length);
          const ia = new Uint8Array(ab);
          for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
          }
          const blob = new Blob([ab], { type: mime });
          viewerUrl = URL.createObjectURL(blob);
        } catch (e) {
          console.warn('Could not create Blob URL for PDF:', e);
        }
      }
      setPreviewAttachment({
        ...att,
        viewerUrl: viewerUrl || rawUrl
      });
      return;
    }

    if (category === 'image') {
      setPreviewAttachment(att);
      return;
    }

    if (category === 'excel' && (att.name || att.filename || '').toLowerCase().endsWith('.csv') && rawUrl && rawUrl.startsWith('data:')) {
      try {
        const arr = rawUrl.split(',');
        const text = atob(arr[1]);
        const rows = text.split(/\r?\n/).filter(Boolean).map(r => r.split(','));
        setCsvPreviewData({ name: att.name || att.filename, rows });
        setPreviewAttachment(att);
        return;
      } catch (e) {
        console.warn("CSV parse failed", e);
      }
    }

    setPreviewAttachment(att);
  };

  const handleFilesSelected = async (fileList, target) => {
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
        console.error("Failed to read file:", file.name, err);
      }
    }
    if (target === 'reply') {
      setReplyAttachments(prev => [...prev, ...newAttachments]);
    } else {
      setComposeAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  // Sync with Supabase RFQ Leads & Inbound Resend Emails on Mount and every 10s
  useEffect(() => {
    fetchAndSyncAll();
    const interval = setInterval(() => {
      fetchAndSyncAll(true);
    }, 10000);
    return () => clearInterval(interval);
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

  const fetchAndSyncAll = async (isBackground = false) => {
    if (!isBackground) setIsRefreshing(true);
    try {
      await Promise.allSettled([
        fetchAndMergeSupabaseLeads(),
        fetchAndMergeInboundEmails()
      ]);
    } finally {
      if (!isBackground) setIsRefreshing(false);
    }
  };

  const fetchAndMergeInboundEmails = async () => {
    try {
      const res = await fetch('/api/inbound-email');
      if (!res.ok) return;
      const data = await res.json();
      const emails = data.emails || [];
      if (!emails.length) return;

      // Filter only authorized departmental mailboxes
      const validEmails = emails.filter(item => isAllowedInboundRecipient(item.to));
      if (!validEmails.length) return;

      setThreads(prev => {
        let updatedThreads = prev.filter(t => !t.id?.startsWith('thread-demo')).map(t => ({ ...t, messages: [...(t.messages || [])] }));
        const { threadIds: tombstoneIds, threadKeys: tombstoneKeys, msgIds: tombstoneMsgs } = getTombstones();

        for (const item of validEmails) {
          const rawMsgId = String(item.id);
          const msgId = `msg-${rawMsgId}`;

          // If this message or thread was permanently deleted, skip it completely!
          if (tombstoneMsgs.has(rawMsgId) || tombstoneMsgs.has(msgId)) continue;
          if (tombstoneIds.has(`inbound-${rawMsgId}`)) continue;

          const sender = typeof item.from === 'string' ? item.from : 'Customer';
          const senderEmail = (sender.match(/<([^>]+)>/)?.[1] || sender).trim();
          const senderName = sender.split('<')[0].replace(/"/g, '').trim() || senderEmail.split('@')[0];
          
          const rawRecipients = Array.isArray(item.to) ? item.to : [item.to || 'sales@baachko.com'];
          const recipient = rawRecipients
            .map(r => (typeof r === 'string' ? (r.match(/<([^>]+)>/)?.[1] || r) : '').toLowerCase().trim())
            .find(r => ALLOWED_MAILBOXES.includes(r)) || 'sales@baachko.com';

          const matchedTier = SENDER_TIERS.find(t => t.email === recipient) || SENDER_TIERS[0];

          // Clean Gmail/Outlook quoted text history so only fresh reply is shown
          const cleanBody = item.cleanBody || cleanEmailBody(item.text, item.html) || 'Incoming email received via baachko.com MX server.';

          // Normalize and enrich attachments
          const itemAttachments = (item.attachments || []).map(att => {
            const proxyUrl = `/api/inbound-email?action=attachment&emailId=${encodeURIComponent(item.id)}&attachmentId=${encodeURIComponent(att.id || '')}`;
            return {
              id: att.id,
              name: att.name || att.filename || 'attachment',
              filename: att.filename || att.name || 'attachment',
              size: att.size || 0,
              type: att.type || att.content_type || 'application/octet-stream',
              url: att.url || att.download_url || proxyUrl,
              download_url: att.download_url || att.url || proxyUrl
            };
          });

          const newMsg = {
            id: msgId,
            senderType: 'inbound',
            senderName: senderName,
            senderEmail: senderEmail,
            recipientEmail: recipient,
            cc: item.cc && (Array.isArray(item.cc) ? item.cc.length > 0 : Boolean(item.cc)) ? item.cc : undefined,
            tier: matchedTier.name,
            subject: item.subject || 'Incoming Mail',
            body: cleanBody,
            timestamp: item.created_at || new Date().toISOString(),
            status: 'Received',
            attachments: itemAttachments
          };

          // Find if we already have a conversation thread with this sender email & matching subject
          const normIncomingSubject = normalizeSubject(item.subject);
          const itemKey = `${senderEmail.toLowerCase().trim()}___${normIncomingSubject}`;
          if (tombstoneKeys.has(itemKey) || tombstoneKeys.has(senderEmail.toLowerCase().trim())) {
            continue;
          }

          const existingIndex = updatedThreads.findIndex(t => {
            if (t.email?.toLowerCase().trim() !== senderEmail.toLowerCase().trim()) return false;
            const normThreadSubject = normalizeSubject(t.subject || t.messages?.[0]?.subject || '');
            if (normThreadSubject && normIncomingSubject && (normThreadSubject === normIncomingSubject || normIncomingSubject.includes(normThreadSubject) || normThreadSubject.includes(normIncomingSubject))) {
              return true;
            }
            return t.messages?.some(m => normalizeSubject(m.subject) === normIncomingSubject);
          });

          if (existingIndex !== -1) {
            const currentThread = updatedThreads[existingIndex];
            const hasMsg = currentThread.messages.some(m => m.id === msgId);
            if (!hasMsg) {
              updatedThreads[existingIndex] = {
                ...currentThread,
                status: 'Reply Received',
                lastUpdated: item.created_at || new Date().toISOString(),
                messages: [...currentThread.messages, newMsg]
              };
            }
          } else {
            // Create a brand new distinct conversation thread for this contact & subject
            updatedThreads.unshift({
              id: `inbound-${item.id}`,
              contactName: senderName,
              company: senderEmail.includes('@') ? senderEmail.split('@')[1] : 'Direct Partner',
              email: senderEmail,
              phone: '',
              targetSku: '',
              subject: item.subject || 'Incoming Inquiry',
              category: recipient.includes('enquiry') ? 'vendor' : 'quote',
              status: 'New',
              isStarred: false,
              isDeleted: false,
              deletedAt: null,
              lastUpdated: item.created_at || new Date().toISOString(),
              messages: [newMsg]
            });
          }
        }

        if (updatedThreads.length > 0 && !selectedThreadId) {
          setSelectedThreadId(updatedThreads[0].id);
        }
        return updatedThreads;
      });
    } catch (err) {
      console.warn("Could not sync inbound emails:", err);
    }
  };

  const fetchAndMergeSupabaseLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('rfq_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return;

      setThreads(prev => {
        const cleanPrev = (prev || []).filter(t => t && !t.id?.startsWith('thread-demo'));
        const { threadIds: tombstoneIds, threadKeys: tombstoneKeys } = getTombstones();
        const existingEmails = new Set(
          cleanPrev
            .filter(t => t && t.email)
            .map(t => t.email.toLowerCase().trim())
        );
        const newThreadsFromLeads = data
          .filter(lead => {
            if (!lead.email) return false;
            const cleanLeadEmail = lead.email.toLowerCase().trim();
            const normSub = normalizeSubject(lead.target_product_sku || '');
            const leadKey = `${cleanLeadEmail}___${normSub}`;
            if (tombstoneKeys.has(leadKey) || tombstoneKeys.has(cleanLeadEmail)) return false;
            if (tombstoneIds.has(`lead-${lead.id}`)) return false;
            return !existingEmails.has(cleanLeadEmail);
          })
          .map(lead => ({
            id: `lead-${lead.id}`,
            contactName: lead.contact_name || 'Website Inquiry',
            company: lead.company_name || 'Direct Client',
            email: lead.email,
            phone: lead.phone || '',
            targetSku: lead.target_product_sku || '',
            category: 'quote',
            status: lead.status || 'New',
            isStarred: false,
            isDeleted: false,
            deletedAt: null,
            lastUpdated: lead.created_at || new Date().toISOString(),
            messages: [
              {
                id: `msg-lead-${lead.id}`,
                senderType: 'inbound',
                senderName: lead.contact_name || 'Customer',
                senderEmail: lead.email,
                recipientEmail: 'quotes@baachko.com',
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

  // Star, Bin, and Restore Action Handlers
  const handleToggleStar = (threadId, e) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isStarred: !t.isStarred };
      }
      return t;
    }));
  };

  const handleMoveToBin = (threadId, e) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isDeleted: true, deletedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const handleRestoreFromBin = (threadId, e) => {
    if (e) e.stopPropagation();
    setThreads(prev => prev.map(t => {
      if (t.id === threadId) {
        return { ...t, isDeleted: false, deletedAt: null };
      }
      return t;
    }));
  };

  const handlePermanentlyDelete = async (threadId, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this conversation? This action cannot be undone.")) {
      return;
    }
    const targetThread = threads.find(t => t.id === threadId);
    if (targetThread) {
      // 1. Record persistent tombstone so neither Resend nor Supabase polling recreates it
      recordTombstone(targetThread);

      // 2. Also remove corresponding lead from Supabase if applicable
      if (targetThread.email) {
        try {
          await supabase
            .from('rfq_leads')
            .delete()
            .ilike('email', targetThread.email.toLowerCase().trim());
        } catch (supaErr) {
          console.warn('Failed to delete lead from Supabase:', supaErr);
        }
      }
    }

    setThreads(prev => prev.filter(t => t.id !== threadId));
    if (selectedThreadId === threadId) {
      setSelectedThreadId(null);
    }

    setReplyAlert({
      type: 'success',
      text: 'Conversation permanently deleted.'
    });
  };

  const handleEmptyBin = async () => {
    if (binThreads.length === 0) return;
    if (!window.confirm("Are you sure you want to permanently delete all conversations in the bin? This action cannot be undone.")) {
      return;
    }
    for (const t of binThreads) {
      recordTombstone(t);
      if (t.email) {
        try {
          await supabase.from('rfq_leads').delete().ilike('email', t.email.toLowerCase().trim());
        } catch (e) {}
      }
    }
    setThreads(prev => prev.filter(t => !t.isDeleted));
    if (activeThread?.isDeleted) {
      setSelectedThreadId(null);
    }
    setReplyAlert({ type: 'success', text: 'Mail Bin emptied permanently.' });
  };

  // Filtered thread pools
  const activeThreads = useMemo(() => threads.filter(t => !t.isDeleted), [threads]);
  const binThreads = useMemo(() => threads.filter(t => Boolean(t.isDeleted)), [threads]);
  const starredCount = useMemo(() => activeThreads.filter(t => t.isStarred).length, [activeThreads]);

  // Filtered Threads
  const filteredThreads = useMemo(() => {
    const baseList = isBinView ? binThreads : activeThreads;

    return baseList.filter(thread => {
      // Star toggle filter
      if (!isBinView && isStarredFilterActive && !thread.isStarred) {
        return false;
      }

      // Tab filter
      if (!isBinView) {
        if (activeTab === 'quotes' && thread.category !== 'quote') return false;
        if (activeTab === 'vendors' && thread.category !== 'vendor') return false;
        if (activeTab === 'outreach' && thread.category !== 'outreach') return false;
        if (activeTab === 'starred' && !thread.isStarred) return false;
      }

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
  }, [activeThreads, binThreads, isBinView, isStarredFilterActive, activeTab, searchQuery]);

  // Currently active thread (null if no conversations)
  const activeThread = useMemo(() => {
    const currentPool = isBinView ? binThreads : activeThreads;
    if (currentPool.length === 0) return null;
    return currentPool.find(t => t.id === selectedThreadId) || filteredThreads[0] || currentPool[0] || null;
  }, [activeThreads, binThreads, isBinView, selectedThreadId, filteredThreads]);

  // Keep replyTierId & senderFilter aligned with active thread's category & latest message
  useEffect(() => {
    if (activeThread) {
      const msgs = activeThread.messages || [];
      const lastMsg = msgs[msgs.length - 1];
      let initialTier = 'sales';
      if (lastMsg) {
        if (lastMsg.tierId) initialTier = lastMsg.tierId;
        else if (lastMsg.recipientEmail?.includes('quotes') || lastMsg.senderEmail?.includes('quotes')) initialTier = 'quotes';
        else if (lastMsg.recipientEmail?.includes('karan') || lastMsg.senderEmail?.includes('karan')) initialTier = 'karan';
        else if (lastMsg.recipientEmail?.includes('enquiry') || lastMsg.senderEmail?.includes('enquiry')) initialTier = 'enquiry';
      } else if (activeThread.category === 'vendor') {
        initialTier = 'enquiry';
      } else if (activeThread.category === 'quote') {
        initialTier = 'quotes';
      }
      setReplyTierId(initialTier);
      setSenderFilter(initialTier);
    }
  }, [activeThread?.id]);

  // Sync replyToEmail whenever activeThread changes
  useEffect(() => {
    if (activeThread?.email) {
      setReplyToEmail(activeThread.email);
    }
  }, [activeThread?.id, activeThread?.email]);

  // Messages in active thread
  const displayedMessages = useMemo(() => {
    return activeThread?.messages || [];
  }, [activeThread?.messages]);

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

    const chosenTier = getSenderTier(replyTierId);
    const lastMsg = activeThread.messages?.[activeThread.messages?.length - 1];
    const replySubject = `Re: ${lastMsg?.subject || 'Baachko Industrial Packaging'}`;
    const targetEmail = (replyToEmail || activeThread.email || '').trim();
    const isDifferentEmail = targetEmail.toLowerCase() !== (activeThread.email || '').toLowerCase();
    const parsedCc = replyCc.trim() ? replyCc.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [];

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          cc: parsedCc.length > 0 ? parsedCc : undefined,
          subject: replySubject,
          message: replyBody.trim(),
          fromName: chosenTier.fromName,
          fromEmail: chosenTier.email,
          replyTo: 'sales@baachko.com',
          attachments: replyAttachments.map(a => ({
            filename: a.name,
            content: a.dataUrl,
            contentType: a.type,
            size: a.size
          }))
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch email via Resend.');
      }

      // Append new message
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderType: 'outbound',
        senderName: chosenTier.fromName,
        senderEmail: chosenTier.email,
        recipientEmail: targetEmail,
        cc: parsedCc.length > 0 ? parsedCc : undefined,
        tier: chosenTier.name,
        tierId: chosenTier.id,
        subject: replySubject,
        body: replyBody.trim(),
        timestamp: new Date().toISOString(),
        status: 'Delivered',
        attachments: replyAttachments.map(a => ({
          name: a.name,
          size: a.size,
          type: a.type,
          url: a.dataUrl
        }))
      };

      // Sync sent outbound lead update to Supabase
      try {
        if (isDifferentEmail) {
          await supabase.from('rfq_leads').insert([
            {
              contact_name: targetEmail.split('@')[0],
              company_name: targetEmail.split('@')[1] || 'Direct Client',
              email: targetEmail.toLowerCase(),
              phone: '',
              target_product_sku: replySubject,
              status: 'Contacted',
              message: replyBody.trim()
            }
          ]);
        } else {
          await supabase
            .from('rfq_leads')
            .update({ status: 'Contacted' })
            .ilike('email', targetEmail.toLowerCase());
        }
      } catch (supaErr) {
        console.warn('Could not update Supabase for sent reply:', supaErr);
      }

      if (isDifferentEmail) {
        // Different email address chosen -> start a new conversation for this email ("the new mail goes in")
        const newThreadId = `thread-${Date.now()}`;
        const newThread = {
          id: newThreadId,
          contactName: targetEmail.split('@')[0],
          company: targetEmail.split('@')[1] || 'External Partner',
          email: targetEmail,
          phone: '',
          targetSku: '',
          category: 'quote',
          status: 'Quoted',
          lastUpdated: new Date().toISOString(),
          messages: [newMessage]
        };
        setThreads(prev => [newThread, ...prev]);
        setSelectedThreadId(newThreadId);
      } else {
        // Existing email address used -> trail in the current conversation
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
      }

      setReplyBody('');
      setReplyCc('');
      setShowCcInput(false);
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
    setComposeTierId(prefill.tierId || 'sales');
    setComposeTo(prefill.to || '');
    setComposeCc(prefill.cc || '');
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

    const chosenTier = getSenderTier(composeTierId);
    const parsedComposeCc = composeCc.trim() ? composeCc.split(/[,;]/).map(s => s.trim()).filter(Boolean) : [];

    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeTo.trim(),
          cc: parsedComposeCc.length > 0 ? parsedComposeCc : undefined,
          subject: composeSubject.trim(),
          message: composeBody.trim(),
          fromName: chosenTier.fromName,
          fromEmail: chosenTier.email,
          replyTo: 'sales@baachko.com',
          attachments: composeAttachments.map(a => ({
            filename: a.name,
            content: a.dataUrl,
            contentType: a.type,
            size: a.size
          }))
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to dispatch email via Resend.');
      }

      // Define newMessage for newly composed outbound email
      const newMessage = {
        id: `msg-${Date.now()}`,
        senderType: 'outbound',
        senderName: chosenTier.fromName,
        senderEmail: chosenTier.email,
        recipientEmail: composeTo.trim(),
        cc: parsedComposeCc.length > 0 ? parsedComposeCc : undefined,
        tier: chosenTier.name,
        tierId: chosenTier.id,
        subject: composeSubject.trim(),
        body: composeBody.trim(),
        timestamp: new Date().toISOString(),
        status: 'Delivered',
        attachments: composeAttachments.map(a => ({
          name: a.name,
          size: a.size,
          type: a.type,
          url: a.dataUrl
        }))
      };

      // Sync new conversation / lead to Supabase rfq_leads
      try {
        await supabase.from('rfq_leads').insert([
          {
            contact_name: composeContactName.trim() || composeTo.split('@')[0],
            company_name: composeCompany.trim() || (composeCategory === 'vendor' ? 'Supplier / Vendor' : 'Direct Client'),
            email: composeTo.trim().toLowerCase(),
            phone: '',
            target_product_sku: composeSubject.trim() || 'Direct Inquiry',
            status: 'Contacted',
            message: composeBody.trim()
          }
        ]);
      } catch (supaErr) {
        console.warn('Could not sync new composed email to Supabase:', supaErr);
      }

      // ALWAYS create a distinct new conversation thread for Compose New Email
      const newThreadId = `thread-${Date.now()}`;
      const newThread = {
        id: newThreadId,
        contactName: composeContactName.trim() || composeTo.split('@')[0],
        company: composeCompany.trim() || (composeCategory === 'vendor' ? 'Supplier / Vendor' : 'Direct Inquiry'),
        email: composeTo.trim(),
        phone: '',
        targetSku: '',
        subject: composeSubject.trim(),
        category: composeCategory,
        status: composeCategory === 'vendor' ? 'In Follow-up' : 'Quoted',
        isStarred: false,
        isDeleted: false,
        deletedAt: null,
        lastUpdated: new Date().toISOString(),
        messages: [newMessage]
      };

      setThreads(prev => [newThread, ...prev]);
      setSelectedThreadId(newThreadId);
      setSenderFilter(chosenTier.id);
      setReplyTierId(chosenTier.id);

      // Sent acknowledgement notification
      setReplyAlert({
        type: 'success',
        text: `Email successfully sent to ${composeTo.trim()} via ${chosenTier.email}`
      });

      // Clear compose modal fields
      setComposeTo('');
      setComposeContactName('');
      setComposeCc('');
      setComposeSubject('');
      setComposeBody('');
      setComposeAttachments([]);
      if (composeFileInputRef.current) composeFileInputRef.current.value = '';
      setIsComposeOpen(false);
      setIsMobileViewingThread(true);

    } catch (err) {
      setComposeError(err.message || 'Error occurred while sending email.');
    } finally {
      setIsSendingCompose(false);
    }
  };

  return (
    <div className="h-full flex flex-col min-h-0 bg-white">
      
      {/* ==================================================== */}
      {/* TOP TOOLBAR: SEARCH & ACTIONS (FLUSH, SECTIONLESS)   */}
      {/* ==================================================== */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 shrink-0">
        
        {/* Left: Search Input & Sync (Swapped to Left) */}
        <div className="flex items-center gap-2 flex-1 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations, emails, SKUs..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-gray-50 hover:bg-gray-100/60 focus:bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition"
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
            onClick={() => fetchAndSyncAll()}
            disabled={isRefreshing}
            title="Refresh Inbound Mails & Leads"
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 transition cursor-pointer shrink-0"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin text-amber-600' : ''} />
          </button>
        </div>

        {/* Right: Star Mails Toggle & Compose New Email */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsStarredFilterActive(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition cursor-pointer ${
              isStarredFilterActive
                ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200'
            }`}
            title={isStarredFilterActive ? "Showing only starred emails (Click to show all)" : "Filter by starred emails"}
          >
            <Star 
              size={15} 
              className={isStarredFilterActive ? 'text-amber-500 fill-amber-400' : 'text-gray-400'} 
            />
            <span>Star Mails</span>
            {starredCount > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                isStarredFilterActive ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-600'
              }`}>
                {starredCount}
              </span>
            )}
          </button>

          <button
            onClick={() => handleOpenCompose()}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-700 to-amber-800 hover:from-amber-800 hover:to-amber-900 text-white font-bold text-xs sm:text-sm rounded-lg shadow-xs transition hover:shadow-sm cursor-pointer"
          >
            <Plus size={16} /> Compose New Email
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* WORKSPACE: DEDICATED MAIL BIN OR 2-PANE MAILING      */}
      {/* ==================================================== */}
      {isBinView ? (
        /* ==================================================== */
        /* DEDICATED MAIL BIN (TRASH) VIEW                      */
        /* (Items marked in red removed, action buttons shifted) */
        /* ==================================================== */
        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/60">
          {/* Bin Top Bar */}
          <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setActiveTab('all');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft size={14} /> Back to Mailing Center
              </button>
              <span className="text-xs text-gray-500 font-semibold hidden sm:inline">
                • {binThreads.length} {binThreads.length === 1 ? 'conversation' : 'conversations'} in Mail Bin
              </span>
            </div>

            {binThreads.length > 0 && (
              <button
                type="button"
                onClick={handleEmptyBin}
                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs font-bold rounded-lg border border-red-200 transition cursor-pointer"
                title="Permanently remove all conversations in Mail Bin"
              >
                <Trash2 size={13} /> Empty Bin
              </button>
            )}
          </div>

          {/* Mail Bin Cards List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {filteredThreads.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200 max-w-md mx-auto p-8 shadow-xs">
                <Trash2 size={44} className="mx-auto mb-3 text-gray-300" />
                <h3 className="text-base font-bold text-gray-800 mb-1">Mail Bin is Empty</h3>
                <p className="text-xs text-gray-500 mb-5">
                  {searchQuery.trim() ? "No deleted conversations match your search." : "There are currently no deleted conversations in your bin."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchParams({});
                    setActiveTab('all');
                  }}
                  className="px-4 py-2 bg-[#C95A08] hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Return to Mailing Center
                </button>
              </div>
            ) : (
              <div className="max-w-5xl mx-auto space-y-3">
                {filteredThreads.map((thread) => {
                  const lastMsg = thread.messages?.[thread.messages?.length - 1];
                  const msgCount = thread.messages?.length || 0;

                  return (
                    <div
                      key={thread.id}
                      className="p-4 sm:p-5 bg-white hover:bg-amber-50/30 rounded-xl border border-gray-200 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      {/* Left: Contact & Conversation Details */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs bg-amber-100 text-amber-800">
                          {thread.contactName?.slice(0, 2).toUpperCase() || 'BK'}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-bold text-sm text-gray-900">
                              {thread.contactName}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                              • {thread.company}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              • {thread.email}
                            </span>
                          </div>

                          <div className="text-xs text-gray-800 font-semibold truncate mb-1">
                            {lastMsg?.subject || thread.subject || 'Direct Inquiry'}
                          </div>

                          <div className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
                            {cleanEmailBody(lastMsg?.body || 'No message content.')}
                          </div>

                          <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400 font-medium">
                            <span>Moved to Bin: {new Date(thread.deletedAt || thread.lastUpdated || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            {msgCount > 1 && <span>• {msgCount} messages</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: The Shifted Action Buttons from Yellow Box directly on the card */}
                      <div className="flex items-center gap-2 shrink-0 sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleRestoreFromBin(thread.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-xs"
                          title="Restore conversation to Inbox"
                        >
                          <RotateCcw size={14} /> Restore to Inbox
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePermanentlyDelete(thread.id)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition cursor-pointer text-xs shadow-xs"
                          title="Permanently delete conversation"
                        >
                          <Trash2 size={14} /> Delete Permanently
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================================================== */
        /* STANDARD MAILING CENTER TWO-PANE WORKSPACE           */
        /* ==================================================== */
        <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-white">
        
        {/* -------------------------------------------------- */}
        {/* LEFT PANE: GMAIL-STYLE MAIL LIST                   */}
        {/* -------------------------------------------------- */}
        <div className={`w-full md:w-88 lg:w-[380px] xl:w-[420px] border-r border-gray-200 flex flex-col bg-white shrink-0 ${
          isMobileViewingThread ? 'hidden md:flex' : 'flex'
        }`}>
          
          {/* Category Dropdown Filter */}
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <select
                value={isBinView ? 'bin' : activeTab}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'bin') {
                    setSearchParams({ view: 'bin' });
                    setActiveTab('bin');
                  } else {
                    setSearchParams({});
                    setActiveTab(val);
                  }
                }}
                className="w-full text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none cursor-pointer appearance-none"
              >
                <option value="all">All Mails ({activeThreads.length})</option>
                <option value="quotes">Quotes & RFQs ({activeThreads.filter(t => t.category === 'quote').length})</option>
                <option value="vendors">Vendor Follow-ups ({activeThreads.filter(t => t.category === 'vendor').length})</option>
                <option value="outreach">Outreach ({activeThreads.filter(t => t.category === 'outreach').length})</option>
                <option value="bin">Mail Bin / Trash ({binThreads.length})</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            <span className="text-[11px] font-medium text-gray-400 shrink-0">
              {filteredThreads.length} items
            </span>
          </div>

          {/* Bin Mode Notice in Left Pane */}
          {isBinView && (
            <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
              <span className="font-semibold flex items-center gap-1.5">
                <Trash2 size={13} className="text-amber-700" />
                Mail Bin ({binThreads.length})
              </span>
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setActiveTab('all');
                }}
                className="text-[11px] font-bold text-amber-800 hover:underline cursor-pointer"
              >
                ← Back to Inbox
              </button>
            </div>
          )}

          {/* Email Conversation Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                {isBinView ? (
                  <>
                    <Trash2 size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">Mail Bin is empty</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Deleted conversations will appear here. You can restore them to your active inbox at any time.
                    </p>
                  </>
                ) : isStarredFilterActive ? (
                  <>
                    <Star size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No starred emails</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Click the star icon on any conversation card to keep track of important emails.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsStarredFilterActive(false)}
                      className="mt-3 text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
                    >
                      Show all emails
                    </button>
                  </>
                ) : (
                  <>
                    <Inbox size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-semibold text-gray-700">No conversations yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                      Inquiries from the website will appear here automatically, or click "Compose New Email" to send an email.
                    </p>
                  </>
                )}
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = activeThread?.id === thread.id;
                const lastMsg = thread.messages?.[thread.messages?.length - 1];
                const msgCount = thread.messages?.length || 0;

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
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-bold text-sm truncate ${isSelected ? 'text-amber-900' : 'text-gray-900'}`}>
                          {thread.contactName}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 font-medium truncate mb-0.5">
                        {thread.company}
                      </div>

                      <div className="text-xs text-gray-800 font-semibold truncate mb-0.5">
                        {lastMsg?.subject || 'Quotation & Inquiry'}
                      </div>

                      <div className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
                        {cleanEmailBody(lastMsg?.body || 'No message content yet.')}
                      </div>
                    </div>

                    {/* Right Column: Date, Badge, and Action Buttons (The red box in user screenshot) */}
                    <div className="flex flex-col items-end justify-between self-stretch shrink-0 gap-1.5 pl-1">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <span className="text-[11px] font-medium">
                          {new Date(thread.lastUpdated || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                        {msgCount > 1 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-gray-100 text-gray-600">
                            {msgCount}
                          </span>
                        )}
                      </div>

                      {/* Action buttons (The area indicated in user's red box) */}
                      <div className="flex items-center gap-1 mt-auto">
                        {!isBinView ? (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleToggleStar(thread.id, e)}
                              className={`p-1 rounded-md transition cursor-pointer ${
                                thread.isStarred 
                                  ? 'text-amber-500 hover:bg-amber-100/60' 
                                  : 'text-gray-300 hover:text-amber-500 hover:bg-gray-100'
                              }`}
                              title={thread.isStarred ? "Starred (Click to unstar)" : "Star this conversation"}
                            >
                              <Star 
                                size={15} 
                                className={thread.isStarred ? 'fill-amber-400 text-amber-500' : ''} 
                              />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleMoveToBin(thread.id, e)}
                              className="p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                              title="Delete conversation (Move to Bin)"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={(e) => handleRestoreFromBin(thread.id, e)}
                              className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition cursor-pointer flex items-center gap-0.5 text-[11px] font-semibold"
                              title="Restore conversation to Inbox"
                            >
                              <RotateCcw size={14} />
                              <span className="hidden sm:inline text-[10px]">Restore</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handlePermanentlyDelete(thread.id, e)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
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
        <div className={`flex-1 flex flex-col bg-white min-w-0 ${
          !isMobileViewingThread ? 'hidden md:flex' : 'flex'
        }`}>
          {activeThread ? (
            <>
              {/* Thread Header Bar with Conversation Switcher */}
              <div className="px-6 py-3.5 bg-white border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
                
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setIsMobileViewingThread(false)}
                    className="md:hidden p-1.5 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <ArrowLeft size={18} />
                  </button>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                      {activeThread.messages?.[activeThread.messages?.length - 1]?.subject || 'Direct Conversation'}
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

                {/* Right Action Icons for Active Conversation */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleStar(activeThread.id)}
                    className={`p-2 rounded-lg border transition cursor-pointer ${
                      activeThread.isStarred 
                        ? 'bg-amber-50 text-amber-500 border-amber-300' 
                        : 'text-gray-400 hover:text-amber-500 hover:bg-gray-50 border-gray-200'
                    }`}
                    title={activeThread.isStarred ? 'Unstar conversation' : 'Star conversation'}
                  >
                    <Star size={16} fill={activeThread.isStarred ? 'currentColor' : 'none'} />
                  </button>
                  {!activeThread.isDeleted ? (
                    <button
                      type="button"
                      onClick={(e) => handleMoveToBin(activeThread.id, e)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 border border-gray-200 rounded-lg transition cursor-pointer"
                      title="Delete conversation (Move to Bin)"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handlePermanentlyDelete(activeThread.id, e)}
                      className="p-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition cursor-pointer"
                      title="Delete permanently"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Bin Banner if Active Thread is in Bin */}
              {activeThread.isDeleted && (
                <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 shrink-0">
                  <div className="flex items-center gap-2">
                    <Trash2 size={15} className="text-amber-700 shrink-0" />
                    <span className="font-semibold">This conversation is currently in the Mail Bin.</span>
                    {activeThread.deletedAt && (
                      <span className="text-amber-700 text-[11px] hidden sm:inline">
                        (Moved to bin on {new Date(activeThread.deletedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleRestoreFromBin(activeThread.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                    >
                      <RotateCcw size={14} /> Restore to Inbox
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePermanentlyDelete(activeThread.id)}
                      className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                    >
                      <Trash2 size={14} /> Delete Permanently
                    </button>
                  </div>
                </div>
              )}

              {/* Thread Trail Timeline (Scrollable, Generous Space) */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

                {/* Timeline Start Notice */}
                <div className="text-center">
                  <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    Conversation Trail Started • {new Date(activeThread.messages?.[0]?.timestamp || activeThread.lastUpdated || Date.now()).toLocaleDateString()}
                  </span>
                </div>

                {/* Trail Messages Filtered by Sender */}
                {displayedMessages.length === 0 ? (
                  <div className="text-center py-12 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 font-bold text-xs">
                      {getSenderTier(senderFilter).badge}
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      No messages on the {getSenderTier(senderFilter).email} channel yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      Replies sent using {getSenderTier(senderFilter).email} will appear here as a distinct, isolated conversation trail matching the client inbox.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSenderFilter('all')}
                      className="mt-3 text-xs font-semibold text-amber-700 hover:text-amber-800 underline cursor-pointer"
                    >
                      View all channel messages ({activeThread.messages?.length || 0})
                    </button>
                  </div>
                ) : (
                  displayedMessages.map((msg, index) => {
                  const isInbound = msg.senderType === 'inbound';
                  const msgTier = getSenderTier(msg.tierId);

                  return (
                    <div 
                      key={msg.id || index}
                      className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} space-y-1.5 w-full`}
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

                      {/* Message Card - Spacious & Clean */}
                      <div className={`w-full max-w-3xl lg:max-w-4xl rounded-xl p-5 border transition ${
                        isInbound 
                          ? 'bg-gray-50/80 border-gray-200 text-gray-800 shadow-2xs' 
                          : 'bg-[#0B1730] text-white border-gray-800 shadow-xs'
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
                          {cleanEmailBody(msg.body)}
                        </div>

                        {/* Standardized Attachments Area (PDF, Images, Excel, CSV) */}
                        {msg.attachments && Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                          <div className={`mt-4 pt-3.5 border-t ${isInbound ? 'border-gray-200' : 'border-gray-700/60'}`}>
                            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2.5 text-amber-500">
                              <Paperclip size={13} />
                              <span>Attached Documents ({msg.attachments.length}):</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {msg.attachments.map((att, attIdx) => {
                                const category = getAttachmentCategory(att);
                                const isPdf = category === 'pdf';
                                const isImg = category === 'image';
                                const isExcel = category === 'excel';
                                const attUrl = att.url || att.dataUrl || att.content;

                                return (
                                  <div
                                    key={attIdx}
                                    className={`flex flex-col justify-between p-2.5 rounded-xl border transition ${
                                      isInbound 
                                        ? 'bg-white border-gray-200 shadow-2xs hover:border-amber-400' 
                                        : 'bg-white/10 border-white/15 hover:border-amber-400/60 text-white'
                                    }`}
                                  >
                                    <div className="flex items-start gap-2 mb-2 min-w-0">
                                      <div className={`p-1.5 rounded-lg shrink-0 ${
                                        isPdf ? 'bg-red-500/15 text-red-500' :
                                        isImg ? 'bg-purple-500/15 text-purple-400' :
                                        isExcel ? 'bg-emerald-500/15 text-emerald-400' :
                                        'bg-gray-500/15 text-gray-400'
                                      }`}>
                                        {isPdf && <FileText size={16} />}
                                        {isImg && <Image size={16} />}
                                        {isExcel && <FileSpreadsheet size={16} />}
                                        {!isPdf && !isImg && !isExcel && <File size={16} />}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${isInbound ? 'text-gray-900' : 'text-white'}`} title={att.name || att.filename}>
                                          {att.name || att.filename || 'Attachment'}
                                        </p>
                                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5 font-medium">
                                          <span className="uppercase tracking-wider font-semibold">
                                            {isPdf ? 'PDF Document' : isImg ? 'Image' : isExcel ? 'Excel / CSV' : 'File'}
                                          </span>
                                          {att.size ? <span>• {formatFileSize(att.size)}</span> : null}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Thumbnail Preview for Images */}
                                    {isImg && attUrl && (
                                      <div
                                        onClick={() => handleViewAttachment(att)}
                                        className="relative mb-2 h-24 rounded-lg overflow-hidden bg-black/10 cursor-pointer group/thumb"
                                      >
                                        <img 
                                          src={attUrl} 
                                          alt={att.name} 
                                          className="w-full h-full object-cover transition duration-300 group-hover/thumb:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover/thumb:opacity-100 transition flex items-center justify-center text-white text-xs font-semibold gap-1">
                                          <Eye size={13} /> Click to View
                                        </div>
                                      </div>
                                    )}

                                    {/* Action buttons: View & Download */}
                                    <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100/10">
                                      <button
                                        type="button"
                                        onClick={() => handleViewAttachment(att)}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                          isInbound 
                                            ? 'bg-amber-50 hover:bg-amber-100 text-amber-900' 
                                            : 'bg-white/15 hover:bg-white/25 text-white'
                                        }`}
                                        title={`View ${att.name || 'document'}`}
                                      >
                                        <Eye size={12} /> View
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => downloadAttachment(att)}
                                        className={`p-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                                          isInbound 
                                            ? 'hover:bg-gray-100 text-gray-600' 
                                            : 'hover:bg-white/10 text-gray-300'
                                        }`}
                                        title="Download file"
                                      >
                                        <Download size={13} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Footer status & CC */}
                        <div className="mt-3 pt-2.5 border-t border-gray-100/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-400">
                          <div className="flex flex-wrap items-center gap-2">
                            <span>To: {msg.recipientEmail}</span>
                            {msg.cc && (
                              <span className="text-amber-400 font-medium">
                                • CC: {Array.isArray(msg.cc) ? msg.cc.join(', ') : msg.cc}
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 font-semibold text-emerald-400">
                            <Check size={12} /> {msg.status || 'Delivered'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }))}
              </div>

              {/* ==================================================== */}
              {/* INLINE QUICK REPLY BOX / BIN RESTORE NOTICE          */}
              {/* ==================================================== */}
              <div className="px-6 py-4 bg-white border-t border-gray-200 shrink-0">
                {activeThread.isDeleted ? (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Trash2 size={16} className="text-amber-700 shrink-0" />
                      <span>This conversation is in the <strong>Mail Bin</strong>. To send follow-up replies, please restore it to your inbox.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRestoreFromBin(activeThread.id)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer text-xs"
                      >
                        <RotateCcw size={14} /> Restore Conversation
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendReply} className="space-y-3">
                  
                  {/* Reply Controls: Sender Identity, Recipient, and CC */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/70 p-2.5 rounded-lg border border-gray-200">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
                      {/* FROM Dropdown */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                          <Reply size={13} className="text-amber-700" /> From:
                        </span>
                        <select
                          value={replyTierId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setReplyTierId(val);
                            setSenderFilter(val);
                          }}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                        >
                          {SENDER_TIERS.map(tier => (
                            <option key={tier.id} value={tier.id}>
                              {tier.email} ({tier.fromName})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* TO Input */}
                      <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0">
                          To:
                        </span>
                        <input
                          type="email"
                          value={replyToEmail}
                          onChange={(e) => setReplyToEmail(e.target.value)}
                          placeholder="recipient@company.com"
                          className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Attach Files Button */}
                      <button
                        type="button"
                        onClick={() => replyFileInputRef.current?.click()}
                        className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border transition cursor-pointer shrink-0 ${
                          replyAttachments.length > 0
                            ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                        }`}
                        title="Attach PDF, Images (PNG/JPG/WEBP), or Excel (CSV/XLSX)"
                      >
                        <Paperclip size={13} className="text-amber-700" />
                        <span>Attach Files</span>
                        {replyAttachments.length > 0 && (
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                            {replyAttachments.length}
                          </span>
                        )}
                      </button>

                      {/* CC Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowCcInput(!showCcInput)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer shrink-0 ${
                          showCcInput || replyCc.trim()
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
                        }`}
                        title="Add Carbon Copy (CC) recipients"
                      >
                        {showCcInput ? '− CC' : '+ CC'}
                      </button>
                    </div>
                  </div>

                  {/* Hidden File Input for Quick Reply */}
                  <input
                    ref={replyFileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.csv,.xlsx,.xls,application/pdf,image/*,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    onChange={(e) => {
                      handleFilesSelected(e.target.files, 'reply');
                      e.target.value = '';
                    }}
                    className="hidden"
                  />

                  {/* Staged Attachments Chips in Quick Reply */}
                  {replyAttachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/70">
                      {replyAttachments.map((att, idx) => {
                        const cat = getAttachmentCategory(att);
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs shadow-2xs">
                            <span className={`p-1 rounded font-bold text-[10px] flex items-center gap-1 ${
                              cat === 'pdf' ? 'bg-red-100 text-red-700' :
                              cat === 'image' ? 'bg-purple-100 text-purple-700' :
                              cat === 'excel' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {cat === 'pdf' ? <FileText size={12} /> :
                               cat === 'image' ? <Image size={12} /> :
                               cat === 'excel' ? <FileSpreadsheet size={12} /> :
                               <File size={12} />}
                              {cat.toUpperCase()}
                            </span>
                            <span className="font-semibold text-gray-800 truncate max-w-[150px]" title={att.name}>
                              {att.name}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ({formatFileSize(att.size)})
                            </span>
                            <button
                              type="button"
                              onClick={() => setReplyAttachments(prev => prev.filter((_, i) => i !== idx))}
                              className="text-gray-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
                              title="Remove attachment"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Expandable CC Input Row */}
                  {(showCcInput || replyCc.trim()) && (
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider shrink-0">
                        CC:
                      </span>
                      <input
                        type="text"
                        value={replyCc}
                        onChange={(e) => setReplyCc(e.target.value)}
                        placeholder="Comma-separated emails (e.g. procurement@supplier.com, team@baachko.com)"
                        className="w-full text-xs px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 outline-none font-mono"
                      />
                    </div>
                  )}

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
                )}
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
      )}

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

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Message Body *
                </label>
                <textarea 
                  rows={6}
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your formal message, specifications, or inquiry..."
                  className="w-full text-xs sm:text-sm p-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none font-sans leading-relaxed"
                  required
                />
              </div>

              {/* Attachments Section in Compose Modal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Attachments (PDF, Images, Excel)
                  </label>
                  <button
                    type="button"
                    onClick={() => composeFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Paperclip size={13} className="text-amber-700" />
                    <span>Attach Files</span>
                    {composeAttachments.length > 0 && (
                      <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {composeAttachments.length}
                      </span>
                    )}
                  </button>
                </div>

                <input
                  ref={composeFileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.svg,.csv,.xlsx,.xls,application/pdf,image/*,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(e) => {
                    handleFilesSelected(e.target.files, 'compose');
                    e.target.value = '';
                  }}
                  className="hidden"
                />

                {composeAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200">
                    {composeAttachments.map((att, idx) => {
                      const cat = getAttachmentCategory(att);
                      return (
                        <div key={idx} className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs shadow-2xs">
                          <span className={`p-1 rounded font-bold text-[10px] flex items-center gap-1 ${
                            cat === 'pdf' ? 'bg-red-100 text-red-700' :
                            cat === 'image' ? 'bg-purple-100 text-purple-700' :
                            cat === 'excel' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {cat === 'pdf' ? <FileText size={12} /> :
                             cat === 'image' ? <Image size={12} /> :
                             cat === 'excel' ? <FileSpreadsheet size={12} /> :
                             <File size={12} />}
                            {cat.toUpperCase()}
                          </span>
                          <span className="font-semibold text-gray-800 truncate max-w-[150px]" title={att.name}>
                            {att.name}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            ({formatFileSize(att.size)})
                          </span>
                          <button
                            type="button"
                            onClick={() => setComposeAttachments(prev => prev.filter((_, i) => i !== idx))}
                            className="text-gray-400 hover:text-red-600 p-0.5 rounded cursor-pointer transition"
                            title="Remove file"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
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

      {/* ==================================================== */}
      {/* ATTACHMENT VIEWER & PREVIEW MODAL                    */}
      {/* ==================================================== */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="bg-[#0B1730] px-5 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                  {getAttachmentCategory(previewAttachment) === 'pdf' ? <FileText size={18} /> :
                   getAttachmentCategory(previewAttachment) === 'image' ? <Image size={18} /> :
                   <FileSpreadsheet size={18} />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate" title={previewAttachment.name || previewAttachment.filename}>
                    {previewAttachment.name || previewAttachment.filename}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span className="uppercase font-semibold tracking-wider">
                      {getAttachmentCategory(previewAttachment) === 'pdf' ? 'PDF Document' :
                       getAttachmentCategory(previewAttachment) === 'image' ? 'Image File' :
                       getAttachmentCategory(previewAttachment) === 'excel' ? 'Spreadsheet' : 'File'}
                    </span>
                    {previewAttachment.size ? <span>• {formatFileSize(previewAttachment.size)}</span> : null}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Open in New Tab Button */}
                <button
                  type="button"
                  onClick={() => {
                    const targetUrl = previewAttachment.viewerUrl || previewAttachment.url || previewAttachment.download_url || previewAttachment.dataUrl;
                    if (targetUrl) window.open(targetUrl, '_blank');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="Open document in a new browser tab"
                >
                  <Maximize2 size={13} />
                  <span className="hidden sm:inline">Open in Tab</span>
                </button>

                {/* Download Button */}
                <button
                  type="button"
                  onClick={() => downloadAttachment(previewAttachment)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-sm"
                  title="Download file to computer"
                >
                  <Download size={14} /> Download
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setPreviewAttachment(null);
                    setCsvPreviewData(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer ml-1"
                  title="Close viewer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body: Direct PDF Viewer, Image Viewer, or Spreadsheet */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-900/95 min-h-[500px]">
              {getAttachmentCategory(previewAttachment) === 'pdf' ? (
                <div className="w-full h-full min-h-[550px] max-h-[82vh] flex flex-col bg-white rounded-xl overflow-hidden shadow-2xl border border-gray-700/50">
                  <iframe
                    src={`${previewAttachment.viewerUrl || previewAttachment.url || previewAttachment.download_url || previewAttachment.dataUrl}#toolbar=1`}
                    className="w-full h-[76vh] border-0 rounded-xl bg-white"
                    title={previewAttachment.name || 'PDF Document'}
                  />
                </div>
              ) : getAttachmentCategory(previewAttachment) === 'image' ? (
                <div className="flex items-center justify-center p-2">
                  <img
                    src={previewAttachment.url || previewAttachment.dataUrl || previewAttachment.download_url}
                    alt={previewAttachment.name}
                    className="max-h-[78vh] max-w-full rounded-lg object-contain shadow-2xl"
                  />
                </div>
              ) : csvPreviewData ? (
                <div className="w-full h-full max-h-[75vh] overflow-auto bg-white rounded-xl border border-gray-200 shadow-md">
                  <table className="w-full text-xs text-left border-collapse">
                    <tbody>
                      {csvPreviewData.rows.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx === 0 ? 'bg-gray-100 font-bold sticky top-0' : 'border-t border-gray-100 hover:bg-gray-50'}>
                          {row.map((col, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-r border-gray-100 truncate max-w-[200px]">
                              {col}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-gray-200 max-w-md shadow-xl">
                  <FileText size={48} className="mx-auto mb-3 text-amber-600" />
                  <p className="font-bold text-gray-800 text-sm mb-1">{previewAttachment.name || previewAttachment.filename}</p>
                  <p className="text-xs text-gray-500 mb-4">{formatFileSize(previewAttachment.size)} • Document</p>
                  <button
                    type="button"
                    onClick={() => downloadAttachment(previewAttachment)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <Download size={14} /> Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
