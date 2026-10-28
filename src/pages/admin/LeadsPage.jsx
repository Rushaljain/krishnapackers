import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Search, Filter, Download, Mail, Trash2, Send } from 'lucide-react';
import SendEmailModal from '../../components/admin/SendEmailModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('rfq_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('rfq_leads')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Optimistic update
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: newStatus } : lead));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    
    try {
      const { error } = await supabase
        .from('rfq_leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setLeads(leads.filter(lead => lead.id !== id));
    } catch (error) {
      console.error("Error deleting lead:", error);
      alert("Failed to delete lead");
    }
  };

  const exportToCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ['Date', 'Name', 'Company', 'Email', 'Phone', 'Target SKU', 'Estimated Qty', 'Message', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        new Date(lead.created_at).toLocaleDateString(),
        `"${(lead.contact_name || '').replace(/"/g, '""')}"`,
        `"${(lead.company_name || '').replace(/"/g, '""')}"`,
        `"${(lead.email || '').replace(/"/g, '""')}"`,
        `"${(lead.phone || '').replace(/"/g, '""')}"`,
        `"${(lead.target_product_sku || '').replace(/"/g, '""')}"`,
        `"${(lead.estimated_qty || '').replace(/"/g, '""')}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`,
        `"${(lead.status || 'New').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rfq_leads_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter(lead => 
    (lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
    (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-amber-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row justify-between gap-4 items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Search leads by name, company, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Filter size={18} />
            <span>Showing {filteredLeads.length} leads</span>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{lead.contact_name}</div>
                    <div className="text-sm text-gray-500">{lead.company_name || '-'}</div>
                    <div className="text-sm text-amber-700 mt-1">{lead.email}</div>
                    <div className="text-sm text-gray-500">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    {lead.target_product_sku && (
                      <div className="text-sm font-medium text-amber-700 mb-1">
                        SKU: {lead.target_product_sku}
                      </div>
                    )}
                    {lead.estimated_qty && (
                      <div className="text-sm text-gray-900 mb-1">
                        Qty: {lead.estimated_qty}
                      </div>
                    )}
                    {lead.message && (
                      <div className="text-sm text-gray-500 mt-2 line-clamp-2 max-w-xs" title={lead.message}>
                        "{lead.message}"
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={lead.status || 'New'}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className={`text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer border-0 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-amber-500 ${getStatusColor(lead.status || 'New')}`}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedLeadForEmail(lead);
                          setIsEmailModalOpen(true);
                        }}
                        className="text-white bg-[#C95A08] hover:bg-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                        title="Reply via Resend (Custom Domain)"
                      >
                        <Mail size={14} /> Reply
                      </button>
                      <a 
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(lead.email)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-blue-700 transition flex items-center p-1.5 bg-gray-100 hover:bg-blue-50 rounded-lg"
                        title="Open in Gmail"
                      >
                        <Send size={14} />
                      </a>
                      <button 
                        onClick={() => deleteLead(lead.id)}
                        className="text-red-500 hover:text-red-700 transition flex items-center p-1.5 bg-gray-100 hover:bg-red-50 rounded-lg"
                        title="Delete Lead"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No leads found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resend Email Reply Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedLeadForEmail(null);
        }}
        lead={selectedLeadForEmail}
        onEmailSent={(leadId) => {
          setLeads(leads.map(l => l.id === leadId ? { ...l, status: 'Contacted' } : l));
        }}
      />

    </div>
  );
}
