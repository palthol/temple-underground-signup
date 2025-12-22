/**
 * NOTE: These interfaces reflect the current Supabase schema as of v0.53.
 * If the database migrates (columns renamed/added/removed), update these shapes
 * and any downstream mappers accordingly.
 */

export interface ParticipantRecord {
  id: string;
  full_name: string | null;
  date_of_birth: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  home_phone: string | null;
  cell_phone: string | null;
  email: string | null;
  created_at: string | null;
}

export interface WaiverRecord {
  id: string;
  participant_id: string;
  consent_acknowledged: boolean | null;
  initials_risk_assumption: string | null;
  initials_release: string | null;
  initials_indemnification: string | null;
  initials_media_release: string | null;
  signature_image_url: string | null;
  signature_vector_json: unknown | null;
  signed_at_utc: string | null;
  review_confirm_accuracy: boolean | null;
}

export interface WaiverMedicalHistoryRecord {
  id: string;
  waiver_id: string;
  heart_disease: boolean | null;
  shortness_of_breath: boolean | null;
  high_blood_pressure: boolean | null;
  smoking: boolean | null;
  diabetes: boolean | null;
  family_history: boolean | null;
  workouts: boolean | null;
  medication: boolean | null;
  alcohol: boolean | null;
  last_physical: string | null;
  exercise_restriction: string | null;
  injuries_knees: boolean | null;
  injuries_lower_back: boolean | null;
  injuries_neck_shoulders: boolean | null;
  injuries_hip_pelvis: boolean | null;
  injuries_other_has: boolean | null;
  injuries_other_details: string | null;
  had_recent_injury: boolean | null;
  injury_details: string | null;
  physician_cleared: boolean | null;
  clearance_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface EmergencyContactRecord {
  id: string;
  waiver_id: string;
  participant_id: string;
  name: string | null;
  relationship: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
}

export interface AuditTrailRecord {
  id: string;
  participant_id: string;
  waiver_id: string;
  document_pdf_url: string | null;
  document_sha256: string | null;
  identity_snapshot: unknown;
  locale: string | null;
  content_version: string | null;
  created_at: string | null;
}

export interface WaiverJoinedRow {
  waiver: WaiverRecord;
  participant: ParticipantRecord | null;
  medical: WaiverMedicalHistoryRecord | null;
  emergencyContact: EmergencyContactRecord | null;
  audit: AuditTrailRecord | null;
}

export interface WaiverPdfPayload {
  document: {
    title: string;
    version: string;
    locale: string;
    generatedAt: string;
  };
  organization: {
    name: string;
    tagline?: string;
    address?: string;
  };
  waiver: {
    id: string;
    signedAt: string | null;
  };
  participant: {
    id: string;
    fullName: string | null;
    dateOfBirth: string | null;
    email: string | null;
    phone: string | null;
    addressLine: string | null;
    cityStateZip: string | null;
  };
  emergencyContact: {
    name: string | null;
    relationship: string | null;
    phone: string | null;
    email: string | null;
  };
  medicalInformation: {
    heartDisease: string | null;
    shortnessOfBreath: string | null;
    highBloodPressure: string | null;
    smoking: string | null;
    diabetes: string | null;
    familyHistory: string | null;
    workouts: string | null;
    medication: string | null;
    alcohol: string | null;
    lastPhysical: string | null;
    exerciseRestriction: string | null;
    injuries: Array<{ label: string; active: boolean }>;
    otherInjuryDetails: string | null;
    hadRecentInjury: string | null;
    physicianCleared: string | null;
    clearanceNotes: string | null;
  };
  legal: {
    release: { title: string; body: string };
    indemnification: { title: string; body: string };
    media: { title: string; body: string };
    acknowledgement: { title: string; body: string };
  };
  legalConfirmation: {
    riskInitials: string | null;
    releaseInitials: string | null;
    indemnificationInitials: string | null;
    mediaInitials: string | null;
  };
  signature: {
    imageDataUrl: string | null;
  };
}


