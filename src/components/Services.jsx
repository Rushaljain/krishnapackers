import React from 'react';
import { Settings, ShieldCheck, PaintBucket, Droplets, Droplet, Zap, Maximize, Target, Lock } from 'lucide-react';

// Helper to provide an icon if we miss one
const Layers = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
);

const services = [
  { name: "Inner PE Liner", icon: <ShieldCheck size={24} className="text-amber-700" /> },
  { name: "Outer Coating", icon: <Layers size={24} className="text-amber-700" /> },
  { name: "Custom Printing", icon: <PaintBucket size={24} className="text-amber-700" /> },
  { name: "Multi-Color Options", icon: <Droplets size={24} className="text-amber-700" /> },
  { name: "Secure Closures", icon: <Lock size={24} className="text-amber-700" /> },
  { name: "Custom Bottom Types", icon: <Maximize size={24} className="text-amber-700" /> },
  { name: "Moisture Resistance", icon: <Droplet size={24} className="text-amber-700" /> },
  { name: "Food Grading", icon: <Target size={24} className="text-amber-700" /> },
  { name: "Burst Strength Testing", icon: <Zap size={24} className="text-amber-700" /> },
];

export default function Services() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 mb-10">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Services & Customizations</h2>
          <div className="w-24 h-1 bg-amber-700 mx-auto mt-4 rounded-full mb-4"></div>
          <p className="text-gray-600">Tailored packaging solutions manufactured to your exact specifications.</p>
        </div>
      </div>

      {/* Marquee Wrapper */}
      <div className="relative flex overflow-hidden group">
        
        {/* We animate this entire container by -50%. It contains TWO copies of the list so it loops seamlessly. */}
        <div className="animate-marquee whitespace-nowrap py-4 flex items-center group-hover:[animation-play-state:paused] pr-8">
          {[...services, ...services].map((svc, idx) => (
            <div key={idx} className="flex items-center gap-3 px-8 border-r border-gray-300 last:border-r-0 hover:bg-amber-50 rounded-lg p-2 transition cursor-default">
              <div className="bg-white p-2 shadow-sm rounded-full border border-gray-100">
                {svc.icon}
              </div>
              <span className="text-lg font-bold text-gray-800">{svc.name}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
