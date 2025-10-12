import * as yup from 'yup';
import type { ObjectSchema } from 'yup';
import type { FieldPath } from 'react-hook-form';
import type {
  WaiverFormData,
  WaiverStepId,
  YesNo,
} from '../types/Waiver';

type Translate = (key: string) => string;

const yesNoSchema = yup
  .mixed<YesNo>()
  .oneOf(['yes', 'no'] as const);

export const createWaiverSchema = (t: Translate): ObjectSchema<WaiverFormData> =>
  yup
    .object({
      personalInfo: yup.object({
        fullName: yup
          .string()
          .trim()
          .required(t('validation.required')),
        dateOfBirth: yup
          .string()
          .trim()
          .required(t('validation.required')),
        addressLine1: yup
          .string()
          .trim()
          .required(t('validation.required')),
        addressLine2: yup.string().trim(),
        city: yup
          .string()
          .trim()
          .required(t('validation.required')),
        state: yup
          .string()
          .trim()
          .required(t('validation.required')),
        postalCode: yup
          .string()
          .trim()
          .required(t('validation.required')),
        email: yup
          .string()
          .email(t('validation.email'))
          .required(t('validation.required')),
        phone: yup
          .string()
          .trim()
          .required(t('validation.required')),
      }),
      emergencyContact: yup.object({
        name: yup
          .string()
          .trim()
          .required(t('validation.required')),
        relationship: yup
          .string()
          .trim()
          .required(t('validation.required')),
        phone: yup
          .string()
          .trim()
          .required(t('validation.required')),
        email: yup
          .string()
          .trim()
          .email(t('validation.email'))
          .optional()
          .default(''),
      }),
      healthAssessment: yup.object({
        heartDisease: yup
          .boolean()
          .required(t('validation.required')),
        shortnessOfBreath: yup
          .boolean()
          .required(t('validation.required')),
        highBloodPressure: yup
          .boolean()
          .required(t('validation.required')),
        smoking: yup
          .boolean()
          .required(t('validation.required')),
        diabetes: yup
          .boolean()
          .required(t('validation.required')),
        familyHistory: yup
          .boolean()
          .required(t('validation.required')),
        workouts: yup
          .boolean()
          .required(t('validation.required')),
        medication: yup
          .boolean()
          .required(t('validation.required')),
        alcohol: yup
          .boolean()
          .required(t('validation.required')),
        lastPhysical: yup
          .string()
          .trim()
          .required(t('validation.required')),
        injuries: yup.object({
          knees: yup
            .boolean()
            .required(t('validation.required')),
          lowerBack: yup
            .boolean()
            .required(t('validation.required')),
          neckShoulders: yup
            .boolean()
            .required(t('validation.required')),
          hipPelvis: yup
            .boolean()
            .required(t('validation.required')),
          other: yup.object({
            has: yup
              .boolean()
              .required(t('validation.required')),
            details: yup
              .string()
              .trim()
              .when('has', {
                is: true,
                then: (schema) =>
                  schema.required(t('validation.required')),
                otherwise: (schema) => schema.optional().default(''),
              }),
          }),
        }),
        exerciseRestriction: yup.string().trim(),
      }),
      injury: yup.object({
        hadRecentInjury: yesNoSchema.required(t('validation.required')),
        injuryDetails: yup.string().trim(),
        physicianCleared: yesNoSchema.required(t('validation.required')),
        clearanceNotes: yup.string().trim(),
      }),
      clauses: yup.object({
        riskInitials: yup
          .string()
          .trim()
          .length(2, t('validation.initials_length'))
          .required(t('validation.required')),
        releaseInitials: yup
          .string()
          .trim()
          .length(2, t('validation.initials_length'))
          .required(t('validation.required')),
        indemnificationInitials: yup
          .string()
          .trim()
          .length(2, t('validation.initials_length'))
          .required(t('validation.required')),
        mediaInitials: yup
          .string()
          .trim()
          .length(2, t('validation.initials_length'))
          .required(t('validation.required')),
        acceptedTerms: yup
          .boolean()
          .oneOf([true], t('validation.accept_terms')),
      }),
      signature: yup
        .object({
          pngDataUrl: yup
            .string()
            .trim()
            .required(t('validation.signature_required')),
          vectorJson: yup.mixed().required(),
        })
        .test(
          'has-signature',
          t('validation.signature_required'),
          (value) => Boolean(value?.pngDataUrl),
        ),
      review: yup.object({
        confirmAccuracy: yup
          .boolean()
          .oneOf([true], t('validation.confirm_accuracy')),
      }),
    })
    .required() as ObjectSchema<WaiverFormData>;

export const stepFieldPaths: Record<WaiverStepId, FieldPath<WaiverFormData>[]> = {
  personalInfo: [
    'personalInfo.fullName',
    'personalInfo.dateOfBirth',
    'personalInfo.addressLine1',
    'personalInfo.addressLine2',
    'personalInfo.city',
    'personalInfo.state',
    'personalInfo.postalCode',
    'personalInfo.email',
    'personalInfo.phone',
  ],
  emergencyContact: [
    'emergencyContact.name',
    'emergencyContact.relationship',
    'emergencyContact.phone',
    'emergencyContact.email',
  ],
  healthAssessment: [
    'healthAssessment.heartDisease',
    'healthAssessment.shortnessOfBreath',
    'healthAssessment.highBloodPressure',
    'healthAssessment.smoking',
    'healthAssessment.diabetes',
    'healthAssessment.familyHistory',
    'healthAssessment.workouts',
    'healthAssessment.medication',
    'healthAssessment.alcohol',
    'healthAssessment.lastPhysical',
    'healthAssessment.injuries.knees',
    'healthAssessment.injuries.lowerBack',
    'healthAssessment.injuries.neckShoulders',
    'healthAssessment.injuries.hipPelvis',
    'healthAssessment.injuries.other.has',
    'healthAssessment.injuries.other.details',
    'healthAssessment.exerciseRestriction',
  ],
  injuryDisclosure: [
    'injury.hadRecentInjury',
    'injury.injuryDetails',
    'injury.physicianCleared',
    'injury.clearanceNotes',
  ],
  initialClauses: [
    'clauses.riskInitials',
    'clauses.releaseInitials',
    'clauses.indemnificationInitials',
    'clauses.mediaInitials',
    'clauses.acceptedTerms',
  ],
  signature: ['signature.pngDataUrl', 'signature.vectorJson'],
  review: ['review.confirmAccuracy'],
};
