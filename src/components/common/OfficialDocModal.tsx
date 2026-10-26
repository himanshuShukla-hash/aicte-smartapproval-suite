import React from 'react';
import { AshokaEmblem, AicteLogo } from './Emblem';
import { X, Printer, ShieldCheck, ExternalLink, FileText } from 'lucide-react';

export interface OfficialDocContent {
  title: string;
  category: 'REGULATION' | 'POLICY' | 'HANDBOOK' | 'GUIDELINE';
  gazetteRef?: string;
  lastUpdated: string;
  sections: {
    heading: string;
    body: string[];
  }[];
}

interface OfficialDocModalProps {
  doc: OfficialDocContent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OfficialDocModal: React.FC<OfficialDocModalProps> = ({
  doc,
  isOpen,
  onClose
}) => {
  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded border border-slate-300 shadow-2xl overflow-hidden my-6 animate-in fade-in-50">
        
        {/* Top Government Title Bar */}
        <div className="bg-[#002147] text-white px-5 py-3 flex items-center justify-between border-b-2 border-orange-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div>
              <span className="font-bold text-xs sm:text-sm tracking-wide block uppercase">
                {doc.title}
              </span>
              <span className="text-[10px] text-slate-300 font-mono">
                Category: {doc.category} | {doc.gazetteRef || 'Govt of India Gazette Notification'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white/20 text-white text-xs px-2.5 py-1 rounded flex items-center gap-1 border border-white/20"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Document Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6 text-slate-800 text-xs leading-relaxed bg-[#fbfcfd]">
          
          {/* Official Letterhead Header */}
          <div className="text-center border-b border-slate-200 pb-4">
            <div className="flex justify-center items-center gap-4 mb-2">
              <AshokaEmblem className="h-12 w-auto" />
              <AicteLogo className="h-12 w-12" />
            </div>
            <p className="text-[11px] font-bold text-slate-700 uppercase font-serif">
              अखिल भारतीय तकनीकी शिक्षा परिषद (AICTE)
            </p>
            <h2 className="text-sm font-bold uppercase text-[#002147]">
              All India Council for Technical Education
            </h2>
            <p className="text-[10px] text-slate-500">
              Ministry of Education, Government of India | Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
            </p>
            <p className="text-[10px] font-mono text-orange-600 font-semibold mt-1">
              Effective Academic Session: 2027-28 | Last Reviewed: {doc.lastUpdated}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            {doc.sections.map((sec, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded p-4 shadow-2xs space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#002147] border-b border-slate-100 pb-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  {sec.heading}
                </h3>
                <div className="space-y-1.5 text-slate-700 text-[11px]">
                  {sec.body.map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-300 px-5 py-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <span>AICTE Approval Regulatory Framework • Project ID: SIH26262</span>
          <button
            onClick={onClose}
            className="btn-govt-secondary text-xs py-1 px-3"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
};
