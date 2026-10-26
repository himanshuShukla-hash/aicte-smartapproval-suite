import React from 'react';
import { AshokaEmblem } from './Emblem';
import { ExternalLink, FileText } from 'lucide-react';

interface PassportSevaFooterProps {
  onOpenDoc: (docKey: string) => void;
}

export const PassportSevaFooter: React.FC<PassportSevaFooterProps> = ({ onOpenDoc }) => {
  return (
    <footer className="w-full bg-[#001733] text-slate-300 text-xs border-t-4 border-orange-500 mt-12 no-print">
      
      {/* Upper Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-slate-700/60">
        
        {/* Column 1: Council Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <AshokaEmblem className="h-8 w-auto text-amber-400" />
            <span>AICTE SmartApproval</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All India Council for Technical Education (AICTE), Ministry of Education, Government of India. Nelson Mandela Marg, Vasant Kunj, New Delhi-110070.
          </p>
          <div className="pt-2 text-[11px] text-amber-300">
            Toll-Free Helpline: 1800-11-2626
          </div>
        </div>

        {/* Column 2: Quick Links (External Official Portals) */}
        <div>
          <h4 className="text-white font-semibold mb-2.5 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">
            Important Portals
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>
              <a 
                href="https://www.india.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                National Portal of India <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="https://www.education.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                Ministry of Education (MoE) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="https://www.digilocker.gov.in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                DigiLocker Verification Portal <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a 
                href="https://www.nbaind.org" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white flex items-center gap-1 transition-colors"
              >
                National Board of Accreditation (NBA) <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Regulatory Policies & Handbooks (Internal Modals) */}
        <div>
          <h4 className="text-white font-semibold mb-2.5 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">
            Regulations & Handbooks
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>
              <button 
                onClick={() => onOpenDoc('aph_handbook')} 
                className="hover:text-white text-left transition-colors flex items-center gap-1 text-slate-400 hover:underline"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                Approval Process Handbook (APH 2027-28)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('regulations_gazette')} 
                className="hover:text-white text-left transition-colors flex items-center gap-1 text-slate-400 hover:underline"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                AICTE Approval Regulations Gazette
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('faculty_norms')} 
                className="hover:text-white text-left transition-colors flex items-center gap-1 text-slate-400 hover:underline"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                Faculty Norms & Pay Scalings
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('anti_ragging')} 
                className="hover:text-white text-left transition-colors flex items-center gap-1 text-slate-400 hover:underline"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                Anti-Ragging Directives & Affidavits
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('barrier_free')} 
                className="hover:text-white text-left transition-colors flex items-center gap-1 text-slate-400 hover:underline"
              >
                <FileText className="w-3 h-3 text-orange-400" />
                Divyangjan Barrier-Free Standards
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: Portal Policies & Standards */}
        <div>
          <h4 className="text-white font-semibold mb-2.5 text-xs uppercase tracking-wider border-b border-slate-700 pb-1">
            Website Policies
          </h4>
          <ul className="space-y-1.5 text-[11px] text-slate-400">
            <li>
              <button 
                onClick={() => onOpenDoc('terms_conditions')} 
                className="hover:text-white text-left transition-colors hover:underline"
              >
                Terms & Conditions
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('privacy_policy')} 
                className="hover:text-white text-left transition-colors hover:underline"
              >
                Privacy Policy & Data Isolation
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('hyperlinking_policy')} 
                className="hover:text-white text-left transition-colors hover:underline"
              >
                Hyperlinking Policy
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('accessibility_statement')} 
                className="hover:text-white text-left transition-colors hover:underline"
              >
                Accessibility Statement (GIGW Compliant)
              </button>
            </li>
            <li>
              <button 
                onClick={() => onOpenDoc('grievance_redressal')} 
                className="hover:text-white text-left transition-colors hover:underline"
              >
                Help & Grievance Redressal
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Lower Copyright & NIC Credits */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-center text-[11px] text-slate-400 space-y-1">
        <p>
          Portal Designed, Developed and Hosted by <strong>National Informatics Centre (NIC)</strong> / AICTE SmartApproval Team (Project ID: SIH26262 v2.0).
        </p>
        <p className="text-slate-500">
          Contents of this digital platform are managed and owned by All India Council for Technical Education, Government of India.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-[10px]">
          <span>Last Updated: 26-Oct-2026</span>
          <span>•</span>
          <span>Security Audit Passed: STQC Certified</span>
          <span>•</span>
          <span>Browser Compatibility: Chrome, Edge, Firefox, Safari</span>
        </div>
      </div>

    </footer>
  );
};
