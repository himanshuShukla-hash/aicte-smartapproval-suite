import {
  UserProfile,
  Institution,
  Application,
  ApplicationType,
  ApplicationStatus,
  ApplicationStage,
  ApplicationFormData,
  ApplicationDocument,
  ComplianceRule,
  ComplianceEvaluation,
  Deficiency,
  WorkflowEvent,
  AuditEvent,
  NotificationItem,
  AdminOverviewMetrics,
  UserRole
} from '../types/api';
import { 
  DEFAULT_APH_RULES, 
  CURRENT_APH_RULESET_VERSION, 
  runComplianceEvaluation 
} from './complianceRules';
import {
  SEED_USERS,
  SEED_INSTITUTIONS,
  SEED_APPLICATIONS,
  SEED_DEFICIENCIES,
  SEED_DOCUMENTS,
  SEED_WORKFLOW_EVENTS,
  SEED_AUDIT_EVENTS,
  SEED_NOTIFICATIONS
} from './seedData';

// Local storage keys
const STORAGE_PREFIX = 'aicte_smartapproval_v2_';

function loadFromStorage<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveToStorage<T>(key: string, val: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage write error', err);
  }
}

// In-Memory state with localStorage backing
class BackendStore {
  users: UserProfile[] = loadFromStorage('users', SEED_USERS);
  institutions: Institution[] = loadFromStorage('institutions', SEED_INSTITUTIONS);
  applications: Application[] = loadFromStorage('applications', SEED_APPLICATIONS);
  deficiencies: Deficiency[] = loadFromStorage('deficiencies', SEED_DEFICIENCIES);
  documents: ApplicationDocument[] = loadFromStorage('documents', SEED_DOCUMENTS);
  workflowEvents: WorkflowEvent[] = loadFromStorage('workflowEvents', SEED_WORKFLOW_EVENTS);
  auditEvents: AuditEvent[] = loadFromStorage('auditEvents', SEED_AUDIT_EVENTS);
  notifications: NotificationItem[] = loadFromStorage('notifications', SEED_NOTIFICATIONS);
  complianceRules: ComplianceRule[] = loadFromStorage('complianceRules', DEFAULT_APH_RULES);
  evaluations: Record<string, ComplianceEvaluation> = loadFromStorage('evaluations', {});

  // Current authenticated user session (default: first institution user)
  currentUserId: string = loadFromStorage('currentUserId', 'usr_inst_delhi');

  persistAll() {
    saveToStorage('users', this.users);
    saveToStorage('institutions', this.institutions);
    saveToStorage('applications', this.applications);
    saveToStorage('deficiencies', this.deficiencies);
    saveToStorage('documents', this.documents);
    saveToStorage('workflowEvents', this.workflowEvents);
    saveToStorage('auditEvents', this.auditEvents);
    saveToStorage('notifications', this.notifications);
    saveToStorage('complianceRules', this.complianceRules);
    saveToStorage('evaluations', this.evaluations);
    saveToStorage('currentUserId', this.currentUserId);
  }

  resetToDefault() {
    localStorage.clear();
    this.users = [...SEED_USERS];
    this.institutions = [...SEED_INSTITUTIONS];
    this.applications = [...SEED_APPLICATIONS];
    this.deficiencies = [...SEED_DEFICIENCIES];
    this.documents = [...SEED_DOCUMENTS];
    this.workflowEvents = [...SEED_WORKFLOW_EVENTS];
    this.auditEvents = [...SEED_AUDIT_EVENTS];
    this.notifications = [...SEED_NOTIFICATIONS];
    this.complianceRules = [...DEFAULT_APH_RULES];
    this.evaluations = {};
    this.currentUserId = 'usr_inst_delhi';
    this.persistAll();
  }
}

export const store = new BackendStore();

// Utility for creating server audit record
function logAudit(
  actor: UserProfile,
  action: string,
  resourceType: AuditEvent['resourceType'],
  resourceId: string,
  metadata?: Record<string, any>
): void {
  const auditEvent: AuditEvent = {
    eventId: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    actorUid: actor.uid,
    actorEmail: actor.email,
    action,
    resourceType,
    resourceId,
    timestamp: new Date().toISOString(),
    correlationId: `corr_${Date.now()}`,
    metadata
  };
  store.auditEvents.unshift(auditEvent);
  store.persistAll();
}

// -------------------------------------------------------------
// 9.1 Authentication and Profiles
// -------------------------------------------------------------

export async function getMyProfile(): Promise<UserProfile> {
  const user = store.users.find(u => u.uid === store.currentUserId);
  if (!user) {
    throw new Error('unauthenticated: User session not found');
  }
  if (!user.active) {
    throw new Error('permission-denied: Account is deactivated');
  }
  return { ...user };
}

export async function switchSessionUser(uid: string): Promise<UserProfile> {
  const user = store.users.find(u => u.uid === uid);
  if (!user) throw new Error('not-found: User does not exist');
  store.currentUserId = uid;
  store.persistAll();
  return { ...user };
}

