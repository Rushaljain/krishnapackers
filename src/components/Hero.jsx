import React from 'react';
import { Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaachkoLogo from './BaachkoLogo';

export default function Hero({ onOpenQuote }) {
  return (
    <section className="relative h-[85vh] flex items-center pb-24 md:pb-16 pt-16">
      <div className="absolute inset-0 bg-[#0B1730] z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=2000" 
            alt="[MEDIA: JUTE / HESSIAN MANUFACTURING PHOTOGRAPH]" 
            className="w-full h-full object-cover opacity-40 mix-blend-multiply"
          />
      </div>
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center justify-between">
        <div className="flex flex-col items-start max-w-3xl text-left">
          <span className="text-[#C95A08] uppercase tracking-[0.2em] text-sm font-bold mb-4">
            Sustaining Industries
          </span>
          
          <div className="mb-6">
            <h1 className="sr-only">Baachko</h1>
            <BaachkoLogo className="h-14 sm:h-18 md:h-22 w-auto text-white drop-shadow-lg" />
          </div>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 font-light drop-shadow-md">
            50 Years of Excellence in Packaging Solutions
          </p>
          
          <div className="flex gap-4 mb-10">
            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs md:text-sm border border-white/20">
              <Award size={16} className="text-[#C95A08]"/> ISO 9001:2015
            </span>
            <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs md:text-sm border border-white/20">
              <ShieldCheck size={16} className="text-[#C95A08]"/> Govt. Certified
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/our-products" className="bg-[#C95A08] text-white px-8 py-3.5 rounded-md text-base md:text-lg font-bold hover:bg-orange-700 transition shadow-lg flex items-center justify-center gap-2">
              View Products <ChevronRight size={20} />
            </Link>
            <button onClick={onOpenQuote} className="bg-transparent border-2 border-white text-white px-8 py-3.5 rounded-md text-base md:text-lg font-bold hover:bg-white/10 transition flex items-center justify-center">
              Bulk Quote
            </button>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-end opacity-90 mt-16 md:mt-0 text-right max-w-sm">
          <p className="text-2xl md:text-3xl text-white font-bold mb-2 leading-tight">
            Quality, Reliability<br/>& Innovation
          </p>
          <div className="w-12 h-1 bg-[#C95A08] mb-3 rounded-full"></div>
          <p className="text-base md:text-lg text-gray-200 font-light italic" style={{ fontFamily: 'Georgia, serif' }}>
            Sustainable Developments for a Greener Tomorrow
          </p>
        </div>
      </div>
    </section>
  );
}
