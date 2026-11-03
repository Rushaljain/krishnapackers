import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Search, Download, Mail, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import SendEmailModal from '../../components/admin/SendEmailModal';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [expandedLeadIds, setExpandedLeadIds] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');

  const toggleExpandLead = (id) => {
    setExpandedLeadIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

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
    const dataToExport = filteredLeads.length > 0 ? filteredLeads : leads;
    if (dataToExport.length === 0) return;
    
    const headers = ['Date', 'Name', 'Company', 'Email', 'Phone', 'Target SKU', 'Estimated Qty', 'Message', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...dataToExport.map(lead => [
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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.phone?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.target_product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) || '') ||
      (lead.message?.toLowerCase().includes(searchTerm.toLowerCase()) || '');

    const currentStatus = lead.status || 'New';
    const matchesStatus = statusFilter === 'All' || currentStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

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
        <div>
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition cursor-pointer"
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
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="w-28 px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider shrink-0">Date</th>
                <th scope="col" className="w-72 min-w-[220px] px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Details</th>
                <th scope="col" className="w-[420px] min-w-[360px] max-w-[460px] px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Requirements</th>
                <th scope="col" className="w-36 px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span>Status</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="normal-case tracking-normal text-xs font-semibold px-2 py-1 rounded-md border border-gray-300 bg-white hover:border-amber-500 text-gray-700 shadow-2xs focus:ring-2 focus:ring-amber-500 outline-none cursor-pointer"
                      title="Filter leads by status"
                    >
                      <option value="All">All</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </th>
                <th scope="col" className="w-36 px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeads.map((lead) => {
                const isExpanded = !!expandedLeadIds[lead.id];

                return (
                  <tr key={lead.id} className="hover:bg-gray-50/70 transition-colors">
                    {/* Date */}
                    <td className="w-28 px-5 py-4 align-top whitespace-nowrap text-xs sm:text-sm text-gray-500 font-medium">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>

                    {/* Contact Details */}
                    <td className="w-72 min-w-[220px] px-5 py-4 align-top">
                      <div className="text-sm font-bold text-gray-900 leading-snug">{lead.contact_name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{lead.company_name || '-'}</div>
                      <div className="text-xs text-amber-800 font-medium mt-1 font-mono">{lead.email}</div>
                      {lead.phone && <div className="text-xs text-gray-500 mt-0.5 font-mono">{lead.phone}</div>}
                    </td>

                    {/* Requirements */}
                    <td className="w-[420px] min-w-[360px] max-w-[460px] px-5 py-4 align-top">
                      {lead.target_product_sku && (
                        <div className="text-xs font-bold text-amber-800 mb-1 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200/60 rounded text-[11px] font-mono">
                            SKU: {lead.target_product_sku}
                          </span>
                        </div>
                      )}
                      {lead.estimated_qty && (
                        <div className="text-xs text-gray-600 mb-1.5 font-medium">
                          Qty: <span className="text-gray-900 font-semibold">{lead.estimated_qty}</span>
                        </div>
                      )}
                      
                      {lead.message ? (
                        <div className="w-full">
                          {isExpanded ? (
                            <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200/90 shadow-2xs">
                              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-200/70">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                  Full Requirement
                                </span>
                                <button
                                  type="button"
                                  onClick={() => toggleExpandLead(lead.id)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-amber-800 hover:text-amber-900 hover:bg-amber-100/60 rounded-md transition cursor-pointer"
                                  title="Collapse requirement"
                                >
                                  <span>Show less</span>
                                  <ChevronUp size={13} />
                                </button>
                              </div>
                              <div className="text-xs sm:text-sm text-gray-800 leading-relaxed whitespace-pre-wrap select-text font-normal">
                                "{lead.message}"
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <div 
                                onClick={() => toggleExpandLead(lead.id)}
                                className="text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed cursor-pointer flex-1 hover:text-gray-900 transition select-none"
                                title="Click to view full requirement"
                              >
                                "{lead.message}"
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleExpandLead(lead.id)}
                                className="p-1 rounded-md border border-gray-200 hover:border-amber-400 bg-white hover:bg-amber-50 text-gray-400 hover:text-amber-800 shadow-2xs transition cursor-pointer shrink-0 mt-0.5"
                                title="Show full requirement"
                                aria-label="Show full requirement"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        !lead.target_product_sku && !lead.estimated_qty && (
                          <span className="text-xs text-gray-400 italic">No details provided</span>
                        )
                      )}
                    </td>

                    {/* Status */}
                    <td className="w-36 px-5 py-4 align-top whitespace-nowrap">
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

                    {/* Actions */}
                    <td className="w-36 px-5 py-4 align-top whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setSelectedLeadForEmail(lead);
                            setIsEmailModalOpen(true);
                          }}
                          className="text-white bg-[#C95A08] hover:bg-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                          title="Reply with Baachko Mailers"
                        >
                          <Mail size={14} /> Reply
                        </button>
                        <button 
                          onClick={() => deleteLead(lead.id)}
                          className="text-red-500 hover:text-red-700 transition flex items-center p-1.5 bg-gray-100 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No leads found matching your search or filter.
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
