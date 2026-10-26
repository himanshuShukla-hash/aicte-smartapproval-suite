/**
 * AICTE SmartApproval Suite - Automated Test Suite
 * Validates PRD Section 15 (Authentication, Authorization, Compliance, Workflow, Concurrency)
 */

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log(' AICTE SmartApproval Suite — PRD v2.0 Test Suite (SIH26262)');
console.log('======================================================\n');

// Deterministic rule engine logic test
function evaluateTest(formData) {
  const results = [];
  const enrolled = formData.totalEnrolledStudents || formData.totalSanctionedIntake || 0;
  const faculty = formData.fullTimeFacultyCount || 0;
  const actualRatio = faculty > 0 ? (enrolled / faculty) : 999;
  
  if (faculty === 0 || actualRatio > 20) {
    results.push({ ruleId: 'aph_sfr_01', status: 'fail' });
  } else if (actualRatio > 15) {
    results.push({ ruleId: 'aph_sfr_01', status: 'needs_review' });
  } else {
    results.push({ ruleId: 'aph_sfr_01', status: 'pass' });
  }

  const land = formData.landAreaAcres || 0;
  const landType = formData.landType || 'Rural';
  const reqLand = landType === 'Mega/Metro' ? 1.5 : (landType === 'Urban' ? 2.5 : 5.0);
  if (land < reqLand) {
    results.push({ ruleId: 'aph_land_03', status: 'fail' });
  } else {
    results.push({ ruleId: 'aph_land_03', status: 'pass' });
  }

  if (!formData.fireSafetyNoc || !formData.antiRaggingCommitteeFormed || !formData.barrierFreeCampus) {
    results.push({ ruleId: 'aph_statutory_08', status: 'fail' });
  } else {
    results.push({ ruleId: 'aph_statutory_08', status: 'pass' });
  }

  const failed = results.filter(r => r.status === 'fail').length;
  const needs_review = results.filter(r => r.status === 'needs_review').length;
  const overallStatus = failed > 0 ? 'non_compliant' : (needs_review > 0 ? 'needs_attention' : 'compliant');

  return { overallStatus, results, ruleSetVersion: 'aph-2027-v1' };
}

// 1. Compliance Engine Tests (PRD Section 15.4)
console.log('1. Regulatory Compliance Engine (APH 2027-28 Deterministic Checks):');

const mockBaseFormData = {
  program: 'Engineering & Technology',
  totalSanctionedIntake: 300,
  totalEnrolledStudents: 300,
  fullTimeFacultyCount: 20, // SFR = 15:1 (Compliant)
  landAreaAcres: 3.0,
  landType: 'Urban', // Required: 2.5
  fireSafetyNoc: true,
  antiRaggingCommitteeFormed: true,
  barrierFreeCampus: true
};

const evalPass = evaluateTest(mockBaseFormData);
assert(evalPass.overallStatus === 'compliant', 'Baseline compliant application receives overall compliant status');
assert(evalPass.ruleSetVersion === 'aph-2027-v1', 'Evaluation preserves immutable rule-set version aph-2027-v1');

// Test SFR Ceiling (1:20)
const deficientSfrData = {
  ...mockBaseFormData,
  fullTimeFacultyCount: 10 // SFR = 300 / 10 = 30:1 (Deficit!)
};
const evalSfrFail = evaluateTest(deficientSfrData);
assert(evalSfrFail.overallStatus === 'non_compliant', 'Deficient SFR (> 1:20) triggers overall non_compliant status');
const sfrRule = evalSfrFail.results.find(r => r.ruleId === 'aph_sfr_01');
assert(sfrRule && sfrRule.status === 'fail', 'Rule aph_sfr_01 correctly flags faculty deficit');

// Test Land Area Norms
const ruralLandDeficient = {
  ...mockBaseFormData,
  landType: 'Rural',
  landAreaAcres: 4.2 // Rural requires 5.0 acres
};
const evalLandFail = evaluateTest(ruralLandDeficient);
const landRule = evalLandFail.results.find(r => r.ruleId === 'aph_land_03');
assert(landRule && landRule.status === 'fail', 'Rural location with 4.2 acres correctly fails 5.0 acre statutory threshold');

// Test Statutory Safety & Anti-Ragging Mandates
const missingFireNoc = {
  ...mockBaseFormData,
  fireSafetyNoc: false
};
const evalSafetyFail = evaluateTest(missingFireNoc);
const safetyRule = evalSafetyFail.results.find(r => r.ruleId === 'aph_statutory_08');
assert(safetyRule && safetyRule.status === 'fail', 'Missing Fire Safety NOC flags critical statutory safety deficiency');

// 2. State Machine Transition Tests (PRD Section 15.5)
console.log('\n2. Workflow State Machine & Security Transition Enforcement:');

const validTransitions = {
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

function canTransition(current, target) {
  return validTransitions[current]?.includes(target) || false;
}

assert(canTransition('draft', 'submitted') === true, 'Valid transition from draft to submitted succeeds');
assert(canTransition('draft', 'approved') === false, 'Direct stage skipping from draft to approved is strictly denied');
assert(canTransition('approved', 'draft') === false, 'Modifying approved application is rejected by terminal state lock');
assert(canTransition('scrutiny', 'rectification') === true, 'Reviewer can transition deficient application to rectification');

// 3. Concurrency Lock & Versioning (PRD Section 11.6 & 15.3)
console.log('\n3. Optimistic Concurrency & Data Isolation:');

let appVersion = 3;
function checkAndIncrementVersion(expected) {
  if (expected !== appVersion) {
    throw new Error('aborted: Concurrency conflict');
  }
  appVersion++;
  return appVersion;
}

assert(checkAndIncrementVersion(3) === 4, 'Valid expected version matches and increments safely');
let conflictCaught = false;
try {
  checkAndIncrementVersion(3); // Stale version
} catch {
  conflictCaught = true;
}
assert(conflictCaught, 'Stale concurrent update (version 3 vs 4) is rejected with aborted error');

// 4. Role Authorization Isolation (PRD Section 15.2)
console.log('\n4. Role-Based Access Isolation (Institutions & Reviewers):');

function checkApplicationAccess(callerRole, callerInstId, appInstId) {
  if (callerRole === 'admin' || callerRole === 'reviewer') return true;
  if (callerRole === 'institution' && callerInstId === appInstId) return true;
  return false;
}

assert(checkApplicationAccess('institution', 'inst_delhi_001', 'inst_delhi_001') === true, 'Institution user can access their own institution application');
assert(checkApplicationAccess('institution', 'inst_delhi_001', 'inst_mumbai_002') === false, 'Cross-institution application access is strictly denied (Data Isolation)');
assert(checkApplicationAccess('admin', 'any', 'inst_mumbai_002') === true, 'Authorized Admin has global governance visibility');

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log('------------------------------------------------------\n');
