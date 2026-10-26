import React, { useState } from 'react';
import { 
  Application, 
  UserProfile, 
  Deficiency, 
  ApplicationDocument, 
  ComplianceEvaluation, 
  RuleSeverity,
  WorkflowEvent 
} from '../../types/api';
import { 
  CheckSquare, 
  AlertTriangle, 
  FileSearch, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  Building, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';
import { StageStepper } from '../common/StageStepper';

interface ReviewerPortalProps {
  currentUser: UserProfile;
  applications: Application[];
  deficiencies: Deficiency[];
  documents: ApplicationDocument[];
  onEvaluateCompliance: (appId: string) => Promise<ComplianceEvaluation>;
  onCreateDeficiency: (appId: string, ruleId: string, ruleName: string, desc: string, severity: 'critical' | 'major' | 'minor') => Promise<void>;
  onResolveDeficiency: (deficiencyId: string, remarks: string, action: 'resolve' | 'reopen') => Promise<void>;
  onRecordDecision: (appId: string, decision: 'recommend_evc' | 'return_rectification' | 'recommend_approval' | 'recommend_rejection', comment: string) => Promise<void>;
  workflowEvents: WorkflowEvent[];
}

export const ReviewerPortal: React.FC<ReviewerPortalProps> = ({
  currentUser,
  applications,
  deficiencies,
  documents,
  onEvaluateCompliance,
  onCreateDeficiency,
  onResolveDeficiency,
  onRecordDecision,
  workflowEvents
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(applications[0] || null);
  const [latestEvaluation, setLatestEvaluation] = useState<ComplianceEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Deficiency creation modal
  const [isDeficiencyModalOpen, setIsDeficiencyModalOpen] = useState(false);
  const [defRuleId, setDefRuleId] = useState('aph_sfr_01');
  const [defRuleName, setDefRuleName] = useState('Student Faculty Ratio (SFR)');
  const [defSeverity, setDefSeverity] = useState<'critical' | 'major' | 'minor'>('critical');
  const [defDescription, setDefDescription] = useState('');
  const [isCreatingDef, setIsCreatingDef] = useState(false);

  // Deficiency resolution modal
  const [resolvingDeficiency, setResolvingDeficiency] = useState<Deficiency | null>(null);
  const [resolutionRemarks, setResolutionRemarks] = useState('');
  const [resolutionAction, setResolutionAction] = useState<'resolve' | 'reopen'>('resolve');

  // Decision Modal
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<'recommend_evc' | 'return_rectification' | 'recommend_approval' | 'recommend_rejection'>('recommend_evc');
  const [decisionComment, setDecisionComment] = useState('');
  const [isRecordingDecision, setIsRecordingDecision] = useState(false);

  const handleRunEvaluation = async () => {
    if (!selectedApp) return;
    setIsEvaluating(true);
    try {
      const evalRes = await onEvaluateCompliance(selectedApp.applicationId);
      setLatestEvaluation(evalRes);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCreateDeficiencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !defDescription.trim()) return;
    setIsCreatingDef(true);
    try {
      await onCreateDeficiency(selectedApp.applicationId, defRuleId, defRuleName, defDescription, defSeverity);
      setIsDeficiencyModalOpen(false);
      setDefDescription('');
      alert('Deficiency logged and notification dispatched to the Institution.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingDef(false);
    }
  };

  const handleResolveDeficiencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingDeficiency || !resolutionRemarks.trim()) return;
    try {
      await onResolveDeficiency(resolvingDeficiency.deficiencyId, resolutionRemarks, resolutionAction);
      setResolvingDeficiency(null);
      setResolutionRemarks('');
      alert(`Deficiency ${resolutionAction === 'resolve' ? 'RESOLVED' : 'REOPENED'} successfully.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !decisionComment.trim()) return;

    if (selectedApp.status === 'draft') {
      alert(`Invalid Workflow Action: Cannot transition a DRAFT application directly to ${decisionType.toUpperCase()}.\n\nThe applicant institution must formally submit the application first.\n\nTo proceed:\n1. Switch to the Institution User from the top-right persona menu.\n2. Open this application and click "Submit Application to Council" at Step 7.\n3. Return here to record your Scrutiny Order.`);
      setIsDecisionModalOpen(false);
      return;
    }

    setIsRecordingDecision(true);
    try {
      await onRecordDecision(selectedApp.applicationId, decisionType, decisionComment);
      setIsDecisionModalOpen(false);
      setDecisionComment('');
      alert(`Official Scrutiny recommendation recorded for ${selectedApp.applicationId}.`);
    } catch (err: any) {
      alert(`Workflow State Machine: ${err.message}`);
    } finally {
      setIsRecordingDecision(false);
    }
  };

  const appDeficiencies = selectedApp ? deficiencies.filter(d => d.applicationId === selectedApp.applicationId) : [];
  const appDocuments = selectedApp ? documents.filter(d => d.applicationId === selectedApp.applicationId) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Reviewer Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-base sm:text-lg font-bold text-[#002147]">
              Regional Scrutiny Officer Workstation
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Officer: <strong>{currentUser.displayName}</strong> | AICTE Regional Bureau | Role: <span className="uppercase font-semibold text-blue-900">{currentUser.role}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded font-bold">
            {applications.length} Assigned Cases
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold">
            {deficiencies.filter(d => d.status === 'open' || d.status === 'rectification_submitted').length} Open Deficiencies
          </span>
        </div>
      </div>

      {/* Main 2-Column Workstation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Assigned Application Queue (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#002147] text-white px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Scrutiny Review Queue</span>
              <span className="text-[10px] text-amber-300 font-normal">Active Applications</span>
            </div>

            <div className="divide-y divide-slate-200 max-h-[600px] overflow-y-auto">
              {applications.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No applications assigned in scrutiny queue.
                </div>
              ) : (
                applications.map((app) => {
                  const isSelected = selectedApp?.applicationId === app.applicationId;
                  const openCount = deficiencies.filter(d => d.applicationId === app.applicationId && d.status !== 'resolved').length;

                  return (
                    <div
                      key={app.applicationId}
                      onClick={() => {
                        setSelectedApp(app);
                        setLatestEvaluation(null);
                      }}
                      className={`p-3 text-xs cursor-pointer transition-all hover:bg-slate-50 ${
                        isSelected ? 'bg-amber-50/70 border-l-4 border-orange-500 font-semibold' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-blue-950">{app.applicationId}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <p className="text-slate-800 font-medium truncate mt-1">{app.institutionName}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 pt-1 border-t border-slate-100">
                        <span>{app.academicYear} | {app.formData.program}</span>
                        {openCount > 0 && (
                          <span className="text-amber-700 font-bold">{openCount} Deficiencies</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Scrutiny & Evaluation Center (lg:col-span-8) */}
        {selectedApp ? (
          <div className="lg:col-span-8 space-y-5">
            
            {/* Workstation Application Header */}
            <div className="bg-white border border-slate-300 rounded p-4 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#002147] font-mono">
                      {selectedApp.applicationId}
                    </h3>
                    <StatusBadge status={selectedApp.status} />
                  </div>
                  <p className="text-xs text-slate-700 font-semibold mt-0.5">
                    {selectedApp.institutionName} ({selectedApp.academicYear})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunEvaluation}
                    disabled={isEvaluating}
                    className="btn-govt-secondary text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                    {isEvaluating ? 'Executing...' : 'Run Compliance Engine'}
                  </button>

                  <button
                    onClick={() => {
                      if (selectedApp.status === 'draft') {
                        alert(`Application ${selectedApp.applicationId} is currently in DRAFT status.\n\nThe institution must submit it before a scrutiny order can be recorded.\n\nNext Step:\n1. Switch to Institution User from the top-right persona dropdown.\n2. Open this application and go to Step 7.\n3. Click "Submit Application to Council".\n4. Then return here to record your scrutiny recommendation.`);
                        return;
                      }
                      setIsDecisionModalOpen(true);
                    }}
                    className={`btn-govt-primary text-xs flex items-center gap-1.5 shadow-xs ${
                      selectedApp.status === 'draft' ? 'opacity-70 bg-slate-600 hover:bg-slate-700' : ''
                    }`}
                    title={selectedApp.status === 'draft' ? 'Application in draft. Awaiting submission by institution.' : 'Record Scrutiny Order'}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    Record Scrutiny Order
                  </button>
                </div>
              </div>

              {selectedApp.status === 'draft' && (
                <div className="p-3.5 bg-blue-50 border-l-4 border-blue-600 rounded text-xs flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-blue-950 text-xs">
                      Notice: Application in DRAFT status — Awaiting Institutional Submission
                    </p>
                    <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed">
                      This application ({selectedApp.applicationId}) is currently being prepared by the institution. Formal scrutiny recommendations (EVC Inspection / Rectification / Approval) can only be executed after the institution submits the application via Step 7 of the Application Wizard.
                    </p>
                  </div>
                </div>
              )}

              <StageStepper status={selectedApp.status} />

              {/* Institution Norms Snapshot Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Sanctioned Intake</span>
                  <p className="font-bold text-[#002147]">{selectedApp.formData.totalSanctionedIntake} Students</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Full-Time Faculty</span>
                  <p className="font-bold text-[#002147]">
                    {selectedApp.formData.fullTimeFacultyCount} Faculty (SFR 1:{(selectedApp.formData.totalEnrolledStudents / (selectedApp.formData.fullTimeFacultyCount || 1)).toFixed(1)})
                  </p>
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Land Norms</span>
                  <p className="font-bold text-[#002147]">{selectedApp.formData.landAreaAcres} Acres ({selectedApp.formData.landType})</p>
                </div>
                <div className="p-2 bg-slate-50 rounded border">
                  <span className="text-[10px] text-slate-500 font-bold uppercase">Instructional Area</span>
                  <p className="font-bold text-[#002147]">{selectedApp.formData.instructionalAreaSqM} Sq.M</p>
                </div>
              </div>
            </div>

            {/* Compliance Evaluation Engine Card */}
            {latestEvaluation && (
              <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
                <div className="bg-[#0B3C5D] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase">
                  <span>Authoritative Compliance Engine Results ({latestEvaluation.ruleSetVersion})</span>
                  <StatusBadge status={latestEvaluation.overallStatus} />
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3 text-xs font-semibold">
                    <span className="text-emerald-700">{latestEvaluation.summary.passed} Rules Passed</span>
                    <span>•</span>
                    <span className="text-amber-700">{latestEvaluation.summary.needs_review} Needs Review</span>
                    <span>•</span>
                    <span className="text-red-700 font-bold">{latestEvaluation.summary.failed} Rules Deficient</span>
                  </div>

                  <table className="govt-table text-xs">
                    <thead>
                      <tr>
                        <th>Rule ID</th>
                        <th>Norm Metric</th>
                        <th>Reported vs Standard</th>
                        <th>Outcome</th>
                        <th>Reviewer Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {latestEvaluation.results.map(r => (
                        <tr key={r.ruleId}>
                          <td className="font-mono text-blue-900 font-semibold">{r.ruleId}</td>
                          <td className="font-semibold text-slate-800">{r.ruleName}</td>
                          <td className="text-xs">
                            <span className="font-bold">{r.actualValue}</span> / <span className="text-slate-500">{r.requiredValue}</span>
                            <p className="text-[10px] text-slate-500 mt-0.5">{r.message}</p>
                          </td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                          <td>
                            {r.status === 'fail' && (
                              <button
                                onClick={() => {
                                  setDefRuleId(r.ruleId);
                                  setDefRuleName(r.ruleName);
                                  setDefDescription(`Statutory deficiency on ${r.ruleName}: Reported ${r.actualValue} against required standard ${r.requiredValue}. ${r.message}`);
                                  setIsDeficiencyModalOpen(true);
                                }}
                                className="text-[11px] text-red-700 hover:underline font-bold"
                              >
                                Raise Deficiency →
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scrutiny Deficiencies Management */}
            <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
              <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">
                    Deficiencies & Rectification Workstation
                  </h4>
                </div>
                <button
                  onClick={() => setIsDeficiencyModalOpen(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold px-2.5 py-1 rounded"
                >
                  + Raise New Deficiency
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="govt-table text-xs">
                  <thead>
                    <tr>
                      <th>Rule Clause</th>
                      <th>Deficiency Finding</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>College Rectification Response</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appDeficiencies.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          No deficiencies logged on this application.
                        </td>
                      </tr>
                    ) : (
                      appDeficiencies.map(def => (
                        <tr key={def.deficiencyId}>
                          <td className="font-semibold text-slate-800">{def.ruleName}</td>
                          <td className="text-slate-700 max-w-xs">{def.description}</td>
                          <td><StatusBadge status={def.severity} /></td>
                          <td><StatusBadge status={def.status} /></td>
                          <td className="text-xs text-slate-600 max-w-xs">
                            {def.responseText ? (
                              <div className="p-1.5 bg-slate-50 border rounded">
                                <p className="font-medium text-slate-800 italic">"{def.responseText}"</p>
                                <span className="text-[10px] text-slate-400">
                                  Submitted: {new Date(def.responseSubmittedAt!).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Awaiting response</span>
                            )}
                          </td>
                          <td>
                            {def.status === 'rectification_submitted' && (
                              <button
                                onClick={() => {
                                  setResolvingDeficiency(def);
                                  setResolutionRemarks('');
                                }}
                                className="btn-govt-primary text-[11px] py-1 px-2"
                              >
                                Evaluate & Clear
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Document Evidence Viewer */}
            <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
              <div className="bg-[#0B3C5D] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-300" />
                  <span>Submitted Institutional Affidavits & Documents ({appDocuments.length})</span>
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {appDocuments.map(doc => (
                  <div key={doc.documentId} className="p-3 bg-slate-50 border rounded flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#002147]">{doc.fileName}</p>
                      <p className="text-[11px] text-slate-500">{doc.documentType.replace(/_/g, ' ')}</p>
                      <span className="text-[10px] text-slate-400">Size: {(doc.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
                    </div>

                    <a
                      href={`https://storage.googleapis.com/aicte-vault/${doc.storagePath}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-govt-secondary text-[11px] py-1 px-2 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-8 p-12 text-center text-slate-400 bg-white border rounded">
            Select an application from the queue to start scrutiny verification.
          </div>
        )}

      </div>

      {/* MODAL: Raise Deficiency */}
      {isDeficiencyModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-red-700 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Raise Scrutiny Deficiency</h3>
                <p className="text-[11px] text-red-100">Application: {selectedApp.applicationId}</p>
              </div>
              <button onClick={() => setIsDeficiencyModalOpen(false)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleCreateDeficiencySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">APH Rule Violation Clause</label>
                <select
                  value={defRuleId}
                  onChange={(e) => {
                    setDefRuleId(e.target.value);
                    const opt = e.target.options[e.target.selectedIndex];
                    setDefRuleName(opt.text);
                  }}
                  className="w-full govt-input text-xs"
                >
                  <option value="aph_sfr_01">Student Faculty Ratio (SFR 1:20 Max)</option>
                  <option value="aph_cadre_02">Faculty Cadre Ratio (1:2:6 Structure)</option>
                  <option value="aph_land_03">Minimum Land Area Requirement</option>
                  <option value="aph_builtup_04">Instructional Carpet Area</option>
                  <option value="aph_computers_05">Computer Labs and Terminal Count</option>
                  <option value="aph_library_06">Library Books & Journals Volumes</option>
                  <option value="aph_principal_07">Qualified Principal/Director</option>
                  <option value="aph_statutory_08">Statutory Safety & Anti-Ragging Mandate</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Severity Level</label>
                <select
                  value={defSeverity}
                  onChange={(e) => setDefSeverity(e.target.value as 'critical' | 'major' | 'minor')}
                  className="w-full govt-input text-xs"
                >
                  <option value="critical">Critical (Blocks Final Approval)</option>
                  <option value="major">Major (Mandatory Rectification Required)</option>
                  <option value="minor">Minor (Informational Warning)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deficiency Finding & Justification <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={defDescription}
                  onChange={(e) => setDefDescription(e.target.value)}
                  placeholder="Detail the exact deficit, clause violation, and required remedy..."
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsDeficiencyModalOpen(false)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDef || !defDescription.trim()}
                  className="btn-govt-saffron text-xs disabled:opacity-50"
                >
                  {isCreatingDef ? 'Logging...' : 'Record Deficiency'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Evaluate & Clear Deficiency */}
      {resolvingDeficiency && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Evaluate Rectification Response</h3>
                <p className="text-[11px] text-slate-300">Rule: {resolvingDeficiency.ruleName}</p>
              </div>
              <button onClick={() => setResolvingDeficiency(null)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleResolveDeficiencySubmit} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 border rounded space-y-1">
                <span className="font-bold text-slate-800">Original Deficiency:</span>
                <p className="text-slate-700">{resolvingDeficiency.description}</p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded space-y-1">
                <span className="font-bold text-amber-950">College Explanation:</span>
                <p className="text-slate-800 font-medium italic">"{resolvingDeficiency.responseText}"</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reviewer Determination</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="p-2 border rounded flex items-center gap-2 cursor-pointer bg-emerald-50 border-emerald-300">
                    <input
                      type="radio"
                      name="action"
                      checked={resolutionAction === 'resolve'}
                      onChange={() => setResolutionAction('resolve')}
                      className="accent-emerald-700"
                    />
                    <span className="font-bold text-emerald-900">Resolve Deficiency (Clear)</span>
                  </label>

                  <label className="p-2 border rounded flex items-center gap-2 cursor-pointer bg-red-50 border-red-300">
                    <input
                      type="radio"
                      name="action"
                      checked={resolutionAction === 'reopen'}
                      onChange={() => setResolutionAction('reopen')}
                      className="accent-red-700"
                    />
                    <span className="font-bold text-red-900">Reopen (Insufficient)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reviewer Remarks / Order</label>
                <textarea
                  rows={3}
                  value={resolutionRemarks}
                  onChange={(e) => setResolutionRemarks(e.target.value)}
                  placeholder="State basis for resolution or further clarification needed..."
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setResolvingDeficiency(null)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!resolutionRemarks.trim()}
                  className="btn-govt-primary text-xs disabled:opacity-50"
                >
                  Submit Determination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Scrutiny Decision */}
      {isDecisionModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
              <div>
                <h3 className="font-bold text-sm">Record Scrutiny Order / Stage Transition</h3>
                <p className="text-[11px] text-slate-300">{selectedApp.applicationId} | Current: {selectedApp.status.toUpperCase()}</p>
              </div>
              <button onClick={() => setIsDecisionModalOpen(false)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleDecisionSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Authorized Stage Recommendation</label>
                <select
                  value={decisionType}
                  onChange={(e) => setDecisionType(e.target.value as any)}
                  className="w-full govt-input text-xs"
                >
                  <option value="recommend_evc">Recommend Expert Visiting Committee (EVC Inspection)</option>
                  <option value="return_rectification">Return to Institution for Deficiency Rectification</option>
                  <option value="recommend_approval">Recommend to Council for Approval (All Norms Satisfied)</option>
                  <option value="recommend_rejection">Recommend Rejection to Standing Appellate Committee</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Justification & Scrutiny Minutes <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={decisionComment}
                  onChange={(e) => setDecisionComment(e.target.value)}
                  placeholder="Record formal scrutiny committee observations, compliance verification notes, and decision rationale..."
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-950">
                This action transitions the server workflow state and creates an immutable audit event under your digital signature.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsDecisionModalOpen(false)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingDecision || !decisionComment.trim()}
                  className="btn-govt-primary text-xs disabled:opacity-50"
                >
                  {isRecordingDecision ? 'Submitting...' : 'Record Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
