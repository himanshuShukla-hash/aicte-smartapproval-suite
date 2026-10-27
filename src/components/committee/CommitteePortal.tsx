import React, { useState } from 'react';
import { Application, UserProfile, WorkflowEvent, ApplicationDocument } from '../../types/api';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Video, 
  Calendar, 
  Clock, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Building, 
  History,
  ShieldAlert,
  Send
} from 'lucide-react';

interface CommitteePortalProps {
  committeeType: 'shc' | 'sac';
  currentUser: UserProfile;
  applications: Application[];
  workflowEvents: WorkflowEvent[];
  documents: ApplicationDocument[];
  onScheduleHearing: (
    appId: string, 
    committeeType: 'shc' | 'sac', 
    schedule: { scheduledDate: string; scheduledTime: string; meetingLink: string; committeeNotes?: string }
  ) => Promise<void>;
  onDecideAppeal: (
    appId: string, 
    committeeType: 'shc' | 'sac', 
    outcome: 'accept' | 'reject', 
    remarks: string
  ) => Promise<void>;
}

export const CommitteePortal: React.FC<CommitteePortalProps> = ({
  committeeType,
  currentUser,
  applications,
  workflowEvents,
  documents,
  onScheduleHearing,
  onDecideAppeal
}) => {
  const committeeTitle = committeeType === 'shc' ? 'Standing Hearing Committee (SHC)' : 'Standing Appellate Committee (SAC)';
  const committeeCode = committeeType.toUpperCase();

  // Filter applications that are currently in this committee stage or were reviewed here
  const committeeApps = applications.filter(a => a.status === committeeType || (committeeType === 'shc' && a.rejectionStage === 'evc') || (committeeType === 'sac' && a.rejectionStage === 'shc'));

  const [selectedApp, setSelectedApp] = useState<Application | null>(committeeApps[0] || null);
  
  // VC Schedule State
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Decision State
  const [decisionOutcome, setDecisionOutcome] = useState<'accept' | 'reject'>('accept');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isDeciding, setIsDeciding] = useState(false);

  const activeApp = selectedApp || committeeApps[0] || null;

  const appEvents = activeApp 
    ? workflowEvents.filter(e => e.applicationId === activeApp.applicationId) 
    : [];
  
  const appDocs = activeApp 
    ? documents.filter(d => d.applicationId === activeApp.applicationId) 
    : [];

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !scheduledDate || !scheduledTime || !meetingLink) return;

    setIsScheduling(true);
    try {
      await onScheduleHearing(activeApp.applicationId, committeeType, {
        scheduledDate,
        scheduledTime,
        meetingLink,
        committeeNotes: scheduleNotes
      });
      alert(`[Official Notice] Video Conferencing Hearing Scheduled for ${activeApp.applicationId}! Notice and meeting link delivered to institution.`);
      setScheduledDate('');
      setScheduledTime('');
      setMeetingLink('');
      setScheduleNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeApp || !decisionRemarks.trim()) return;

    if (!confirm(`Are you sure you want to record the official decision as: ${decisionOutcome.toUpperCase()} for ${activeApp.applicationId}?`)) {
      return;
    }

    setIsDeciding(true);
    try {
      await onDecideAppeal(activeApp.applicationId, committeeType, decisionOutcome, decisionRemarks);
      alert(`[Official Decision Recorded] Appeal has been ${decisionOutcome.toUpperCase()}ED by ${committeeTitle}.`);
      setDecisionRemarks('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsDeciding(false);
    }
  };

  const currentSchedule = committeeType === 'shc' ? activeApp?.shcHearingSchedule : activeApp?.sacHearingSchedule;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Committee Header Banner */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#002147] text-white flex items-center justify-center font-bold text-xl">
            <Video className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#002147]">
                {committeeTitle}
              </h2>
              <span className="text-xs bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded">
                Statutory Appellate Forum
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Logged in as: <strong className="text-slate-800">{currentUser.displayName}</strong> | AICTE Act Regulatory Committee
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Pending Case Hearings</span>
          <span className="text-2xl font-black text-[#002147]">{committeeApps.length}</span>
        </div>
      </div>

      {committeeApps.length === 0 ? (
        <div className="bg-white border border-slate-300 rounded p-12 text-center shadow-xs">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Pending Appeals Before {committeeCode}</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            There are currently no aggrieved institutions who have filed appeals or cases referred to {committeeTitle}.
            When an institution appeals against an EVC/Scrutiny finding or SHC order, their dossier will appear here for video conferencing.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: List of Appealing Institutions (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-[#002147] text-white px-3 py-2 rounded-t text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span>{committeeCode} Appeals Docket</span>
              <span className="bg-orange-600 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                {committeeApps.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {committeeApps.map((app) => {
                const isSelected = activeApp?.applicationId === app.applicationId;
                return (
                  <div
                    key={app.applicationId}
                    onClick={() => setSelectedApp(app)}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-400' 
                        : 'bg-white border-slate-300 hover:border-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-xs text-[#002147]">
                        {app.applicationId}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>

                    <h4 className="font-semibold text-xs text-slate-900 leading-snug line-clamp-1">
                      {app.institutionName || 'Affiliated Technical Institution'}
                    </h4>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>{app.academicYear} • {app.applicationType.replace(/_/g, ' ')}</span>
                      {app.rejectionStage && (
                        <span className="text-red-700 font-bold bg-red-50 border border-red-200 px-1 rounded">
                          Aggrieved at {app.rejectionStage.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Case Workstation, Previous Records & Video Conferencing Action (lg:col-span-8) */}
          {activeApp && (
            <div className="lg:col-span-8 space-y-5">
              
              {/* Institution Header Card */}
              <div className="bg-white border border-slate-300 rounded p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-black text-[#002147]">
                        {activeApp.applicationId}
                      </span>
                      <StatusBadge status={activeApp.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 mt-0.5">
                      {activeApp.institutionName}
                    </h3>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-slate-500 block">Intake Capacity</span>
                    <strong className="text-slate-800 font-bold">{activeApp.formData.totalSanctionedIntake} Seats • {activeApp.formData.fullTimeFacultyCount} Faculty</strong>
                  </div>
                </div>

                {/* Prior Rejection / Deficiency Finding Summary */}
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-red-900 mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Aggrieved Grounds & Prior Scrutiny/EVC Finding:</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {activeApp.rejectionReason || 'The application was flagged by Scrutiny/EVC inspection for non-compliance with APH statutory norms. Institution has requested an opportunity of hearing under statutory rules.'}
                  </p>
                </div>
              </div>

              {/* Video Conferencing (VC) Scheduling Center */}
              <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
                <div className="bg-gradient-to-r from-[#002147] to-[#0a366b] text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-amber-300" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      Schedule Video Conferencing (VC) Hearing
                    </h3>
                  </div>
                  <span className="text-[11px] text-amber-200 font-medium">
                    Powers under APH Chapter VIII
                  </span>
                </div>

                <div className="p-4 text-xs space-y-4">
                  {currentSchedule ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-0.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Video Conference Scheduled with Institution</span>
                        </div>
                        <p className="text-slate-700">
                          <strong>Date:</strong> {currentSchedule.scheduledDate} &nbsp;|&nbsp; <strong>Time:</strong> {currentSchedule.scheduledTime} IST
                        </p>
                        {currentSchedule.committeeNotes && (
                          <p className="text-slate-600 mt-1 italic">
                            Notes: "{currentSchedule.committeeNotes}"
                          </p>
                        )}
                      </div>
                      <a
                        href={currentSchedule.meetingLink.startsWith('http') ? currentSchedule.meetingLink : `https://${currentSchedule.meetingLink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-govt-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                      >
                        <Video className="w-3.5 h-3.5" />
                        Join Virtual Hearing
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <p className="text-slate-600 text-[11px]">
                      The Committee conducts hearings strictly via authenticated Video Conferencing. Schedule a virtual hearing slot below; an official notification and VC link will be transmitted to the institution's portal immediately.
                    </p>
                  )}

                  <form onSubmit={handleScheduleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t pt-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hearing Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full govt-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Hearing Time (IST) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full govt-input text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        VC Meeting Link (Meet / Zoom / Webex) <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/..."
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full govt-input text-xs"
                        required
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Instructions / Agenda for Principal & Chairman
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Keep original land registry deed and faculty attendance registers ready for live video verification."
                        value={scheduleNotes}
                        onChange={(e) => setScheduleNotes(e.target.value)}
                        className="w-full govt-input text-xs"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end">
                      <button
                        type="submit"
                        disabled={isScheduling}
                        className="btn-govt-saffron text-xs font-bold flex items-center gap-1.5 py-1.5 px-4"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        {isScheduling ? 'Transmitting Schedule...' : 'Schedule & Notify Institution'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Committee Decision: Accept or Reject Appeal */}
              <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
                <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-300" />
                    <h3 className="font-bold text-xs uppercase tracking-wider">
                      {committeeCode} Post-Hearing Statutory Verdict
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-300">
                    Authority: Accept or Reject Appeal
                  </span>
                </div>

                <form onSubmit={handleDecisionSubmit} className="p-4 text-xs space-y-4">
                  <p className="text-slate-600 text-[11px]">
                    Following the video conference hearing and verification of records, the {committeeTitle} has the statutory power to either <strong>Accept the Appeal</strong> (granting approval) or <strong>Reject the Appeal</strong>.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`p-3 rounded border cursor-pointer flex items-center gap-3 ${
                      decisionOutcome === 'accept' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-400' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="outcome"
                        checked={decisionOutcome === 'accept'}
                        onChange={() => setDecisionOutcome('accept')}
                        className="w-4 h-4 text-emerald-600"
                      />
                      <div>
                        <strong className="text-emerald-900 block font-bold">ACCEPT APPEAL (Recommend Approval)</strong>
                        <span className="text-[11px] text-slate-500">Institution satisfied all norms during video conference hearing.</span>
                      </div>
                    </label>

                    <label className={`p-3 rounded border cursor-pointer flex items-center gap-3 ${
                      decisionOutcome === 'reject' ? 'bg-red-50 border-red-500 ring-1 ring-red-400' : 'bg-slate-50 border-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="outcome"
                        checked={decisionOutcome === 'reject'}
                        onChange={() => setDecisionOutcome('reject')}
                        className="w-4 h-4 text-red-600"
                      />
                      <div>
                        <strong className="text-red-900 block font-bold">REJECT APPEAL</strong>
                        <span className="text-[11px] text-slate-500">
                          {committeeType === 'shc' 
                            ? 'Institution can appeal before Standing Appellate Committee (SAC).'
                            : 'All statutory remedies exhausted. Cancelled by Executive Committee.'}
                        </span>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Official Committee Minutes & Findings <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={decisionRemarks}
                      onChange={(e) => setDecisionRemarks(e.target.value)}
                      placeholder="Record detailed observations from the video conferencing hearing..."
                      className="w-full govt-input text-xs"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isDeciding || !decisionRemarks.trim()}
                      className={`btn-govt-${decisionOutcome === 'accept' ? 'primary' : 'saffron'} text-xs font-bold py-2 px-5 flex items-center gap-2`}
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isDeciding ? 'Recording...' : `Record ${decisionOutcome.toUpperCase()} Order`}
                    </button>
                  </div>
                </form>
              </div>

              {/* Complete Institutional Previous Dossier & History */}
              <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#002147]" />
                    <span>Previous Institutional Records & Audit History</span>
                  </div>
                  <span className="text-slate-500 font-normal">{appEvents.length} Prior Logged Events</span>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Documents submitted */}
                  <div>
                    <h5 className="font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-900" />
                      Uploaded Statutory Evidence Dossiers
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {appDocs.map((doc) => (
                        <div key={doc.documentId} className="p-2 border rounded bg-slate-50 flex items-center justify-between">
                          <div>
                            <span className="font-semibold block text-[11px] text-slate-800">{doc.fileName}</span>
                            <span className="text-[10px] text-slate-500">{doc.documentType} • {(doc.sizeBytes / 1024).toFixed(0)} KB</span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">{doc.verificationStatus}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complete Workflow Log */}
                  <div className="border-t pt-3 mt-3">
                    <h5 className="font-bold text-slate-700 mb-2">Stage Transition Timeline</h5>
                    <div className="space-y-1.5">
                      {appEvents.map((evt) => (
                        <div key={evt.eventId} className="p-2 border-l-2 border-blue-900 bg-slate-50 text-[11px]">
                          <div className="flex items-center justify-between font-semibold text-slate-800">
                            <span>{evt.action}</span>
                            <span className="text-slate-400 font-normal">{new Date(evt.timestamp).toLocaleString('en-IN')}</span>
                          </div>
                          <p className="text-slate-600 mt-0.5">{evt.comment || 'Transition processed.'}</p>
                          <span className="text-[10px] text-blue-900 font-mono">By: {evt.actorName} ({evt.actorRole})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
