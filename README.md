# AICTE SmartApproval Suite (SIH26262) — MVP v2.0
**All India Council for Technical Education (AICTE), Ministry of Education, Government of India**  
**Design & UI Specification:** Authentic Indian Government Portal (Passport Seva Aesthetic)  
**Backend Architecture:** Cloud Firestore, Firebase Cloud Functions, Firebase Authentication, Cloud Storage, Strict Server-Enforced API Contracts.

---

## 🏛️ Passport Seva Official Interface Architecture

The platform's user interface is styled to match the official **Passport Seva (passportindia.gov.in) & National Portal of India** standard:
1. **Topmost Accessibility & Utility Strip**:
   - Official Tricolor emblem and "भारत सरकार | GOVERNMENT OF INDIA | शिक्षा मंत्रालय | Ministry of Education"
   - Real-time Indian Standard Time (IST) clock
   - Font Resizing (`A-`, `A`, `A+`), "Skip to Main Content", GIGW accessibility compliant, and Bilingual selector.
2. **Main Branding Header**:
   - Ashoka Lion Capital (State Emblem of India with *सत्यमेव जयते*)
   - AICTE Council Emblem
   - Official Bilingual Title: "अखिल भारतीय तकनीकी शिक्षा परिषद | All India Council for Technical Education"
   - National Approval Toll-Free Helpline: `1800-11-2626`
   - *Azadi Ka Amrit Mahotsav* & *Digital India* badges.
3. **Primary Navigation Bar**:
   - Classic Deep Navy Blue (`#002147`) with Saffron (`#E65100`) accents
   - Instant Demo Persona Switcher (switch between Institution Director, Scrutiny Reviewer, and Council Secretary in 1-click)
   - Real-time notification bell with statutory alert badges.
4. **Scrolling Circulars & Notice Ticker**:
   - Ticking marquee with urgent APH deadlines, SFR policy notices, and submission alerts.
5. **Iconic 3-Column Portal Layout**:
   - **Left Column**: Passport Seva Action Cards (New User Registration, Existing User Login, Track Application Status, APH Norms Calculator, Regional Offices).
   - **Center Column**: Digital approval pipeline walkthrough, Quick Services 3x2 grid.
   - **Right Column**: Important deadlines countdown (EoA: 15-Nov-2026), latest gazette circulars, helpdesk contacts.
6. **Official Letter of Approval (LOA)**:
   - High-fidelity printable Council Approval Order with Government seal, Council digital stamp, and QR verification code.

---

## 🔑 Pre-Configured Test Personas (One-Click Testing)

Judges and testers can switch roles anytime using the top-right persona dropdown in the navigation bar:

| Role | Name & Title | Institution / Bureau | Key Capabilities |
|---|---|---|---|
| **Institution User** | Prof. Amit Mehra (Principal) | Delhi Institute of Technology & Engineering Sciences (`C-18459`) | Create drafts, run live APH pre-checks, submit applications, upload affidavits, respond to scrutiny deficiencies, download LOA. |
| **Institution User** | Dr. Sunita Deshmukh (Director) | Maharashtra College of Engineering & Research (`C-34190`) | Review active deficiencies on faculty SFR and land norms, submit rectification evidence. |
| **Reviewer** | Dr. Rajesh Sharma (Senior Scrutiny Officer) | AICTE Regional Bureau | Inspect assigned applications, view uploaded affidavits, run deterministic compliance engine, log structured deficiencies, evaluate rectification responses, record stage recommendations. |
| **Admin** | Shri K. V. Subramanian (Member Secretary / Admin) | Central Council Headquarters | Real-time bottleneck dashboard, assign reviewers, publish APH rule sets, provision users & roles, execute final Council approval/rejection orders, inspect immutable audit trail. |

---

## ⚙️ Mandatory API Contract (PRD Section 9 Implemented)

- **9.1 Authentication & Profiles**: `getMyProfile`, `adminCreateUser`, `adminSetUserRole`
- **9.2 Applications**: `listMyApplications`, `getApplication`, `createApplication`, `updateApplicationDraft`, `submitApplication`, `assignReviewer`
- **9.3 Compliance**: `evaluateCompliance` (version `aph-2027-v1`), `getComplianceEvaluation`, `listComplianceRules`, `adminPublishComplianceRules`
- **9.4 Deficiencies**: `createDeficiency`, `listApplicationDeficiencies`, `respondToDeficiency`, `resolveDeficiency`
- **9.5 Workflow**: `getWorkflowHistory`, `transitionApplication`, `recordReviewDecision`, `recordCommitteeRecommendation`, `recordFinalDecision`
- **9.6 Documents**: `registerDocument`, `getDocumentDownloadUrl`, `deleteDraftDocument`
- **9.7 Notifications**: `listMyNotifications`, `markNotificationRead`
- **9.8 Audit & Dashboards**: `getApplicationAuditLog`, `getAdminOverview`, `getPendingApplications`

---

## 🚀 Running the Project Locally

### 1. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Run PRD Automated Security & Workflow Test Suite
```bash
npm test
```
Executes 15 comprehensive tests covering:
- Deterministic APH 2027 checks (SFR 1:20 ceiling, Land acreage by Metro/Urban/Rural, Built-up area per student, Safety NOCs).
- State machine transition matrix (invalid stage skipping rejected).
- Optimistic concurrency locks (`version` mismatch rejection).
- Institutional data isolation (cross-institution data access denied).

### 3. Production Build
```bash
npm run build
```
Generates production assets in `dist/`.
