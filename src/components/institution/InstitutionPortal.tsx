import React, { useState } from 'react';
import { 
  Application, 
  UserProfile, 
  Deficiency, 
  WorkflowEvent, 
  ApplicationDocument, 
  ApplicationType 
} from '../../types/api';
import { 
  PlusCircle, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Eye, 
  Edit3, 
  Send, 
  FileCheck,
  Building,
  Upload,
  History,
  Award
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { StageStepper } from '../common/StageStepper';

interface InstitutionPortalProps {
  currentUser: UserProfile;
  applications: Application[];
  deficiencies: Deficiency[];
  workflowEvents: WorkflowEvent[];
  documents: ApplicationDocument[];
  onCreateNewApplication: (type: ApplicationType, year: string) => Promise<void>;
  onSelectApplication: (app: Application) => void;
  onRespondDeficiency: (deficiencyId: string, responseText: string, docIds: string[]) => Promise<void>;
  onUploadDocument: (appId: string, file: File, docType: ApplicationDocument['documentType']) => Promise<void>;
  onOpenLoa: (app: Application) => void;
}

export const InstitutionPortal: React.FC<InstitutionPortalProps> = ({
  currentUser,
  applications,
  deficiencies,
  workflowEvents,
  documents,
  onCreateNewApplication,
  onSelectApplication,
  onRespondDeficiency,
  onUploadDocument,
  onOpenLoa
}) => {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newType, setNewType] = useState<ApplicationType>('extension_of_approval');
  const [newYear, setNewYear] = useState('2027-28');
  const [isCreating, setIsCreating] = useState(false);

  // Deficiency rectification state
  const [selectedDeficiency, setSelectedDeficiency] = useState<Deficiency | null>(null);
  const [responseText, setResponseText] = useState('');
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);

  // Workflow tracking modal
  const [trackingApp, setTrackingApp] = useState<Application | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await onCreateNewApplication(newType, newYear);
      setIsNewModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeficiencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeficiency || !responseText.trim()) return;
    setIsSubmittingResponse(true);
    try {
      await onRespondDeficiency(selectedDeficiency.deficiencyId, responseText, []);
      setSelectedDeficiency(null);
      setResponseText('');
      alert('Rectification response successfully submitted to Scrutiny Reviewer.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  // Metrics
  const myApps = applications.filter(a => a.institutionId === currentUser.institutionId);
  const draftsCount = myApps.filter(a => a.status === 'draft').length;
  const inScrutinyCount = myApps.filter(a => a.status === 'scrutiny' || a.status === 're_scrutiny' || a.status === 'evc').length;
  const rectificationCount = myApps.filter(a => a.status === 'rectification').length;
  const approvedCount = myApps.filter(a => a.status === 'approved').length;

  // Open deficiencies for this institution's apps
  const myAppIds = myApps.map(a => a.applicationId);
  const myDeficiencies = deficiencies.filter(d => myAppIds.includes(d.applicationId));
  const openDeficiencies = myDeficiencies.filter(d => d.status === 'open' || d.status === 'reopened');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Institution Profile Banner */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-[#002147] text-white flex items-center justify-center font-bold text-xl">
            <Building className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#002147]">
              {myApps[0]?.institutionName || 'Affiliated Technical Institution'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-0.5">
              <span>AISHE Code: <strong className="font-mono text-slate-800">C-18459</strong></span>
              <span>•</span>
              <span>Institute ID: <strong className="font-mono text-slate-800">{currentUser.institutionId}</strong></span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Active Approved Institution</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="btn-govt-saffron text-xs font-bold px-4 py-2 flex items-center gap-2 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Approval Application
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-300 p-3.5 rounded shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Draft Applications</span>
          <p className="text-2xl font-black text-[#002147] mt-1">{draftsCount}</p>
          <span className="text-[10px] text-slate-400">Ready for editing</span>
        </div>

        <div className="bg-white border border-slate-300 p-3.5 rounded shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Under Scrutiny</span>
          <p className="text-2xl font-black text-sky-700 mt-1">{inScrutinyCount}</p>
          <span className="text-[10px] text-slate-400">Regional review active</span>
        </div>

        <div className="bg-white border border-slate-300 p-3.5 rounded shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rectification Required</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{rectificationCount}</p>
          <span className="text-[10px] text-amber-600 font-semibold">{openDeficiencies.length} Deficiencies pending</span>
        </div>

        <div className="bg-white border border-slate-300 p-3.5 rounded shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Approved (LOA Issued)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Statutory order released</span>
        </div>
      </div>

      {/* Action Notice if Deficiencies Pending */}
      {openDeficiencies.length > 0 && (
        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">
                Action Required: Scrutiny Committee has raised {openDeficiencies.length} deficiency(ies)
              </p>
              <p className="text-slate-700 mt-0.5">
                Please provide institutional explanations and upload supporting affidavits before the deadline.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-200 text-amber-900 font-bold rounded text-[11px] uppercase">
            Rectification Window Open
          </span>
        </div>
      )}

      {/* Main Table: My Applications */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Institutional Application Register (AY 2027-28)
            </h3>
          </div>
          <span className="text-[11px] text-slate-300">Total: {myApps.length} Applications</span>
        </div>

        <div className="overflow-x-auto">
          <table className="govt-table">
            <thead>
              <tr>
                <th>Application Ref No.</th>
                <th>Type of Approval</th>
                <th>Academic Year</th>
                <th>Current Stage</th>
                <th>Status</th>
                <th>Intake / Faculty</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {myApps.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No applications initiated yet. Click "Create New Approval Application" above.
                  </td>
                </tr>
              ) : (
                myApps.map((app) => (
                  <tr key={app.applicationId}>
                    <td className="font-mono font-bold text-blue-900">
                      {app.applicationId}
                    </td>
                    <td className="font-medium text-slate-800">
                      {app.applicationType.replace(/_/g, ' ').toUpperCase()}
                    </td>
                    <td className="font-mono">{app.academicYear}</td>
                    <td className="capitalize text-slate-700 font-medium">
                      {app.currentStage.replace(/_/g, ' ')}
                    </td>
                    <td>
                      <StatusBadge status={app.status} />
                    </td>
                    <td className="text-xs">
                      {app.formData.totalSanctionedIntake} Seats / {app.formData.fullTimeFacultyCount} Faculty
                    </td>
                    <td className="text-[11px] text-slate-500">
                      {new Date(app.updatedAt).toLocaleDateString('en-IN')}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onSelectApplication(app)}
                          className="p-1 hover:bg-slate-200 rounded text-blue-900"
                          title="Open Application Form / Workstation"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setTrackingApp(app)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-700"
                          title="View Workflow Progression"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        {app.status === 'approved' && (
                          <button
                            onClick={() => onOpenLoa(app)}
                            className="p-1 hover:bg-emerald-100 rounded text-emerald-800 font-bold"
                            title="Download Official Council Approval Order (LOA)"
                          >
                            <Award className="w-4 h-4 text-emerald-600" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deficiencies Workstation Table */}
      <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
        <div className="bg-[#0B3C5D] text-white px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-300" />
            <h3 className="font-bold text-xs uppercase tracking-wider">
              Scrutiny Deficiency Register & Institutional Rectification
            </h3>
          </div>
          <span className="text-[11px] text-slate-300">
            {myDeficiencies.length} Recorded Findings
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="govt-table">
            <thead>
              <tr>
                <th>App ID</th>
                <th>APH Rule Clause</th>
                <th>Deficiency Description</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Rectification Action</th>
              </tr>
            </thead>
            <tbody>
              {myDeficiencies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-slate-400">
                    No scrutiny deficiencies recorded. Application is compliant.
                  </td>
                </tr>
              ) : (
                myDeficiencies.map((def) => (
                  <tr key={def.deficiencyId}>
                    <td className="font-mono text-xs font-bold text-blue-900">{def.applicationId}</td>
                    <td className="font-semibold text-slate-800">{def.ruleName}</td>
                    <td className="text-xs text-slate-700 max-w-xs">{def.description}</td>
                    <td>
                      <StatusBadge status={def.severity} />
                    </td>
                    <td>
                      <StatusBadge status={def.status} />
                    </td>
                    <td>
                      {def.status === 'open' || def.status === 'reopened' ? (
                        <button
                          onClick={() => {
                            setSelectedDeficiency(def);
                            setResponseText('');
                          }}
                          className="btn-govt-saffron text-[11px] py-1 px-2.5"
                        >
                          Respond & Rectify
                        </button>
                      ) : def.status === 'rectification_submitted' ? (
                        <span className="text-[11px] text-purple-800 font-semibold">
                          Under Re-Evaluation
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Create New Application */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
              <h3 className="font-bold text-sm">Initiate AICTE Approval Application</h3>
              <button onClick={() => setIsNewModalOpen(false)} className="text-slate-300 hover:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Application Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as ApplicationType)}
                  className="w-full govt-input text-xs"
                >
                  <option value="extension_of_approval">Extension of Approval (EoA)</option>
                  <option value="new_approval">Establishment of New Technical Institution</option>
                  <option value="increase_intake">Increase in Sanctioned Intake</option>
                  <option value="new_course">Introduction of New Discipline / Course</option>
                  <option value="closure">Closure of Program / Institution</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Session</label>
                <input
                  type="text"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="w-full govt-input text-xs font-mono"
                  placeholder="2027-28"
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-slate-600 text-[11px]">
                Initiates a server-managed draft. Mandatory APH rules will be evaluated during editing and submission.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-govt-saffron text-xs disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Create Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Respond to Deficiency */}
      {selectedDeficiency && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Submit Deficiency Rectification</h3>
                <p className="text-[11px] text-amber-100">Official Scrutiny Rectification Form</p>
              </div>
              <button onClick={() => setSelectedDeficiency(null)} className="text-white hover:text-slate-200">✕</button>
            </div>
            
            <form onSubmit={handleDeficiencySubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs space-y-1">
                <p className="font-bold text-slate-800">Deficiency on: {selectedDeficiency.ruleName}</p>
                <p className="text-slate-700">{selectedDeficiency.description}</p>
                <span className="text-[10px] text-slate-500">Raised by: {selectedDeficiency.createdByName}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Institutional Explanation & Compliance Affidavit <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  placeholder="Detail the remedial actions taken (e.g. appointment letters, land lease extension, equipment purchase receipts)..."
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedDeficiency(null)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResponse || !responseText.trim()}
                  className="btn-govt-primary text-xs disabled:opacity-50"
                >
                  {isSubmittingResponse ? 'Submitting...' : 'Submit Rectification to Reviewer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Application Tracking Stepper & Workflow History */}
      {trackingApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
              <div>
                <h3 className="font-bold text-sm tracking-wide">
                  Application Tracking & Stage Progression — {trackingApp.applicationId}
                </h3>
                <p className="text-[11px] text-slate-300">
                  {trackingApp.institutionName} | Current: {trackingApp.status.toUpperCase()}
                </p>
              </div>
              <button onClick={() => setTrackingApp(null)} className="text-slate-300 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              <StageStepper status={trackingApp.status} />

              {/* Workflow Event Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 border-b pb-1">
                  Verified Audit & Workflow Milestones
                </h4>
                
                <div className="space-y-2.5">
                  {workflowEvents
                    .filter(w => w.applicationId === trackingApp.applicationId)
                    .map(evt => (
                      <div key={evt.eventId} className="p-3 bg-slate-50 border rounded text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#002147]">{evt.action}</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(evt.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </span>
                        </div>
                        <p className="text-slate-700 mt-1">{evt.comment}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                          <span>Actor: <strong>{evt.actorName}</strong> ({evt.actorRole})</span>
                          <span>•</span>
                          <span>Transition: <strong className="uppercase">{evt.fromStatus}</strong> → <strong className="uppercase">{evt.toStatus}</strong></span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t flex justify-end">
              <button onClick={() => setTrackingApp(null)} className="btn-govt-secondary text-xs">
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
