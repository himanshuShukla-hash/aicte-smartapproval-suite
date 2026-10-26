import React, { useState } from 'react';
import { 
  Application, 
  UserProfile, 
  AdminOverviewMetrics, 
  AuditEvent, 
  ComplianceRule, 
  UserRole 
} from '../../types/api';
import { 
  Users, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Award, 
  BookOpen, 
  Clock, 
  FileText,
  UserPlus,
  AlertTriangle,
  Sliders,
  History
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface AdminPortalProps {
  currentUser: UserProfile;
  applications: Application[];
  users: UserProfile[];
  metrics: AdminOverviewMetrics | null;
  auditEvents: AuditEvent[];
  rules: ComplianceRule[];
  onAssignReviewer: (appId: string, reviewerId: string) => Promise<void>;
  onRecordFinalDecision: (appId: string, decision: 'approved' | 'rejected', remarks: string) => Promise<void>;
  onCreateUser: (displayName: string, email: string, role: UserRole, institutionId?: string) => Promise<void>;
  onSetUserRole: (uid: string, role: UserRole) => Promise<void>;
  onPublishRules: (rules: ComplianceRule[]) => Promise<void>;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  applications,
  users,
  metrics,
  auditEvents,
  rules,
  onAssignReviewer,
  onRecordFinalDecision,
  onCreateUser,
  onSetUserRole,
  onPublishRules
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'assignments' | 'final_decisions' | 'users' | 'rules' | 'audit'>('overview');

  // Reviewer assignment state
  const [selectedAppForAssign, setSelectedAppForAssign] = useState<string>('');
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Final Decision state
  const [selectedAppForDecision, setSelectedAppForDecision] = useState<Application | null>(null);
  const [decisionOutcome, setDecisionOutcome] = useState<'approved' | 'rejected'>('approved');
  const [decisionRemarks, setDecisionRemarks] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);

  // User provisioning state
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('reviewer');
  const [newUserInstId, setNewUserInstId] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const reviewers = users.filter(u => u.role === 'reviewer');

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForAssign || !selectedReviewerId) return;
    setIsAssigning(true);
    try {
      await onAssignReviewer(selectedAppForAssign, selectedReviewerId);
      setSelectedAppForAssign('');
      setSelectedReviewerId('');
      alert('Reviewer successfully assigned.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleFinalDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForDecision || !decisionRemarks.trim()) return;
    setIsSubmittingDecision(true);
    try {
      await onRecordFinalDecision(selectedAppForDecision.applicationId, decisionOutcome, decisionRemarks);
      setSelectedAppForDecision(null);
      setDecisionRemarks('');
      alert(`Final Council Decision successfully recorded. Application status updated to ${decisionOutcome.toUpperCase()}.`);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    setIsCreatingUser(true);
    try {
      await onCreateUser(newUserName, newUserEmail, newUserRole, newUserInstId || undefined);
      setIsNewUserModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      alert('User provisioned with verified credentials.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Admin Header */}
      <div className="bg-white border border-slate-300 rounded p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[#002147]">
            Central Council Administration & Governance Console
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Council Administrator: <strong>{currentUser.displayName}</strong> | AICTE Headquarters, New Delhi
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview Metrics' },
            { id: 'assignments', label: 'Assign Reviewers' },
            { id: 'final_decisions', label: 'Council Final Orders' },
            { id: 'users', label: 'User Roles' },
            { id: 'rules', label: 'APH 2027 Rules' },
            { id: 'audit', label: 'Protected Audit Trail' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeSubTab === tab.id
                  ? 'bg-[#002147] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: Overview Metrics */}
      {activeSubTab === 'overview' && metrics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-300 p-4 rounded shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
              <p className="text-2xl font-black text-[#002147] mt-1">{metrics.totalApplications}</p>
              <span className="text-[10px] text-slate-400">All categories AY 2027-28</span>
            </div>

            <div className="bg-white border border-slate-300 p-4 rounded shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Awaiting Reviewer</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{metrics.pendingReviewerCount}</p>
              <span className="text-[10px] text-amber-600 font-semibold">Assignment required</span>
            </div>

            <div className="bg-white border border-slate-300 p-4 rounded shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Open Deficiencies</span>
              <p className="text-2xl font-black text-red-700 mt-1">{metrics.openDeficienciesCount}</p>
              <span className="text-[10px] text-red-600 font-semibold">Under rectification</span>
            </div>

            <div className="bg-white border border-slate-300 p-4 rounded shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Council Approved</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{metrics.byStatus.approved || 0}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">LOA issued</span>
            </div>
          </div>

          {/* Workflow Bottlenecks Table */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase">
              <span>Operational Stage Latency & Bottleneck Monitoring</span>
              <span className="text-amber-300 font-mono">Real-Time Queue Telemetry</span>
            </div>
            <table className="govt-table">
              <thead>
                <tr>
                  <th>Workflow Stage</th>
                  <th>Applications in Queue</th>
                  <th>Average Wait Time</th>
                  <th>Bottleneck Alert Level</th>
                </tr>
              </thead>
              <tbody>
                {metrics.bottlenecks.map((b, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold text-slate-800">{b.stage}</td>
                    <td className="font-bold text-blue-900">{b.pendingCount} Cases</td>
                    <td className="font-mono">{b.avgWaitDays} Days</td>
                    <td>
                      {b.pendingCount > 0 ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          Active Queue ({b.pendingCount})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          Clear
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Reviewer Assignments */}
      {activeSubTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded p-5 shadow-xs max-w-xl">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider mb-3 pb-2 border-b">
              Assign Scrutiny Reviewer to Application
            </h3>

            <form onSubmit={handleAssign} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Application Queue Item</label>
                <select
                  value={selectedAppForAssign}
                  onChange={(e) => setSelectedAppForAssign(e.target.value)}
                  className="w-full govt-input text-xs"
                  required
                >
                  <option value="">-- Choose Application --</option>
                  {applications.map(app => (
                    <option key={app.applicationId} value={app.applicationId}>
                      {app.applicationId} — {app.institutionName} ({app.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Regional Scrutiny Officer</label>
                <select
                  value={selectedReviewerId}
                  onChange={(e) => setSelectedReviewerId(e.target.value)}
                  className="w-full govt-input text-xs"
                  required
                >
                  <option value="">-- Choose Reviewer --</option>
                  {reviewers.map(rev => (
                    <option key={rev.uid} value={rev.uid}>
                      {rev.displayName} ({rev.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isAssigning || !selectedAppForAssign || !selectedReviewerId}
                  className="btn-govt-saffron text-xs disabled:opacity-50"
                >
                  {isAssigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>

          {/* Current Assignments List */}
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#0B3C5D] text-white px-4 py-2 text-xs font-bold uppercase">
              Current Application Assignment Roster
            </div>
            <table className="govt-table text-xs">
              <thead>
                <tr>
                  <th>Application ID</th>
                  <th>Institution</th>
                  <th>Assigned Reviewer</th>
                  <th>Status</th>
                  <th>Stage</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(app => (
                  <tr key={app.applicationId}>
                    <td className="font-mono font-bold text-blue-900">{app.applicationId}</td>
                    <td>{app.institutionName}</td>
                    <td className="font-semibold text-slate-800">
                      {app.assignedReviewerName || <span className="text-amber-600 italic">Unassigned</span>}
                    </td>
                    <td><StatusBadge status={app.status} /></td>
                    <td className="capitalize">{app.currentStage.replace(/_/g, ' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Final Decisions (Council Authority) */}
      {activeSubTab === 'final_decisions' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <div className="bg-[#002147] text-white px-4 py-2.5 flex items-center justify-between text-xs font-bold uppercase">
              <span>Council Approval Bureau — Final Decision Authority</span>
              <span className="text-emerald-300">Mandatory Server Validation Enforced</span>
            </div>

            <div className="overflow-x-auto">
              <table className="govt-table text-xs">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Institution Name</th>
                    <th>Intake</th>
                    <th>Current Status</th>
                    <th>Stage</th>
                    <th>Council Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app.applicationId}>
                      <td className="font-mono font-bold text-blue-900">{app.applicationId}</td>
                      <td className="font-medium text-slate-800">{app.institutionName}</td>
                      <td>{app.formData.totalSanctionedIntake} Seats</td>
                      <td><StatusBadge status={app.status} /></td>
                      <td className="capitalize">{app.currentStage.replace(/_/g, ' ')}</td>
                      <td>
                        {app.status === 'approved' ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Approval Order Issued
                          </span>
                        ) : app.status === 'rejected' ? (
                          <span className="text-red-700 font-bold flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> Rejection Order Issued
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedAppForDecision(app);
                              setDecisionRemarks('');
                            }}
                            className="btn-govt-saffron text-[11px] py-1 px-2.5"
                          >
                            Execute Council Order
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: User Roles & Provisioning */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
              System User Directory & Role Allowlist
            </h3>
            <button
              onClick={() => setIsNewUserModalOpen(true)}
              className="btn-govt-saffron text-xs flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Provision New User
            </button>
          </div>

          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <table className="govt-table text-xs">
              <thead>
                <tr>
                  <th>UID</th>
                  <th>Full Name</th>
                  <th>Official Email</th>
                  <th>Authorized Role</th>
                  <th>Institution Ref</th>
                  <th>Account Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.uid}>
                    <td className="font-mono text-slate-500">{u.uid}</td>
                    <td className="font-bold text-slate-800">{u.displayName}</td>
                    <td className="font-mono text-slate-600">{u.email}</td>
                    <td>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-900">
                        {u.role}
                      </span>
                    </td>
                    <td>{u.institutionId || <span className="text-slate-400">N/A</span>}</td>
                    <td>
                      <span className="text-emerald-700 font-bold">Active</span>
                    </td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => onSetUserRole(u.uid, e.target.value as UserRole)}
                        className="govt-input text-[11px] py-0.5"
                      >
                        <option value="institution">Institution</option>
                        <option value="reviewer">Reviewer</option>
                        <option value="inspector">Inspector</option>
                        <option value="committee">Committee</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: APH Rules Configuration */}
      {activeSubTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                Approval Process Handbook (APH 2027) Regulatory Engine
              </h3>
              <p className="text-xs text-slate-500">
                Active Version: <strong className="font-mono text-blue-900">aph-2027-v1</strong> | Versioned & Immutable
              </p>
            </div>
            <button
              onClick={() => alert('Rule version aph-2027-v1 is verified and locked for Academic Year 2027-28.')}
              className="btn-govt-secondary text-xs"
            >
              Verify Version Lock
            </button>
          </div>

          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <table className="govt-table text-xs">
              <thead>
                <tr>
                  <th>Rule ID</th>
                  <th>Norm Title</th>
                  <th>Description</th>
                  <th>Severity</th>
                  <th>Version</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rules.map(r => (
                  <tr key={r.ruleId}>
                    <td className="font-mono font-bold text-blue-900">{r.ruleId}</td>
                    <td className="font-semibold text-slate-800">{r.name}</td>
                    <td className="text-slate-600 max-w-sm">{r.description}</td>
                    <td><StatusBadge status={r.severity} /></td>
                    <td className="font-mono">{r.version}</td>
                    <td><span className="text-emerald-700 font-bold">ACTIVE</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: Protected Audit Trail */}
      {activeSubTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-sm text-[#002147] uppercase tracking-wider">
                Immutable Server Audit Log (PRD Section 7.8 & 11.5)
              </h3>
              <p className="text-xs text-slate-500">
                Append-only ledger of privileged administrative and workflow operations
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              Total Logged Events: {auditEvents.length}
            </span>
          </div>

          <div className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
            <table className="govt-table text-xs">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Actor Email</th>
                  <th>Timestamp (IST)</th>
                  <th>Correlation ID</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map(evt => (
                  <tr key={evt.eventId}>
                    <td className="font-mono text-slate-500">{evt.eventId}</td>
                    <td className="font-bold text-blue-900">{evt.action}</td>
                    <td className="font-mono text-slate-700">{evt.resourceType}: {evt.resourceId}</td>
                    <td className="text-slate-600">{evt.actorEmail}</td>
                    <td className="font-mono text-slate-500">
                      {new Date(evt.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </td>
                    <td className="font-mono text-[10px] text-slate-400">{evt.correlationId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Execute Final Council Decision */}
      {selectedAppForDecision && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
              <div>
                <h3 className="font-bold text-sm">Council Approval Order Execution</h3>
                <p className="text-[11px] text-slate-300">{selectedAppForDecision.applicationId} | {selectedAppForDecision.institutionName}</p>
              </div>
              <button onClick={() => setSelectedAppForDecision(null)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleFinalDecisionSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Final Council Decision</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="p-3 border rounded flex items-center gap-2 cursor-pointer bg-emerald-50 border-emerald-400">
                    <input
                      type="radio"
                      name="decision"
                      checked={decisionOutcome === 'approved'}
                      onChange={() => setDecisionOutcome('approved')}
                      className="accent-emerald-700"
                    />
                    <div>
                      <span className="font-bold text-emerald-950 block">GRANT APPROVAL</span>
                      <span className="text-[10px] text-emerald-800">Generates official Letter of Approval</span>
                    </div>
                  </label>

                  <label className="p-3 border rounded flex items-center gap-2 cursor-pointer bg-red-50 border-red-400">
                    <input
                      type="radio"
                      name="decision"
                      checked={decisionOutcome === 'rejected'}
                      onChange={() => setDecisionOutcome('rejected')}
                      className="accent-red-700"
                    />
                    <div>
                      <span className="font-bold text-red-950 block">REJECT APPLICATION</span>
                      <span className="text-[10px] text-red-800">Issues rejection order with grounds</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Official Remarks / Order Transcript <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={decisionRemarks}
                  onChange={(e) => setDecisionRemarks(e.target.value)}
                  placeholder="Record formal Council findings, compliance verification transcript, and authorized decision notes..."
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-[11px] text-amber-900">
                <strong>Statutory Notice:</strong> This action permanently seals the application status for Academic Year {selectedAppForDecision.academicYear} and attaches your digital signature to the Council order.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedAppForDecision(null)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDecision || !decisionRemarks.trim()}
                  className="btn-govt-saffron text-xs disabled:opacity-50"
                >
                  {isSubmittingDecision ? 'Executing Order...' : 'Execute Council Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Provision New User */}
      {isNewUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-300 shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-[#002147] text-white p-4 flex items-center justify-between border-b-2 border-orange-500">
              <h3 className="font-bold text-sm">Provision System User</h3>
              <button onClick={() => setIsNewUserModalOpen(false)} className="text-white">✕</button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name & Designation</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. Dr. Ramesh Gupta (Regional Officer)"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Email Address</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="r.gupta@aicte-india.org"
                  className="w-full govt-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full govt-input text-xs"
                >
                  <option value="reviewer">Reviewer (Regional Scrutiny)</option>
                  <option value="institution">Institution User</option>
                  <option value="inspector">Inspector (EVC Field)</option>
                  <option value="committee">Committee Member (SAC/SHC)</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              {newUserRole === 'institution' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Institution ID</label>
                  <input
                    type="text"
                    value={newUserInstId}
                    onChange={(e) => setNewUserInstId(e.target.value)}
                    placeholder="inst_delhi_001"
                    className="w-full govt-input text-xs"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewUserModalOpen(false)}
                  className="btn-govt-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="btn-govt-saffron text-xs disabled:opacity-50"
                >
                  {isCreatingUser ? 'Provisioning...' : 'Provision User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
