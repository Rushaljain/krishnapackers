import React from 'react';
import { Quote } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Baachko has been our sole supplier for packaging for over a decade. Their consistency in quality and adherence to delivery timelines is unmatched in the industry.",
      author: "Procurement Director",
      company: "National Agri-Corp Ltd."
    },
    {
      quote: "Finding high-quality, dependable packaging without contamination was a challenge until we partnered with Baachko. Excellent quality control.",
      author: "Supply Chain Manager",
      company: "Global Coffee Exports"
    },
    {
      quote: "Their valve bags have completely streamlined our cement packaging process. The strength and durability ensure minimal breakage during tough transport conditions.",
      author: "Operations Head",
      company: "Prime Build Materials"
    },
    {
      quote: "We require specific moisture barriers for our chemical powders, and Baachko developed a custom laminated solution that perfectly fits our rigorous requirements.",
      author: "Plant Manager",
      company: "ChemCore Industries"
    }
  ];

  return (
    <section className="py-20 bg-gray-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4">
         <div className="text-center mb-16">
          <h2 className="text-3xl font-bold">Trusted by Industry Leaders</h2>
          <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full"></div>
        </div>
        
        <div className="relative">
          <div className="flex gap-4 md:gap-6 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {testimonials.map((t, idx) => (
              <div key={idx} className="w-[85vw] sm:w-[350px] md:w-[450px] lg:w-[500px] snap-center flex-shrink-0 bg-gray-800 p-8 rounded-xl relative border border-gray-700 hover:border-amber-700 transition duration-300">
                <Quote className="absolute top-4 right-4 text-gray-700 opacity-30 h-16 w-16" />
                <p className="text-base md:text-lg text-gray-300 italic mb-8 relative z-10 line-clamp-4">"{t.quote}"</p>
                <div className="mt-auto">
                  <p className="font-bold text-amber-500">{t.author}</p>
                  <p className="text-gray-400 text-sm">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Scroll hint gradient for desktop */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none hidden md:block" />
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
    </section>
  );
}
