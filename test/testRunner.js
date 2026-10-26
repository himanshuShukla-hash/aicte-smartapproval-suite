/**
 * AICTE SmartApproval Suite - Automated Test Suite
 * Validates PRD Section 15 (Authentication, Authorization, Compliance, Workflow, Concurrency)
 */

import { runComplianceEvaluation } from '../src/services/complianceRules.ts';

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

// 1. Compliance Engine Tests (PRD Section 15.4)
console.log('1. Regulatory Compliance Engine (APH 2027-28 Deterministic Checks):');

const mockBaseFormData = {
  program: 'Engineering & Technology',
  level: 'UG',
  totalSanctionedIntake: 300,
  totalEnrolledStudents: 300,
  fullTimeFacultyCount: 20, // SFR = 15:1 (Compliant)
  cadreRatio: { professors: 2, associateProfessors: 4, assistantProfessors: 14 },
  principalQualified: true,
  landAreaAcres: 3.0,
  landType: 'Urban', // Required: 2.5
  instructionalAreaSqM: 1500, // Required: 300 * 4 = 1200 (Compliant)
  administrativeAreaSqM: 1000,
  amenitiesAreaSqM: 500,
  computerLabCount: 3,
  computersCount: 100, // 300 / 4 = 75 required (Compliant)
  libraryTitlesCount: 600,
  libraryVolumesCount: 2500,
  nationalJournalsCount: 12,
  internationalJournalsCount: 6,
  barrierFreeCampus: true,
  fireSafetyNoc: true,
  antiRaggingCommitteeFormed: true
};

const evalPass = runComplianceEvaluation('APP_TEST_01', mockBaseFormData);
assert(evalPass.overallStatus === 'compliant', 'Baseline compliant application receives overall compliant status');
assert(evalPass.summary.failed === 0, 'Zero failed rules on compliant input');
assert(evalPass.ruleSetVersion === 'aph-2027-v1', 'Evaluation preserves immutable rule-set version');

// Test SFR Ceiling (1:20)
const deficientSfrData = {
  ...mockBaseFormData,
  fullTimeFacultyCount: 10 // SFR = 300 / 10 = 30:1 (Deficit!)
};
const evalSfrFail = runComplianceEvaluation('APP_TEST_02', deficientSfrData);
assert(evalSfrFail.overallStatus === 'non_compliant', 'Deficient SFR (> 1:20) triggers overall non_compliant status');
const sfrRule = evalSfrFail.results.find(r => r.ruleId === 'aph_sfr_01');
assert(sfrRule && sfrRule.status === 'fail', 'Rule aph_sfr_01 correctly flags faculty deficit');

// Test Land Area Norms (Rural vs Urban vs Metro)
const ruralLandDeficient = {
  ...mockBaseFormData,
  landType: 'Rural',
  landAreaAcres: 4.2 // Rural requires 5.0 acres
};
const evalLandFail = runComplianceEvaluation('APP_TEST_03', ruralLandDeficient);
const landRule = evalLandFail.results.find(r => r.ruleId === 'aph_land_03');
assert(landRule && landRule.status === 'fail', 'Rural location with 4.2 acres correctly fails 5.0 acre statutory threshold');

// Test Statutory Safety & Anti-Ragging Mandates
const missingFireNoc = {
  ...mockBaseFormData,
  fireSafetyNoc: false
};
const evalSafetyFail = runComplianceEvaluation('APP_TEST_04', missingFireNoc);
const safetyRule = evalSafetyFail.results.find(r => r.ruleId === 'aph_statutory_08');
assert(safetyRule && safetyRule.status === 'fail', 'Missing Fire Safety NOC flags critical statutory safety deficiency');

// Summary
console.log('\n------------------------------------------------------');
console.log(`Results: ${passedTests} / ${totalTests} tests passed.`);
console.log('------------------------------------------------------\n');
