import { z } from "zod";

const SHORT_MAX = 200;
const LONG_MAX = 5000;
const DATE_MAX = 40;

const requiredShortText = z
  .string()
  .min(1, "Required")
  .max(SHORT_MAX, `Must be ${SHORT_MAX} characters or fewer`);
const optionalShortText = z
  .string()
  .max(SHORT_MAX, `Must be ${SHORT_MAX} characters or fewer`)
  .optional();
const requiredLongText = z
  .string()
  .min(1, "Required")
  .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`);
const requiredDateText = z
  .string()
  .min(1, "Required")
  .max(DATE_MAX, "Invalid date");
const optionalDateText = z
  .string()
  .max(DATE_MAX, "Invalid date")
  .optional();
const optionalTimeText = z
  .string()
  .max(20, "Invalid time")
  .optional();

export const deathReportSchema = z.object({
  // Step 1 — Basic Information
  ref: requiredShortText,
  reportedDate: requiredDateText,
  incidentDate: requiredDateText,
  incidentTime: requiredDateText,
  department: requiredShortText,
  location: requiredShortText,
  category: requiredShortText,
  subCategory: requiredShortText,

  // Step 2 — Incident Details
  description: requiredLongText,
  actionTaken: requiredLongText,
  openedDate: optionalDateText,
  submittedTime: optionalTimeText,
  handler: optionalShortText,
  manager: optionalShortText,
  specialty: optionalShortText,
  exactLocation: optionalShortText,
  coding: optionalShortText,
  type: optionalShortText,

  // Step 3 — Risk & Outcome Assessment
  riskGrading: z.enum(["Low", "Medium", "High", "Critical"], {
    error: "Select a risk grading",
  }),
  result: optionalShortText,
  actualHarm: optionalShortText,
  potentialHarm: optionalShortText,
  details: z
    .string()
    .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`)
    .optional(),

  // Step 4 — Patient & Family Communication
  patientInvolved: z.boolean(),
  patientTold: z.boolean(),
  familyTold: z.boolean(),
  whatFamilyTold: z
    .string()
    .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`)
    .optional(),

  // Step 5 — Investigation & Review
  incidentInvestigation: z
    .string()
    .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`)
    .optional(),
  reviewMeetingDate: optionalDateText,
  qualityAssuranceLead: optionalShortText,
  doctorNotified: z.boolean(),
  meetingDiscussionPoints: z
    .string()
    .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`)
    .optional(),
  meetingActionPoints: z
    .string()
    .max(LONG_MAX, `Must be ${LONG_MAX} characters or fewer`)
    .optional(),
  levelOfInvestigation: z.enum(["Level 1", "Level 2", "Level 3", "Comprehensive"], {
    error: "Select a level of investigation",
  }),
});

export type DeathReportValues = z.infer<typeof deathReportSchema>;

export const STEP_FIELDS: Record<1 | 2 | 3 | 4 | 5, (keyof DeathReportValues)[]> = {
  1: [
    "ref",
    "reportedDate",
    "incidentDate",
    "incidentTime",
    "department",
    "location",
    "category",
    "subCategory",
  ],
  2: [
    "description",
    "actionTaken",
    "openedDate",
    "submittedTime",
    "handler",
    "manager",
    "specialty",
    "exactLocation",
    "coding",
    "type",
  ],
  3: [
    "riskGrading",
    "result",
    "actualHarm",
    "potentialHarm",
    "details",
  ],
  4: [
    "patientInvolved",
    "patientTold",
    "familyTold",
    "whatFamilyTold",
  ],
  5: [
    "incidentInvestigation",
    "reviewMeetingDate",
    "qualityAssuranceLead",
    "doctorNotified",
    "meetingDiscussionPoints",
    "meetingActionPoints",
    "levelOfInvestigation",
  ],
};

export const DEATH_REPORT_DEFAULTS: DeathReportValues = {
  ref: "",
  reportedDate: "",
  incidentDate: "",
  incidentTime: "",
  department: "",
  location: "",
  category: "",
  subCategory: "",
  description: "",
  actionTaken: "",
  openedDate: "",
  submittedTime: "",
  handler: "",
  manager: "",
  specialty: "",
  exactLocation: "",
  coding: "",
  type: "Clinical Incident",
  riskGrading: "High",
  result: "",
  actualHarm: "",
  potentialHarm: "",
  details: "",
  patientInvolved: false,
  patientTold: false,
  familyTold: false,
  whatFamilyTold: "",
  incidentInvestigation: "",
  reviewMeetingDate: "",
  qualityAssuranceLead: "",
  doctorNotified: false,
  meetingDiscussionPoints: "",
  meetingActionPoints: "",
  levelOfInvestigation: "Level 3",
};
