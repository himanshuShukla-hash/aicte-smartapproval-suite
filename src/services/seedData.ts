import { 
  UserProfile, 
  Institution, 
  Application, 
  Deficiency, 
  ApplicationDocument, 
  WorkflowEvent, 
  AuditEvent, 
  NotificationItem 
} from '../types/api';
import { runComplianceEvaluation } from './complianceRules';

export const SEED_USERS: UserProfile[] = [
  {
    uid: 'usr_inst_delhi',
    displayName: 'Prof. Amit Mehra (Principal)',
    email: 'principal@delhi-tech.edu.in',
    role: 'institution',
    institutionId: 'inst_delhi_001',
    active: true,
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    uid: 'usr_inst_mumbai',
    displayName: 'Dr. Sunita Deshmukh (Director)',
    email: 'director@mumbai-engg.ac.in',
    role: 'institution',
    institutionId: 'inst_mumbai_002',
    active: true,
    createdAt: '2026-08-18T11:00:00Z',
    updatedAt: '2026-08-18T11:00:00Z'
  },
  {
    uid: 'usr_reviewer_sharma',
    displayName: 'Dr. Rajesh Sharma (Senior Scrutiny Officer)',
    email: 'r.sharma@aicte-india.org',
    role: 'reviewer',
    active: true,
    createdAt: '2026-07-01T09:00:00Z',
    updatedAt: '2026-07-01T09:00:00Z'
  },
  {
    uid: 'usr_reviewer_sundaram',
    displayName: 'Prof. Meenakshi Sundaram (EVC Head)',
    email: 'm.sundaram@aicte-india.org',
    role: 'reviewer',
    active: true,
    createdAt: '2026-07-05T09:00:00Z',
    updatedAt: '2026-07-05T09:00:00Z'
  },
  {
    uid: 'usr_admin_secretary',
    displayName: 'Shri K. V. Subramanian (Member Secretary / Admin)',
    email: 'secretary.approval@aicte-india.org',
    role: 'admin',
    active: true,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z'
  },
  {
    uid: 'usr_committee_shc',
    displayName: 'Prof. Anand Vardhan (SHC Chairman)',
    email: 'shc.chair@aicte-india.org',
    role: 'committee',
    active: true,
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z'
  },
  {
    uid: 'usr_committee_sac',
    displayName: 'Justice (Retd.) K. G. Balakrishnan (SAC Head)',
    email: 'sac.appellate@aicte-india.org',
    role: 'committee',
    active: true,
    createdAt: '2026-07-12T10:00:00Z',
    updatedAt: '2026-07-12T10:00:00Z'
  }
];

export const SEED_INSTITUTIONS: Institution[] = [
  {
    institutionId: 'inst_delhi_001',
    name: 'Delhi Institute of Technology & Engineering Sciences',
    aisheCode: 'C-18459',
    address: 'Sector 12, Dwarka, Institutional Area',
    state: 'Delhi (NCT)',
    district: 'South West Delhi',
    pinCode: '110078',
    contactEmail: 'registrar@delhi-tech.edu.in',
    contactPhone: '+91-11-28082900',
    status: 'active',
    createdAt: '2026-08-15T10:00:00Z',
    updatedAt: '2026-08-15T10:00:00Z'
  },
  {
    institutionId: 'inst_mumbai_002',
    name: 'Maharashtra College of Engineering & Research',
    aisheCode: 'C-34190',
    address: 'Shivaji Nagar, Vashi Tech Campus',
    state: 'Maharashtra',
    district: 'Navi Mumbai',
    pinCode: '400703',
    contactEmail: 'admin@mumbai-engg.ac.in',
    contactPhone: '+91-22-27781200',
    status: 'active',
    createdAt: '2026-08-18T11:00:00Z',
    updatedAt: '2026-08-18T11:00:00Z'
  }
];