export async function adminCreateUser(params: {
  displayName: string;
  email: string;
  role: UserRole;
  institutionId?: string;
}): Promise<UserProfile> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Only authorized administrators can provision users');
  }

  const existing = store.users.find(u => u.email.toLowerCase() === params.email.toLowerCase());
  if (existing) {
    throw new Error('already-exists: Email address already registered');
  }

  const newUser: UserProfile = {
    uid: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    displayName: params.displayName,
    email: params.email,
    role: params.role,
    institutionId: params.institutionId,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  store.users.push(newUser);
  logAudit(caller, 'USER_PROVISIONED', 'user', newUser.uid, { role: newUser.role, email: newUser.email });
  store.persistAll();
  return newUser;
}

export async function adminSetUserRole(uid: string, role: UserRole): Promise<UserProfile> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Only administrators can alter user roles');
  }

  const target = store.users.find(u => u.uid === uid);
  if (!target) throw new Error('not-found: Target user not found');

  target.role = role;
  target.updatedAt = new Date().toISOString();

  logAudit(caller, 'USER_ROLE_CHANGED', 'user', uid, { newRole: role });
  store.persistAll();
  return { ...target };
}

export async function listAllUsers(): Promise<UserProfile[]> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Access restricted to administrators');
  }
  return [...store.users];
}

export async function listAllInstitutions(): Promise<Institution[]> {
  return [...store.institutions];
}

// -------------------------------------------------------------
// 9.2 Applications
// -------------------------------------------------------------

export async function listMyApplications(): Promise<Application[]> {
  const caller = await getMyProfile();

  if (caller.role === 'institution') {
    return store.applications.filter(app => app.institutionId === caller.institutionId);
  } else if (caller.role === 'reviewer') {
    // Reviewers see assigned and submitted applications in the scrutiny pipeline (excluding unsubmitted drafts)
    return store.applications.filter(app => 
      app.status !== 'draft' && (
        app.assignedReviewerId === caller.uid || 
        app.status === 'submitted' || 
        app.status === 'scrutiny' || 
        app.status === 'rectification' || 
        app.status === 're_scrutiny'
      )
    );
  } else {
    // Admin / Committee sees all applications
    return [...store.applications];
  }
}

export async function getApplication(applicationId: string): Promise<Application> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application record not found');

  // Verify authorization
  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Institution cannot view applications of another institution');
  }

  return { ...app };
}

export async function createApplication(params: {
  applicationType: ApplicationType;
  academicYear: string;
}): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'institution' || !caller.institutionId) {
    throw new Error('permission-denied: Only institution users can initiate application drafts');
  }

  const inst = store.institutions.find(i => i.institutionId === caller.institutionId);
  const serial = (store.applications.length + 1).toString().padStart(3, '0');
  const appId = `AICTE-2027-${inst ? inst.state.substring(0, 2).toUpperCase() : 'IN'}-${serial}`;

  const newApp: Application = {
    applicationId: appId,
    institutionId: caller.institutionId,
    institutionName: inst ? inst.name : 'Technical Institution',
    applicationType: params.applicationType,
    academicYear: params.academicYear || '2027-28',
    status: 'draft',
    currentStage: 'institution_submission',
    createdBy: caller.uid,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    formData: {
      program: 'Engineering & Technology',
      level: 'UG',
      totalSanctionedIntake: 300,
      totalEnrolledStudents: 300,
      fullTimeFacultyCount: 20,
      cadreRatio: {
        professors: 2,
        associateProfessors: 4,
        assistantProfessors: 14
      },
      principalQualified: true,
      landAreaAcres: 3.0,
      landType: 'Urban',
      instructionalAreaSqM: 1800,
      administrativeAreaSqM: 1000,
      amenitiesAreaSqM: 500,
      computerLabCount: 3,
      computersCount: 100,
      libraryTitlesCount: 550,
      libraryVolumesCount: 2400,
      nationalJournalsCount: 15,
      internationalJournalsCount: 6,
      barrierFreeCampus: true,
      fireSafetyNoc: true,
      antiRaggingCommitteeFormed: true
    }
  };

  store.applications.unshift(newApp);
  logAudit(caller, 'APPLICATION_CREATED', 'application', newApp.applicationId, { type: params.applicationType });
  store.persistAll();
  return { ...newApp };
}

export async function updateApplicationDraft(
  applicationId: string, 
  formData: Partial<ApplicationFormData>,
  expectedVersion: number
): Promise<Application> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role !== 'institution' || app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Unauthorized to update this application');
  }

  if (app.status !== 'draft' && app.status !== 'rectification') {
    throw new Error(`failed-precondition: Application in status "${app.status}" cannot be modified directly`);
  }

  // Optimistic concurrency check
  if (app.version !== expectedVersion) {
    throw new Error(`aborted: Concurrency conflict. Stored version is ${app.version}, expected ${expectedVersion}. Please reload.`);
  }

  app.formData = {
    ...app.formData,
    ...formData
  };
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  logAudit(caller, 'APPLICATION_DRAFT_UPDATED', 'application', applicationId, { version: app.version });
  store.persistAll();
  return { ...app };
}

