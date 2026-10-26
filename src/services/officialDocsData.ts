import { OfficialDocContent } from '../components/common/OfficialDocModal';

export const OFFICIAL_DOCS: Record<string, OfficialDocContent> = {
  aph_handbook: {
    title: 'Approval Process Handbook (APH 2027-28)',
    category: 'HANDBOOK',
    gazetteRef: 'F.No. AICTE/AB/APH/2027-28',
    lastUpdated: '15-October-2026',
    sections: [
      {
        heading: 'Chapter I: General Statutory Provisions',
        body: [
          'The All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2026 govern the procedure for granting Extension of Approval (EoA), introduction of new courses, increase in intake, and establishment of new technical institutions.',
          'All applications submitted for the Academic Year 2027-28 are subjected to deterministic server-side compliance validation against prescribed norms and standards.'
        ]
      },
      {
        heading: 'Chapter II: Minimum Land and Location Norms (Clause 4.1)',
        body: [
          'Mega and Metro Cities: Minimum contiguous land requirement is 1.5 Acres.',
          'Urban Areas (Municipal Corporation boundaries): Minimum contiguous land requirement is 2.5 Acres.',
          'Rural Areas: Minimum contiguous land requirement is 5.0 Acres.',
          'Land in possession must be registered in the name of the Applicant Society/Trust through registered sale deed or minimum 30-year irrevocable lease registered with the State Revenue Authority.'
        ]
      },
      {
        heading: 'Chapter III: Staffing and Cadre Pyramid Norms (Clause 7.1 & 7.4)',
        body: [
          'Student to Faculty Ratio (SFR): Standard SFR ceiling for Undergraduate Engineering programs is 1:20 (1 full-time faculty member per 20 students enrolled).',
          'Cadre Structure: The teaching staff must maintain a cadre ratio of 1 Professor : 2 Associate Professors : 6 Assistant Professors.',
          'Principal / Director: Must possess Ph.D. in an appropriate engineering discipline with at least 15 years of teaching/research experience and approved regular scale.'
        ]
      },
      {
        heading: 'Chapter IV: Built-up Area and IT Infrastructure (Clause 5.1 & 5.2)',
        body: [
          'Instructional Carpet Area: Minimum 4.0 sq. meters per enrolled student across classrooms, drawing halls, and laboratories.',
          'Computer Terminals: At least 1 functional computer per 4 students enrolled in Engineering and Technology programs, supported by minimum 2 dedicated computing laboratories.'
        ]
      }
    ]
  },
  regulations_gazette: {
    title: 'AICTE Approval Regulations Gazette Notification',
    category: 'REGULATION',
    gazetteRef: 'The Gazette of India, Extraordinary, Part III, Sec. 4',
    lastUpdated: '01-September-2026',
    sections: [
      {
        heading: '1. Short Title and Commencement',
        body: [
          'These Regulations may be called the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2026.',
          'They shall come into force on the date of their publication in the Official Gazette and apply to all technical education institutions across India.'
        ]
      },
      {
        heading: '2. Mandatory Server-Enforced Digital Workflow',
        body: [
          'Every application shall be submitted exclusively via the AICTE SmartApproval Suite (SIH26262) digital portal.',
          'No off-line, paper-based submissions or ex-post approvals shall be entertained. Every state transition from draft to scrutiny, inspection, and council order is cryptographically signed and recorded in an immutable audit ledger.'
        ]
      },
      {
        heading: '3. Legal Sanctity of Scrutiny Determinations',
        body: [
          'Determinations made by Regional Scrutiny Committees, Expert Visiting Committees (EVC), Standing Hearing Committees (SHC), and Standing Appellate Committees (SAC) are binding and subject strictly to the appeal mechanisms provided in the Act.'
        ]
      }
    ]
  },
  faculty_norms: {
    title: 'Faculty Norms, Cadre Ratio and 7th CPC Pay Scalings',
    category: 'GUIDELINE',
    gazetteRef: 'Notification No. 61-1/RIFD/7th CPC/2016-17',
    lastUpdated: '10-August-2026',
    sections: [
      {
        heading: '1. Qualifications for Teaching Faculty in Engineering & Technology',
        body: [
          'Assistant Professor: B.E./B.Tech./B.S. and M.E./M.Tech./M.S. or Integrated M.Tech. in relevant branch with first class or equivalent in any one of the degrees.',
          'Associate Professor: Ph.D. degree in the relevant field and First class or equivalent at either Bachelor\'s or Master\'s level in the relevant branch, with minimum 8 years of experience.',
          'Professor: Ph.D. degree in relevant field and First class or equivalent at either Bachelor\'s or Master\'s level in the relevant branch, with minimum 10 years of experience, of which at least 3 years at Associate Professor level, and minimum 6 research publications in SCI/Scopus indexed journals.'
        ]
      },
      {
        heading: '2. Mandatory Biometric Attendance & Aadhaar Linking',
        body: [
          'All full-time faculty considered for calculating the Student-Faculty Ratio must have registered Aadhaar-linked biometric attendance verified on the AICTE portal.'
        ]
      }
    ]
  },
  anti_ragging: {
    title: 'Anti-Ragging Directives & Affidavits Regulation',
    category: 'REGULATION',
    gazetteRef: 'F.No. 37-3/Legal/AICTE/2009',
    lastUpdated: '05-July-2026',
    sections: [
      {
        heading: '1. Zero Tolerance Policy against Ragging',
        body: [
          'Ragging in any form is completely banned in technical institutions under the AICTE (Prevention and Prohibition of Ragging in Technical Institutions, Universities including Deemed to be Universities imparting technical education) Regulations.',
          'Institutions must establish an Anti-Ragging Committee headed by the Head of the Institution, an Anti-Ragging Squad, and a dedicated 24x7 toll-free helpline.'
        ]
      },
      {
        heading: '2. Mandatory Online Undertakings',
        body: [
          'Every student and parent must submit an annual online anti-ragging undertaking at www.antiragging.in or the AICTE portal at the time of admission.'
        ]
      }
    ]
  },
  barrier_free: {
    title: 'Divyangjan Barrier-Free Campus Standards',
    category: 'POLICY',
    gazetteRef: 'RPwD Act 2016 & APH Standards Clause 2.18',
    lastUpdated: '12-May-2026',
    sections: [
      {
        heading: '1. Accessibility Requirements for Persons with Disabilities (Divyangjan)',
        body: [
          'Technical institutions must provide barrier-free access in all academic, administrative, and hostel buildings.',
          'Mandatory structural features include: Ramps with handrails (slope 1:12 max), accessible Braille-equipped elevators, dedicated accessible toilets on all floors, tactile pavers for visually impaired students, and designated accessible parking facilities.'
        ]
      }
    ]
  },
  terms_conditions: {
    title: 'Terms & Conditions of Portal Usage',
    category: 'POLICY',
    lastUpdated: '26-October-2026',
    sections: [
      {
        heading: '1. Authorized Use and Representation',
        body: [
          'This portal is strictly for authorized representatives of educational institutions applying for AICTE approval and accredited government officials.',
          'Any false declaration, tampering of uploaded documents, or unauthorized access attempts will invite prosecution under the Information Technology Act, 2000 and Indian Penal Code.'
        ]
      },
      {
        heading: '2. Optimistic Concurrency & Data Locking',
        body: [
          'Applications under scrutiny or locked by Council decision cannot be modified without authorized workflow transitions.',
          'Draft applications are protected with versioning tokens to prevent concurrent overwrites.'
        ]
      }
    ]
  },
  privacy_policy: {
    title: 'Privacy Policy & Institutional Data Isolation',
    category: 'POLICY',
    lastUpdated: '26-October-2026',
    sections: [
      {
        heading: '1. Institutional Data Isolation',
        body: [
          'In compliance with PRD Section 11, data of each institution is strictly isolated. No institution user can view or alter the applications, faculty records, or deficiencies of any other institution.',
          'Audit logs and workflow histories are tamper-proof and accessible only to authorized supervisory oversight officers.'
        ]
      },
      {
        heading: '2. Storage Security & Access Tokens',
        body: [
          'Document files uploaded to Cloud Storage reside in private, authenticated paths and are accessible strictly via temporary time-limited access tokens.'
        ]
      }
    ]
  },
  hyperlinking_policy: {
    title: 'Hyperlinking Policy',
    category: 'POLICY',
    lastUpdated: '26-October-2026',
    sections: [
      {
        heading: '1. Links to External Websites',
        body: [
          'At various places in this portal, you will find links to other government websites/portals (e.g. National Portal of India, Ministry of Education, DigiLocker, NBA).',
          'AICTE is not responsible for the contents and reliability of the linked websites and does not necessarily endorse the views expressed within them.'
        ]
      }
    ]
  },
  accessibility_statement: {
    title: 'Accessibility Statement (GIGW Compliant)',
    category: 'POLICY',
    lastUpdated: '26-October-2026',
    sections: [
      {
        heading: '1. Compliance with Guidelines for Indian Government Websites (GIGW)',
        body: [
          'AICTE SmartApproval Suite is committed to ensuring that the portal is accessible to all users, regardless of device, technology, or ability.',
          'Features include: Text size resizing (A-, A, A+), skip to main content, screen reader support, keyboard navigability, high color contrast, and clear semantic landmarks conforming to W3C Web Content Accessibility Guidelines (WCAG) 2.1 Level AA.'
        ]
      }
    ]
  },
  grievance_redressal: {
    title: 'Helpdesk & Grievance Redressal Mechanism',
    category: 'GUIDELINE',
    lastUpdated: '26-October-2026',
    sections: [
      {
        heading: '1. Technical Helpdesk',
        body: [
          'For technical issues encountered during submission, institutions may contact the Central Helpdesk via Toll-Free: 1800-11-2626 or email: helpdesk.approval@aicte-india.org between 09:30 AM to 05:30 PM (Monday through Friday).'
        ]
      },
      {
        heading: '2. Standing Grievance & Hearing Committee',
        body: [
          'Institutions aggrieved by any decision of the Scrutiny Committee may appeal before the Standing Hearing Committee (SHC) within 15 days of notice, and thereafter before the Standing Appellate Committee (SAC).'
        ]
      }
    ]
  }
};
