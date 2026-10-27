import React from 'react';
import { Package, Phone, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaachkoLogo from './BaachkoLogo';

export default function Footer({ onOpenQuote }) {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
        
        {/* Quick Links Left - 2 Columns on Mobile, 4 Columns on Large Screens */}
        <div className="md:col-span-8 lg:col-span-9 grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
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

        {/* Logo Right */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col items-start md:items-end md:text-right border-t md:border-t-0 pt-8 md:pt-0">
           <div className="flex items-center mb-4">
              <BaachkoLogo className="h-8 md:h-9 w-auto text-[#0B1730]" />
            </div>
            <p className="text-gray-500 text-sm max-w-xs">
              Providing dependable industrial packaging solutions, built around your specific requirements since 1974.
            </p>
        </div>

      </div>
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-500 text-sm border-t border-gray-100 pt-8 gap-4">
        <p>© {new Date().getFullYear()} Baachko Pvt. Ltd. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-gray-500">
          <Link to="/privacy-policy" className="hover:text-amber-700 transition">Privacy Policy (DPDP Act, 2023)</Link>
        </div>
      </div>
    </footer>
  );
}
