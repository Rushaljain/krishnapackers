import React from 'react';
import { Package, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaachkoLogo from './BaachkoLogo';

export default function Footer({ onOpenQuote }) {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Upper Navigation Section (White Background) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 lg:gap-12">
          <div>
            <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-base md:text-lg">Company</h4>
            <ul className="space-y-2.5 md:space-y-3 text-gray-600 text-sm">
              <li><Link to="/about" className="hover:text-amber-700 transition">Company Overview</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-700 transition">Infrastructure</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-amber-700 transition font-medium">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-base md:text-lg">Quick Links</h4>
            <ul className="space-y-2.5 md:space-y-3 text-gray-600 text-sm">
              <li><Link to="/our-products" className="hover:text-amber-700 transition">Product Catalog</Link></li>
              <li><button onClick={onOpenQuote} className="text-amber-700 font-medium hover:text-amber-800 transition text-left">Request a Quote</button></li>
              <li><button onClick={onOpenQuote} className="hover:text-amber-700 transition text-left">Order a Sample</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-base md:text-lg">Contact Us</h4>
            <ul className="space-y-2.5 md:space-y-3 text-gray-600 text-sm">
              <li className="flex items-start gap-2">
                <Phone size={16} className="mt-0.5 text-amber-700 flex-shrink-0" />
                <span className="flex flex-col">
                  <a href="tel:+919324635279" className="hover:text-amber-700 transition">+91 93246 35279</a>
                  <a href="tel:+917303077339" className="hover:text-amber-700 transition">+91 73030 77339</a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Mail size={16} className="mt-0.5 text-amber-700 flex-shrink-0" />
                <a href="mailto:karan.apcotraders@gmail.com" className="hover:text-amber-700 transition break-all">
                  karan.apcotraders@gmail.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 md:mb-4 text-base md:text-lg">Location</h4>
            <div className="flex items-start gap-2 text-gray-600 text-sm">
              <MapPin size={16} className="mt-0.5 text-amber-700 flex-shrink-0" />
              <address className="not-italic leading-relaxed">
                W-234, Khairane Road,<br />
                TTC Industrial Area,<br />
                Khairane MIDC,<br />
                Navi Mumbai - 400705
              </address>
            </div>
          </div>
        </div>
      </div>

      {/* Strictly Marked Section with #C95A08 Background */}
      <div className="bg-[#C95A08] text-white pt-10 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          {/* Logo & Description */}
          <div className="flex flex-col items-center md:items-start max-w-md">
            <div className="flex items-center mb-4">
              <BaachkoLogo className="h-9 md:h-10 w-auto text-white drop-shadow-sm" strokeWidth={2.5} />
            </div>
            <p className="text-white/90 text-sm leading-relaxed max-w-sm">
              Providing dependable industrial packaging solutions, built around your specific requirements since 1974.
            </p>
          </div>

          {/* Copyright & DPDP Act Link */}
          <div className="flex flex-col items-center md:items-end justify-center text-white/90 text-xs md:text-sm gap-2 border-t border-white/20 md:border-t-0 pt-6 md:pt-0 w-full md:w-auto">
            <p className="font-medium text-white">
              © {new Date().getFullYear()} Baachko Pvt. Ltd. All rights reserved.
            </p>
            <div>
              <Link 
                to="/privacy-policy" 
                className="text-white/80 hover:text-white underline transition"
              >
                Privacy Policy (DPDP Act, 2023)
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
