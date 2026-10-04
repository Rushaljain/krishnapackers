import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product, hideIndustry = false }) {
  const imageUrl = "https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=600&q=80";

  // Build a clean summary text of options (e.g. Ply options, Lamination options, etc.)
  const optionsSummary = [
    product.ply_options ? `Ply: ${product.ply_options.join(', ')}` : null,
    product.lamination_options ? `Options: ${product.lamination_options.join(', ')}` : null,
    product.material ? `Material: ${product.material}` : null
  ].filter(Boolean).join(' | ');

  return (
    <Link to={`/product/${product.sku_code}`} className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full group cursor-pointer border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-gray-50 flex flex-col">
      <div className="aspect-[5/4] bg-gray-200 overflow-hidden relative flex-shrink-0">
         <img src={imageUrl} alt={product.product_name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
         <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white p-1 md:p-2 rounded-full shadow-md"><ChevronRight className="text-amber-700 w-4 h-4 md:w-5 md:h-5"/></div>
         <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-xs font-bold text-amber-800 shadow-sm">
            {product.product_category}
         </div>
      </div>
      <div className="p-4 md:p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900">{product.product_name}</h3>
        <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">
          {product.description || optionsSummary}
        </p>
        <span className="text-amber-700 font-semibold text-xs sm:text-sm mt-auto">View Specifications &rarr;</span>
      </div>
    </Link>
  );
}
