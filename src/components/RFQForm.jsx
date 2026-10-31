import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function RFQForm({ productSku, productName }) {
  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    target_product_sku: productSku || '',
    estimated_qty: '',
    message: ''
  });

  // Dynamically update target_product_sku when user changes product options/buttons
  useEffect(() => {
    if (productSku) {
      setFormData(prev => ({
        ...prev,
        target_product_sku: productSku
      }));
    }
  }, [productSku]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState(null);

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

      if (insertError) {
        throw insertError;
      }
      
      setIsSuccess(true);

      // Automated client confirmation email via Resend (non-blocking)
      try {
        fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: formData.email,
            subject: `Inquiry Confirmation - Baachko Packaging (${formData.target_product_sku || 'Custom Packaging'})`,
            message: `Dear ${formData.contact_name},\n\nThank you for requesting a quotation from Baachko Pvt. Ltd. (Krishna Packers).\n\nWe have received your requirement for ${formData.target_product_sku || 'Industrial Packaging'}${formData.estimated_qty ? ` (Quantity: ${formData.estimated_qty})` : ''}.\n\nOur sales engineering team is reviewing your requirements and will connect with you within 24 hours with complete technical specifications and pricing.\n\nWarm regards,\nSales Engineering Team\nBaachko Pvt. Ltd.`,
            fromName: 'Baachko Sales'
          })
        }).catch(() => {});
      } catch (err) {}
    } catch (err) {
      console.error("Error submitting RFQ:", err);
      setError(`Failed to submit: ${err.message || err.details || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
        <p className="text-gray-600">
          Your request for bulk quotation has been received. Our sales engineering team will be in touch within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-xl" id="rfq-form">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Request Bulk Quote</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input 
              required
              type="text" 
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" 
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
            <input 
              required
              type="text" 
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" 
              placeholder="Your Full Name"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
            <input 
              required
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" 
              placeholder="your.email@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" 
              placeholder="Your Phone Number"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Product SKU</label>
            <input 
              type="text" 
              name="target_product_sku"
              value={formData.target_product_sku}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-amber-50/40 text-gray-900 font-semibold text-sm focus:ring-amber-500 focus:border-amber-500 transition-colors shadow-2xs" 
              readOnly={!!productSku}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Quantity</label>
            <input 
              type="text" 
              name="estimated_qty"
              value={formData.estimated_qty}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" 
              placeholder="e.g. 10,000 bags"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Additional Message / Specs</label>
          <textarea 
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4" 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            placeholder="Please specify any custom branding, dimensional tolerances, or timeline requirements..."
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-amber-700 text-white font-bold py-4 rounded-md hover:bg-amber-800 transition flex justify-center items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <><Loader2 className="animate-spin w-5 h-5" /> Submitting Request...</>
          ) : (
            "Submit RFQ"
          )}
        </button>
      </form>
    </div>
  );
}