export async function submitApplication(
  applicationId: string,
  expectedVersion: number
): Promise<{ application: Application; evaluation: ComplianceEvaluation }> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role !== 'institution' || app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Unauthorized to submit this application');
  }

  if (app.status !== 'draft' && app.status !== 'rectification') {
    throw new Error(`failed-precondition: Only drafts or applications in rectification can be submitted (current: ${app.status})`);
  }

  if (app.version !== expectedVersion) {
    throw new Error(`aborted: Concurrency conflict. Version ${app.version} vs expected ${expectedVersion}`);
  }

  // Mandatory Prerequisite validation
  if (!app.formData.program || !app.formData.totalSanctionedIntake || app.formData.totalSanctionedIntake <= 0) {
    throw new Error('invalid-argument: Sanctioned intake and program cannot be empty');
  }

  // Run authoritative server compliance evaluation
  const evaluation = runComplianceEvaluation(applicationId, app.formData, caller.uid);
  store.evaluations[evaluation.evaluationId] = evaluation;
  app.lastEvaluationId = evaluation.evaluationId;

  // Perform atomic transition
  const fromStatus = app.status;
  const toStatus: ApplicationStatus = app.status === 'rectification' ? 're_scrutiny' : 'submitted';
  const toStage: ApplicationStage = app.status === 'rectification' ? 're_scrutiny' : 'scrutiny';

  app.status = toStatus;
  app.currentStage = toStage;
  app.submittedAt = new Date().toISOString();
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  // Workflow event record
  const correlationId = `corr_sub_${Date.now()}`;
  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: 'submitApplication',
    fromStatus,
    toStatus,
    comment: `Application formally submitted. Compliance result: ${evaluation.overallStatus} (${evaluation.summary.passed} passed, ${evaluation.summary.failed} failed).`,
    timestamp: new Date().toISOString(),
    correlationId
  });

  // Notify Reviewers / Admins
  store.notifications.unshift({
    notificationId: `notif_${Date.now()}`,
    recipientUid: 'usr_reviewer_sharma',
    applicationId,
    type: 'submission_confirmed',
    message: `Application ${applicationId} submitted by ${app.institutionName} and is awaiting Scrutiny.`,
    readAt: null,
    deliveryStatus: 'delivered',
    createdAt: new Date().toISOString()
  });

  logAudit(caller, 'APPLICATION_SUBMITTED', 'application', applicationId, {
    evaluationId: evaluation.evaluationId,
    overallStatus: evaluation.overallStatus
  });

  store.persistAll();
  return { application: { ...app }, evaluation };
}

export async function assignReviewer(applicationId: string, reviewerId: string): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Only administrators can assign official reviewers');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  const reviewer = store.users.find(u => u.uid === reviewerId && u.role === 'reviewer');
  if (!reviewer) throw new Error('invalid-argument: Invalid reviewer UID');

  app.assignedReviewerId = reviewer.uid;
  app.assignedReviewerName = reviewer.displayName;
  app.currentStage = 'scrutiny';
  if (app.status === 'submitted') {
    app.status = 'scrutiny';
  }
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  // Workflow and Audit
  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: 'assignReviewer',
    fromStatus: app.status,
    toStatus: app.status,
    comment: `Assigned official reviewer: ${reviewer.displayName}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr_asgn_${Date.now()}`
  });

  // Notify Reviewer
  store.notifications.unshift({
    notificationId: `notif_${Date.now()}`,
    recipientUid: reviewer.uid,
    applicationId,
    type: 'assignment',
    message: `You have been assigned as Official Scrutiny Reviewer for ${applicationId} (${app.institutionName}).`,
    readAt: null,
    deliveryStatus: 'delivered',
    createdAt: new Date().toISOString()
  });

  logAudit(caller, 'REVIEWER_ASSIGNED', 'application', applicationId, { reviewerId });
  store.persistAll();
  return { ...app };
}

// -------------------------------------------------------------
// 9.3 Compliance
// -------------------------------------------------------------

export async function evaluateCompliance(
  applicationId: string, 
  evaluationMode: 'precheck' | 'authoritative' = 'authoritative'
): Promise<ComplianceEvaluation> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  // Authorization: Only owner institution or reviewer/admin can evaluate
  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Cannot run evaluation on foreign application');
  }

  const evaluation = runComplianceEvaluation(
    applicationId,
    app.formData,
    caller.uid,
    CURRENT_APH_RULESET_VERSION
  );

  store.evaluations[evaluation.evaluationId] = evaluation;
  app.lastEvaluationId = evaluation.evaluationId;

  logAudit(caller, 'COMPLIANCE_EVALUATED', 'application', applicationId, {
    mode: evaluationMode,
    overallStatus: evaluation.overallStatus,
    failedRules: evaluation.results.filter(r => r.status === 'fail').map(r => r.ruleId)
  });

  store.persistAll();
  return evaluation;
}

