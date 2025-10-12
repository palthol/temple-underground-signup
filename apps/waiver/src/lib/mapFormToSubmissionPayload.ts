import type { WaiverFormData } from '../types/Waiver';

export type WaiverSubmissionPayload = {
  participant: {
    full_name: string;
    date_of_birth: string;
    email: string;
    phone: string;
    address: {
      line1: string;
      line2: string;
      city: string;
      state: string;
      postal_code: string;
    };
  };
  emergency_contact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  health: WaiverFormData['healthAssessment'];
  injury: WaiverFormData['injury'];
  clauses: WaiverFormData['clauses'];
  review: WaiverFormData['review'];
  signature: WaiverFormData['signature'];
  locale: string;
  content_version: string;
};

export const mapFormToSubmissionPayload = (
  form: WaiverFormData,
  locale: string,
  contentVersion: string,
): WaiverSubmissionPayload => ({
  participant: {
    full_name: form.personalInfo.fullName,
    date_of_birth: form.personalInfo.dateOfBirth,
    email: form.personalInfo.email,
    phone: form.personalInfo.phone,
    address: {
      line1: form.personalInfo.addressLine1,
      line2: form.personalInfo.addressLine2,
      city: form.personalInfo.city,
      state: form.personalInfo.state,
      postal_code: form.personalInfo.postalCode,
    },
  },
  emergency_contact: {
    name: form.emergencyContact.name,
    relationship: form.emergencyContact.relationship,
    phone: form.emergencyContact.phone,
    email: form.emergencyContact.email || undefined,
  },
  health: form.healthAssessment,
  injury: form.injury,
  clauses: form.clauses,
  review: form.review,
  signature: form.signature,
  locale,
  content_version: contentVersion,
});
