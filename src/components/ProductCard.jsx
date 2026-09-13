import React from 'react';
import { ChevronRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, hideIndustry = false }) {
  // Use a placeholder image or a dynamic one based on category/name if available
  const imageUrl = "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=600&q=80";

  return (
    <Link to={`/product/${product.sku_code}`} className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full group cursor-pointer border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-gray-50 flex flex-col">
      <div className="aspect-[5/4] bg-gray-200 overflow-hidden relative flex-shrink-0">
         <img src={imageUrl} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
         <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white p-1 md:p-2 rounded-full shadow-md"><ChevronRight className="text-amber-700 w-4 h-4 md:w-5 md:h-5"/></div>
      </div>
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-1 line-clamp-1">{product.product_name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-4">
          {product.capacity && <span className="font-semibold">Capacity: {product.capacity}</span>}
          {!hideIndustry && product.capacity && product.application && <span className="mx-1">|</span>}
          {!hideIndustry && product.application && <span>Industry: {product.application}</span>}
        </p>
        <span className="text-amber-700 font-semibold text-xs sm:text-sm mt-auto">View Specifications &rarr;</span>
      </div>
    </Link>
  );
}
