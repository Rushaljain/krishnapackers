import React from 'react';
import { 
  ArrowRight, Image as ImageIcon, ShieldCheck, CheckCircle, 
  Settings, Users, Calendar, Briefcase, Box, Globe, Package, HeartHandshake,
  Download, ArrowDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MediaPlaceholder = ({ title, subtitle, className = "" }) => (
  <div className={`bg-gray-200 flex flex-col items-center justify-center border-2 border-dashed border-gray-400 p-6 text-center ${className}`}>
    <ImageIcon className="h-10 w-10 text-gray-500 mb-3" />
    <span className="text-gray-800 font-semibold text-sm uppercase tracking-wider">{title}</span>
    {subtitle && <span className="text-gray-500 text-xs mt-1">{subtitle}</span>}
  </div>
);

export default function AboutUsPage() {
  return (
    <div className="pt-20 bg-gray-50 min-h-screen font-sans text-gray-900">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">About Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-blue-950 leading-tight">
              Packaging built for a stronger tomorrow.
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Krishnna Makali Global Pvt. Ltd. is an industrial packaging company focused on delivering reliable, high-quality packaging solutions to businesses across diverse industries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/products" className="bg-orange-600 text-white px-8 py-3 rounded text-center font-bold hover:bg-orange-700 transition shadow-md flex items-center justify-center gap-2">
                Request a Quote <ArrowRight size={18} />
              </Link>
              <a href="#company-at-a-glance" className="bg-white text-blue-900 border border-blue-200 px-8 py-3 rounded text-center font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2">
                Learn More <ArrowDown size={18} />
              </a>
            </div>
          </div>
          
          {/* Right Media */}
          <div className="relative">
            <MediaPlaceholder 
              title="FACTORY / PRODUCTION FLOOR PHOTOGRAPH" 
              subtitle="(Replace with actual image)"
              className="h-80 md:h-[500px] w-full rounded-lg"
            />
            {/* Credibility Strip */}
            <div className="md:absolute md:-bottom-6 md:left-8 md:right-8 bg-blue-950 text-white p-6 rounded-lg shadow-xl grid grid-cols-3 gap-4 text-center mt-4 md:mt-0">
              <div className="flex flex-col items-center">
                <Box className="h-6 w-6 text-orange-400 mb-2" />
                <span className="text-xs md:text-sm font-semibold">Reliable Products</span>
              </div>
              <div className="flex flex-col items-center border-l border-blue-800">
                <ShieldCheck className="h-6 w-6 text-orange-400 mb-2" />
                <span className="text-xs md:text-sm font-semibold">Consistent Quality</span>
              </div>
              <div className="flex flex-col items-center border-l border-blue-800">
                <Users className="h-6 w-6 text-orange-400 mb-2" />
                <span className="text-xs md:text-sm font-semibold">Long-Term Partnerships</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPANY AT A GLANCE */}
      <section id="company-at-a-glance" className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">Company at a Glance</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 leading-tight">
              Built on experience. Focused on industrial packaging.
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              We provide industrial packaging solutions for a wide range of demanding applications and industries, combining experience, quality and a customer-first approach.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-8 w-8 text-blue-900 mb-3" />
              <span className="text-3xl font-extrabold text-gray-900">1974</span>
              <span className="text-sm text-gray-500 font-medium mt-1">Year Founded</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-blue-900 mb-3" />
              <span className="text-3xl font-extrabold text-gray-900">50+</span>
              <span className="text-sm text-gray-500 font-medium mt-1">Years of Experience</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-blue-900 mb-3" />
              <span className="text-3xl font-extrabold text-gray-900">10+</span>
              <span className="text-sm text-gray-500 font-medium mt-1">Products</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Briefcase className="h-8 w-8 text-blue-900 mb-3" />
              <span className="text-3xl font-extrabold text-gray-900">6+</span>
              <span className="text-sm text-gray-500 font-medium mt-1">Industries Served</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. OUR STORY */}
      <section className="bg-gray-50 py-16 md:py-24 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="order-2 md:order-1">
            <MediaPlaceholder 
              title="HISTORICAL / FOUNDERS IMAGE" 
              subtitle="(Replace with actual image)"
              className="h-64 md:h-full w-full rounded-lg min-h-[300px]"
            />
          </div>
          
          <div className="space-y-8 order-1 md:order-2 flex flex-col justify-center">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-2 mb-6">
                From experience to a focused future.
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Krishnna Makali Global is backed by the knowledge and experience developed through <strong>Krishna Packers</strong> and <strong>Apco Traders</strong>.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Over the years, these businesses have provided valuable exposure to packaging, products, customers and commercial operations. This foundation has helped shape our understanding of what businesses expect from a dependable packaging partner.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Today, Krishnna Makali Global continues this journey with a dedicated focus on industrial packaging solutions and a vision for developing long-term business relationships.
              </p>
            </div>

            {/* Timeline */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col">
                <span className="font-bold text-blue-950">Krishna Packers</span>
                <span className="text-xs text-gray-500">Early operations</span>
              </div>
              <ArrowRight className="text-orange-500 hidden sm:block" size={20} />
              <div className="flex flex-col border-l-2 sm:border-l-0 border-orange-200 pl-4 sm:pl-0 ml-2 sm:ml-0">
                <span className="font-bold text-blue-950">Apco Traders</span>
                <span className="text-xs text-gray-500">Expanded experience</span>
              </div>
              <ArrowRight className="text-orange-500 hidden sm:block" size={20} />
              <div className="flex flex-col border-l-2 sm:border-l-0 border-orange-500 pl-4 sm:pl-0 ml-2 sm:ml-0">
                <span className="font-bold text-blue-950">Krishnna Makali Global</span>
                <span className="text-xs text-gray-500">A focused packaging business</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHAT WE BELIEVE */}
      <section className="bg-blue-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">What We Believe</span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-blue-950 mt-2 leading-tight">
                Packaging should work as hard as the product it carries.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-gray-600 text-lg border-l-4 border-orange-500 pl-6 py-2">
                We are guided by a simple belief — industrial packaging plays a vital role in protecting products, improving handling efficiency and maintaining consistency throughout the supply chain.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col">
              <ShieldCheck className="h-8 w-8 text-blue-800 mb-4" />
              <h3 className="text-lg font-bold text-blue-950 mb-2">QUALITY</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Consistent specifications and dependable performance.</p>
            </div>
            <div className="flex flex-col">
              <Settings className="h-8 w-8 text-blue-800 mb-4" />
              <h3 className="text-lg font-bold text-blue-950 mb-2">RELIABILITY</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Packaging customers can depend on, order after order.</p>
            </div>
            <div className="flex flex-col">
              <Box className="h-8 w-8 text-blue-800 mb-4" />
              <h3 className="text-lg font-bold text-blue-950 mb-2">PRACTICALITY</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Solutions designed around real-world application needs.</p>
            </div>
            <div className="flex flex-col">
              <HeartHandshake className="h-8 w-8 text-blue-800 mb-4" />
              <h3 className="text-lg font-bold text-blue-950 mb-2">PARTNERSHIP</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Long-term relationships built through consistency and transparency.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. OUR EXPERTISE */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">Our Expertise</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-2">
                Industrial packaging for real-world applications.
              </h2>
            </div>
            <div className="flex items-center">
              <p className="text-gray-600 text-lg">
                Our expertise is focused on industrial packaging solutions designed for a wide range of industries and requirements.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="group cursor-pointer">
              <MediaPlaceholder 
                title="JUTE BAGS PRODUCT IMAGE" 
                subtitle="(Replace with actual image)"
                className="h-64 w-full rounded-t-lg border-b-0"
              />
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-b-lg group-hover:bg-gray-100 transition">
                <h3 className="font-bold text-blue-950 text-center">Jute Bags</h3>
              </div>
            </div>
            <div className="group cursor-pointer">
              <MediaPlaceholder 
                title="HESSIAN CLOTH IMAGE" 
                subtitle="(Replace with actual image)"
                className="h-64 w-full rounded-t-lg border-b-0"
              />
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-b-lg group-hover:bg-gray-100 transition">
                <h3 className="font-bold text-blue-950 text-center">Hessian Cloth</h3>
              </div>
            </div>
            <div className="group cursor-pointer">
              <MediaPlaceholder 
                title="INDUSTRIAL PACKAGING IMAGE" 
                subtitle="(Replace with actual image)"
                className="h-64 w-full rounded-t-lg border-b-0"
              />
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-b-lg group-hover:bg-gray-100 transition">
                <h3 className="font-bold text-blue-950 text-center">Industrial Packaging</h3>
              </div>
            </div>
            <div className="group cursor-pointer">
              <MediaPlaceholder 
                title="CUSTOM SOLUTIONS IMAGE" 
                subtitle="(Replace with actual image)"
                className="h-64 w-full rounded-t-lg border-b-0"
              />
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-b-lg group-hover:bg-gray-100 transition">
                <h3 className="font-bold text-blue-950 text-center">Custom Solutions</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW WE WORK */}
      <section className="bg-gray-50 py-16 md:py-24 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div>
              <span className="text-orange-600 font-bold uppercase tracking-widest text-sm">How We Work</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-950 mt-2 mb-4 leading-tight">
                Understanding needs.<br/>Delivering consistently.
              </h2>
              <p className="text-gray-600 text-lg">
                We take a structured and practical approach to ensure our packaging solutions meet the specific requirements of each customer.
              </p>
            </div>

            <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 relative">
              <div className="hidden md:block absolute top-6 left-6 right-6 h-0.5 bg-gray-200 -z-10"></div>
              
              <div className="flex flex-row md:flex-col gap-4 md:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-blue-900 bg-white flex items-center justify-center font-bold text-blue-900 shrink-0">01</div>
                <div>
                  <h4 className="font-bold text-blue-950 mb-1">Understand</h4>
                  <p className="text-sm text-gray-600">Application, handling and storage needs.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-4 md:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-blue-900 bg-white flex items-center justify-center font-bold text-blue-900 shrink-0">02</div>
                <div>
                  <h4 className="font-bold text-blue-950 mb-1">Specify</h4>
                  <p className="text-sm text-gray-600">Dimensions, material and performance requirements.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-4 md:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-blue-900 bg-white flex items-center justify-center font-bold text-blue-900 shrink-0">03</div>
                <div>
                  <h4 className="font-bold text-blue-950 mb-1">Produce</h4>
                  <p className="text-sm text-gray-600">Consistent manufacturing against specifications.</p>
                </div>
              </div>

              <div className="flex flex-row md:flex-col gap-4 md:gap-4 relative z-10">
                <div className="w-12 h-12 rounded-full border-2 border-blue-900 bg-white flex items-center justify-center font-bold text-blue-900 shrink-0">04</div>
                <div>
                  <h4 className="font-bold text-blue-950 mb-1">Deliver</h4>
                  <p className="text-sm text-gray-600">Dependable packaging, order after order.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full">
            <MediaPlaceholder 
              title="QUALITY INSPECTION / MANUFACTURING IMAGE" 
              subtitle="(Replace with actual image)"
              className="h-80 md:h-full w-full rounded-lg min-h-[400px]"
            />
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="relative bg-blue-950 py-20">
        <div className="absolute inset-0 opacity-20">
          <MediaPlaceholder 
            title="FINISHED PACKAGING / WAREHOUSE PHOTOGRAPH" 
            className="w-full h-full border-0 bg-transparent text-white"
          />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <span className="text-orange-400 font-bold uppercase tracking-widest text-sm mb-2 block">Let's Partner</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
            Looking for a reliable packaging partner?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Let's discuss your packaging requirements.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="bg-orange-600 text-white px-8 py-4 rounded font-bold hover:bg-orange-700 transition flex items-center justify-center gap-2">
              Request a Quote <ArrowRight size={18} />
            </Link>
            <Link to="/products" className="bg-transparent border-2 border-white text-white px-8 py-4 rounded font-bold hover:bg-white/10 transition flex items-center justify-center">
              View Products
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
