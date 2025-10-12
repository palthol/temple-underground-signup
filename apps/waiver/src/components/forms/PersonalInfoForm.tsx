import React from 'react';
import { Stack, TextField } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const PersonalInfoForm: React.FC = () => {
  const { t } = useI18n();
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const fieldError = (path: keyof WaiverFormData['personalInfo']) =>
    errors.personalInfo?.[path]?.message as string | undefined;

  return (
    <Stack spacing={2}>
      <TextField
        label={t('form.personal.full_name')}
        {...register('personalInfo.fullName')}
        error={Boolean(errors.personalInfo?.fullName)}
        helperText={fieldError('fullName')}
        fullWidth
      />

      <Controller
        name="personalInfo.dateOfBirth"
        control={control}
        render={({ field }) => (
          <DatePicker
            label={t('form.personal.date_of_birth')}
            value={field.value ? dayjs(field.value) : null}
            onChange={(value) =>
              field.onChange(value ? value.format('YYYY-MM-DD') : '')
            }
            slotProps={{
              textField: {
                error: Boolean(errors.personalInfo?.dateOfBirth),
                helperText: fieldError('dateOfBirth'),
                fullWidth: true,
              },
            }}
          />
        )}
      />

      <TextField
        label={t('form.personal.address_line1')}
        {...register('personalInfo.addressLine1')}
        error={Boolean(errors.personalInfo?.addressLine1)}
        helperText={fieldError('addressLine1')}
        fullWidth
      />

      <TextField
        label={t('form.personal.address_line2')}
        {...register('personalInfo.addressLine2')}
        error={Boolean(errors.personalInfo?.addressLine2)}
        helperText={fieldError('addressLine2')}
        fullWidth
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label={t('form.personal.city')}
          {...register('personalInfo.city')}
          error={Boolean(errors.personalInfo?.city)}
          helperText={fieldError('city')}
          fullWidth
        />
        <TextField
          label={t('form.personal.state')}
          {...register('personalInfo.state')}
          error={Boolean(errors.personalInfo?.state)}
          helperText={fieldError('state')}
          fullWidth
        />
        <TextField
          label={t('form.personal.postal_code')}
          {...register('personalInfo.postalCode')}
          error={Boolean(errors.personalInfo?.postalCode)}
          helperText={fieldError('postalCode')}
          fullWidth
        />
      </Stack>

      <TextField
        type="email"
        label={t('form.personal.email')}
        {...register('personalInfo.email')}
        error={Boolean(errors.personalInfo?.email)}
        helperText={fieldError('email')}
        fullWidth
      />

      <TextField
        type="tel"
        label={t('form.personal.phone')}
        {...register('personalInfo.phone')}
        error={Boolean(errors.personalInfo?.phone)}
        helperText={fieldError('phone')}
        fullWidth
      />
    </Stack>
  );
};

export default PersonalInfoForm;
