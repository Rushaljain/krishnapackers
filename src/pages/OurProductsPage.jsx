import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export default function OurProductsPage() {
  const [products] = useState(productsData);
  const location = useLocation();

  // Group products by category
  const categories = products.reduce((acc, product) => {
    const cat = product.product_category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(product);
    return acc;
  }, {});

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  const scrollContainer = (id, direction) => {
    const container = document.getElementById(`carousel-${id}`);
    if (container) {
      const scrollAmount = 300;
      container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-blue-950">Full Product Catalog</h1>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Browse our complete range of high-quality packaging products manufactured to international standards.
          </p>
          <div className="w-24 h-1 bg-orange-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {Object.entries(categories).map(([category, items], idx) => {
          const categoryId = category.toLowerCase().replace(/[\s&/]+/g, '-');
          return (
          <div key={category} id={categoryId} className="mb-16">
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollContainer(idx, 'left')}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition shadow-sm text-gray-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollContainer(idx, 'right')}
                  className="p-2 rounded-full bg-white border border-gray-200 hover:bg-gray-100 transition shadow-sm text-gray-700"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div 
              id={`carousel-${idx}`}
              className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((product) => (
                <div key={product.sku_code} className="snap-start flex-shrink-0 flex">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
          );
        })}
        
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </div>
  );
}
