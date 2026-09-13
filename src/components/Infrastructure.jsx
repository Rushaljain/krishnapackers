import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const facilities = [
  { id: 1, img: "/factory/1000197409.jpg", title: "Manufacturing Facility" },
  { id: 2, img: "/factory/1000197411.jpg", title: "Production Line" },
  { id: 3, img: "/factory/1000197412.jpg", title: "Warehouse & Logistics" },
  { id: 4, img: "/factory/factory4.png", title: "Packaging Division" },
  { id: 5, img: "/factory/factory5.png", title: "Quality Inspection" }
];

export default function Infrastructure() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % facilities.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? facilities.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % facilities.length);
  };

  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNext();
    } else if (touchStartX.current - touchEndX.current < -50) {
      handlePrev();
    }
    setIsPaused(false);
  };

  return (
    <section className="pt-20 pb-20 bg-[#F7F8FA] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#0B1730] tracking-tight uppercase">Our Infrastructure</h2>
        <p className="text-slate-600 mt-3 text-lg md:text-xl font-light">Built to Deliver at Scale</p>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <div 
          className="relative w-full h-[300px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {facilities.map((facility, index) => (
            <div
              key={facility.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img 
                src={facility.img} 
                alt={facility.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 w-full p-6 md:p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <p className="text-white text-xl md:text-2xl font-bold">{facility.title}</p>
              </div>
            </div>
          ))}

          {/* Navigation Controls */}
          <button 
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 md:p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {facilities.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-amber-500 w-8' : 'bg-white/50 hover:bg-white/80'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
