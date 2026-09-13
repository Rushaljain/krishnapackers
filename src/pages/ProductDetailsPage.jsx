import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import RFQForm from '../components/RFQForm';
import { Loader2, Package, CheckCircle2 } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dynamic import to avoid circular dependencies if any, but regular import is fine
    import('../data/products.json').then((module) => {
      const data = module.default;
      const foundProduct = data.find(p => p.sku_code === id);
      setProduct(foundProduct || null);
      setLoading(false);
    }).catch(err => {
      console.error("Error loading product data:", err);
      setLoading(false);
    });
  }, [id]);

  const scrollToRFQ = () => {
    const rfqForm = document.getElementById('rfq-form');
    if (rfqForm) {
      rfqForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-amber-700" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex justify-center items-center bg-gray-50 text-xl text-gray-500">
        Product not found.
      </div>
    );
  }

  const imageUrl = "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="bg-gray-50 pt-20">
      

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Product Image & Overview */}
          <div>
            <div className="bg-gray-200 rounded-2xl overflow-hidden mb-8 h-96 relative shadow-lg">
              <img src={imageUrl} alt={product.product_name} className="w-full h-full object-cover" />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1 rounded-full text-sm font-bold text-amber-800 shadow-sm">
                {product.product_category}
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.product_name}</h1>
              <p className="text-lg text-gray-600 mb-8">
                Premium quality {product.bag_type ? product.bag_type.toLowerCase() : 'product'} ideal for {product.application ? product.application.toLowerCase() : 'various applications'}. Manufactured with high-grade {product.material ? product.material.toLowerCase() : 'materials'}.
              </p>
              
              {/* Highlight Features */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start gap-3 mb-6">
                <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">Capacity</h4>
                  <p className="text-gray-500">{product.capacity || 'N/A'}</p>
                </div>
              </div>

              {/* Custom Packaging Notice */}
              <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100 mb-8">
                <h4 className="text-lg font-bold text-amber-900 mb-2">Custom Industrial Packaging</h4>
                <p className="text-amber-800/90 text-sm leading-relaxed">
                  We know that every business is unique, and your packaging should reflect that! We are fully equipped to tailor our solutions to your exact requirements. From custom dimensions and specific materials to specialized printing, construction, and closure systems—our team is dedicated to supporting you every step of the way to ensure the perfect packaging fit for your application.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs & RFQ Form */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
              <div className="divide-y divide-gray-100">
                
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">SKU Code</span>
                  <span className="font-medium text-gray-900">{product.sku_code}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Category</span>
                  <span className="font-medium text-gray-900">{product.product_category}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Bag Type</span>
                  <span className="font-medium text-gray-900">{product.bag_type}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Construction</span>
                  <span className="font-medium text-gray-900">{product.construction}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Material</span>
                  <span className="font-medium text-gray-900">{product.material}</span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Application</span>
                  <span className="font-medium text-gray-900">{product.application}</span>
                </div>

              </div>
            </div>

            <RFQForm productSku={product.sku_code} productName={product.product_name} />
          </div>

        </div>
      </div>
    </div>
  );
}
