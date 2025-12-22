import type { WaiverJoinedRow, WaiverPdfPayload } from '../types.js'

export type LegalCopy = WaiverPdfPayload['legal']

export type OrganizationInfo = WaiverPdfPayload['organization']

export interface MapWaiverToPayloadOptions {
  legalCopy: LegalCopy
  organization: OrganizationInfo
  document: Pick<WaiverPdfPayload['document'], 'title' | 'version' | 'locale'>
}

const formatBoolean = (value: boolean | null | undefined) => {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
}

const formatString = (value: string | null | undefined) => (value && value.trim().length ? value.trim() : '—')

const formatCityStateZip = (city: string | null, state: string | null, zip: string | null) => {
  const parts = [city, state, zip].map((part) => formatString(part ?? null)).filter((part) => part !== '—')
  return parts.length ? parts.join(', ') : '—'
}

const buildInjuryChips = (medical: WaiverJoinedRow['medical']) => {
  const chips = [
    { label: 'Knees', active: Boolean(medical?.injuries_knees) },
    { label: 'Lower Back', active: Boolean(medical?.injuries_lower_back) },
    { label: 'Neck & Shoulders', active: Boolean(medical?.injuries_neck_shoulders) },
    { label: 'Hip & Pelvis', active: Boolean(medical?.injuries_hip_pelvis) },
  ]

  if (medical?.injuries_other_has) {
    chips.push({ label: 'Other', active: true })
  }

  return chips
}

export const mapWaiverToPayload = (
  row: WaiverJoinedRow,
  { legalCopy, organization, document }: MapWaiverToPayloadOptions,
): WaiverPdfPayload => {
  const { waiver, participant, medical, emergencyContact, audit } = row

  return {
    document: {
      title: document.title,
      version: document.version,
      locale: document.locale,
      generatedAt: new Date().toISOString(),
    },
    organization,
    waiver: {
      id: waiver.id,
      signedAt: audit?.created_at ?? waiver.signed_at_utc ?? null,
    },
    participant: {
      id: participant?.id ?? waiver.participant_id,
      fullName: formatString(participant?.full_name ?? null),
      dateOfBirth: formatString(participant?.date_of_birth ?? null),
      email: formatString(participant?.email ?? null),
      phone: formatString(participant?.cell_phone ?? participant?.home_phone ?? null),
      addressLine: formatString(participant?.address_line ?? null),
      cityStateZip: formatCityStateZip(participant?.city ?? null, participant?.state ?? null, participant?.zip ?? null),
    },
    emergencyContact: {
      name: formatString(emergencyContact?.name ?? null),
      relationship: formatString(emergencyContact?.relationship ?? null),
      phone: formatString(emergencyContact?.phone ?? null),
      email: formatString(emergencyContact?.email ?? null),
    },
    medicalInformation: {
      heartDisease: formatBoolean(medical?.heart_disease ?? null),
      shortnessOfBreath: formatBoolean(medical?.shortness_of_breath ?? null),
      highBloodPressure: formatBoolean(medical?.high_blood_pressure ?? null),
      smoking: formatBoolean(medical?.smoking ?? null),
      diabetes: formatBoolean(medical?.diabetes ?? null),
      familyHistory: formatBoolean(medical?.family_history ?? null),
      workouts: formatBoolean(medical?.workouts ?? null),
      medication: formatBoolean(medical?.medication ?? null),
      alcohol: formatBoolean(medical?.alcohol ?? null),
      lastPhysical: formatString(medical?.last_physical ?? null),
      exerciseRestriction: formatString(medical?.exercise_restriction ?? null),
      injuries: buildInjuryChips(medical),
      otherInjuryDetails: formatString(medical?.injuries_other_details ?? null),
      hadRecentInjury: formatBoolean(medical?.had_recent_injury ?? null),
      physicianCleared: formatBoolean(medical?.physician_cleared ?? null),
      clearanceNotes: formatString(medical?.clearance_notes ?? null),
    },
    legal: legalCopy,
    legalConfirmation: {
      riskInitials: formatString(waiver.initials_risk_assumption ?? null),
      releaseInitials: formatString(waiver.initials_release ?? null),
      indemnificationInitials: formatString(waiver.initials_indemnification ?? null),
      mediaInitials: formatString(waiver.initials_media_release ?? null),
    },
    signature: {
      imageDataUrl: null, // populated later when storage download is implemented
    },
  }
}

