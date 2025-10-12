import React from 'react';
import { Stack, TextField } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const EmergencyContactForm: React.FC = () => {
  const { t } = useI18n();
  const {
    register,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const fieldError = (path: keyof WaiverFormData['emergencyContact']) =>
    errors.emergencyContact?.[path]?.message as string | undefined;

  return (
    <Stack spacing={2}>
      <TextField
        label={t('form.emergency.name')}
        {...register('emergencyContact.name')}
        error={Boolean(errors.emergencyContact?.name)}
        helperText={fieldError('name')}
        fullWidth
      />

      <TextField
        label={t('form.emergency.relationship')}
        {...register('emergencyContact.relationship')}
        error={Boolean(errors.emergencyContact?.relationship)}
        helperText={fieldError('relationship')}
        fullWidth
      />

      <TextField
        type="tel"
        label={t('form.emergency.phone')}
        {...register('emergencyContact.phone')}
        error={Boolean(errors.emergencyContact?.phone)}
        helperText={fieldError('phone')}
        fullWidth
      />

      <TextField
        type="email"
        label={t('form.emergency.email')}
        {...register('emergencyContact.email')}
        error={Boolean(errors.emergencyContact?.email)}
        helperText={fieldError('email')}
        fullWidth
      />
    </Stack>
  );
};

export default EmergencyContactForm;