export const SEED_APPLICATIONS: Application[] = [
  {
    applicationId: 'AICTE-2027-DL-001',
    institutionId: 'inst_delhi_001',
    institutionName: 'Delhi Institute of Technology & Engineering Sciences',
    applicationType: 'extension_of_approval',
    academicYear: '2027-28',
    status: 'scrutiny',
    currentStage: 'scrutiny',
    assignedReviewerId: 'usr_reviewer_sharma',
    assignedReviewerName: 'Dr. Rajesh Sharma (Senior Scrutiny Officer)',
    submittedAt: '2026-10-15T14:30:00Z',
    createdBy: 'usr_inst_delhi',
    createdAt: '2026-10-10T09:15:00Z',
    updatedAt: '2026-10-15T14:30:00Z',
    version: 3,
    formData: {
      program: 'Engineering & Technology',
      level: 'UG',
      totalSanctionedIntake: 480,
      totalEnrolledStudents: 480,
      fullTimeFacultyCount: 32, // SFR = 15 (good)
      cadreRatio: {
        professors: 4,
        associateProfessors: 8,
        assistantProfessors: 20
      },
      principalQualified: true,
      landAreaAcres: 3.5,
      landType: 'Urban', // Required: 2.5 (Pass)
      instructionalAreaSqM: 2400, // Required: 480 * 4 = 1920 (Pass)
      administrativeAreaSqM: 1200,
      amenitiesAreaSqM: 600,
      computerLabCount: 4,
      computersCount: 150, // Required: 480 / 4 = 120 (Pass)
      libraryTitlesCount: 650,
      libraryVolumesCount: 3200,
      nationalJournalsCount: 18,
      internationalJournalsCount: 8,
      barrierFreeCampus: true,
      fireSafetyNoc: true,
      antiRaggingCommitteeFormed: true
    }
  },
  {
    applicationId: 'AICTE-2027-MH-002',
    institutionId: 'inst_mumbai_002',
    institutionName: 'Maharashtra College of Engineering & Research',
    applicationType: 'new_approval',
    academicYear: '2027-28',
    status: 'rectification',
    currentStage: 'rectification',
    assignedReviewerId: 'usr_reviewer_sharma',
    assignedReviewerName: 'Dr. Rajesh Sharma (Senior Scrutiny Officer)',
    submittedAt: '2026-10-12T16:00:00Z',
    createdBy: 'usr_inst_mumbai',
    createdAt: '2026-10-05T11:00:00Z',
    updatedAt: '2026-10-20T10:45:00Z',
    version: 4,
    formData: {
      program: 'Engineering & Technology',
      level: 'UG',
      totalSanctionedIntake: 360,
      totalEnrolledStudents: 360,
      fullTimeFacultyCount: 14, // Deficient! SFR = 25.7 > 20 (Deficit of 4 faculty)
      cadreRatio: {
        professors: 1,
        associateProfessors: 3,
        assistantProfessors: 10
      },
      principalQualified: true,
      landAreaAcres: 2.1,
      landType: 'Urban', // Deficient! Urban requires 2.5 acres
      instructionalAreaSqM: 1600,
      administrativeAreaSqM: 900,
      amenitiesAreaSqM: 450,
      computerLabCount: 2,
      computersCount: 95,
      libraryTitlesCount: 520,
      libraryVolumesCount: 2150,
      nationalJournalsCount: 12,
      internationalJournalsCount: 4,
      barrierFreeCampus: true,
      fireSafetyNoc: true,
      antiRaggingCommitteeFormed: true
    }
  },
  {
    applicationId: 'AICTE-2027-KA-003',
    institutionId: 'inst_delhi_001',
    institutionName: 'Delhi Institute of Technology & Engineering Sciences',
    applicationType: 'increase_intake',
    academicYear: '2027-28',
    status: 'approved',
    currentStage: 'council_decision',
    assignedReviewerId: 'usr_reviewer_sundaram',
    assignedReviewerName: 'Prof. Meenakshi Sundaram (EVC Head)',
    submittedAt: '2026-09-20T11:00:00Z',
    createdBy: 'usr_inst_delhi',
    createdAt: '2026-09-10T09:00:00Z',
    updatedAt: '2026-10-18T16:20:00Z',
    version: 6,
    finalDecisionRemarks: 'Unanimously approved by Council Approval Bureau. All statutory land, cadre, and laboratory norms satisfied without any pending deficiency.',
    finalDecisionDate: '2026-10-18T16:20:00Z',
    finalDecisionBy: 'usr_admin_secretary',
    formData: {
      program: 'Engineering & Technology',
      level: 'UG',
      totalSanctionedIntake: 600,
      totalEnrolledStudents: 600,
      fullTimeFacultyCount: 42,
      cadreRatio: {
        professors: 6,
        associateProfessors: 12,
        assistantProfessors: 24
      },
      principalQualified: true,
      landAreaAcres: 4.8,
      landType: 'Urban',
      instructionalAreaSqM: 3200,
      administrativeAreaSqM: 1400,
      amenitiesAreaSqM: 800,
      computerLabCount: 6,
      computersCount: 220,
      libraryTitlesCount: 900,
      libraryVolumesCount: 4800,
      nationalJournalsCount: 24,
      internationalJournalsCount: 12,
      barrierFreeCampus: true,
      fireSafetyNoc: true,
      antiRaggingCommitteeFormed: true
    }
  }
];

