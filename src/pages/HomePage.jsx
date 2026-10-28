import React from 'react';
import { Package, ChevronRight, Building2, FlaskConical, Wheat, Utensils, Factory, Award, ShieldCheck, Leaf } from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Infrastructure from '../components/Infrastructure';
import Services from '../components/Services';
import Testimonials from '../components/Testimonials';
import productsData from '../data/products.json';
import ProductCard from '../components/ProductCard';

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

      {/* Brand Introduction & Search Authority Section */}
      <section className="py-12 md:py-16 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="text-[#C95A08] font-bold uppercase tracking-wider text-xs sm:text-sm">Welcome to Baachko</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#0B1730] mt-2 mb-4 tracking-tight">
            India's Leading Industrial Packaging Sacks Manufacturer
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Backed by over five decades of manufacturing excellence (formerly Krishna Packers & Apco Traders), <strong className="font-semibold text-gray-900">Baachko Pvt. Ltd.</strong> supplies high-performance Multiwall Kraft Paper Sacks, Valve Sacks, HDPE Coated Sacks, PP Woven Bags, BOPP Laminated Bags, and FIBC Jumbo Bulk Bags engineered for demanding industrial, chemical, construction, and agricultural applications.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-700 font-medium">
            <span className="bg-slate-50 px-4 py-2 rounded-full border border-gray-200">📍 TTC Industrial Area, Navi Mumbai</span>
            <span className="bg-slate-50 px-4 py-2 rounded-full border border-gray-200">🏆 ISO 9001:2015 Certified Quality</span>
            <span className="bg-slate-50 px-4 py-2 rounded-full border border-gray-200">⚙️ 50+ Years Manufacturing Heritage</span>
          </div>
        </div>
      </section>

      <Infrastructure />

      {/* INDUSTRIES WE SERVE */}
      <div className="max-w-7xl mx-auto px-4 mt-12 md:mt-16">
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Industries We Serve</h2>
          <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full"></div>
        </div>

        <div className="relative">
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {[
              { id: "construction-materials", name: "Construction Materials", image: "/industries/construction.webp", desc: "Packaging solutions for: Cement; Mortar; Tile Adhesives; Plaster; Gypsum Products; Dry-Mix Materials; Other Construction Powders." },
              { id: "chemicals", name: "Chemicals", image: "/industries/chemicals.webp", desc: "Packaging designed for a wide range of chemical and industrial materials, with specifications tailored to product characteristics and handling." },
              { id: "animal-feed", name: "Animal Feed", image: "/industries/animal_feed.webp", desc: "High-strength bags for animal feed, livestock nutrition, seeds, and specialty agricultural feeds." },
              { id: "agriculture-food-ingredients", name: "Agriculture & Food Ingredients", image: "/industries/agri_food.webp", desc: "Packaging solutions for food ingredients, grains, flour, sugar, and dry bulk products where hygiene and protection are essential." },
              { id: "other-industrial-applications", name: "Other Industrial Applications", image: "/industries/other_industrial.webp", desc: "We also work with businesses across other industries requiring dependable packaging for powdered, granular and bulk products." },
            ].map((industry) => {
              return (
                <Link to={`/industry/${industry.id}`} key={industry.id} className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full snap-start flex-shrink-0 group border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition duration-300 bg-white flex flex-col cursor-pointer">
                  <div className="aspect-[5/4] bg-gray-100 overflow-hidden relative flex-shrink-0">
                    <img src={industry.image} alt={industry.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-md">
                      <ChevronRight className="text-amber-700 w-4 h-4 md:w-5 md:h-5"/>
                    </div>
                  </div>
                  <div className="p-4 md:p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mb-1 text-gray-900 line-clamp-1">{industry.name}</h3>
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">{industry.desc}</p>
                    <span className="text-amber-700 font-semibold text-xs sm:text-sm text-left mt-auto flex items-center gap-1 group-hover:translate-x-1 transition">
                      View Products &rarr;
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          {/* Scroll hint gradient for desktop */}
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
        </div>
      </div>

      {/* EXPLORE OUR PRODUCTS CAROUSEL */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Explore Our Products</h2>
            <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="relative">
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {productsData.map((product) => (
                <div key={product.sku_code} className="snap-start flex-shrink-0 flex">
                  <ProductCard product={product} />
                </div>
              ))}
              
              <div className="w-[75vw] sm:w-[280px] md:w-[320px] lg:w-[350px] h-full snap-start flex-shrink-0 group cursor-pointer border-2 border-dashed border-amber-700 rounded-xl overflow-hidden hover:bg-amber-50 transition duration-300 flex flex-col items-center justify-center text-center p-6 bg-white relative">
                <div className="bg-amber-100 p-3 md:p-4 rounded-full mb-3 md:mb-4 group-hover:scale-110 transition duration-300">
                  <Package className="h-8 w-8 md:h-10 md:w-10 text-amber-800" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">We Also Customize</h3>
                <p className="text-gray-600 text-sm mb-6">Need specific dimensions or logo branding? We manufacture to your exact specs.</p>
                <Link to="/our-products" className="bg-amber-700 text-white px-6 py-2 rounded-md font-semibold hover:bg-amber-800 transition text-sm mt-auto">Full Catalog</Link>
              </div>
            </div>
            {/* Scroll hint gradient for desktop */}
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent pointer-events-none hidden md:block" />
          </div>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
        ` }} />
      </section>

      <Services />

      <Testimonials />
    </div>
  );
}
