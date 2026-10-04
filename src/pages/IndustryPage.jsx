import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ChevronDown } from 'lucide-react';

const industryNames = {
  'construction-materials': 'Construction Materials',
  'chemicals': 'Chemicals',
  'animal-feed': 'Animal Feed',
  'agriculture-food-ingredients': 'Agriculture & Food Ingredients',
  'other-industrial-applications': 'Other Industrial Applications'
};

export default function IndustryPage() {
  const [products] = useState(productsData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { industryId } = useParams();

  const industryName = industryNames[industryId];
  if (!industryName) {
    return <Navigate to="/" replace />;
  }

  // Filter products by matching the industries array in products.json
  const industryProducts = products.filter(product => {
    return product.industries && product.industries.includes(industryId);
  });

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        <Link to="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 font-semibold mb-8 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Home
        </Link>

        <div className="text-center mb-16 flex flex-col items-center">
          
          <div className="relative inline-block text-left">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold text-blue-950 hover:text-amber-700 transition"
            >
              {industryName}
              <ChevronDown className={`w-8 h-8 md:w-10 md:h-10 text-amber-700 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-72 rounded-xl shadow-xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top">
                  <div className="py-2">
                    {Object.entries(industryNames).map(([id, name]) => {
                      const isActive = id === industryId;
                      return (
                        <Link
                          key={id}
                          to={`/industry/${id}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`block px-6 py-3 text-base md:text-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-amber-50 text-amber-800 font-bold border-l-4 border-amber-700' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-amber-700 border-l-4 border-transparent'
                          }`}
                        >
                          {name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Browse packaging products engineered for the {industryName} industry.
          </p>
          <div className="w-24 h-1 bg-amber-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {industryProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No specific products mapped to this industry yet. Please view our full catalog.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
            {industryProducts.map((product) => (
              <div key={product.sku_code} className="flex w-full justify-center">
                <ProductCard product={product} hideIndustry={true} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
