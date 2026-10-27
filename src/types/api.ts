/**
 * AICTE SmartApproval Suite - PRD v2.0 Centralized Schema & API Types
 * Enforces strict typing across all Firebase Functions & Client Modules.
 */

export type UserRole = 'institution' | 'reviewer' | 'inspector' | 'committee' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  institutionId?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  institutionId: string;
  name: string;
  aisheCode: string;
  address: string;
  state: string;
  district: string;
  pinCode: string;
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'suspended' | 'blacklisted';
  createdAt: string;
  updatedAt: string;
}

export type ApplicationType = 
  | 'new_approval' 
  | 'extension_of_approval' 
  | 'increase_intake' 
  | 'new_course' 
  | 'closure';

export type ApplicationStatus = 
  | 'draft' 
  | 'submitted' 
  | 'scrutiny' 
  | 'rectification' 
  | 're_scrutiny' 
  | 'evc' 
  | 'shc' 
  | 'sac' 
  | 'approved' 
  | 'rejected';

export type ApplicationStage = 
  | 'institution_submission' 
  | 'scrutiny' 
  | 'rectification' 
  | 're_scrutiny' 
  | 'evc_inspection' 
  | 'committee_review' 
  | 'council_decision';

export interface CadreRatio {
  professors: number;
  associateProfessors: number;
  assistantProfessors: number;
}

export interface ApplicationFormData {
  program: 'Engineering & Technology' | 'Management' | 'Pharmacy' | 'Architecture' | 'MCA';
  level: 'UG' | 'PG' | 'Diploma';
  totalSanctionedIntake: number;
  totalEnrolledStudents: number;
  fullTimeFacultyCount: number;
  cadreRatio: CadreRatio;
  principalQualified: boolean;
  landAreaAcres: number;
  landType: 'Mega/Metro' | 'Urban' | 'Rural';
  instructionalAreaSqM: number;
  administrativeAreaSqM: number;
  amenitiesAreaSqM: number;
  computerLabCount: number;
  computersCount: number;
  libraryTitlesCount: number;
  libraryVolumesCount: number;
  nationalJournalsCount: number;
  internationalJournalsCount: number;
  barrierFreeCampus: boolean;
  fireSafetyNoc: boolean;
  antiRaggingCommitteeFormed: boolean;
}

export interface Application {
  applicationId: string;
  institutionId: string;
  institutionName?: string;
  applicationType: ApplicationType;
  academicYear: string;
  status: ApplicationStatus;
  currentStage: ApplicationStage;
  assignedReviewerId?: string;
  assignedReviewerName?: string;
  submittedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  formData: ApplicationFormData;
  lastEvaluationId?: string;
  finalDecisionRemarks?: string;
  finalDecisionDate?: string;
  finalDecisionBy?: string;
  rejectionStage?: 'evc' | 'shc' | 'sac' | 'executive_committee';
  rejectionReason?: string;
  shcHearingSchedule?: {
    scheduledDate: string;
    scheduledTime: string;
    meetingLink: string;
    committeeNotes?: string;
  };
  sacHearingSchedule?: {
    scheduledDate: string;
    scheduledTime: string;
    meetingLink: string;
    committeeNotes?: string;
  };
}

export interface ApplicationDocument {
  documentId: string;
  applicationId: string;
  documentType: 
    | 'land_documents' 
    | 'building_plan_approval' 
    | 'fire_safety_noc' 
    | 'faculty_list_and_affidavits' 
    | 'financial_audit_report' 
    | 'anti_ragging_undertaking' 
    | 'barrier_free_certificate'
    | 'deficiency_rectification_evidence';
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'verified' | 'deficient' | 'rejected';
  reviewerNotes?: string;
}

export type RuleSeverity = 'critical' | 'major' | 'minor' | 'info';
export type RuleOutcome = 'pass' | 'fail' | 'needs_review';

export interface ComplianceRule {
  ruleId: string;
  name: string;
  description: string;
  ruleType: 'numerical' | 'ratio' | 'boolean' | 'document';
  parameters: Record<string, any>;
  severity: RuleSeverity;
  version: string;
  active: boolean;
  effectiveFrom: string;
  publishedBy: string;
  publishedAt: string;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  status: RuleOutcome;
  severity: RuleSeverity;
  actualValue: any;
  requiredValue: any;
  message: string;
  clauseRef?: string;
}

export interface ComplianceEvaluation {
  evaluationId: string;
  applicationId: string;
  ruleSetVersion: string;
  overallStatus: 'compliant' | 'needs_attention' | 'non_compliant';
  summary: {
    passed: number;
    failed: number;
    needs_review: number;
  };
  results: RuleEvaluationResult[];
  inputSnapshot: ApplicationFormData;
  evaluatedAt: string;
  evaluatedBy: string;
  createdAt: string;
}

export interface Deficiency {
  deficiencyId: string;
  applicationId: string;
  ruleId: string;
  ruleName: string;
  description: string;
  severity: 'critical' | 'major' | 'minor';
  status: 'open' | 'rectification_submitted' | 'resolved' | 'reopened';
  responseText: string | null;
  responseDocumentIds: string[];
  responseSubmittedAt: string | null;
  createdBy: string;
  createdByName?: string | null;
  createdAt: string;
  resolvedBy: string | null;
  resolvedByName?: string | null;
  resolvedAt: string | null;
  resolutionRemarks: string | null;
}

export interface WorkflowEvent {
  eventId: string;
  applicationId: string;
  actorUid: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  fromStatus: ApplicationStatus;
  toStatus: ApplicationStatus;
  comment?: string;
  timestamp: string;
  correlationId: string;
}

export interface AuditEvent {
  eventId: string;
  actorUid: string;
  actorEmail: string;
  action: string;
  resourceType: 'application' | 'deficiency' | 'compliance_rule' | 'user' | 'document' | 'workflow';
  resourceId: string;
  timestamp: string;
  correlationId: string;
  metadata?: Record<string, any>;
}

export interface NotificationItem {
  notificationId: string;
  recipientUid: string;
  applicationId?: string;
  type: 
    | 'deficiency_raised' 
    | 'submission_confirmed' 
    | 'status_changed' 
    | 'assignment' 
    | 'rectification_received' 
    | 'final_decision';
  message: string;
  readAt: string | null;
  deliveryStatus: 'delivered' | 'read';
  createdAt: string;
}

export interface AdminOverviewMetrics {
  totalApplications: number;
  byStatus: Record<ApplicationStatus, number>;
  byType: Record<ApplicationType, number>;
  totalInstitutions: number;
  openDeficienciesCount: number;
  resolvedDeficienciesCount: number;
  compliancePassRate: number;
  pendingReviewerCount: number;
  bottlenecks: {
    stage: string;
    pendingCount: number;
    avgWaitDays: number;
  }[];
}
