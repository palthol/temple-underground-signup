import React from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createWaiverSchema, stepFieldPaths } from '../schema/waiver';
import type { WaiverFormData } from '../types/Waiver';

type Translate = (key: string) => string;

const createDefaultValues = (): WaiverFormData => ({
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
  healthAssessment: undefined as unknown as WaiverFormData['healthAssessment'],
  injury: {
    hadRecentInjury: 'no',
    injuryDetails: '',
    physicianCleared: 'yes',
    clearanceNotes: '',
  },
  clauses: {
    riskInitials: '',
    releaseInitials: '',
    indemnificationInitials: '',
    mediaInitials: '',
    acceptedTerms: false,
  },
  signature: {
    pngDataUrl: '',
    vectorJson: [],
  },
  review: {
    confirmAccuracy: false,
  },
});

export type UseWaiverFormReturn = {
  methods: UseFormReturn<WaiverFormData>;
  stepFields: typeof stepFieldPaths;
};

export const useWaiverForm = (t: Translate): UseWaiverFormReturn => {
  const schema = React.useMemo(() => createWaiverSchema(t), [t]);
  const defaultValues = React.useMemo(() => createDefaultValues(), []);
  const methods = useForm<WaiverFormData>({
    resolver: yupResolver<WaiverFormData>(schema),
    mode: 'onBlur',
    defaultValues,
  });

  return React.useMemo(
    () => ({
      methods,
      stepFields: stepFieldPaths,
    }),
    [methods],
  );
};

export const useWaiverFormDefaultValues = (): WaiverFormData => createDefaultValues();
