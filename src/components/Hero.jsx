import React from 'react';
import { Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaachkoLogo from './BaachkoLogo';

export default function Hero({ onOpenQuote }) {
  return (
    <section className="relative min-h-[90vh] md:h-[88vh] flex items-center py-20 md:py-16">
      <div className="absolute inset-0 bg-[#0B1730] z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster="/hero-poster.webp"
          className="w-full h-full object-cover opacity-65"
        >
          <source src="/hero.webm" type="video/webm" />
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1730]/75 via-[#0B1730]/50 to-[#0B1730]/25 pointer-events-none" />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-8">
        {/* Left Box: Brand & Main CTA */}
        <div className="flex flex-col items-start max-w-xl lg:max-w-2xl xl:max-w-3xl text-left">
          <span className="text-[#C95A08] uppercase tracking-[0.25em] text-xs sm:text-sm md:text-base font-extrabold mb-3 sm:mb-4 drop-shadow-sm">
            Sustaining Industries
          </span>
          
          <div className="mb-4 sm:mb-6 w-full">
            <h1 className="sr-only">Baachko</h1>
            <BaachkoLogo className="w-full max-w-[280px] sm:max-w-[380px] md:max-w-[460px] lg:max-w-[540px] xl:max-w-[620px] h-auto text-white drop-shadow-2xl" />
          </div>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-100 mb-6 sm:mb-8 font-light drop-shadow-md leading-relaxed">
            50 Years of Excellence in Packaging Solutions
          </p>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 sm:mb-10">
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium border border-white/25 shadow-md">
              <Award size={18} className="text-[#C95A08] flex-shrink-0" /> ISO 9001:2015
            </span>
            <span className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md text-white px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm md:text-base font-medium border border-white/25 shadow-md">
              <ShieldCheck size={18} className="text-[#C95A08] flex-shrink-0" /> Govt. Certified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link 
              to="/our-products" 
              className="bg-[#C95A08] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl font-bold hover:bg-orange-700 transition shadow-xl flex items-center justify-center gap-2 group"
            >
              View Products <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={onOpenQuote} 
              className="bg-transparent border-2 border-white text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-lg text-base sm:text-lg md:text-xl font-bold hover:bg-white/15 transition flex items-center justify-center shadow-lg"
            >
              Bulk Quote
            </button>
          </div>
        </div>

        {/* Right Box: Value Proposition & Tagline */}
        <div className="flex flex-col items-start md:items-end mt-8 md:mt-0 pt-8 md:pt-0 border-t border-white/15 md:border-t-0 w-full md:w-auto text-left md:text-right max-w-lg lg:max-w-xl">
          <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-3 md:mb-4 leading-tight drop-shadow-lg">
            Quality, Reliability<br className="hidden sm:inline" /> & Innovation
          </p>
          <div className="w-16 sm:w-20 md:w-24 h-1.5 bg-[#C95A08] mb-4 sm:mb-5 rounded-full shadow-sm"></div>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 font-light italic drop-shadow-md leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            Sustainable Developments for a Greener Tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
