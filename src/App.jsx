import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import OurProductsPage from './pages/OurProductsPage';
import IndustryPage from './pages/IndustryPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import AboutUsPage from './pages/AboutUsPage';
import ScrollToTop from './components/ScrollToTop';
import QuoteModal from './components/QuoteModal';
import GalleryPage from './pages/GalleryPage';

// Admin Imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import LeadsPage from './pages/admin/LeadsPage';

function PublicLayout({ onOpenQuote }) {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800 flex flex-col">
      <Navbar onOpenQuote={onOpenQuote} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer onOpenQuote={onOpenQuote} />
    </div>
  );
}

export default function App() {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const handleOpenQuote = () => setIsQuoteModalOpen(true);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Admin Routes */}
        <Route path="/adminpanel/login" element={<AdminLogin />} />
        <Route path="/adminpanel" element={<AdminLayout />}>
          <Route index element={<LeadsPage />} />
          <Route path="leads" element={<LeadsPage />} />
        </Route>

        {/* Public Routes */}
        <Route path="/" element={<PublicLayout onOpenQuote={handleOpenQuote} />}>
          <Route index element={<HomePage onOpenQuote={handleOpenQuote} />} />
          <Route path="about" element={<AboutUsPage />} />
          <Route path="products" element={<CatalogPage />} />
          <Route path="our-products" element={<OurProductsPage />} />
          <Route path="industry/:industryId" element={<IndustryPage />} />
          <Route path="product/:id" element={<ProductDetailsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
        </Route>
      </Routes>

      <QuoteModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </Router>
  );
}
