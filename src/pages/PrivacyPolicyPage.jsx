import React from 'react';
import { ShieldCheck, Mail, MapPin, Lock, FileText, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 font-semibold mb-8 transition">
          <ArrowLeft size={18} className="mr-2" /> Back to Home
        </Link>

        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-8 md:p-10 shadow-sm border border-gray-200 mb-10">
          <div className="flex items-center gap-3 text-amber-700 mb-3 font-semibold text-sm uppercase tracking-wider">
            <ShieldCheck size={20} />
            <span>Digital Personal Data Protection (DPDP) Act, 2023 Compliant</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-950 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 leading-relaxed text-sm md:text-base">
            At <strong>Baachko Pvt. Ltd.</strong>, we are committed to protecting your privacy and ensuring the security of your personal data. This Privacy Policy details how we collect, use, store, and safeguard your personal information in full compliance with India’s <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong>.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap justify-between text-xs text-gray-500">
            <span>Data Fiduciary: <strong>Baachko Pvt. Ltd.</strong></span>
            <span>Effective Date: October 2026</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-200 space-y-10 text-gray-700 text-sm md:text-base leading-relaxed">
          
          {/* Section 1: Introduction & Definitions */}
          <section className="space-y-3">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <FileText className="text-amber-700 flex-shrink-0" size={22} />
              1. Scope & Application
            </h2>
            <p>
              This policy applies to all visitors, prospective clients, commercial partners, and users ("Data Principals") accessing our website (<code>www.krishnapackers.co.in</code>) or interacting with our industrial packaging sales team.
            </p>
            <p>
              <strong>Baachko Pvt. Ltd.</strong> operates as the <strong>Data Fiduciary</strong> under the DPDP Act, 2023, determining the purpose and means of processing personal data collected through our digital forms and inquiries.
            </p>
          </section>

          {/* Section 2: Data We Collect */}
          <section className="space-y-3 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <UserCheck className="text-amber-700 flex-shrink-0" size={22} />
              2. Personal Data We Collect
            </h2>
            <p>
              We collect personal data that you voluntarily provide to us when submitting quotation forms ("Request Bulk Quote", RFQ Forms, or Sample Requests). This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-600">
              <li><strong>Contact Identification:</strong> Full Name / Contact Person Name</li>
              <li><strong>Business Information:</strong> Company Name & Industry Sector</li>
              <li><strong>Communication Details:</strong> Email Address & Phone / Mobile Number</li>
              <li><strong>Inquiry Details:</strong> Required Bag Type, Target SKU, Quantity, Packaging Specifications, and Custom Messages</li>
            </ul>
          </section>

          {/* Section 3: Purpose of Data Processing */}
          <section className="space-y-3 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <Lock className="text-amber-700 flex-shrink-0" size={22} />
              3. Purpose & Legal Basis of Data Processing
            </h2>
            <p>
              Under Section 6 & 7 of the DPDP Act, 2023, we process your personal data strictly for specified, lawful commercial purposes based on your explicit consent or legitimate use:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-600">
              <li><strong>Quotation & Order Processing:</strong> To evaluate packaging specifications, generate commercial quotes, send samples, and fulfill industrial orders.</li>
              <li><strong>Client Communication:</strong> To respond to your technical inquiries, coordinate delivery schedules, and provide customer support.</li>
              <li><strong>Regulatory Compliance:</strong> To maintain tax, commercial, and legal records as mandated under Indian law.</li>
            </ul>
            <p className="text-xs text-gray-500 bg-amber-50 p-4 rounded-xl border border-amber-100">
              <strong>Consent Notice:</strong> By submitting any form on our website, you provide explicit consent to Baachko Pvt. Ltd. to process your contact details for responding to your quotation request.
            </p>
          </section>

          {/* Section 4: Data Security & Storage */}
          <section className="space-y-3 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <ShieldCheck className="text-amber-700 flex-shrink-0" size={22} />
              4. Data Protection & Storage Security
            </h2>
            <p>
              We implement robust technical and organizational security measures to protect your personal data against unauthorized access, loss, alteration, or disclosure:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-gray-600">
              <li><strong>Secure Cloud Infrastructure:</strong> Inquiry lead data is stored in encrypted databases hosted on secure cloud servers (Supabase) with Row-Based Security Policies (RLS) and strict access controls.</li>
              <li><strong>Access Control:</strong> Only authorized sales and administrative personnel have password-authenticated access to process lead inquiries.</li>
              <li><strong>No Data Selling:</strong> We DO NOT sell, rent, or trade your personal information to third-party advertisers or data brokers.</li>
            </ul>
          </section>

          {/* Section 5: Data Principal Rights (DPDP Act, 2023) */}
          <section className="space-y-3 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <UserCheck className="text-amber-700 flex-shrink-0" size={22} />
              5. Your Rights as a Data Principal
            </h2>
            <p>
              In accordance with Chapter III of the Digital Personal Data Protection Act, 2023, you hold the following rights regarding your personal data:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-blue-950 text-sm mb-1">Right to Access Summary</h4>
                <p className="text-xs text-gray-600">Request a summary of your personal data being processed by us.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-blue-950 text-sm mb-1">Right to Correction & Erasure</h4>
                <p className="text-xs text-gray-600">Request correction of inaccurate data or complete deletion of your records.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-blue-950 text-sm mb-1">Right to Withdraw Consent</h4>
                <p className="text-xs text-gray-600">Withdraw your consent for communications at any time by contacting our officer.</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h4 className="font-bold text-blue-950 text-sm mb-1">Right to Grievance Redressal</h4>
                <p className="text-xs text-gray-600">Lodge a grievance with our designated Data Protection Officer regarding data handling.</p>
              </div>
            </div>
          </section>

          {/* Section 6: Grievance Redressal Officer */}
          <section className="space-y-4 pt-6 border-t border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-blue-950 flex items-center gap-2">
              <Mail className="text-amber-700 flex-shrink-0" size={22} />
              6. Data Protection Officer & Grievance Redressal
            </h2>
            <p>
              If you wish to exercise your rights under the DPDP Act, 2023, request data erasure, or have any grievances regarding your personal data, please reach out to our designated Data Protection Officer:
            </p>
            
            <div className="bg-blue-950 text-white p-6 rounded-2xl shadow-sm space-y-3">
              <h3 className="font-bold text-lg text-amber-400">Grievance Redressal Officer</h3>
              <p className="text-sm text-gray-200 font-semibold">Baachko Pvt. Ltd.</p>
              <div className="space-y-2 text-xs md:text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-amber-400 flex-shrink-0" />
                  <span>karan.apcotraders@gmail.com</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <span>W-234, Khairane Road, TTC Industrial Area, Khairane MIDC, Navi Mumbai - 400705, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
