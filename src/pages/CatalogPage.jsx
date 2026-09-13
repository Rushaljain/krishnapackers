import React, { useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export default function CatalogPage() {
  const [products] = useState(productsData);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const selectedCategoryHash = location.hash ? location.hash.replace('#', '') : null;

  // Group products by category
  const categories = products.reduce((acc, product) => {
    const cat = product.product_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  const filteredCategories = Object.entries(categories).filter(([category]) => {
    if (!selectedCategoryHash) return false;
    const categoryId = category.toLowerCase().replace(/[\s&/]+/g, '-');
    return categoryId === selectedCategoryHash;
  });

  if (!selectedCategoryHash || filteredCategories.length === 0) {
    // If no specific category is selected, redirect to homepage or our-products
    return <Navigate to="/" replace />;
  }

  const [categoryName, items] = filteredCategories[0];

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        
        <Link to="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 font-semibold mb-8 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Products
        </Link>

        <div className="text-center mb-16 flex flex-col items-center">
          
          <div className="relative inline-block text-left">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="group flex items-center justify-center gap-3 text-3xl md:text-4xl font-bold text-blue-950 hover:text-amber-700 transition"
            >
              {categoryName}
              <ChevronDown className={`w-8 h-8 md:w-10 md:h-10 text-amber-700 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDropdownOpen && (
              <>
                {/* Backdrop to close dropdown when clicking outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                
                <div className="absolute left-1/2 -translate-x-1/2 mt-4 w-72 rounded-xl shadow-xl bg-white border border-gray-100 ring-1 ring-black ring-opacity-5 z-50 overflow-hidden transform origin-top">
                  <div className="py-2">
                    {Object.keys(categories).map((catName) => {
                      const hash = catName.toLowerCase().replace(/[\s&/]+/g, '-');
                      const isActive = catName === categoryName;
                      return (
                        <Link
                          key={catName}
                          to={`/products#${hash}`}
                          onClick={() => setIsDropdownOpen(false)}
                          className={`block px-6 py-3 text-base md:text-lg text-left transition-colors ${
                            isActive 
                              ? 'bg-amber-50 text-amber-800 font-bold border-l-4 border-amber-700' 
                              : 'text-gray-700 hover:bg-gray-50 hover:text-amber-700 border-l-4 border-transparent'
                          }`}
                        >
                          {catName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Browse our complete range of subcategories and specifications for {categoryName}.
          </p>
          <div className="w-24 h-1 bg-amber-700 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Vertical Grid layout (acts as a vertical list/carousel alternative) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
          {items.map((product) => (
            <div key={product.sku_code} className="flex w-full justify-center">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
