import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import RFQForm from '../components/RFQForm';
import { Loader2, CheckCircle2, Layers, Weight, Sliders, Shield, Box, Tag, ChevronDown } from 'lucide-react';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Interactive option selections for RFQ custom requests
  const [selectedPly, setSelectedPly] = useState('');
  const [selectedCapacity, setSelectedCapacity] = useState('');
  const [selectedLamination, setSelectedLamination] = useState('');
  const [selectedConstruction, setSelectedConstruction] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');

  useEffect(() => {
    import('../data/products.json').then((module) => {
      const data = module.default;
      const foundProduct = data.find(p => p.sku_code === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setSelectedPly(foundProduct.ply_options?.length ? foundProduct.ply_options[0] : '');
        setSelectedCapacity(foundProduct.capacity_options?.length ? foundProduct.capacity_options[0] : '');
        setSelectedLamination(foundProduct.lamination_options?.length ? foundProduct.lamination_options[0] : '');
        setSelectedConstruction(foundProduct.construction_options?.length ? foundProduct.construction_options[0] : '');
        setSelectedMaterial(foundProduct.material_options?.length ? foundProduct.material_options[0] : '');
      } else {
        setProduct(null);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Error loading product data:", err);
      setLoading(false);
    });
  }, [id]);

  // Compute live configured SKU code based on button selections
  const configuredSku = useMemo(() => {
    if (!product) return '';
    let sku = product.sku_code;

    const specs = [];
    if (selectedPly) specs.push(selectedPly);
    if (selectedConstruction) specs.push(selectedConstruction);
    if (selectedMaterial) specs.push(selectedMaterial);
    if (selectedLamination) specs.push(selectedLamination);

    if (specs.length > 0) {
      sku += ` (${specs.join(', ')})`;
    }

    if (selectedCapacity) {
      sku += ` [${selectedCapacity}]`;
    }

    return sku;
  }, [product, selectedPly, selectedConstruction, selectedMaterial, selectedLamination, selectedCapacity]);

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

  const imageUrl = product.image_url || "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80";

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
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shadow-2xs">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  SKU: {configuredSku}
                </span>
              </div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{product.product_name}</h1>
              <p className="text-lg text-gray-600 mb-8">
                {product.description || `Premium quality ${product.product_name.toLowerCase()} manufactured for heavy-duty industrial handling and optimal product protection.`}
              </p>
              
              {/* OPTIONS & SPECIFICATIONS SELECTOR (CLEAN DROPDOWNS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                
                {/* Ply Options */}
                {product.ply_options && product.ply_options.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Layers className="text-amber-700 w-4 h-4" />
                      <span>Ply & Construction</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedPly}
                        onChange={(e) => setSelectedPly(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {product.ply_options.map((ply) => (
                          <option key={ply} value={ply}>{ply}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Weave & Construction Options (e.g. Jute Gunny Bags) */}
                {product.construction_options && product.construction_options.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Layers className="text-amber-700 w-4 h-4" />
                      <span>Weave & Construction</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedConstruction}
                        onChange={(e) => setSelectedConstruction(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {product.construction_options.map((construction) => (
                          <option key={construction} value={construction}>{construction}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Material Fabric Options (e.g. PP / HDPE Woven) */}
                {product.material_options && product.material_options.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Box className="text-amber-700 w-4 h-4" />
                      <span>Material Fabric</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {product.material_options.map((material) => (
                          <option key={material} value={material}>{material}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Lamination / Coating Options */}
                {product.lamination_options && product.lamination_options.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Sliders className="text-amber-700 w-4 h-4" />
                      <span>Lamination & Finish</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedLamination}
                        onChange={(e) => setSelectedLamination(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {product.lamination_options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Capacity / Weight Options */}
                {product.capacity_options && product.capacity_options.length > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <label className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                      <Weight className="text-amber-700 w-4 h-4" />
                      <span>Available Capacity / Weight</span>
                    </label>
                    <div className="relative">
                      <select
                        value={selectedCapacity}
                        onChange={(e) => setSelectedCapacity(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 pr-10 rounded-lg border border-gray-300 bg-white text-gray-800 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none cursor-pointer appearance-none"
                      >
                        {product.capacity_options.map((cap) => (
                          <option key={cap} value={cap}>{cap}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                )}

              </div>

              {/* Custom Packaging Notice */}
              <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100 mb-8">
                <h4 className="text-lg font-bold text-amber-900 mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-700" /> Custom Industrial Packaging
                </h4>
                <div className="space-y-3">
                  <p className="text-amber-800/90 text-sm leading-relaxed">
                    We know that every business is unique, and your packaging should reflect that! We are fully equipped to tailor our solutions to your exact requirements. From custom dimensions and specific materials to specialized construction and closure systems—our team is dedicated to supporting you every step of the way to ensure the perfect packaging fit for your application.
                  </p>
                  <p className="text-amber-800/90 text-sm leading-relaxed">
                    <strong className="text-amber-900">Advanced Custom Printing:</strong> We offer premium Flex and DTG printing solutions to elevate your brand's visibility with vibrant, durable, and high-resolution graphics tailored perfectly to your packaging design.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Technical Specs Summary & RFQ Form */}
          <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
              <div className="divide-y divide-gray-100">
                
                <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <span className="text-gray-500 font-medium">Configured SKU</span>
                  <span className="font-bold text-amber-900 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 text-sm font-mono self-start sm:self-auto transition-all shadow-2xs">
                    {configuredSku}
                  </span>
                </div>
                <div className="py-3 flex justify-between items-center">
                  <span className="text-gray-500">Base Catalog Code</span>
                  <span className="font-medium text-gray-700 font-mono text-sm">{product.sku_code}</span>
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
                  <span className="font-medium text-gray-900">{selectedMaterial || product.material}</span>
                </div>
                {selectedPly && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Ply / Construction</span>
                    <span className="font-semibold text-amber-800">{selectedPly}</span>
                  </div>
                )}
                {selectedConstruction && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Construction</span>
                    <span className="font-semibold text-amber-800">{selectedConstruction}</span>
                  </div>
                )}
                {selectedMaterial && (
                  <div className="py-3 flex justify-between items-center">
                    <span className="text-gray-500">Selected Fabric</span>
                    <span className="font-semibold text-amber-800">{selectedMaterial}</span>
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
              productSku={configuredSku} 
              productName={product.product_name} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}
