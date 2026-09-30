import React from 'react';
import { Package, ChevronRight, Building2, FlaskConical, Wheat, Gem, Utensils, Factory } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Infrastructure from '../components/Infrastructure';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import { Factory as FactoryIcon, Award, ShieldCheck, Leaf } from 'lucide-react';

export default function HomePage({ onOpenQuote }) {
  return (
    <div className="pt-20">
      <Hero onOpenQuote={onOpenQuote} />
      
      <section className="bg-white border border-gray-100 py-6 md:py-10 relative z-20 -mt-16 mx-4 rounded-2xl shadow-xl shadow-black/5 md:mx-auto md:max-w-5xl overflow-hidden">
        <div className="grid grid-cols-2 gap-y-6 md:gap-y-10 gap-x-2 md:gap-x-6 px-2 md:px-6">
          
          {/* Item 1 */}
          <div className="flex flex-col items-center text-center px-2">
            <div className="bg-slate-50 p-3 md:p-4 rounded-full mb-3 md:mb-4">
              <Award className="h-6 w-6 md:h-7 md:w-7 text-[#0B1730] stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-[1.75rem] font-bold text-[#C95A08] mb-1 tracking-tight">50+ Years</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base leading-snug">experience in Manufacturing and providing packaging solutions</p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center text-center px-2 border-l border-slate-100">
            <div className="bg-slate-50 p-3 md:p-4 rounded-full mb-3 md:mb-4">
              <Leaf className="h-6 w-6 md:h-7 md:w-7 text-[#0B1730] stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-[1.75rem] font-bold text-[#C95A08] mb-1 tracking-tight leading-tight">Sustainable<br className="md:hidden"/> Mfg.</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base leading-snug mt-1 md:mt-0">Eco-Friendly Materials & Processes</p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center text-center px-2 border-t border-slate-100 pt-6 md:pt-8">
            <div className="bg-slate-50 p-3 md:p-4 rounded-full mb-3 md:mb-4">
              <Package className="h-6 w-6 md:h-7 md:w-7 text-[#0B1730] stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-[1.75rem] font-bold text-[#C95A08] mb-1 tracking-tight leading-tight">Industrial<br className="md:hidden"/> Packaging</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base leading-snug mt-1 md:mt-0">Solutions Built Around Requirements</p>
          </div>
          
          {/* Item 4 */}
          <div className="flex flex-col items-center text-center px-2 border-t border-l border-slate-100 pt-6 md:pt-8">
            <div className="bg-slate-50 p-3 md:p-4 rounded-full mb-3 md:mb-4">
              <ShieldCheck className="h-6 w-6 md:h-7 md:w-7 text-[#0B1730] stroke-[1.5]" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-[1.75rem] font-bold text-[#C95A08] mb-1 tracking-tight leading-tight">Consistent<br className="md:hidden"/> Quality</h3>
            <p className="text-slate-500 font-medium text-xs sm:text-sm md:text-base leading-snug mt-1 md:mt-0">Reliable Supply & Long-Term Partnerships</p>
          </div>

        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-[#C95A08] rounded-t-md opacity-80"></div>
      </section>

      <Infrastructure />

      {/* 3x2 PRODUCT GRID TEASER */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Explore Our Products</h2>
            <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="relative">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { name: "Kraft Paper Bags", desc: "Multi-layer paper packaging solutions designed for strength, protection and reliable handling." },
                { name: "PP Woven Bags", desc: "Durable woven polypropylene bags providing strength, flexibility and dependable performance." },
                { name: "Multiwall & Valve Bags", desc: "High-performance bags designed for efficient filling and secure handling of powdered/granular products." },
                { name: "HDPE & BOPP Laminated Bags", desc: "Combining woven strength with high-quality printing and enhanced visual presentation." },
                { name: "Jute Bags", desc: "Premium natural fiber bags leveraging our 50 years of manufacturing excellence." },
                { name: "FIBC / Jumbo Bags", desc: "Flexible Intermediate Bulk Containers for efficient handling and storage of bulk materials." },
              ].map((prod, idx) => {
                const hashId = prod.name.toLowerCase().replace(/[\s&/]+/g, '-');
                return (
                <Link key={idx} to={`/our-products#${hashId}`} className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full snap-start flex-shrink-0 group cursor-pointer border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-gray-50 flex flex-col">
                  <div className="aspect-[5/4] bg-gray-200 flex items-center justify-center relative flex-shrink-0">
                     <Package className="h-10 w-10 md:h-16 md:w-16 text-gray-400 group-hover:scale-110 transition duration-300" />
                     <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white p-1 md:p-2 rounded-full shadow-md"><ChevronRight className="text-amber-700 w-4 h-4 md:w-5 md:h-5" /></div>
                  </div>
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1 text-gray-900">{prod.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">{prod.desc}</p>
                    <span className="text-amber-700 font-semibold text-xs sm:text-sm text-left mt-auto">View Specifications &rarr;</span>
                  </div>
                </Link>
                );
              })}
              
              <div className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full snap-start flex-shrink-0 group cursor-pointer border-2 border-dashed border-amber-700 rounded-xl overflow-hidden hover:bg-amber-50 transition duration-300 flex flex-col items-center justify-center text-center p-6 bg-white relative">
                <div className="bg-amber-100 p-3 md:p-4 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition duration-300">
                  <Package className="h-8 w-8 md:h-10 md:w-10 text-amber-800" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">We Also Customize</h3>
                <p className="text-gray-600 text-sm mb-6">Need specific dimensions or logo branding? We manufacture to your exact specs.</p>
                <Link to="/our-products" className="bg-amber-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-amber-800 transition text-sm mt-auto">
                  Full Catalog
                </Link>
              </div>
            </div>
            
            {/* Scroll hint gradient for desktop */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
          </div>
        </div>

        {/* INDUSTRIES WE SERVE */}
        <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
          <div className="text-center mb-8 md:mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Industries We Serve</h2>
            <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="relative">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { name: "Construction Materials", icon: "Building2", desc: "Packaging solutions for: Cement; Mortar; Tile Adhesives; Plaster; Gypsum Products; Dry-Mix Materials; Other Construction Powders." },
                { name: "Chemicals", icon: "FlaskConical", desc: "Packaging designed for a wide range of chemical and industrial materials, with specifications tailored to product characteristics and handling." },
                { name: "Agriculture & Animal Feed", icon: "Wheat", desc: "Solutions for: Seeds; Animal Feed; Grains; Agricultural Products; Fertilizers; Other Bulk Agricultural Materials." },
                { name: "Minerals & Industrial Materials", icon: "Gem", desc: "Packaging solutions for powdered and granular materials such as: Calcium Carbonate; Silica; Kaolin; Pigments; Industrial Minerals." },
                { name: "Food & Ingredients", icon: "Utensils", desc: "Packaging solutions for selected food ingredients and dry bulk products where product protection, hygiene and reliable handling are essential." },
                { name: "Other Industrial Applications", icon: "Factory", desc: "We also work with businesses across other industries requiring dependable packaging for powdered, granular and bulk products." },
              ].map((industry, idx) => {
                const IconComponent = {
                  "Building2": Building2,
                  "FlaskConical": FlaskConical,
                  "Wheat": Wheat,
                  "Gem": Gem,
                  "Utensils": Utensils,
                  "Factory": Factory
                }[industry.icon];

                const hashId = industry.name.toLowerCase().replace(/[\s&/]+/g, '-');
                return (
                <Link to={`/industry/${hashId}`} key={idx} className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full snap-start flex-shrink-0 group border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-gray-50 flex flex-col cursor-pointer">
                  <div className="aspect-[5/4] bg-gray-200 flex items-center justify-center relative flex-shrink-0">
                    <IconComponent className="h-10 w-10 md:h-16 md:w-16 text-gray-400 group-hover:scale-110 group-hover:text-amber-700 transition duration-300" />
                  </div>
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 line-clamp-1">{industry.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4">{industry.desc}</p>
                    <span className="text-amber-700 font-semibold text-xs sm:text-sm text-left mt-auto">View Products &rarr;</span>
                  </div>
                </Link>
                );
              })}
            </div>
            {/* Scroll hint gradient for desktop */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        `}} />
      </section>

      <Services />

      <Testimonials />
    </div>
  );
}
