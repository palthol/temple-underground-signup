import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const InitialClausesForm: React.FC = () => {
  const { t } = useI18n();
  const {
    register,
    setValue,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const clauseError = (path: keyof WaiverFormData['clauses']) =>
    errors.clauses?.[path]?.message as string | undefined;

  const uppercase =
    (name: keyof WaiverFormData['clauses']) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(
        `clauses.${name}`,
        event.target.value.toUpperCase(),
        { shouldValidate: true, shouldDirty: true },
      );
    };

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.clauses.risk.title')}
        </Typography>
        <Typography variant="body2">
          {t('form.clauses.risk.body')}
        </Typography>
        <TextField
          label={t('form.clauses.initials')}
          {...register('clauses.riskInitials')}
          onChange={uppercase('riskInitials')}
          inputProps={{ maxLength: 2 }}
          error={Boolean(errors.clauses?.riskInitials)}
          helperText={clauseError('riskInitials')}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.clauses.release.title')}
        </Typography>
        <Typography variant="body2">
          {t('form.clauses.release.body')}
        </Typography>
        <TextField
          label={t('form.clauses.initials')}
          {...register('clauses.releaseInitials')}
          onChange={uppercase('releaseInitials')}
          inputProps={{ maxLength: 2 }}
          error={Boolean(errors.clauses?.releaseInitials)}
          helperText={clauseError('releaseInitials')}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.clauses.indemnification.title')}
        </Typography>
        <Typography variant="body2">
          {t('form.clauses.indemnification.body')}
        </Typography>
        <TextField
          label={t('form.clauses.initials')}
          {...register('clauses.indemnificationInitials')}
          onChange={uppercase('indemnificationInitials')}
          inputProps={{ maxLength: 2 }}
          error={Boolean(errors.clauses?.indemnificationInitials)}
          helperText={clauseError('indemnificationInitials')}
        />
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.clauses.media.title')}
        </Typography>
        <Typography variant="body2">
          {t('form.clauses.media.body')}
        </Typography>
        <TextField
          label={t('form.clauses.initials')}
          {...register('clauses.mediaInitials')}
          onChange={uppercase('mediaInitials')}
          inputProps={{ maxLength: 2 }}
          error={Boolean(errors.clauses?.mediaInitials)}
          helperText={clauseError('mediaInitials')}
        />
      </Stack>

      <div>
        <FormControlLabel
          control={
            <Checkbox
              {...register('clauses.acceptedTerms')}
              color="primary"
            />
          }
          label={t('form.clauses.accept_terms')}
        />
        {errors.clauses?.acceptedTerms && (
          <FormHelperText error>
            {errors.clauses.acceptedTerms.message as string}
          </FormHelperText>
        )}
      </div>
    </Stack>
  );
};

export default InitialClausesForm;
