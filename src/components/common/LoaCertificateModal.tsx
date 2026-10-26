import React from 'react';
import { Application } from '../../types/api';
import { AshokaEmblem, AicteLogo } from './Emblem';
import { Printer, Download, X, ShieldCheck } from 'lucide-react';

interface LoaCertificateModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LoaCertificateModal: React.FC<LoaCertificateModalProps> = ({
  application,
  isOpen,
  onClose
}) => {
  if (!isOpen || !application) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded shadow-2xl border border-slate-300 overflow-hidden my-6">
        
        {/* Top Control Bar */}
        <div className="bg-[#002147] text-white px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm tracking-wide">
              Official Council Order & Letter of Approval (LOA)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Letter Area */}
        <div className="p-8 sm:p-12 text-slate-900 bg-white printable-area font-serif leading-relaxed border-8 border-double border-slate-200 m-2">
          
          {/* Letterhead Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <div className="flex justify-center items-center gap-6 mb-2">
              <AshokaEmblem className="h-16 w-auto" />
              <AicteLogo className="h-16 w-16" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-[#002147]">
              अखिल भारतीय तकनीकी शिक्षा परिषद
            </h2>
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-[#002147]">
              All India Council for Technical Education
            </h1>
            <p className="text-xs text-slate-700 italic mt-0.5">
              (A Statutory Body under Ministry of Education, Government of India)
            </p>
            <p className="text-xs text-slate-600">
              Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | Website: www.aicte-india.org
            </p>
          </div>

          {/* Reference and Date */}
          <div className="flex justify-between items-start text-xs font-sans font-semibold mb-6">
            <div>
              <p>F.No. AICTE/AB/{application.academicYear}/{application.applicationId}</p>
              <p className="text-slate-600 mt-0.5">Permanent Institute ID: {application.institutionId}</p>
            </div>
            <div className="text-right">
              <p>Date: {new Date(application.finalDecisionDate || application.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
              <p className="text-emerald-700 font-bold">STATUS: OFFICIAL GRANT OF APPROVAL</p>
            </div>
          </div>

          {/* Recipient */}
          <div className="text-xs font-sans mb-6">
            <p className="font-bold">To,</p>
            <p className="font-semibold text-slate-800">The Principal / Director,</p>
            <p className="text-slate-800 text-sm font-bold">{application.institutionName || 'Technical Institution'}</p>
            <p className="text-slate-600">Sub: Extension of Approval / New Approval for Academic Year {application.academicYear}</p>
          </div>

          {/* Letter Body */}
          <div className="text-xs space-y-3 text-justify leading-normal font-sans text-slate-800">
            <p>
              Sir / Madam,
            </p>
            <p>
              In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Education) Regulations, 2026 notified by the Council vide notification number F.No. AB/AICTE/REG/2026 and published norms and standards prescribed in the Approval Process Handbook (APH 2027-28), I am directed to convey the statutory approval of the Council to:
            </p>

            {/* Institution Details Box */}
            <div className="bg-slate-50 border border-slate-300 p-3 rounded my-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="font-semibold">Application Reference:</span> {application.applicationId}</div>
                <div><span className="font-semibold">Application Type:</span> {application.applicationType.replace(/_/g, ' ').toUpperCase()}</div>
                <div><span className="font-semibold">Academic Session:</span> {application.academicYear}</div>
                <div><span className="font-semibold">Approved Intake:</span> {application.formData.totalSanctionedIntake} Seats</div>
                <div><span className="font-semibold">Program / Level:</span> {application.formData.program} ({application.formData.level})</div>
                <div><span className="font-semibold">Location Norm:</span> {application.formData.landType} ({application.formData.landAreaAcres} Acres)</div>
              </div>
            </div>

            <p>
              to conduct following courses with the intake indicated below for the Academic Year <strong>{application.academicYear}</strong>:
            </p>

            {/* Courses Table */}
            <table className="govt-table my-3 text-xs">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Level</th>
                  <th>Course / Discipline</th>
                  <th>Affiliating Body</th>
                  <th>Approved Intake</th>
                  <th>Approval Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{application.formData.program}</td>
                  <td>{application.formData.level}</td>
                  <td>Computer Science & Engineering / Core Tech</td>
                  <td>State Technical University</td>
                  <td className="font-bold text-center">{application.formData.totalSanctionedIntake}</td>
                  <td className="text-emerald-700 font-bold">APPROVED</td>
                </tr>
              </tbody>
            </table>

            <p>
              The Institution shall strictly adhere to the policies, directives, and guidelines issued by AICTE from time to time including implementation of Anti-Ragging regulations, Barrier-Free environment for Divyangjan, mandatory Student-Faculty Ratio of 1:20, and Biometric attendance protocols.
            </p>

            <p className="italic text-slate-600 bg-amber-50 p-2 border-l-4 border-amber-500">
              <strong>Council Remarks:</strong> {application.finalDecisionRemarks || "All statutory requirements and norms verified through digitized compliance review."}
            </p>
          </div>

          {/* Signatures & Seal */}
          <div className="mt-8 pt-6 border-t border-slate-300 flex justify-between items-end font-sans">
            {/* QR Code Verification Simulation */}
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 bg-slate-900 p-1 flex items-center justify-center text-white text-[9px] text-center font-mono">
                [ QR CODE ]<br/>
                VERIFY DIGITALLY<br/>
                {application.applicationId}
              </div>
              <div className="text-[10px] text-slate-500">
                <p className="font-bold text-slate-700">Digital Seal of Council</p>
                <p>Digitally signed by:</p>
                <p className="font-semibold text-slate-800">{application.finalDecisionBy || "Member Secretary, AICTE"}</p>
                <p>Auth Timestamp: {new Date(application.finalDecisionDate || application.updatedAt).toISOString()}</p>
              </div>
            </div>

            {/* Signature Box */}
            <div className="text-right text-xs">
              <div className="w-40 border-b border-slate-400 mb-1 ml-auto"></div>
              <p className="font-bold text-slate-900">{application.finalDecisionBy || "Member Secretary"}</p>
              <p className="text-slate-600 text-[11px]">All India Council for Technical Education</p>
              <p className="text-[10px] text-slate-400">Government of India, New Delhi</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