export const SEED_DEFICIENCIES: Deficiency[] = [
  {
    deficiencyId: 'def_sfr_mh002',
    applicationId: 'AICTE-2027-MH-002',
    ruleId: 'aph_sfr_01',
    ruleName: 'Student Faculty Ratio (SFR)',
    description: 'Faculty count of 14 for 360 students results in an SFR of 1:25.7, exceeding the statutory limit of 1:20. Minimum 18 full-time faculty members required.',
    severity: 'critical',
    status: 'rectification_submitted',
    responseText: 'We have recruited 4 additional Assistant Professors on regular scale and attached their appointment letters, joining reports, and university approval affidavits.',
    responseDocumentIds: ['doc_rect_fac_01'],
    responseSubmittedAt: '2026-10-22T14:10:00Z',
    createdBy: 'usr_reviewer_sharma',
    createdByName: 'Dr. Rajesh Sharma (Senior Scrutiny Officer)',
    createdAt: '2026-10-16T11:20:00Z',
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    resolutionRemarks: null
  },
  {
    deficiencyId: 'def_land_mh002',
    applicationId: 'AICTE-2027-MH-002',
    ruleId: 'aph_land_03',
    ruleName: 'Minimum Land Area Requirement',
    description: 'Available land of 2.1 acres is deficient against the required 2.5 acres in Urban category as per APH 2027 Clause 4.1.',
    severity: 'critical',
    status: 'open',
    responseText: null,
    responseDocumentIds: [],
    responseSubmittedAt: null,
    createdBy: 'usr_reviewer_sharma',
    createdByName: 'Dr. Rajesh Sharma (Senior Scrutiny Officer)',
    createdAt: '2026-10-16T11:25:00Z',
    resolvedBy: null,
    resolvedByName: null,
    resolvedAt: null,
    resolutionRemarks: null
  }
];

export const SEED_DOCUMENTS: ApplicationDocument[] = [
  {
    documentId: 'doc_land_dl001',
    applicationId: 'AICTE-2027-DL-001',
    documentType: 'land_documents',
    storagePath: 'institutions/inst_delhi_001/applications/AICTE-2027-DL-001/land_title_deed_signed.pdf',
    fileName: 'Land_Title_Deed_Registry_Dwarka.pdf',
    contentType: 'application/pdf',
    sizeBytes: 2458900,
    uploadedBy: 'usr_inst_delhi',
    uploadedAt: '2026-10-12T10:15:00Z',
    verificationStatus: 'verified',
    reviewerNotes: 'Registered title deed verified with Revenue Authority endorsement.'
  },
  {
    documentId: 'doc_fire_dl001',
    applicationId: 'AICTE-2027-DL-001',
    documentType: 'fire_safety_noc',
    storagePath: 'institutions/inst_delhi_001/applications/AICTE-2027-DL-001/delhi_fire_service_noc.pdf',
    fileName: 'Delhi_Fire_Service_NOC_Valid_2028.pdf',
    contentType: 'application/pdf',
    sizeBytes: 1124500,
    uploadedBy: 'usr_inst_delhi',
    uploadedAt: '2026-10-12T10:20:00Z',
    verificationStatus: 'verified'
  },
  {
    documentId: 'doc_fac_dl001',
    applicationId: 'AICTE-2027-DL-001',
    documentType: 'faculty_list_and_affidavits',
    storagePath: 'institutions/inst_delhi_001/applications/AICTE-2027-DL-001/faculty_biometric_affidavit.pdf',
    fileName: 'Faculty_Staff_Affidavit_2026_27.pdf',
    contentType: 'application/pdf',
    sizeBytes: 3410200,
    uploadedBy: 'usr_inst_delhi',
    uploadedAt: '2026-10-12T10:25:00Z',
    verificationStatus: 'verified'
  },
  {
    documentId: 'doc_rect_fac_01',
    applicationId: 'AICTE-2027-MH-002',
    documentType: 'deficiency_rectification_evidence',
    storagePath: 'institutions/inst_mumbai_002/applications/AICTE-2027-MH-002/rectification_faculty_appointment.pdf',
    fileName: 'Appointment_Letters_Joining_Reports_4_Faculty.pdf',
    contentType: 'application/pdf',
    sizeBytes: 1845000,
    uploadedBy: 'usr_inst_mumbai',
    uploadedAt: '2026-10-22T14:10:00Z',
    verificationStatus: 'pending'
  }
];

