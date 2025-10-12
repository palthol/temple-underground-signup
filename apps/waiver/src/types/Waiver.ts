import type { FieldPath } from 'react-hook-form';

export type YesNo = 'yes' | 'no';

export type SignatureValue = {
  pngDataUrl: string;
  vectorJson: unknown;
};

export type PersonalInfo = {
  fullName: string;
  dateOfBirth: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  email: string;
  phone: string;
};

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email: string;
};

export type HealthAssessment = {
  heartDisease: boolean;
  shortnessOfBreath: boolean;
  highBloodPressure: boolean;
  smoking: boolean;
  diabetes: boolean;
  familyHistory: boolean;
  workouts: boolean;
  medication: boolean;
  alcohol: boolean;
  lastPhysical: string;
  injuries: {
    knees: boolean;
    lowerBack: boolean;
    neckShoulders: boolean;
    hipPelvis: boolean;
    other: {
      has: boolean;
      details?: string;
    };
  };
  exerciseRestriction?: string;
};

export type InjuryDisclosure = {
  hadRecentInjury: YesNo;
  injuryDetails: string;
  physicianCleared: YesNo;
  clearanceNotes: string;
};

export type InitialClauses = {
  riskInitials: string;
  releaseInitials: string;
  indemnificationInitials: string;
  mediaInitials: string;
  acceptedTerms: boolean;
};

export type WaiverReview = {
  confirmAccuracy: boolean;
};

export type WaiverFormData = {
  personalInfo: PersonalInfo;
  emergencyContact: EmergencyContact;
  healthAssessment: HealthAssessment;
  injury: InjuryDisclosure;
  clauses: InitialClauses;
  signature: SignatureValue;
  review: WaiverReview;
};

export type WaiverStepId =
  | 'personalInfo'
  | 'emergencyContact'
  | 'healthAssessment'
  | 'injuryDisclosure'
  | 'initialClauses'
  | 'signature'
  | 'review';

export type WaiverStepDefinition = {
  id: WaiverStepId;
  fieldPaths: FieldPath<WaiverFormData>[];
};

export type WaiverSubmitResult = {
  waiverId: string;
  participantId: string;
};
