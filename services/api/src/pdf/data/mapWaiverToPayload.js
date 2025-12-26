const formatBoolean = (value) => {
  if (value === true) return 'Yes'
  if (value === false) return 'No'
  return '—'
}

const formatString = (value) => {
  if (typeof value !== 'string') return '—'
  const trimmed = value.trim()
  return trimmed.length ? trimmed : '—'
}

const formatOptionalString = (value) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

const formatCityStateZip = (city, state, zip) => {
  const parts = [city, state, zip].map((part) => (typeof part === 'string' ? part.trim() : '')).filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

const buildInjuryChips = (medical) => {
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

export const mapWaiverToPayload = (row, { legalCopy, organization, document }) => {
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
      signedAt: audit?.created_at || waiver.signed_at_utc || null,
    },
    participant: {
      id: participant?.id ?? waiver.participant_id,
      fullName: formatOptionalString(participant?.full_name),
      dateOfBirth: formatOptionalString(participant?.date_of_birth),
      email: formatOptionalString(participant?.email),
      phone: formatOptionalString(participant?.cell_phone ?? participant?.home_phone),
      addressLine: formatOptionalString(participant?.address_line),
      cityStateZip: formatCityStateZip(participant?.city, participant?.state, participant?.zip),
    },
    emergencyContact: {
      name: formatOptionalString(emergencyContact?.name),
      relationship: formatOptionalString(emergencyContact?.relationship),
      phone: formatOptionalString(emergencyContact?.phone),
      email: formatOptionalString(emergencyContact?.email),
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
      imageDataUrl: null,
    },
  }
}