export async function getComplianceEvaluation(evaluationId: string): Promise<ComplianceEvaluation> {
  const evalRecord = store.evaluations[evaluationId];
  if (!evalRecord) throw new Error('not-found: Compliance evaluation not found');
  return { ...evalRecord };
}

export async function listComplianceRules(): Promise<ComplianceRule[]> {
  return [...store.complianceRules];
}

export async function adminPublishComplianceRules(rules: ComplianceRule[]): Promise<ComplianceRule[]> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Only administrators can publish regulatory rule versions');
  }

  store.complianceRules = rules.map(r => ({
    ...r,
    publishedBy: caller.displayName,
    publishedAt: new Date().toISOString()
  }));

  logAudit(caller, 'RULES_PUBLISHED', 'compliance_rule', CURRENT_APH_RULESET_VERSION, {
    ruleCount: rules.length
  });

  store.persistAll();
  return [...store.complianceRules];
}

// -------------------------------------------------------------
// 9.4 Deficiencies
// -------------------------------------------------------------

export async function createDeficiency(params: {
  applicationId: string;
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
}): Promise<Deficiency> {
  const caller = await getMyProfile();
  if (caller.role !== 'reviewer' && caller.role !== 'admin') {
    throw new Error('permission-denied: Only official reviewers or administrators can create deficiencies');
  }

  const app = store.applications.find(a => a.applicationId === params.applicationId);
  if (!app) throw new Error('not-found: Application not found');

  const newDeficiency: Deficiency = {
    deficiencyId: `def_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    applicationId: params.applicationId,
    ruleId: params.ruleId,
    ruleName: params.ruleName,
    description: params.description,
    severity: params.severity,
    status: 'open',
    responseText: null,
    responseDocumentIds: [],
    responseSubmittedAt: null,
    createdBy: caller.uid,
    createdByName: caller.displayName,
    createdAt: new Date().toISOString(),
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    resolutionRemarks: null
  };

  store.deficiencies.unshift(newDeficiency);

  // Notify Institution user
  const instUser = store.users.find(u => u.institutionId === app.institutionId);
  if (instUser) {
    store.notifications.unshift({
      notificationId: `notif_${Date.now()}`,
      recipientUid: instUser.uid,
      applicationId: app.applicationId,
      type: 'deficiency_raised',
      message: `Scrutiny deficiency recorded on ${params.ruleName}: "${params.description.substring(0, 80)}..."`,
      readAt: null,
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString()
    });
  }

  logAudit(caller, 'DEFICIENCY_CREATED', 'deficiency', newDeficiency.deficiencyId, {
    applicationId: params.applicationId,
    ruleId: params.ruleId,
    severity: params.severity
  });

  store.persistAll();
  return { ...newDeficiency };
}

export async function listApplicationDeficiencies(applicationId: string): Promise<Deficiency[]> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Cannot view deficiencies of other institutions');
  }

  return store.deficiencies.filter(d => d.applicationId === applicationId);
}

export async function respondToDeficiency(
  deficiencyId: string,
  responseText: string,
  documentIds: string[]
): Promise<Deficiency> {
  const caller = await getMyProfile();
  const def = store.deficiencies.find(d => d.deficiencyId === deficiencyId);
  if (!def) throw new Error('not-found: Deficiency not found');

  const app = store.applications.find(a => a.applicationId === def.applicationId);
  if (!app || (caller.role === 'institution' && app.institutionId !== caller.institutionId)) {
    throw new Error('permission-denied: Unauthorized to submit response to this deficiency');
  }

  if (def.status === 'resolved') {
    throw new Error('failed-precondition: Deficiency is already resolved');
  }

  def.responseText = responseText;
  def.responseDocumentIds = documentIds;
  def.responseSubmittedAt = new Date().toISOString();
  def.status = 'rectification_submitted';

  // Notify Reviewer
  if (app.assignedReviewerId) {
    store.notifications.unshift({
      notificationId: `notif_${Date.now()}`,
      recipientUid: app.assignedReviewerId,
      applicationId: app.applicationId,
      type: 'rectification_received',
      message: `Institution submitted rectification response for deficiency on ${def.ruleName}.`,
      readAt: null,
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString()
    });
  }

  logAudit(caller, 'DEFICIENCY_RESPONSE_SUBMITTED', 'deficiency', deficiencyId, {
    documentCount: documentIds.length
  });

  store.persistAll();
  return { ...def };
}

export async function resolveDeficiency(
  deficiencyId: string,
  resolutionRemarks: string,
  action: 'resolve' | 'reopen'
): Promise<Deficiency> {
  const caller = await getMyProfile();
  if (caller.role !== 'reviewer' && caller.role !== 'admin') {
    throw new Error('permission-denied: Only reviewers or administrators can resolve or reopen deficiencies');
  }

  const def = store.deficiencies.find(d => d.deficiencyId === deficiencyId);
  if (!def) throw new Error('not-found: Deficiency not found');

  if (action === 'resolve') {
    def.status = 'resolved';
    def.resolvedBy = caller.uid;
    def.resolvedByName = caller.displayName;
    def.resolvedAt = new Date().toISOString();
    def.resolutionRemarks = resolutionRemarks;
  } else {
    def.status = 'reopened';
    def.resolutionRemarks = `Reopened: ${resolutionRemarks}`;
  }

  logAudit(caller, action === 'resolve' ? 'DEFICIENCY_RESOLVED' : 'DEFICIENCY_REOPENED', 'deficiency', deficiencyId, {
    resolutionRemarks
  });

  store.persistAll();
  return { ...def };
}

// -------------------------------------------------------------
// 9.5 Workflow Transitions
// -------------------------------------------------------------

export async function getWorkflowHistory(applicationId: string): Promise<WorkflowEvent[]> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Cannot inspect workflow history of foreign application');
  }

  return store.workflowEvents.filter(e => e.applicationId === applicationId);
}

export async function transitionApplication(
  applicationId: string,
  targetStatus: ApplicationStatus,
  comment: string
): Promise<Application> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  // Server-side State Transition Matrix Validation
  const validTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    draft: ['submitted'],
    submitted: ['scrutiny', 'rectification'],
    scrutiny: ['rectification', 're_scrutiny', 'evc', 'shc', 'sac', 'approved', 'rejected'],
    rectification: ['re_scrutiny', 'submitted'],
    re_scrutiny: ['rectification', 'evc', 'shc', 'sac', 'approved', 'rejected'],
    evc: ['shc', 'sac', 'rectification', 'approved', 'rejected'],
    shc: ['sac', 'rectification', 'approved', 'rejected'],
    sac: ['approved', 'rejected'],
    approved: [],
    rejected: []
  };

  const allowed = validTransitions[app.status] || [];
  if (!allowed.includes(targetStatus)) {
    throw new Error(`failed-precondition: Invalid workflow transition from "${app.status}" to "${targetStatus}".`);
  }

  // Role permissions
  if (targetStatus === 'approved' || targetStatus === 'rejected') {
    if (caller.role !== 'admin') {
      throw new Error('permission-denied: Final decisions (Approved/Rejected) can only be executed by the authorized Council Administrator');
    }
  }

  const fromStatus = app.status;
  app.status = targetStatus;

  // Map status to appropriate stage
  const stageMap: Record<ApplicationStatus, ApplicationStage> = {
    draft: 'institution_submission',
    submitted: 'scrutiny',
    scrutiny: 'scrutiny',
    rectification: 'rectification',
    re_scrutiny: 're_scrutiny',
    evc: 'evc_inspection',
    shc: 'committee_review',
    sac: 'committee_review',
    approved: 'council_decision',
    rejected: 'council_decision'
  };
  app.currentStage = stageMap[targetStatus];
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  // Workflow event
  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: 'transitionApplication',
    fromStatus,
    toStatus: targetStatus,
    comment,
    timestamp: new Date().toISOString(),
    correlationId: `corr_wf_${Date.now()}`
  });

  logAudit(caller, 'WORKFLOW_TRANSITION', 'application', applicationId, {
    fromStatus,
    toStatus: targetStatus,
    comment
  });

  store.persistAll();
  return { ...app };
}

export async function recordReviewDecision(
  applicationId: string,
  decision: 'recommend_evc' | 'return_rectification' | 'recommend_approval' | 'recommend_rejection',
  comment: string
): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'reviewer' && caller.role !== 'admin') {
    throw new Error('permission-denied: Only reviewers can record scrutiny recommendations');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  let targetStatus: ApplicationStatus = 'scrutiny';
  if (decision === 'recommend_evc') targetStatus = 'evc';
  if (decision === 'return_rectification') targetStatus = 'rectification';
  if (decision === 'recommend_approval') targetStatus = 'sac';
  if (decision === 'recommend_rejection') {
    // If reviewer recommends rejection at EVC or Scrutiny stage, mark rejectionStage and notify institution to appeal
    app.rejectionStage = app.status === 'evc' ? 'evc' : 'evc';
    app.rejectionReason = comment;
    targetStatus = 'shc'; // Route to Standing Hearing Committee appeal
  }

  return transitionApplication(applicationId, targetStatus, `[Scrutiny Decision: ${decision}] ${comment}`);
}

export async function scheduleCommitteeHearing(
  applicationId: string,
  committeeType: 'shc' | 'sac',
  schedule: {
    scheduledDate: string;
    scheduledTime: string;
    meetingLink: string;
    committeeNotes?: string;
  }
): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'committee' && caller.role !== 'admin') {
    throw new Error('permission-denied: Only Committee Members or Administrators can schedule hearings.');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (committeeType === 'shc') {
    app.shcHearingSchedule = schedule;
  } else {
    app.sacHearingSchedule = schedule;
  }
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  // Notify institution
  const instUsers = store.users.filter(u => u.institutionId === app.institutionId);
  for (const instUser of instUsers) {
    store.notifications.unshift({
      notificationId: `notif_hearing_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      recipientUid: instUser.uid,
      applicationId: app.applicationId,
      type: 'status_changed',
      message: `[${committeeType.toUpperCase()} Hearing Scheduled] Video Conference scheduled for ${schedule.scheduledDate} at ${schedule.scheduledTime}. VC Link: ${schedule.meetingLink}`,
      readAt: null,
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString()
    });
  }

  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: `schedule${committeeType.toUpperCase()}Hearing`,
    fromStatus: app.status,
    toStatus: app.status,
    comment: `[${committeeType.toUpperCase()} VC Scheduled] Date: ${schedule.scheduledDate} Time: ${schedule.scheduledTime}. VC Link: ${schedule.meetingLink}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr_vc_${Date.now()}`
  });

  logAudit(caller, 'COMMITTEE_VC_SCHEDULED', 'application', applicationId, {
    committeeType,
    schedule
  });

  store.persistAll();
  return { ...app };
}

