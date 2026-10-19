import React, { useState } from 'react';
import { Menu, X, ChevronDown, Download, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import BaachkoLogo from './BaachkoLogo';

export default function Navbar({ onOpenQuote }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    if (activeMenu === menu) setActiveMenu(null);
    else setActiveMenu(menu);
  };

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 h-20 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 order-2 md:order-1">
          <img src="/Logo_Favicon.png" alt="Baachko Logo" className="h-10 w-auto" />
          <BaachkoLogo className="h-7 md:h-8 w-auto text-[#0B1730]" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 font-medium order-2">
          <Link to="/" className="hover:text-amber-700 transition">Home</Link>
          <div className="relative group">
            <Link to="/products" className="flex items-center gap-1 hover:text-amber-700 transition py-4">
              Products <ChevronDown size={16} />
            </Link>
            <div className="absolute left-0 top-[90%] hidden group-hover:flex flex-col bg-white border border-gray-100 shadow-xl rounded-md w-56 py-2">
              <Link to="/products#kraft-paper-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">Kraft Paper Bags</Link>
              <Link to="/products#pp-woven-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">PP Woven Bags</Link>
              <Link to="/products#multiwall-valve-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">Multiwall & Valve Bags</Link>
              <Link to="/products#hdpe-bopp-laminated-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">HDPE & BOPP Laminated Bags</Link>
              <Link to="/products#jute-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">Jute Bags</Link>
              <Link to="/products#fibc-jumbo-bags" className="px-4 py-2 hover:bg-amber-50 hover:text-amber-700 transition">FIBC / Jumbo Bags</Link>
              <div className="border-t border-gray-100 mt-2 pt-2">
                <Link to="/our-products" className="px-4 py-2 hover:bg-amber-50 text-amber-700 font-bold transition block">View All Products &rarr;</Link>
              </div>
            </div>
          </div>
          <Link to="/about" className="hover:text-amber-700 transition">About Us</Link>

          <button 
            onClick={onOpenQuote}
            className="bg-amber-700 text-white px-6 py-2 rounded-md hover:bg-amber-800 transition font-semibold shadow-sm"
          >
            Request Quote
          </button>
        </nav>

        {/* Mobile Hamburger Icon */}
        <button className="md:hidden p-2 order-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Hamburger Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-xl pb-4 rounded-b-2xl">
          <div className="flex flex-col px-4 py-2">
            
            <Link 
              to="/" 
              className="block py-4 text-lg font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              to="/about" 
              className="block py-4 text-lg font-medium border-b border-gray-100" 
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>

            <div className="border-b border-gray-100">
              <button 
                onClick={() => toggleMenu('products')}
                className="flex justify-between items-center w-full py-4 text-lg font-medium"
              >
                Product Catalog <ChevronDown size={20} className={`transform transition ${activeMenu === 'products' ? 'rotate-180' : ''}`} />
              </button>
              {activeMenu === 'products' && (
                <div className="pl-4 pb-4 flex flex-col gap-3 text-gray-600">
                  <Link to="/products#kraft-paper-bags" onClick={() => setIsMenuOpen(false)}>Kraft Paper Bags</Link>
                  <Link to="/products#pp-woven-bags" onClick={() => setIsMenuOpen(false)}>PP Woven Bags</Link>
                  <Link to="/products#multiwall-valve-bags" onClick={() => setIsMenuOpen(false)}>Multiwall & Valve Bags</Link>
                  <Link to="/products#hdpe-bopp-laminated-bags" onClick={() => setIsMenuOpen(false)}>HDPE & BOPP Laminated Bags</Link>
                  <Link to="/products#jute-bags" onClick={() => setIsMenuOpen(false)}>Jute Bags</Link>
                  <Link to="/products#fibc-jumbo-bags" onClick={() => setIsMenuOpen(false)}>FIBC / Jumbo Bags</Link>
                  <Link to="/our-products" onClick={() => setIsMenuOpen(false)} className="text-amber-700 font-bold pt-2 mt-2 border-t border-gray-100 block">View All Products &rarr;</Link>
                </div>
              )}
            </div>

            <button 
              onClick={() => {
                onOpenQuote();
                setIsMenuOpen(false);
              }} 
              className="block w-full text-left py-4 text-lg font-medium border-b border-gray-100"
            >
              Request Quote
            </button>
            

          </div>
        </div>
      )}
    </header>
  );
}
