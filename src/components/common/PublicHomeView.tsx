import React, { useState } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Search, 
  Calculator, 
  Building2, 
  FileCheck2, 
  AlertCircle, 
  Clock, 
  Download, 
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Award,
  Users,
  CheckSquare
} from 'lucide-react';
import { Application } from '../../types/api';

interface PublicHomeViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
  applications: Application[];
  onSelectApplication: (appId: string) => void;
}

export const PublicHomeView: React.FC<PublicHomeViewProps> = ({
  onNavigateTab,
  onOpenAuth,
  applications,
  onSelectApplication
}) => {
  const [trackQuery, setTrackQuery] = useState('');
  const [trackResult, setTrackResult] = useState<Application | null | 'not_found'>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackQuery.trim()) return;
    const found = applications.find(a => 
      a.applicationId.toLowerCase() === trackQuery.trim().toLowerCase() ||
      (a.institutionName && a.institutionName.toLowerCase().includes(trackQuery.trim().toLowerCase()))
    );
    setTrackResult(found || 'not_found');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* 3-COLUMN PASSPORT SEVA LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: PASSPORT SEVA ACTION CARDS (lg:col-span-3) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-3">
          
          {/* Card 1: New Institution Registration (Orange Header) */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              New User Registration
            </div>
            <div className="p-3 text-xs space-y-2">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                First time applicants or newly established institutions register to acquire login credentials.
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                Register Now
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Existing User Login (Navy Blue Header) */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#002147] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <LogIn className="w-4 h-4 text-amber-400" />
              Existing User Login
            </div>
            <div className="p-3 text-xs space-y-2">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Authorized Institution Officials, Regional Reviewers & Council Administrators sign in.
              </p>
              <button
                onClick={onOpenAuth}
                className="w-full bg-[#002147] hover:bg-[#0a366b] text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                Login to Portal
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Track Application Status (Emerald Header) */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-emerald-700 text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              Track Application Status
            </div>
            <div className="p-3 text-xs space-y-2.5">
              <p className="text-slate-600 text-[11px]">
                Enter Application Ref ID (e.g. <span className="font-mono text-blue-900 font-bold">AICTE-2027-DL-001</span>):
              </p>
              <form onSubmit={handleTrack} className="space-y-2">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="AICTE-2027-DL-001"
                  className="w-full govt-input text-xs uppercase font-mono"
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 px-3 rounded text-xs flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Search className="w-3.5 h-3.5" />
                  Track Status
                </button>
              </form>

              {trackResult === 'not_found' && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-700">
                  Application record not found. Please verify the Application ID.
                </div>
              )}

              {trackResult && trackResult !== 'not_found' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-xs space-y-1">
                  <p className="font-bold text-blue-950 truncate">{trackResult.applicationId}</p>
                  <p className="text-[11px] text-slate-700 truncate">{trackResult.institutionName}</p>
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-blue-200">
                    <span className="font-semibold text-slate-600">Status:</span>
                    <span className="font-bold text-emerald-800 uppercase">{trackResult.status}</span>
                  </div>
                  <button
                    onClick={() => onSelectApplication(trackResult.applicationId)}
                    className="w-full mt-1.5 text-center text-[11px] text-blue-700 hover:underline font-bold"
                  >
                    View Application Details →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Utility Links (Passport Seva Style) */}
          <div className="bg-white border border-slate-300 rounded shadow-xs p-3 text-xs space-y-2">
            <h4 className="font-bold text-[#002147] text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1">
              Information & Tools
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button 
                  onClick={() => onNavigateTab('aph_rules')}
                  className="text-blue-800 hover:text-orange-600 flex items-center gap-1.5 font-medium"
                >
                  <Calculator className="w-3.5 h-3.5 text-slate-500" />
                  APH 2027 Norms & Ratio Rules
                </button>
              </li>
              <li>
                <a href="#deadlines" className="text-blue-800 hover:text-orange-600 flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Approval Calendar 2027-28
                </a>
              </li>
              <li>
                <a href="#helpline" className="text-blue-800 hover:text-orange-600 flex items-center gap-1.5 font-medium">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Locate AICTE Regional Offices
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ======================================================== */}
        {/* CENTER COLUMN: MAIN SHOWCASE & SERVICES (lg:col-span-6) */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-[#002147] to-[#0B3C5D] text-white p-5 rounded border-2 border-orange-500 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-12 -mt-12 pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4" />
              National Technical Education Portal
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black leading-snug tracking-tight mb-2">
              AICTE SmartApproval Suite (SIH26262)
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
              A centralized digital platform designed to streamline AICTE-related approval workflows, automate deterministic APH compliance calculations, enforce institutional isolation, and eliminate manual scrutiny bottlenecks.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => onNavigateTab('institution_applications')}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <FileCheck2 className="w-4 h-4" />
                Go to Institution Portal
              </button>
              <button
                onClick={() => onNavigateTab('aph_rules')}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded text-xs border border-white/30 transition-colors"
              >
                Inspect APH 2027 Rules
              </button>
            </div>
          </div>

          {/* 4-Step Approval Lifecycle Pipeline */}
          <div className="bg-white border border-slate-300 rounded shadow-xs p-4">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              How the Approval Lifecycle Works
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="w-5 h-5 bg-[#002147] text-white rounded-full inline-flex items-center justify-center font-bold text-[10px] mr-2">1</span>
                <span className="font-bold text-[#002147]">Application Draft & Pre-Check</span>
                <p className="text-slate-600 text-[11px] mt-1 pl-7">
                  Institutions provide student intake, land acres, faculty cadre, and built-up area. Automated APH rules execute instantaneous pre-checks.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="w-5 h-5 bg-[#002147] text-white rounded-full inline-flex items-center justify-center font-bold text-[10px] mr-2">2</span>
                <span className="font-bold text-[#002147]">Server-Validated Submission</span>
                <p className="text-slate-600 text-[11px] mt-1 pl-7">
                  Submission runs strict prerequisite checks and persists an immutable compliance snapshot with optimistic concurrency locks.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="w-5 h-5 bg-[#002147] text-white rounded-full inline-flex items-center justify-center font-bold text-[10px] mr-2">3</span>
                <span className="font-bold text-[#002147]">Scrutiny & Rectification</span>
                <p className="text-slate-600 text-[11px] mt-1 pl-7">
                  Authorized reviewers verify documents and raise structured deficiencies. Colleges upload rectification evidence to resolve findings.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="w-5 h-5 bg-[#002147] text-white rounded-full inline-flex items-center justify-center font-bold text-[10px] mr-2">4</span>
                <span className="font-bold text-[#002147]">Council Decision & LOA</span>
                <p className="text-slate-600 text-[11px] mt-1 pl-7">
                  Council records final orders with protected audit events, generating a verifiable digital Letter of Approval (LOA) with QR code.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Services Grid */}
          <div className="bg-white border border-slate-300 rounded shadow-xs p-4">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              Approval Services & Workstations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => onNavigateTab('institution_applications')}
                className="p-3 text-left border border-slate-200 rounded hover:border-[#002147] hover:shadow-sm transition-all group"
              >
                <FileSpreadsheet className="w-6 h-6 text-blue-900 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-xs text-[#002147]">Institution Portal</h4>
                <p className="text-[11px] text-slate-500 mt-1">Manage drafts, upload land & faculty affidavits, respond to deficiencies.</p>
              </button>

              <button
                onClick={() => onNavigateTab('reviewer_queue')}
                className="p-3 text-left border border-slate-200 rounded hover:border-[#002147] hover:shadow-sm transition-all group"
              >
                <CheckSquare className="w-6 h-6 text-emerald-800 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-xs text-[#002147]">Scrutiny Queue</h4>
                <p className="text-[11px] text-slate-500 mt-1">Assigned reviewer workstation, document verification, raise deficiencies.</p>
              </button>

              <button
                onClick={() => onNavigateTab('admin_dashboard')}
                className="p-3 text-left border border-slate-200 rounded hover:border-[#002147] hover:shadow-sm transition-all group"
              >
                <ShieldCheck className="w-6 h-6 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-xs text-[#002147]">Council Admin</h4>
                <p className="text-[11px] text-slate-500 mt-1">Assign reviewers, publish rule sets, audit logs, and record final decisions.</p>
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: NOTICES, CALENDAR & CONTACT (lg:col-span-3) */}
        {/* ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Latest Announcements */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#002147] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span>What's New</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <div className="p-3 text-xs space-y-3">
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-orange-600">22-Oct-2026</span>
                <p className="text-slate-800 font-medium text-[11px] hover:text-blue-900 cursor-pointer">
                  AICTE releases revised norms for Faculty Cadre Ratio (1:2:6) under APH 2027.
                </p>
              </div>
              <div className="border-b border-slate-100 pb-2">
                <span className="text-[10px] font-bold text-orange-600">18-Oct-2026</span>
                <p className="text-slate-800 font-medium text-[11px] hover:text-blue-900 cursor-pointer">
                  Mandatory biometric faculty affidavits must be registered prior to Scrutiny.
                </p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-orange-600">10-Oct-2026</span>
                <p className="text-slate-800 font-medium text-[11px] hover:text-blue-900 cursor-pointer">
                  Portal opened for Extension of Approval (EoA) and Increase in Intake 2027-28.
                </p>
              </div>
            </div>
          </div>

          {/* Important Deadlines Card */}
          <div id="deadlines" className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-amber-600 text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Regulatory Deadlines
            </div>
            <div className="p-3 text-xs space-y-2.5">
              <div className="p-2 bg-amber-50 rounded border border-amber-200">
                <p className="text-[10px] font-bold text-amber-900 uppercase">Extension of Approval (EoA)</p>
                <p className="text-xs font-bold text-red-700">15-November-2026</p>
                <p className="text-[10px] text-slate-500">20 days remaining</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] font-bold text-slate-700 uppercase">New Institution Approval</p>
                <p className="text-xs font-bold text-slate-900">30-November-2026</p>
                <p className="text-[10px] text-slate-500">35 days remaining</p>
              </div>

              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] font-bold text-slate-700 uppercase">Deficiency Rectification Window</p>
                <p className="text-xs font-bold text-slate-900">15 Days from Notice</p>
                <p className="text-[10px] text-slate-500">Enforced by state machine</p>
              </div>
            </div>
          </div>

          {/* Helpdesk Contacts */}
          <div id="helpline" className="bg-white border border-slate-300 rounded shadow-xs p-3 text-xs space-y-2">
            <h4 className="font-bold text-[#002147] text-[11px] uppercase tracking-wider border-b border-slate-200 pb-1">
              Approval Support Helpdesk
            </h4>
            <p className="text-[11px] text-slate-600">
              For technical inquiries or system assistance during submission:
            </p>
            <div className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-1">
              <p><strong className="text-slate-800">Email:</strong> helpdesk.approval@aicte-india.org</p>
              <p><strong className="text-slate-800">Toll-Free:</strong> 1800-11-2626</p>
              <p><strong className="text-slate-800">Hours:</strong> 09:30 AM to 05:30 PM (Mon - Fri)</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
