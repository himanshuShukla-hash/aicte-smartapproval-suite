import React, { useState, useEffect } from 'react';
import { 
  UserProfile, 
  Application, 
  Deficiency, 
  ApplicationDocument, 
  WorkflowEvent, 
  AuditEvent, 
  NotificationItem, 
  ComplianceRule, 
  AdminOverviewMetrics, 
  ApplicationType, 
  ApplicationFormData, 
  RuleSeverity,
  UserRole 
} from './types/api';
import * as api from './services/api';
import { PassportSevaHeader } from './components/common/PassportSevaHeader';
import { PassportSevaFooter } from './components/common/PassportSevaFooter';
import { PublicHomeView } from './components/common/PublicHomeView';
import { InstitutionPortal } from './components/institution/InstitutionPortal';
import { ApplicationWizard } from './components/institution/ApplicationWizard';
import { ReviewerPortal } from './components/reviewer/ReviewerPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { LoaCertificateModal } from './components/common/LoaCertificateModal';
import { AuthModal } from './components/auth/AuthModal';
import { OfficialDocModal, OfficialDocContent } from './components/common/OfficialDocModal';
import { OFFICIAL_DOCS } from './services/officialDocsData';
import { StatusBadge } from './components/common/StatusBadge';
import { BookOpen, AlertCircle, FileCheck, ShieldCheck } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deficiencies, setDeficiencies] = useState<Deficiency[]>([]);
  const [documents, setDocuments] = useState<ApplicationDocument[]>([]);
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [metrics, setMetrics] = useState<AdminOverviewMetrics | null>(null);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [editingApplication, setEditingApplication] = useState<Application | null>(null);
  const [loaModalApp, setLoaModalApp] = useState<Application | null>(null);
  const [viewingOfficialDoc, setViewingOfficialDoc] = useState<OfficialDocContent | null>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  const refreshAllData = async () => {
    try {
      const profile = await api.getMyProfile();
      setCurrentUser(profile);

      const apps = await api.listMyApplications();
      setApplications(apps);

      const allUsers = api.store.users;
      setUsersList(allUsers);

      setDeficiencies([...api.store.deficiencies]);
      setDocuments([...api.store.documents]);
      setWorkflowEvents([...api.store.workflowEvents]);
      setAuditEvents([...api.store.auditEvents]);

      const notifs = await api.listMyNotifications();
      setNotifications(notifs);

      const ruleList = await api.listComplianceRules();
      setRules(ruleList);

      if (profile.role === 'admin' || profile.role === 'reviewer') {
        const m = await api.getAdminOverview();
        setMetrics(m);
      }
    } catch (err) {
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  // Handlers
  const handleSwitchUser = async (uid: string) => {
    try {
      const switched = await api.switchSessionUser(uid);
      setCurrentUser(switched);
      setEditingApplication(null);

      // Navigate to role's relevant default tab
      if (switched.role === 'institution') {
        setActiveTab('institution_applications');
      } else if (switched.role === 'reviewer' || switched.role === 'committee') {
        setActiveTab('reviewer_queue');
      } else if (switched.role === 'admin') {
        setActiveTab('admin_dashboard');
      }

      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateNewApplication = async (type: ApplicationType, year: string) => {
    try {
      const newApp = await api.createApplication({ applicationType: type, academicYear: year });
      await refreshAllData();
      setEditingApplication(newApp);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveDraft = async (formData: Partial<ApplicationFormData>) => {
    if (!editingApplication) return;
    try {
      const updated = await api.updateApplicationDraft(
        editingApplication.applicationId,
        formData,
        editingApplication.version
      );
      setEditingApplication(updated);
      await refreshAllData();
      alert('Draft saved successfully.');
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  const handleSubmitApplication = async () => {
    if (!editingApplication) return;
    try {
      const { application, evaluation } = await api.submitApplication(
        editingApplication.applicationId,
        editingApplication.version
      );
      setEditingApplication(application);
      await refreshAllData();
      alert(`Application ${application.applicationId} submitted successfully! Server compliance result: ${evaluation.overallStatus.toUpperCase()}`);
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  const handleEvaluateCompliance = async (appId: string) => {
    const res = await api.evaluateCompliance(appId, 'authoritative');
    await refreshAllData();
    return res;
  };

  const handleCreateDeficiency = async (
    appId: string, 
    ruleId: string, 
    ruleName: string, 
    desc: string, 
    severity: 'critical' | 'major' | 'minor'
  ) => {
    await api.createDeficiency({
      applicationId: appId,
      ruleId,
      ruleName,
      description: desc,
      severity
    });
    await refreshAllData();
  };

  const handleRespondDeficiency = async (deficiencyId: string, text: string, docIds: string[]) => {
    await api.respondToDeficiency(deficiencyId, text, docIds);
    await refreshAllData();
  };

  const handleResolveDeficiency = async (deficiencyId: string, remarks: string, action: 'resolve' | 'reopen') => {
    await api.resolveDeficiency(deficiencyId, remarks, action);
    await refreshAllData();
  };

  const handleRecordReviewDecision = async (
    appId: string, 
    decision: 'recommend_evc' | 'return_rectification' | 'recommend_approval' | 'recommend_rejection', 
    comment: string
  ) => {
    await api.recordReviewDecision(appId, decision, comment);
    await refreshAllData();
  };

  const handleAssignReviewer = async (appId: string, reviewerId: string) => {
    await api.assignReviewer(appId, reviewerId);
    await refreshAllData();
  };

  const handleRecordFinalDecision = async (appId: string, decision: 'approved' | 'rejected', remarks: string) => {
    await api.recordFinalDecision(appId, decision, remarks);
    await refreshAllData();
  };

  const handleCreateUser = async (displayName: string, email: string, role: UserRole, instId?: string) => {
    await api.adminCreateUser({ displayName, email, role, institutionId: instId });
    await refreshAllData();
  };

  const handleSetUserRole = async (uid: string, role: UserRole) => {
    await api.adminSetUserRole(uid, role);
    await refreshAllData();
  };

  const handleUploadDocument = async (appId: string, file: File, docType: ApplicationDocument['documentType']) => {
    await api.registerDocument({
      applicationId: appId,
      documentType: docType,
      fileName: file.name,
      sizeBytes: file.size,
      contentType: file.type || 'application/pdf'
    });
    await refreshAllData();
  };

  const handleMarkNotifRead = async (id: string) => {
    await api.markNotificationRead(id);
    await refreshAllData();
  };

  const handleResetData = () => {
    if (confirm('Reset all demo applications, deficiencies, and audit records to baseline?')) {
      api.store.resetToDefault();
      refreshAllData();
      setActiveTab('home');
      setEditingApplication(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f6f9]">
      
      {/* 1. Authentic Passport Seva Government Header */}
      <PassportSevaHeader
        currentUser={currentUser}
        usersList={usersList}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setEditingApplication(null);
        }}
        unreadCount={unreadCount}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* 2. Main Portal Content Router */}
      <main className="flex-1">
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 font-semibold">
            Connecting to National Approval Servers...
          </div>
        ) : (
          <>
            {/* View 1: Application Wizard (Edit / Pre-Check / Submit) */}
            {editingApplication ? (
              <div className="max-w-7xl mx-auto px-4 py-6">
                <ApplicationWizard
                  application={editingApplication}
                  onSaveDraft={handleSaveDraft}
                  onSubmit={handleSubmitApplication}
                  onUploadDocument={(file, docType) => handleUploadDocument(editingApplication.applicationId, file, docType)}
                  documents={documents.filter(d => d.applicationId === editingApplication.applicationId)}
                  onCancel={() => setEditingApplication(null)}
                />
              </div>
            ) : (
              <>
                {/* View 2: Public Home View (Iconic 3-Column Passport Seva) */}
                {activeTab === 'home' && (
                  <PublicHomeView
                    onNavigateTab={setActiveTab}
                    onOpenAuth={() => setIsAuthModalOpen(true)}
                    applications={applications}
                    onSelectApplication={(appId) => {
                      const found = applications.find(a => a.applicationId === appId);
                      if (found) {
                        setEditingApplication(found);
                      }
                    }}
                  />
                )}

                {/* View 3: Institution Portal */}
                {activeTab === 'institution_applications' && currentUser && (
                  <InstitutionPortal
                    currentUser={currentUser}
                    applications={applications}
                    deficiencies={deficiencies}
                    workflowEvents={workflowEvents}
                    documents={documents}
                    onCreateNewApplication={handleCreateNewApplication}
                    onSelectApplication={(app) => setEditingApplication(app)}
                    onRespondDeficiency={handleRespondDeficiency}
                    onUploadDocument={handleUploadDocument}
                    onOpenLoa={(app) => setLoaModalApp(app)}
                  />
                )}

                {/* View 4: Reviewer Scrutiny Queue */}
                {activeTab === 'reviewer_queue' && currentUser && (
                  <ReviewerPortal
                    currentUser={currentUser}
                    applications={applications}
                    deficiencies={deficiencies}
                    documents={documents}
                    onEvaluateCompliance={handleEvaluateCompliance}
                    onCreateDeficiency={handleCreateDeficiency}
                    onResolveDeficiency={handleResolveDeficiency}
                    onRecordDecision={handleRecordReviewDecision}
                    workflowEvents={workflowEvents}
                  />
                )}

                {/* View 5: Central Admin Dashboard */}
                {activeTab === 'admin_dashboard' && currentUser && (
                  <AdminPortal
                    currentUser={currentUser}
                    applications={applications}
                    users={usersList}
                    metrics={metrics}
                    auditEvents={auditEvents}
                    rules={rules}
                    onAssignReviewer={handleAssignReviewer}
                    onRecordFinalDecision={handleRecordFinalDecision}
                    onCreateUser={handleCreateUser}
                    onSetUserRole={handleSetUserRole}
                    onPublishRules={async (r) => {
                      await api.adminPublishComplianceRules(r);
                      await refreshAllData();
                    }}
                  />
                )}

                {/* View 6: APH 2027 Norms & Rules Reference */}
                {activeTab === 'aph_rules' && (
                  <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
                    <div className="bg-white border border-slate-300 rounded p-5 shadow-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-orange-600" />
                        <h2 className="text-base font-bold text-[#002147] uppercase tracking-wider">
                          Approval Process Handbook (APH 2027-28) Regulatory Specifications
                        </h2>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        All compliance decisions in AICTE SmartApproval Suite are evaluated deterministically using version-locked parameters. Client inputs are independently validated on the server.
                      </p>

                      <table className="govt-table text-xs">
                        <thead>
                          <tr>
                            <th>Rule ID</th>
                            <th>Norm Requirement</th>
                            <th>Rule Type</th>
                            <th>Parameters / Threshold</th>
                            <th>Severity</th>
                            <th>Version</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.map(r => (
                            <tr key={r.ruleId}>
                              <td className="font-mono font-bold text-blue-900">{r.ruleId}</td>
                              <td className="font-semibold text-slate-800">{r.name}</td>
                              <td className="capitalize font-mono text-[11px]">{r.ruleType}</td>
                              <td className="font-mono text-[11px] text-slate-600">{JSON.stringify(r.parameters)}</td>
                              <td><StatusBadge status={r.severity} /></td>
                              <td className="font-mono">{r.version}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* 3. Official Government Footer with Working Links */}
      <PassportSevaFooter 
        onOpenDoc={(key) => setViewingOfficialDoc(OFFICIAL_DOCS[key] || null)}
      />

      {/* Drawers and Modals */}
      <OfficialDocModal
        doc={viewingOfficialDoc}
        isOpen={!!viewingOfficialDoc}
        onClose={() => setViewingOfficialDoc(null)}
      />

      <NotificationDrawer
        notifications={notifications}
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onMarkRead={handleMarkNotifRead}
        onSelectApplication={(appId) => {
          const app = applications.find(a => a.applicationId === appId);
          if (app) setEditingApplication(app);
        }}
      />

      <LoaCertificateModal
        application={loaModalApp}
        isOpen={!!loaModalApp}
        onClose={() => setLoaModalApp(null)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        usersList={usersList}
        onSelectUser={handleSwitchUser}
        onRegisterUser={async (name, email, role) => {
          await handleCreateUser(name, email, role);
        }}
      />

    </div>
  );
}

export default App;
