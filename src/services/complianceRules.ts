import { ApplicationFormData, ComplianceRule, RuleEvaluationResult, ComplianceEvaluation } from '../types/api';

export const CURRENT_APH_RULESET_VERSION = 'aph-2027-v1';

export const DEFAULT_APH_RULES: ComplianceRule[] = [
  {
    ruleId: 'aph_sfr_01',
    name: 'Student Faculty Ratio (SFR)',
    description: 'Enforces mandatory Student to Faculty ratio (1:20 max for Engineering UG, 1:15 recommended)',
    ruleType: 'ratio',
    parameters: { maxRatio: 20, recommendedRatio: 15 },
    severity: 'critical',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_cadre_02',
    name: 'Faculty Cadre Ratio',
    description: 'Mandatory cadre structure of 1 Professor : 2 Associate Professors : 6 Assistant Professors',
    ruleType: 'ratio',
    parameters: { minProfessorPercent: 10 },
    severity: 'major',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_land_03',
    name: 'Minimum Land Area Requirement',
    description: 'Mandatory contiguous land based on institution location (Metro: 1.5 acres, Urban: 2.5 acres, Rural: 5.0 acres)',
    ruleType: 'numerical',
    parameters: { 'Mega/Metro': 1.5, 'Urban': 2.5, 'Rural': 5.0 },
    severity: 'critical',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_builtup_04',
    name: 'Instructional & Built-up Area',
    description: 'Adequate instructional carpet area for classrooms, drawing halls, and laboratories (minimum 4.0 sq.m per student)',
    ruleType: 'numerical',
    parameters: { minSqMPerStudent: 4.0 },
    severity: 'critical',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_computers_05',
    name: 'Computer Lab and Terminal Norms',
    description: 'Mandatory computer terminal ratio (at least 1 PC per 4 students) and minimum 2 functional computer labs',
    ruleType: 'numerical',
    parameters: { studentPerPc: 4, minLabs: 2 },
    severity: 'major',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_library_06',
    name: 'Library Volumes & Titles',
    description: 'Adequate library holdings (minimum 500 unique titles and 2000 total volumes for base intake)',
    ruleType: 'numerical',
    parameters: { minTitles: 500, minVolumes: 2000 },
    severity: 'major',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_principal_07',
    name: 'Qualified Head of Institution (Principal/Director)',
    description: 'Verification of appointed regular qualified Principal possessing eligible academic credentials',
    ruleType: 'boolean',
    parameters: { mustBeQualified: true },
    severity: 'critical',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  },
  {
    ruleId: 'aph_statutory_08',
    name: 'Statutory Safety & Anti-Ragging Mandates',
    description: 'Valid Fire Safety NOC, Anti-Ragging Committee establishment, and Barrier-Free Campus for Divyangjan',
    ruleType: 'boolean',
    parameters: { fireSafety: true, antiRagging: true, barrierFree: true },
    severity: 'critical',
    version: CURRENT_APH_RULESET_VERSION,
    active: true,
    effectiveFrom: '2027-01-01',
    publishedBy: 'AICTE Council Regulatory Board',
    publishedAt: '2026-10-01T00:00:00Z'
  }
];

/**
 * Deterministic APH Rule Evaluator
 * Executes pure, auditable compliance checks on server or client pre-checks.
 */
