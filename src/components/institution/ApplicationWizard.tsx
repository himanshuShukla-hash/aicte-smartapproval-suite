import React, { useState } from 'react';
import { 
  Application, 
  ApplicationFormData, 
  ComplianceEvaluation, 
  ApplicationDocument 
} from '../../types/api';
import { runComplianceEvaluation } from '../../services/complianceRules';
import { 
  Save, 
  Send, 
  AlertTriangle, 
  CheckCircle, 
  FileUp, 
  ChevronRight, 
  ChevronLeft,
  Building,
  GraduationCap,
  LandPlot,
  Computer,
  BookOpen,
  ShieldAlert,
  ArrowRight,
  Users
} from 'lucide-react';
import { StatusBadge } from '../common/StatusBadge';

interface ApplicationWizardProps {
  application: Application;
  onSaveDraft: (formData: Partial<ApplicationFormData>) => Promise<void>;
  onSubmit: () => Promise<void>;
  onUploadDocument: (file: File, docType: ApplicationDocument['documentType']) => Promise<void>;
  documents: ApplicationDocument[];
  onCancel: () => void;
}

export const ApplicationWizard: React.FC<ApplicationWizardProps> = ({
  application,
  onSaveDraft,
  onSubmit,
  onUploadDocument,
  documents,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationFormData>({ ...application.formData });
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Live client-side compliance pre-check for immediate applicant guidance
  const preCheckEvaluation: ComplianceEvaluation = runComplianceEvaluation(
    application.applicationId,
    formData,
    'applicant_precheck'
  );

  const handleFieldChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCadreChange = (cadreField: keyof ApplicationFormData['cadreRatio'], value: number) => {
    setFormData(prev => {
      const updatedCadre = {
        ...prev.cadreRatio,
        [cadreField]: Math.max(0, value)
      };
      const totalFaculty = updatedCadre.professors + updatedCadre.associateProfessors + updatedCadre.assistantProfessors;
      return {
        ...prev,
        cadreRatio: updatedCadre,
        fullTimeFacultyCount: totalFaculty
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveDraft(formData);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setValidationError(null);
    setIsSubmitting(true);
    try {
      await onSaveDraft(formData);
      await onSubmit();
    } catch (err: any) {
      setValidationError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: ApplicationDocument['documentType']) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingDocType(docType);
      try {
        await onUploadDocument(file, docType);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setUploadingDocType(null);
      }
    }
  };

  const isEditable = application.status === 'draft' || application.status === 'rectification';

  return (
    <div className="bg-white border border-slate-300 rounded shadow-sm overflow-hidden">
      
      {/* Wizard Header */}
      <div className="bg-[#002147] text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-orange-500">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide">
              {application.applicationId} — Application Formulation Workstation
            </span>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {application.institutionName} | Academic Year: {application.academicYear} | Type: {application.applicationType.replace(/_/g, ' ').toUpperCase()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditable && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1 border border-white/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
          )}
          <button
            onClick={onCancel}
            className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1.5 rounded"
          >
            Close
          </button>
        </div>
      </div>

      {/* Step Indicators Strip */}
      <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { num: 1, label: '1. Program & Intake' },
          { num: 2, label: '2. Land Norms' },
          { num: 3, label: '3. Faculty & Cadre' },
          { num: 4, label: '4. Carpet Area' },
          { num: 5, label: '5. Labs & Library' },
          { num: 6, label: '6. Documents' },
          { num: 7, label: '7. Pre-Check & Submit' }
        ].map(step => (
          <button
            key={step.num}
            onClick={() => setActiveStep(step.num)}
            className={`px-3 py-1 rounded font-semibold whitespace-nowrap transition-colors ${
              activeStep === step.num
                ? 'bg-[#002147] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {validationError && (
        <div className="m-4 p-3 bg-red-50 border border-red-300 rounded text-xs text-red-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="p-6">
        
        {/* STEP 1: Program & Intake */}
        {activeStep === 1 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <GraduationCap className="w-4 h-4 text-orange-600" />
              Step 1: Academic Program & Student Intake
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Discipline / Program</label>
                <select
                  disabled={!isEditable}
                  value={formData.program}
                  onChange={(e) => handleFieldChange('program', e.target.value)}
                  className="w-full govt-input text-xs"
                >
                  <option value="Engineering & Technology">Engineering & Technology</option>
                  <option value="Management">Management (MBA/PGDM)</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Architecture">Architecture & Planning</option>
                  <option value="MCA">Computer Applications (MCA)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Academic Level</label>
                <select
                  disabled={!isEditable}
                  value={formData.level}
                  onChange={(e) => handleFieldChange('level', e.target.value)}
                  className="w-full govt-input text-xs"
                >
                  <option value="UG">Undergraduate (UG)</option>
                  <option value="PG">Postgraduate (PG)</option>
                  <option value="Diploma">Diploma</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Sanctioned Annual Intake</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.totalSanctionedIntake}
                  onChange={(e) => handleFieldChange('totalSanctionedIntake', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="30"
                  step="30"
                />
                <span className="text-[10px] text-slate-500">Approved division multiples (e.g. 60, 120, 300, 480)</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Enrolled Active Students</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.totalEnrolledStudents}
                  onChange={(e) => handleFieldChange('totalEnrolledStudents', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="0"
                />
                <span className="text-[10px] text-slate-500">Across all running years (used for SFR calculations)</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Land Norms */}
        {activeStep === 2 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <LandPlot className="w-4 h-4 text-orange-600" />
              Step 2: Land Area & Location Norms (APH Table 4.1)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location Terrain Classification</label>
                <select
                  disabled={!isEditable}
                  value={formData.landType}
                  onChange={(e) => handleFieldChange('landType', e.target.value)}
                  className="w-full govt-input text-xs"
                >
                  <option value="Mega/Metro">Mega / Metro City (Min 1.5 Acres)</option>
                  <option value="Urban">Urban Area (Min 2.5 Acres)</option>
                  <option value="Rural">Rural Area (Min 5.0 Acres)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contiguous Land Area in Possession (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  disabled={!isEditable}
                  value={formData.landAreaAcres}
                  onChange={(e) => handleFieldChange('landAreaAcres', parseFloat(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                />
                <span className="text-[10px] text-slate-500">Must be registered title or 30-year irrevocable lease</span>
              </div>
            </div>

            {/* Live feedback */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
              <p className="font-semibold text-blue-900">Statutory Land Norm Check:</p>
              <p className="text-slate-700 text-[11px] mt-0.5">
                For <strong className="text-blue-950">{formData.landType}</strong> area, minimum contiguous requirement is{' '}
                <strong>{formData.landType === 'Mega/Metro' ? '1.5' : formData.landType === 'Urban' ? '2.5' : '5.0'} Acres</strong>.
                Current specified: <span className="font-bold">{formData.landAreaAcres} Acres</span>.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Faculty & Cadre */}
        {activeStep === 3 && (
          <div className="space-y-4 max-w-3xl">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <Users className="w-4 h-4 text-orange-600" />
              Step 3: Teaching Faculty & Cadre Ratio (APH Clause 7.1 & 7.4)
            </h3>

            <div className="p-3 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900">
              <p className="font-bold">AICTE Statutory Mandate:</p>
              <p className="text-[11px] mt-0.5">
                Maximum allowed Student to Faculty Ratio (SFR) is <strong>1:20</strong>. Cadre structure should follow{' '}
                <strong>1 Professor : 2 Associate Professors : 6 Assistant Professors</strong>.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professors (PhD mandatory)</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.cadreRatio.professors}
                  onChange={(e) => handleCadreChange('professors', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Associate Professors</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.cadreRatio.associateProfessors}
                  onChange={(e) => handleCadreChange('associateProfessors', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assistant Professors</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.cadreRatio.assistantProfessors}
                  onChange={(e) => handleCadreChange('assistantProfessors', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3 bg-slate-50 border rounded">
                <span className="font-bold text-slate-700">Total Full-Time Regular Faculty:</span>
                <p className="text-xl font-bold text-[#002147] mt-1">{formData.fullTimeFacultyCount}</p>
                <p className="text-[11px] text-slate-500">
                  Calculated SFR:{' '}
                  <strong className="text-blue-900 font-mono">
                    1:{formData.fullTimeFacultyCount > 0 ? (formData.totalEnrolledStudents / formData.fullTimeFacultyCount).toFixed(1) : 'INF'}
                  </strong>
                </p>
              </div>

              <div className="p-3 bg-slate-50 border rounded flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-700">Principal / Director Qualified</span>
                  <p className="text-[11px] text-slate-500">Regular appointment with AICTE pay scale</p>
                </div>
                <input
                  type="checkbox"
                  disabled={!isEditable}
                  checked={formData.principalQualified}
                  onChange={(e) => handleFieldChange('principalQualified', e.target.checked)}
                  className="w-5 h-5 accent-blue-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Carpet Area */}
        {activeStep === 4 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <Building className="w-4 h-4 text-orange-600" />
              Step 4: Instructional, Administrative & Amenities Carpet Area (Sq. Meters)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructional Area (Sq.M)</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.instructionalAreaSqM}
                  onChange={(e) => handleFieldChange('instructionalAreaSqM', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                />
                <span className="text-[10px] text-slate-500">Min 4.0 sq.m per student</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Area (Sq.M)</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.administrativeAreaSqM}
                  onChange={(e) => handleFieldChange('administrativeAreaSqM', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                />
                <span className="text-[10px] text-slate-500">Principal office, admin, faculty cabins</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Amenities Area (Sq.M)</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.amenitiesAreaSqM}
                  onChange={(e) => handleFieldChange('amenitiesAreaSqM', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                />
                <span className="text-[10px] text-slate-500">Common rooms, cafeteria, first-aid</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Labs & Library */}
        {activeStep === 5 && (
          <div className="space-y-4 max-w-2xl">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <Computer className="w-4 h-4 text-orange-600" />
              Step 5: IT Infrastructure & Central Library Holdings
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dedicated Computer Labs</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.computerLabCount}
                  onChange={(e) => handleFieldChange('computerLabCount', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="1"
                />
                <span className="text-[10px] text-slate-500">Minimum 2 labs required</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Functional Computers (PCs)</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.computersCount}
                  onChange={(e) => handleFieldChange('computersCount', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                />
                <span className="text-[10px] text-slate-500">At least 1 terminal per 4 students</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Library Unique Book Titles</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.libraryTitlesCount}
                  onChange={(e) => handleFieldChange('libraryTitlesCount', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="100"
                />
                <span className="text-[10px] text-slate-500">Minimum 500 titles required</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Library Total Book Volumes</label>
                <input
                  type="number"
                  disabled={!isEditable}
                  value={formData.libraryVolumesCount}
                  onChange={(e) => handleFieldChange('libraryVolumesCount', parseInt(e.target.value) || 0)}
                  className="w-full govt-input text-xs"
                  min="500"
                />
                <span className="text-[10px] text-slate-500">Minimum 2000 volumes required</span>
              </div>
            </div>

            <div className="pt-3 border-t space-y-2 text-xs">
              <span className="font-bold text-slate-700">Statutory Affidavits & Safety Mandates:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="p-2 border rounded bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isEditable}
                    checked={formData.fireSafetyNoc}
                    onChange={(e) => handleFieldChange('fireSafetyNoc', e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span>Valid Fire Safety NOC</span>
                </label>

                <label className="p-2 border rounded bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isEditable}
                    checked={formData.antiRaggingCommitteeFormed}
                    onChange={(e) => handleFieldChange('antiRaggingCommitteeFormed', e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span>Anti-Ragging Committee</span>
                </label>

                <label className="p-2 border rounded bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!isEditable}
                    checked={formData.barrierFreeCampus}
                    onChange={(e) => handleFieldChange('barrierFreeCampus', e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span>Barrier Free Campus</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Documents Upload */}
        {activeStep === 6 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <FileUp className="w-4 h-4 text-orange-600" />
              Step 6: Upload Mandatory Statutory Evidentiary Documents
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { type: 'land_documents', label: 'Land Ownership Title Deed / 30-Year Lease' },
                { type: 'building_plan_approval', label: 'Approved Building Master Plan & Carpet Area Certificate' },
                { type: 'fire_safety_noc', label: 'Competent Authority Fire Safety NOC' },
                { type: 'faculty_list_and_affidavits', label: 'Biometric Faculty List & Form 16 / Salary Affidavits' },
                { type: 'financial_audit_report', label: 'Audited Financial Balance Sheet (Last 3 Years)' },
                { type: 'anti_ragging_undertaking', label: 'Anti-Ragging Undertaking by Students & Parents' }
              ].map(item => {
                const attached = documents.find(d => d.documentType === item.type);

                return (
                  <div key={item.type} className="p-3 border rounded bg-slate-50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.label}</p>
                      {attached ? (
                        <p className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Attached: {attached.fileName} ({(attached.sizeBytes / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      ) : (
                        <p className="text-[11px] text-red-600 font-medium mt-0.5">
                          Missing mandatory upload
                        </p>
                      )}
                    </div>

                    <div>
                      {isEditable && (
                        <label className="btn-govt-secondary text-xs cursor-pointer">
                          <FileUp className="w-3.5 h-3.5" />
                          {uploadingDocType === item.type ? 'Uploading...' : attached ? 'Replace' : 'Upload PDF'}
                          <input
                            type="file"
                            accept=".pdf,.png,.jpg"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, item.type as any)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 7: Deterministic Server Pre-Check & Submit */}
        {activeStep === 7 && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#002147] flex items-center gap-2 border-b pb-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Step 7: Automated Compliance Pre-Check & Submission Workstation
            </h3>

            {/* Compliance Results Summary */}
            <div className={`p-4 rounded border ${
              preCheckEvaluation.overallStatus === 'compliant'
                ? 'bg-emerald-50 border-emerald-300'
                : preCheckEvaluation.overallStatus === 'needs_attention'
                  ? 'bg-amber-50 border-amber-300'
                  : 'bg-red-50 border-red-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    Automated Rule Engine Result: <span className="uppercase">{preCheckEvaluation.overallStatus}</span>
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Evaluated against Regulatory Handbook: <strong>{preCheckEvaluation.ruleSetVersion}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded">{preCheckEvaluation.summary.passed} Passed</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded">{preCheckEvaluation.summary.needs_review} Review</span>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded">{preCheckEvaluation.summary.failed} Failed</span>
                </div>
              </div>
            </div>

            {/* Rules Breakdown Table */}
            <table className="govt-table text-xs">
              <thead>
                <tr>
                  <th>Rule ID & Clause</th>
                  <th>Regulatory Metric</th>
                  <th>Submitted Value</th>
                  <th>Required Standard</th>
                  <th>Outcome</th>
                </tr>
              </thead>
              <tbody>
                {preCheckEvaluation.results.map(res => (
                  <tr key={res.ruleId}>
                    <td className="font-mono font-bold text-blue-900">{res.clauseRef || res.ruleId}</td>
                    <td className="font-semibold text-slate-800">{res.ruleName}</td>
                    <td>{res.actualValue}</td>
                    <td className="text-slate-600">{res.requiredValue}</td>
                    <td>
                      <StatusBadge status={res.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Final Submission Card */}
            {isEditable && (
              <div className="p-4 bg-slate-50 border border-slate-300 rounded space-y-3">
                <div className="flex items-start gap-2">
                  <input type="checkbox" id="declaration" className="w-4 h-4 mt-0.5 accent-blue-900" />
                  <label htmlFor="declaration" className="text-xs text-slate-700">
                    I, on behalf of the Management and Governing Body of this Institution, solemnly affirm that the data furnished above is accurate, verifiable, and strictly conforms with AICTE Approval Process Handbook (APH 2027-28) regulations. I acknowledge that any suppression of facts or false declaration shall invite penal action including withdrawal of approval.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs text-slate-500">
                    Version: <strong>v{application.version}</strong> (Optimistic Concurrency Locked)
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-govt-saffron font-bold text-xs px-5 py-2 flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Submitting to Council...' : 'Submit Application to Council'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Wizard Footer Nav */}
      <div className="bg-slate-100 border-t border-slate-300 px-6 py-3 flex items-center justify-between">
        <button
          onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
          disabled={activeStep === 1}
          className="btn-govt-secondary text-xs disabled:opacity-40"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous Step
        </button>

        <span className="text-xs text-slate-500 font-medium">
          Step {activeStep} of 7
        </span>

        <button
          onClick={() => setActiveStep(prev => Math.min(7, prev + 1))}
          disabled={activeStep === 7}
          className="btn-govt-primary text-xs disabled:opacity-40"
        >
          Next Step
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