export const SEED_WORKFLOW_EVENTS: WorkflowEvent[] = [
  {
    eventId: 'wf_001',
    applicationId: 'AICTE-2027-DL-001',
    actorUid: 'usr_inst_delhi',
    actorName: 'Prof. Amit Mehra',
    actorRole: 'institution',
    action: 'submitApplication',
    fromStatus: 'draft',
    toStatus: 'submitted',
    comment: 'Formal submission completed after automated pre-check validation.',
    timestamp: '2026-10-15T14:30:00Z',
    correlationId: 'corr_sub_dl001'
  },
  {
    eventId: 'wf_002',
    applicationId: 'AICTE-2027-DL-001',
    actorUid: 'usr_admin_secretary',
    actorName: 'Shri K. V. Subramanian',
    actorRole: 'admin',
    action: 'assignReviewer',
    fromStatus: 'submitted',
    toStatus: 'scrutiny',
    comment: 'Assigned to Dr. Rajesh Sharma for Regional Scrutiny verification.',
    timestamp: '2026-10-16T09:00:00Z',
    correlationId: 'corr_asgn_dl001'
  },
  {
    eventId: 'wf_003',
    applicationId: 'AICTE-2027-MH-002',
    actorUid: 'usr_reviewer_sharma',
    actorName: 'Dr. Rajesh Sharma',
    actorRole: 'reviewer',
    action: 'recordReviewDecision',
    fromStatus: 'scrutiny',
    toStatus: 'rectification',
    comment: 'Returned for rectification: Critical deficits noted in faculty count and land area.',
    timestamp: '2026-10-16T11:30:00Z',
    correlationId: 'corr_rect_mh002'
  }
];

export const SEED_AUDIT_EVENTS: AuditEvent[] = [
  {
    eventId: 'aud_001',
    actorUid: 'usr_inst_delhi',
    actorEmail: 'principal@delhi-tech.edu.in',
    action: 'APPLICATION_SUBMITTED',
    resourceType: 'application',
    resourceId: 'AICTE-2027-DL-001',
    timestamp: '2026-10-15T14:30:00Z',
    correlationId: 'corr_sub_dl001',
    metadata: { applicationType: 'extension_of_approval', intake: 480 }
  },
  {
    eventId: 'aud_002',
    actorUid: 'usr_reviewer_sharma',
    actorEmail: 'r.sharma@aicte-india.org',
    action: 'DEFICIENCY_RAISED',
    resourceType: 'deficiency',
    resourceId: 'def_sfr_mh002',
    timestamp: '2026-10-16T11:20:00Z',
    correlationId: 'corr_rect_mh002',
    metadata: { ruleId: 'aph_sfr_01', severity: 'critical' }
  },
  {
    eventId: 'aud_003',
    actorUid: 'usr_admin_secretary',
    actorEmail: 'secretary.approval@aicte-india.org',
    action: 'FINAL_DECISION_RECORDED',
    resourceType: 'application',
    resourceId: 'AICTE-2027-KA-003',
    timestamp: '2026-10-18T16:20:00Z',
    correlationId: 'corr_appr_ka003',
    metadata: { decision: 'approved', academicYear: '2027-28' }
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    notificationId: 'notif_001',
    recipientUid: 'usr_inst_mumbai',
    applicationId: 'AICTE-2027-MH-002',
    type: 'deficiency_raised',
    message: 'Scrutiny Committee has raised 2 critical deficiencies on your application. Please rectify within 15 days.',
    readAt: null,
    deliveryStatus: 'delivered',
    createdAt: '2026-10-16T11:35:00Z'
  },
  {
    notificationId: 'notif_002',
    recipientUid: 'usr_inst_delhi',
    applicationId: 'AICTE-2027-DL-001',
    type: 'status_changed',
    message: 'Your application AICTE-2027-DL-001 is now under active Scrutiny review.',
    readAt: '2026-10-17T09:00:00Z',
    deliveryStatus: 'read',
    createdAt: '2026-10-16T09:05:00Z'
  },
  {
    notificationId: 'notif_003',
    recipientUid: 'usr_inst_delhi',
    applicationId: 'AICTE-2027-KA-003',
    type: 'final_decision',
    message: 'Congratulations! Application AICTE-2027-KA-003 for Academic Year 2027-28 has been APPROVED by the Council.',
    readAt: null,
    deliveryStatus: 'delivered',
    createdAt: '2026-10-18T16:25:00Z'
  }
];
