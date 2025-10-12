import { z } from 'zod'
import type { FieldPath } from 'react-hook-form'
import type { Translate } from './common'
import { createPersonalInfoSchema } from './PersonalInfo'
import { createEmergencyContactSchema } from './EmergencyContact'
import { createHealthAssessmentSchema } from './HealthAssessment'
import { createInjuryDisclosureSchema } from './InjuryDisclosure'
import { createClausesSchema } from './Clauses'
import { createSignatureSchema } from './Signature'
import { createReviewSchema } from './Review'

export const createWaiverSchema = (t: Translate) =>
  z
    .object({
      personalInfo: createPersonalInfoSchema(t),
      emergencyContact: createEmergencyContactSchema(t),
      healthAssessment: createHealthAssessmentSchema(t),
      injury: createInjuryDisclosureSchema(t),
      clauses: createClausesSchema(t),
      signature: createSignatureSchema(t),
      review: createReviewSchema(t),
    })
    .strict()

export type WaiverFormData = z.infer<ReturnType<typeof createWaiverSchema>>

export type WaiverStepId =
  | 'personalInfo'
  | 'emergencyContact'
  | 'healthAssessment'
  | 'injuryDisclosure'
  | 'initialClauses'
  | 'signature'
  | 'review'

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
}


