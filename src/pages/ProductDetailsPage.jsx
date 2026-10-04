import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import RFQForm from '../components/RFQForm';
import { Loader2, CheckCircle2, Layers, Weight, Sliders, Shield } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive option selections for RFQ custom requests
  const [selectedPly, setSelectedPly] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [selectedLamination, setSelectedLamination] = useState('');

  useEffect(() => {
    import('../data/products.json').then((module) => {
      const data = module.default;
      const foundProduct = data.find(p => p.sku_code === id);
      if (foundProduct) {
        setProduct(foundProduct);
        if (foundProduct.ply_options?.length) setSelectedPly(foundProduct.ply_options[0]);
        if (foundProduct.capacity_options?.length) setSelectedCapacity(foundProduct.capacity_options[0]);
        if (foundProduct.lamination_options?.length) setSelectedLamination(foundProduct.lamination_options[0]);
      } else {
        setProduct(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error loading product data:", err);
      setLoading(false);
    });
  }, [id]);

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
          
          {/* Left: Product Image & Options */}
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
                {product.description || `Premium quality ${product.product_name.toLowerCase()} manufactured for heavy-duty industrial handling and optimal product protection.`}
              </p>
              
              {/* OPTIONS & SPECIFICATIONS SELECTOR */}
              <div className="space-y-6 mb-8">
                
                {/* Ply Options */}
                {product.ply_options && product.ply_options.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-base">
                      <Layers className="text-amber-700 w-5 h-5" />
                      <span>Ply & Construction Options</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.ply_options.map((ply) => (
                        <button
                          key={ply}
                          onClick={() => setSelectedPly(ply)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                            selectedPly === ply
                              ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {ply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lamination / Coating Options */}
                {product.lamination_options && product.lamination_options.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-base">
                      <Sliders className="text-amber-700 w-5 h-5" />
                      <span>Lamination & Finish Options</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.lamination_options.map((option) => (
                        <button
                          key={option}
                          onClick={() => setSelectedLamination(option)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                            selectedLamination === option
                              ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Capacity / Weight Options */}
                {product.capacity_options && product.capacity_options.length > 0 && (
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2 mb-3 text-gray-900 font-bold text-base">
                      <Weight className="text-amber-700 w-5 h-5" />
                      <span>Available Capacities / Weights</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.capacity_options.map((cap) => (
                        <button
                          key={cap}
                          onClick={() => setSelectedCapacity(cap)}
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition border ${
                            selectedCapacity === cap
                              ? 'bg-amber-700 text-white border-amber-700 shadow-sm'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {cap}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Custom Packaging Notice */}
              <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100 mb-8">
                <h4 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-700" /> Custom Industrial Packaging
                </h4>
                <p className="text-amber-800/90 text-sm leading-relaxed">
                  We know that every business is unique, and your packaging should reflect that! We are fully equipped to tailor our solutions to your exact requirements. From custom dimensions and specific materials to specialized printing, construction, and closure systems—our team is dedicated to supporting you every step of the way to ensure the perfect packaging fit for your application.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs Summary & RFQ Form */}
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
                  <span className="text-gray-500">Material</span>
                  <span className="font-medium text-gray-900">{product.material}</span>
                </div>
                {selectedPly && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Ply / Construction</span>
                    <span className="font-semibold text-amber-800">{selectedPly}</span>
                  </div>
                )}
                {selectedLamination && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Lamination</span>
                    <span className="font-semibold text-amber-800">{selectedLamination}</span>
                  </div>
                )}
                {selectedCapacity && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Capacity</span>
                    <span className="font-semibold text-amber-800">{selectedCapacity}</span>
                  </div>
                )}

              </div>
            </div>

            <RFQForm 
              productSku={`${product.sku_code}${selectedPly ? ` (${selectedPly})` : ''}${selectedCapacity ? ` [${selectedCapacity}]` : ''}`} 
              productName={product.product_name} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
