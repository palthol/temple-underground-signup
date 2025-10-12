import React from 'react'
import { useForm, type UseFormReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createWaiverSchema, stepFieldPaths } from '../schema/waiver'
import { z } from 'zod'

type Translate = (key: string) => string

type WaiverSchema = ReturnType<typeof createWaiverSchema>
export type WaiverFormInput = z.input<WaiverSchema>
export type WaiverFormData = z.output<WaiverSchema>

export type UseWaiverFormReturn = {
  methods: UseFormReturn<WaiverFormInput>
  stepFields: typeof stepFieldPaths
}

const createDefaultValues = (): WaiverFormInput => ({
  personalInfo: {
    fullName: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    email: '',
    phone: '',
  },
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
  },
  healthAssessment: {
    heartDisease: false,
    shortnessOfBreath: false,
    highBloodPressure: false,
    smoking: false,
    diabetes: false,
    familyHistory: false,
    workouts: false,
    medication: false,
    alcohol: false,
    lastPhysical: '',
    injuries: {
      knees: false,
      lowerBack: false,
      neckShoulders: false,
      hipPelvis: false,
      other: { has: false, details: '' },
    },
    exerciseRestriction: '',
  },
  injury: {
    hadRecentInjury: 'no' as any,
    injuryDetails: '',
    physicianCleared: 'yes' as any,
    clearanceNotes: '',
  },
  clauses: {
    riskInitials: '',
    releaseInitials: '',
    indemnificationInitials: '',
    mediaInitials: '',
    acceptedTerms: false,
  },
  signature: { pngDataUrl: '', vectorJson: [] },
  review: { confirmAccuracy: false },
})

export const useWaiverForm = (t: Translate) => {
  const schema = React.useMemo(() => createWaiverSchema(t), [t])
  const defaultValues = React.useMemo(() => createDefaultValues(), [])

  const methods = useForm<WaiverFormInput>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues,
  })

  return React.useMemo(
    () => ({ methods, stepFields: stepFieldPaths }),
    [methods],
  )
}