export function runComplianceEvaluation(
  applicationId: string,
  formData: ApplicationFormData,
  evaluatorUid: string = 'system_rule_engine',
  ruleSetVersion: string = CURRENT_APH_RULESET_VERSION
): ComplianceEvaluation {
  const results: RuleEvaluationResult[] = [];

  // 1. Student Faculty Ratio Check
  const enrolled = formData.totalEnrolledStudents || formData.totalSanctionedIntake || 0;
  const faculty = formData.fullTimeFacultyCount || 0;
  const actualRatio = faculty > 0 ? (enrolled / faculty) : 999;
  const maxAllowedRatio = 20;

  if (faculty === 0) {
    results.push({
      ruleId: 'aph_sfr_01',
      ruleName: 'Student Faculty Ratio (SFR)',
      status: 'fail',
      severity: 'critical',
      actualValue: `0 Faculty (${enrolled} students)`,
      requiredValue: `1:20 (At least ${Math.ceil(enrolled / 20)} faculty required)`,
      message: 'Zero full-time faculty specified. Institution fails statutory teaching staffing minimum.',
      clauseRef: 'APH 2027 Clause 7.1'
    });
  } else if (actualRatio > maxAllowedRatio) {
    results.push({
      ruleId: 'aph_sfr_01',
      ruleName: 'Student Faculty Ratio (SFR)',
      status: 'fail',
      severity: 'critical',
      actualValue: `1:${actualRatio.toFixed(1)} (${faculty} faculty for ${enrolled} students)`,
      requiredValue: `1:20 max (At least ${Math.ceil(enrolled / 20)} faculty required)`,
      message: `Faculty deficit detected. Actual SFR of 1:${actualRatio.toFixed(1)} violates statutory ceiling of 1:20. Deficiency of ${Math.ceil(enrolled / 20) - faculty} faculty members.`,
      clauseRef: 'APH 2027 Clause 7.1'
    });
  } else if (actualRatio > 15) {
    results.push({
      ruleId: 'aph_sfr_01',
      ruleName: 'Student Faculty Ratio (SFR)',
      status: 'needs_review',
      severity: 'minor',
      actualValue: `1:${actualRatio.toFixed(1)}`,
      requiredValue: '1:15 recommended',
      message: `SFR is compliant with minimum statutory limit (1:20), but exceeds recommended accreditation benchmark of 1:15.`,
      clauseRef: 'APH 2027 Clause 7.1'
    });
  } else {
    results.push({
      ruleId: 'aph_sfr_01',
      ruleName: 'Student Faculty Ratio (SFR)',
      status: 'pass',
      severity: 'info',
      actualValue: `1:${actualRatio.toFixed(1)} (${faculty} faculty for ${enrolled} students)`,
      requiredValue: '1:20 max',
      message: 'Student to Faculty ratio fully complies with AICTE statutory guidelines.',
      clauseRef: 'APH 2027 Clause 7.1'
    });
  }

  // 2. Cadre Ratio Check
  const totalCadre = (formData.cadreRatio?.professors || 0) + 
                     (formData.cadreRatio?.associateProfessors || 0) + 
                     (formData.cadreRatio?.assistantProfessors || 0);
  const professors = formData.cadreRatio?.professors || 0;
  const profPercentage = totalCadre > 0 ? (professors / totalCadre) * 100 : 0;

  if (professors === 0 && totalCadre > 10) {
    results.push({
      ruleId: 'aph_cadre_02',
      ruleName: 'Faculty Cadre Ratio',
      status: 'fail',
      severity: 'major',
      actualValue: `0 Professors out of ${totalCadre} faculty`,
      requiredValue: '1:2:6 Cadre (Min 1 Professor per department)',
      message: 'No regular Professor cadre deployed. Cadre pyramid violation.',
      clauseRef: 'APH 2027 Clause 7.4'
    });
  } else if (profPercentage < 8 && totalCadre > 15) {
    results.push({
      ruleId: 'aph_cadre_02',
      ruleName: 'Faculty Cadre Ratio',
      status: 'needs_review',
      severity: 'minor',
      actualValue: `${profPercentage.toFixed(1)}% Professors`,
      requiredValue: 'Minimum 10% Professor cadre target',
      message: 'Professor cadre strength is borderline. Scrutiny inspection advised.',
      clauseRef: 'APH 2027 Clause 7.4'
    });
  } else {
    results.push({
      ruleId: 'aph_cadre_02',
      ruleName: 'Faculty Cadre Ratio',
      status: 'pass',
      severity: 'info',
      actualValue: `${professors} Prof : ${formData.cadreRatio?.associateProfessors || 0} Assoc : ${formData.cadreRatio?.assistantProfessors || 0} Asst`,
      requiredValue: '1:2:6 Structure',
      message: 'Cadre ratio satisfies operational requirements.',
      clauseRef: 'APH 2027 Clause 7.4'
    });
  }

  // 3. Land Area Norm
  const land = formData.landAreaAcres || 0;
  const landType = formData.landType || 'Rural';
  const requiredLand = landType === 'Mega/Metro' ? 1.5 : (landType === 'Urban' ? 2.5 : 5.0);

  if (land < requiredLand) {
    results.push({
      ruleId: 'aph_land_03',
      ruleName: 'Minimum Land Area Requirement',
      status: 'fail',
      severity: 'critical',
      actualValue: `${land} Acres (${landType})`,
      requiredValue: `Minimum ${requiredLand} Acres for ${landType} area`,
      message: `Land deficiency of ${(requiredLand - land).toFixed(2)} acres for ${landType} classification.`,
      clauseRef: 'APH 2027 Table 4.1'
    });
  } else {
    results.push({
      ruleId: 'aph_land_03',
      ruleName: 'Minimum Land Area Requirement',
      status: 'pass',
      severity: 'info',
      actualValue: `${land} Acres (${landType})`,
      requiredValue: `${requiredLand} Acres`,
      message: 'Contiguous land area meets statutory norms.',
      clauseRef: 'APH 2027 Table 4.1'
    });
  }

  // 4. Built-up Instructional Area
  const instArea = formData.instructionalAreaSqM || 0;
  const minRequiredInstArea = enrolled * 4.0;

  if (instArea < minRequiredInstArea) {
    results.push({
      ruleId: 'aph_builtup_04',
      ruleName: 'Instructional & Built-up Area',
      status: 'fail',
      severity: 'critical',
      actualValue: `${instArea} sq.m (${(instArea / (enrolled || 1)).toFixed(2)} sq.m/student)`,
      requiredValue: `Min ${minRequiredInstArea} sq.m (4.0 sq.m/student for ${enrolled} students)`,
      message: `Instructional carpet area is deficient by ${(minRequiredInstArea - instArea).toFixed(0)} sq.m.`,
      clauseRef: 'APH 2027 Table 4.3'
    });
  } else {
    results.push({
      ruleId: 'aph_builtup_04',
      ruleName: 'Instructional & Built-up Area',
      status: 'pass',
      severity: 'info',
      actualValue: `${instArea} sq.m`,
      requiredValue: `${minRequiredInstArea} sq.m`,
      message: 'Instructional carpet area meets or exceeds regulatory norms.',
      clauseRef: 'APH 2027 Table 4.3'
    });
  }

  // 5. Computer Lab & PCs
  const pcs = formData.computersCount || 0;
  const labs = formData.computerLabCount || 0;
  const minPcs = Math.ceil(enrolled / 4);

  if (labs < 2 || pcs < minPcs) {
    results.push({
      ruleId: 'aph_computers_05',
      ruleName: 'Computer Lab and Terminal Norms',
      status: 'fail',
      severity: 'major',
      actualValue: `${pcs} PCs across ${labs} lab(s)`,
      requiredValue: `Min ${minPcs} PCs (1:4 ratio) and min 2 labs`,
      message: `IT infrastructure deficit. Required: min 2 labs and ${minPcs} computers. Shortfall: ${Math.max(0, minPcs - pcs)} PCs, ${Math.max(0, 2 - labs)} lab(s).`,
      clauseRef: 'APH 2027 Table 5.2'
    });
  } else {
    results.push({
      ruleId: 'aph_computers_05',
      ruleName: 'Computer Lab and Terminal Norms',
      status: 'pass',
      severity: 'info',
      actualValue: `${pcs} PCs across ${labs} labs`,
      requiredValue: `${minPcs} PCs, 2 labs`,
      message: 'Computer terminals and laboratories meet statutory requirements.',
      clauseRef: 'APH 2027 Table 5.2'
    });
  }

  // 6. Library Titles and Volumes
  const titles = formData.libraryTitlesCount || 0;
  const volumes = formData.libraryVolumesCount || 0;

  if (titles < 500 || volumes < 2000) {
    results.push({
      ruleId: 'aph_library_06',
      ruleName: 'Library Volumes & Titles',
      status: 'fail',
      severity: 'major',
      actualValue: `${titles} titles, ${volumes} volumes`,
      requiredValue: 'Min 500 titles and 2000 volumes',
      message: `Library holdings insufficient. Deficiency of ${Math.max(0, 500 - titles)} titles and ${Math.max(0, 2000 - volumes)} volumes.`,
      clauseRef: 'APH 2027 Table 5.3'
    });
  } else {
    results.push({
      ruleId: 'aph_library_06',
      ruleName: 'Library Volumes & Titles',
      status: 'pass',
      severity: 'info',
      actualValue: `${titles} titles, ${volumes} volumes`,
      requiredValue: '500 titles, 2000 volumes',
      message: 'Library books and journal subscriptions satisfy AICTE threshold.',
      clauseRef: 'APH 2027 Table 5.3'
    });
  }

  // 7. Qualified Principal
  if (!formData.principalQualified) {
    results.push({
      ruleId: 'aph_principal_07',
      ruleName: 'Qualified Head of Institution (Principal/Director)',
      status: 'fail',
      severity: 'critical',
      actualValue: 'Not Qualified or Unfilled',
      requiredValue: 'Approved regular qualified Principal in position',
      message: 'Statutory position of Principal/Director is vacant or does not meet AICTE qualification norms.',
      clauseRef: 'APH 2027 Clause 7.2'
    });
  } else {
    results.push({
      ruleId: 'aph_principal_07',
      ruleName: 'Qualified Head of Institution (Principal/Director)',
      status: 'pass',
      severity: 'info',
      actualValue: 'Qualified Regular Principal in place',
      requiredValue: 'Qualified Regular Principal',
      message: 'Principal qualification verified as per AICTE pay scales and qualifications regulations.',
      clauseRef: 'APH 2027 Clause 7.2'
    });
  }

  // 8. Statutory Safety & Anti-Ragging Mandates
  const missingStatutory: string[] = [];
  if (!formData.fireSafetyNoc) missingStatutory.push('Fire Safety NOC');
  if (!formData.antiRaggingCommitteeFormed) missingStatutory.push('Anti-Ragging Committee');
  if (!formData.barrierFreeCampus) missingStatutory.push('Barrier Free Environment for Divyangjan');

  if (missingStatutory.length > 0) {
    results.push({
      ruleId: 'aph_statutory_08',
      ruleName: 'Statutory Safety & Anti-Ragging Mandates',
      status: 'fail',
      severity: 'critical',
      actualValue: `Missing: ${missingStatutory.join(', ')}`,
      requiredValue: 'All 3 mandatory statutory compliances active',
      message: `Critical non-compliance: Institution lacks ${missingStatutory.join(', ')}.`,
      clauseRef: 'APH 2027 Chapter II'
    });
  } else {
    results.push({
      ruleId: 'aph_statutory_08',
      ruleName: 'Statutory Safety & Anti-Ragging Mandates',
      status: 'pass',
      severity: 'info',
      actualValue: 'Fire NOC, Anti-Ragging, and Barrier-Free active',
      requiredValue: 'All 3 mandatory statutory compliances active',
      message: 'All statutory committees and structural safety mandates verified.',
      clauseRef: 'APH 2027 Chapter II'
    });
  }

  // Calculate summary counts
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const needs_review = results.filter(r => r.status === 'needs_review').length;

  let overallStatus: 'compliant' | 'needs_attention' | 'non_compliant' = 'compliant';
  if (failed > 0) {
    overallStatus = 'non_compliant';
  } else if (needs_review > 0) {
    overallStatus = 'needs_attention';
  }

  const evaluationId = `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    evaluationId,
    applicationId,
    ruleSetVersion,
    overallStatus,
    summary: {
      passed,
      failed,
      needs_review
    },
    results,
    inputSnapshot: { ...formData },
    evaluatedAt: new Date().toISOString(),
    evaluatedBy: evaluatorUid,
    createdAt: new Date().toISOString()
  };
}
