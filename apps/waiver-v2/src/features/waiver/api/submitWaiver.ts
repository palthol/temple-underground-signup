import type { Locale } from '../../../shared/i18n/I18nProvider'
import type { WaiverFormInput } from '../hooks/useWaiverForm'

export type SubmitWaiverSuccess = {
  waiverId: string
  participantId: string
  sha256: string
}

export type SubmitWaiverFieldError = {
  field: string
  messageKey?: string
}

export type SubmitWaiverResult =
  | { ok: true; data: SubmitWaiverSuccess }
  | { ok: false; status: number; errors?: SubmitWaiverFieldError[]; error?: string; message?: string }

const CONTENT_VERSION = 'waiver.v1'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const parseFieldErrors = (value: unknown): SubmitWaiverFieldError[] | undefined => {
  if (!Array.isArray(value)) return undefined
  const parsed = value.reduce<SubmitWaiverFieldError[]>((acc, entry) => {
    if (!isRecord(entry)) return acc
    const field = typeof entry.field === 'string' ? entry.field : undefined
    if (!field) return acc
    const messageKey = typeof entry.messageKey === 'string' ? entry.messageKey : undefined
    acc.push({ field, messageKey })
    return acc
  }, [])

  return parsed.length ? parsed : undefined
}

const getApiBaseUrl = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL as string | undefined
  if (!fromEnv) return ''
  return fromEnv.endsWith('/') ? fromEnv.slice(0, -1) : fromEnv
}

const mapParticipant = (input: WaiverFormInput['personalInfo']) => ({
  full_name: input.fullName,
  date_of_birth: input.dateOfBirth,
  email: input.email,
  phone: input.phone,
  address_line: input.addressLine1,
  address_line_2: input.addressLine2 || null,
  city: input.city,
  state: input.state,
  zip: input.postalCode,
})

const mapEmergencyContact = (input: WaiverFormInput['emergencyContact']) => ({
  name: input.name || null,
  relationship: input.relationship || null,
  phone: input.phone || null,
  email: input.email || null,
})

const mapMedicalInformation = (input: WaiverFormInput['medicalInformation']) => ({
  heart_disease: input.heartDisease,
  shortness_of_breath: input.shortnessOfBreath,
  high_blood_pressure: input.highBloodPressure,
  smoking: input.smoking,
  diabetes: input.diabetes,
  family_history: input.familyHistory,
  workouts: input.workouts,
  medication: input.medication,
  alcohol: input.alcohol,
  last_physical: input.lastPhysical || null,
  exercise_restriction: input.exerciseRestriction || null,
  injuries: {
    knees: input.injuries.knees,
    lower_back: input.injuries.lowerBack,
    neck_shoulders: input.injuries.neckShoulders,
    hip_pelvis: input.injuries.hipPelvis,
    other: {
      has: input.injuries.other.has,
      details: input.injuries.other.details ? input.injuries.other.details : null,
    },
  },
  had_recent_injury: input.hadRecentInjury,
  injury_details: input.injuryDetails || null,
  physician_cleared: input.physicianCleared ?? null,
  clearance_notes: input.clearanceNotes || null,
})

const mapLegalConfirmation = (input: WaiverFormInput['legalConfirmation']) => ({
  risk_initials: input.riskInitials,
  release_initials: input.releaseInitials,
  indemnification_initials: input.indemnificationInitials,
  media_initials: input.mediaInitials,
  accepted_terms: input.acceptedTerms,
})

const buildPayload = (formData: WaiverFormInput, locale: Locale) => ({
  participant: mapParticipant(formData.personalInfo),
  emergency_contact: mapEmergencyContact(formData.emergencyContact),
  medical_information: mapMedicalInformation(formData.medicalInformation),
  legal_confirmation: mapLegalConfirmation(formData.legalConfirmation),
  signature: formData.legalConfirmation.signature,
  review: { confirm_accuracy: formData.review.confirmAccuracy },
  locale,
  content_version: CONTENT_VERSION,
})

const tryParseJson = async (response: Response) => {
  try {
    return (await response.json()) as unknown
  } catch (error) {
    console.warn('Failed to parse response JSON', error)
    return null
  }
}

export const submitWaiver = async (
  formData: WaiverFormInput,
  locale: Locale,
): Promise<SubmitWaiverResult> => {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}/api/waivers/submit`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildPayload(formData, locale)),
    })

    const json = await tryParseJson(response)

    if (!response.ok) {
      const errors = isRecord(json) ? parseFieldErrors(json.errors) : undefined
      const error = isRecord(json) && typeof json.error === 'string' ? json.error : undefined
      return { ok: false, status: response.status, errors, error }
    }

    if (!isRecord(json)) {
      return { ok: false, status: response.status, error: 'invalid_response' }
    }

    const waiverId = typeof json.waiverId === 'string' ? json.waiverId : undefined
    const participantId = typeof json.participantId === 'string' ? json.participantId : undefined
    const sha256 = typeof json.sha256 === 'string' ? json.sha256 : ''

    if (!waiverId || !participantId) {
      return { ok: false, status: response.status, error: 'invalid_response' }
    }

    return {
      ok: true,
      data: {
        waiverId,
        participantId,
        sha256,
      },
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, status: 0, error: 'network_error', message }
  }
}


