import React, { useState } from 'react';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function QuoteModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    contact_name: '',
    company_name: '',
    email: '',
    phone: '',
    additional_message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from('rfq_leads')
        .insert([formData]);

      if (insertError) throw insertError;
      
      setIsSuccess(true);
      // Auto close after 3 seconds on success
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          contact_name: '',
          company_name: '',
          email: '',
          phone: '',
          additional_message: ''
        });
        onClose();
      }, 3000);
      
    } catch (err) {
      console.error("Error submitting quote request:", err);
      setError("Failed to submit request. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#0B1730] px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Request Bulk Quote</h2>
          <button 
            onClick={onClose}
            className="text-gray-300 hover:text-white transition rounded-full p-1 hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Request Sent!</h3>
              <p className="text-gray-600">Our sales team will be in touch within 24 hours.</p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Name *</label>
                  <input 
                    required 
                    name="contact_name"
                    value={formData.contact_name}
                    onChange={handleChange}
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none transition" 
                    placeholder="Your Name" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Company</label>
                  <input 
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none transition" 
                    placeholder="Your Company Name" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                  <input 
                    required 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    type="email" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none transition" 
                    placeholder="your.email@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Phone Number *</label>
                  <input 
                    required 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    type="tel" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none transition" 
                    placeholder="Your Phone Number" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Requirements / Message</label>
                <textarea 
                  rows="4" 
                  name="additional_message"
                  value={formData.additional_message}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-700 focus:border-amber-700 outline-none transition resize-none" 
                  placeholder="Tell us about the products you are interested in and your application..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-700/70 text-white font-bold py-3 px-4 rounded-lg transition duration-300 shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-4">
                Our sales team will get back to you within 24 hours.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