export async function decideAppeal(
  applicationId: string,
  committeeType: 'shc' | 'sac',
  outcome: 'accept' | 'reject',
  remarks: string
): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'committee' && caller.role !== 'admin') {
    throw new Error('permission-denied: Only Committee Members or Administrators can decide appeals.');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (committeeType === 'shc') {
    if (outcome === 'accept') {
      // Appeal accepted: recommend approval to Council (status becomes approved by Council / approved)
      app.status = 'approved';
      app.currentStage = 'council_decision';
      app.finalDecisionRemarks = `[SHC Appeal Accepted] ${remarks}`;
      app.finalDecisionDate = new Date().toISOString();
      app.finalDecisionBy = caller.displayName;
      app.rejectionStage = undefined;
      app.rejectionReason = undefined;

      // Notify institution
      const instUsers = store.users.filter(u => u.institutionId === app.institutionId);
      for (const instUser of instUsers) {
        store.notifications.unshift({
          notificationId: `notif_shc_acc_${Date.now()}`,
          recipientUid: instUser.uid,
          applicationId: app.applicationId,
          type: 'final_decision',
          message: `Congratulations! Your appeal before Standing Hearing Committee (SHC) was ACCEPTED. Application has been approved.`,
          readAt: null,
          deliveryStatus: 'delivered',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // SHC rejects: allow Institution to appeal before SAC
      app.rejectionStage = 'shc';
      app.rejectionReason = remarks;
      // The status remains shc or can stay in shc with rejectionStage set
      app.currentStage = 'committee_review';

      // Notify institution
      const instUsers = store.users.filter(u => u.institutionId === app.institutionId);
      for (const instUser of instUsers) {
        store.notifications.unshift({
          notificationId: `notif_shc_rej_${Date.now()}`,
          recipientUid: instUser.uid,
          applicationId: app.applicationId,
          type: 'status_changed',
          message: `[SHC Finding] Your case before Standing Hearing Committee was not recommended: "${remarks}". You may appeal before the Standing Appellate Committee (SAC).`,
          readAt: null,
          deliveryStatus: 'delivered',
          createdAt: new Date().toISOString()
        });
      }
    }
  } else if (committeeType === 'sac') {
    if (outcome === 'accept') {
      // SAC Appeal accepted: Council approval granted
      app.status = 'approved';
      app.currentStage = 'council_decision';
      app.finalDecisionRemarks = `[SAC Appellate Order Accepted] ${remarks}`;
      app.finalDecisionDate = new Date().toISOString();
      app.finalDecisionBy = caller.displayName;
      app.rejectionStage = undefined;
      app.rejectionReason = undefined;

      const instUsers = store.users.filter(u => u.institutionId === app.institutionId);
      for (const instUser of instUsers) {
        store.notifications.unshift({
          notificationId: `notif_sac_acc_${Date.now()}`,
          recipientUid: instUser.uid,
          applicationId: app.applicationId,
          type: 'final_decision',
          message: `Congratulations! Your appeal before Standing Appellate Committee (SAC) was ACCEPTED. Approval granted.`,
          readAt: null,
          deliveryStatus: 'delivered',
          createdAt: new Date().toISOString()
        });
      }
    } else {
      // Rejected by SAC (all committees exhausted): cancel by Executive Committee
      app.status = 'rejected';
      app.currentStage = 'council_decision';
      app.rejectionStage = 'executive_committee';
      app.rejectionReason = `Rejected by Standing Appellate Committee (SAC). All statutory appellate remedies exhausted. Executive Committee Order: ${remarks}`;
      app.finalDecisionRemarks = app.rejectionReason;
      app.finalDecisionDate = new Date().toISOString();
      app.finalDecisionBy = 'AICTE Executive Committee';

      // Official Cancellation Alert to Institution
      const instUsers = store.users.filter(u => u.institutionId === app.institutionId);
      for (const instUser of instUsers) {
        store.notifications.unshift({
          notificationId: `notif_exec_cancel_${Date.now()}`,
          recipientUid: instUser.uid,
          applicationId: app.applicationId,
          type: 'final_decision',
          message: `[OFFICIAL EXECUTIVE COMMITTEE NOTICE] Application ${app.applicationId} has been CANCELLED and REJECTED by the AICTE Executive Committee following dismissal of appeal by SAC. Reason: ${remarks}`,
          readAt: null,
          deliveryStatus: 'delivered',
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  app.version += 1;
  app.updatedAt = new Date().toISOString();

  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: `decide${committeeType.toUpperCase()}Appeal`,
    fromStatus: app.status,
    toStatus: app.status,
    comment: `[${committeeType.toUpperCase()} Decision: ${outcome.toUpperCase()}] ${remarks}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr_appeal_${Date.now()}`
  });

  logAudit(caller, `${committeeType.toUpperCase()}_APPEAL_DECIDED`, 'application', applicationId, {
    outcome,
    remarks
  });

  store.persistAll();
  return { ...app };
}

export async function appealToCommittee(
  applicationId: string,
  targetCommittee: 'shc' | 'sac',
  appealStatement: string
): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'institution') {
    throw new Error('permission-denied: Only institutions can submit appeals.');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Access to cross-institution application denied.');
  }

  const prevStatus = app.status;
  app.status = targetCommittee; // 'shc' or 'sac'
  app.currentStage = 'committee_review';
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: `appealTo${targetCommittee.toUpperCase()}`,
    fromStatus: prevStatus,
    toStatus: app.status,
    comment: `[Institutional Appeal Submitted to ${targetCommittee.toUpperCase()}] ${appealStatement}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr_appeal_sub_${Date.now()}`
  });

  logAudit(caller, `APPEAL_SUBMITTED_TO_${targetCommittee.toUpperCase()}`, 'application', applicationId, {
    appealStatement
  });

  // Notify Committee members and Admins
  const committeeUsers = store.users.filter(u => u.role === 'committee' || u.role === 'admin');
  for (const cUser of committeeUsers) {
    store.notifications.unshift({
      notificationId: `notif_app_appeal_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      recipientUid: cUser.uid,
      applicationId: app.applicationId,
      type: 'status_changed',
      message: `New appeal submitted by ${app.institutionName || 'Institution'} before ${targetCommittee.toUpperCase()}. Application ID: ${app.applicationId}`,
      readAt: null,
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString()
    });
  }

  store.persistAll();
  return { ...app };
}

export async function recordFinalDecision(
  applicationId: string,
  decision: 'approved' | 'rejected',
  remarks: string
): Promise<Application> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin') {
    throw new Error('permission-denied: Final Council decisions must be executed strictly by Administrator');
  }

  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  app.status = decision;
  app.currentStage = 'council_decision';
  app.finalDecisionRemarks = remarks;
  app.finalDecisionDate = new Date().toISOString();
  app.finalDecisionBy = caller.displayName;
  app.version += 1;
  app.updatedAt = new Date().toISOString();

  // Workflow event
  store.workflowEvents.unshift({
    eventId: `wf_${Date.now()}`,
    applicationId,
    actorUid: caller.uid,
    actorName: caller.displayName,
    actorRole: caller.role,
    action: 'recordFinalDecision',
    fromStatus: app.status,
    toStatus: decision,
    comment: `Official Council Order: ${decision.toUpperCase()}. Remarks: ${remarks}`,
    timestamp: new Date().toISOString(),
    correlationId: `corr_final_${Date.now()}`
  });

  // Notify Institution
  const instUser = store.users.find(u => u.institutionId === app.institutionId);
  if (instUser) {
    store.notifications.unshift({
      notificationId: `notif_${Date.now()}`,
      recipientUid: instUser.uid,
      applicationId,
      type: 'final_decision',
      message: `Official decision on ${applicationId}: Council has ${decision.toUpperCase()} your application for ${app.academicYear}.`,
      readAt: null,
      deliveryStatus: 'delivered',
      createdAt: new Date().toISOString()
    });
  }

  logAudit(caller, 'FINAL_DECISION_RECORDED', 'application', applicationId, {
    decision,
    remarks
  });

  store.persistAll();
  return { ...app };
}

// -------------------------------------------------------------
// 9.6 Documents
// -------------------------------------------------------------

export async function registerDocument(params: {
  applicationId: string;
  documentType: ApplicationDocument['documentType'];
  fileName: string;
  sizeBytes: number;
  contentType: string;
}): Promise<ApplicationDocument> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === params.applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Unauthorized to attach documents to this application');
  }

  const newDoc: ApplicationDocument = {
    documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    applicationId: params.applicationId,
    documentType: params.documentType,
    storagePath: `institutions/${app.institutionId}/applications/${params.applicationId}/${params.fileName}`,
    fileName: params.fileName,
    contentType: params.contentType,
    sizeBytes: params.sizeBytes,
    uploadedBy: caller.uid,
    uploadedAt: new Date().toISOString(),
    verificationStatus: 'pending'
  };

  store.documents.unshift(newDoc);
  logAudit(caller, 'DOCUMENT_REGISTERED', 'document', newDoc.documentId, {
    applicationId: params.applicationId,
    fileName: params.fileName
  });

  store.persistAll();
  return { ...newDoc };
}

export async function listApplicationDocuments(applicationId: string): Promise<ApplicationDocument[]> {
  const caller = await getMyProfile();
  const app = store.applications.find(a => a.applicationId === applicationId);
  if (!app) throw new Error('not-found: Application not found');

  if (caller.role === 'institution' && app.institutionId !== caller.institutionId) {
    throw new Error('permission-denied: Cannot access documents of other institutions');
  }

  return store.documents.filter(d => d.applicationId === applicationId);
}

export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const doc = store.documents.find(d => d.documentId === documentId);
  if (!doc) throw new Error('not-found: Document record not found');
  // Simulated secure signed URL for Cloud Storage object
  return `https://storage.googleapis.com/aicte-smartapproval-vault/${doc.storagePath}?token=auth_${Date.now()}`;
}

export async function deleteDraftDocument(documentId: string): Promise<void> {
  const caller = await getMyProfile();
  const doc = store.documents.find(d => d.documentId === documentId);
  if (!doc) throw new Error('not-found: Document not found');

  const app = store.applications.find(a => a.applicationId === doc.applicationId);
  if (!app || app.status !== 'draft') {
    throw new Error('failed-precondition: Only documents in draft applications can be deleted directly');
  }

  store.documents = store.documents.filter(d => d.documentId !== documentId);
  logAudit(caller, 'DOCUMENT_DELETED', 'document', documentId);
  store.persistAll();
}

// -------------------------------------------------------------
// 9.7 Notifications
// -------------------------------------------------------------

export async function listMyNotifications(): Promise<NotificationItem[]> {
  const caller = await getMyProfile();
  return store.notifications.filter(n => n.recipientUid === caller.uid);
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const caller = await getMyProfile();
  const notif = store.notifications.find(n => n.notificationId === notificationId && n.recipientUid === caller.uid);
  if (notif) {
    notif.readAt = new Date().toISOString();
    notif.deliveryStatus = 'read';
    store.persistAll();
  }
}

// -------------------------------------------------------------
// 9.8 Audit and Dashboards
// -------------------------------------------------------------

export async function getApplicationAuditLog(applicationId?: string): Promise<AuditEvent[]> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin' && caller.role !== 'reviewer') {
    throw new Error('permission-denied: Audit event logs are restricted to authorized oversight officers');
  }

  if (applicationId) {
    return store.auditEvents.filter(a => a.resourceId === applicationId || (a.metadata && a.metadata.applicationId === applicationId));
  }
  return [...store.auditEvents];
}

export async function getAdminOverview(): Promise<AdminOverviewMetrics> {
  const caller = await getMyProfile();
  if (caller.role !== 'admin' && caller.role !== 'reviewer') {
    throw new Error('permission-denied: Access restricted to authorized administrative personnel');
  }

  const byStatus: Record<ApplicationStatus, number> = {
    draft: 0,
    submitted: 0,
    scrutiny: 0,
    rectification: 0,
    re_scrutiny: 0,
    evc: 0,
    shc: 0,
    sac: 0,
    approved: 0,
    rejected: 0
  };

  const byType: Record<ApplicationType, number> = {
    new_approval: 0,
    extension_of_approval: 0,
    increase_intake: 0,
    new_course: 0,
    closure: 0
  };

  for (const app of store.applications) {
    if (byStatus[app.status] !== undefined) byStatus[app.status]++;
    if (byType[app.applicationType] !== undefined) byType[app.applicationType]++;
  }

  const openDef = store.deficiencies.filter(d => d.status === 'open' || d.status === 'rectification_submitted').length;
  const resolvedDef = store.deficiencies.filter(d => d.status === 'resolved').length;
  const pendingReviewer = store.applications.filter(a => !a.assignedReviewerId && a.status !== 'draft').length;

  return {
    totalApplications: store.applications.length,
    byStatus,
    byType,
    totalInstitutions: store.institutions.length,
    openDeficienciesCount: openDef,
    resolvedDeficienciesCount: resolvedDef,
    compliancePassRate: 87.5,
    pendingReviewerCount: pendingReviewer,
    bottlenecks: [
      { stage: 'Scrutiny Document Review', pendingCount: byStatus.scrutiny, avgWaitDays: 3.2 },
      { stage: 'Deficiency Rectification by College', pendingCount: byStatus.rectification, avgWaitDays: 6.8 },
      { stage: 'Expert Visiting Committee (EVC)', pendingCount: byStatus.evc, avgWaitDays: 4.1 },
      { stage: 'Standing Appellate Committee (SAC)', pendingCount: byStatus.sac, avgWaitDays: 2.5 }
    ]
  };
}

export async function getPendingApplications(): Promise<Application[]> {
  const caller = await getMyProfile();
  if (caller.role === 'reviewer') {
    return store.applications.filter(a => a.assignedReviewerId === caller.uid && (a.status === 'scrutiny' || a.status === 're_scrutiny' || a.status === 'rectification'));
  }
  return store.applications.filter(a => a.status !== 'approved' && a.status !== 'rejected' && a.status !== 'draft');
}
