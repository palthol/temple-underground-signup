import React from 'react';
import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const InjuryDisclosureForm: React.FC = () => {
  const { t } = useI18n();
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const hadRecentInjury = watch('injury.hadRecentInjury');
  const physicianCleared = watch('injury.physicianCleared');

  return (
    <Stack spacing={3}>
      <Controller
        name="injury.hadRecentInjury"
        control={control}
        render={({ field }) => (
          <FormControl
            component="fieldset"
            error={Boolean(errors.injury?.hadRecentInjury)}
          >
            <FormLabel component="legend">
              {t('form.injury.had_recent_injury')}
            </FormLabel>
            <RadioGroup
              row
              {...field}
              value={field.value ?? 'no'}
              onChange={(event) => field.onChange(event.target.value)}
            >
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label={t('common.yes')}
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label={t('common.no')}
              />
            </RadioGroup>
            <FormHelperText>
              {errors.injury?.hadRecentInjury?.message}
            </FormHelperText>
          </FormControl>
        )}
      />

      {(hadRecentInjury ?? 'no') === 'yes' && (
        <TextField
          label={t('form.injury.details')}
          {...register('injury.injuryDetails')}
          multiline
          minRows={3}
        />
      )}

      <Controller
        name="injury.physicianCleared"
        control={control}
        render={({ field }) => (
          <FormControl
            component="fieldset"
            error={Boolean(errors.injury?.physicianCleared)}
          >
            <FormLabel component="legend">
              {t('form.injury.physician_cleared')}
            </FormLabel>
            <RadioGroup
              row
              {...field}
              value={field.value ?? 'yes'}
              onChange={(event) => field.onChange(event.target.value)}
            >
              <FormControlLabel
                value="yes"
                control={<Radio />}
                label={t('common.yes')}
              />
              <FormControlLabel
                value="no"
                control={<Radio />}
                label={t('common.no')}
              />
            </RadioGroup>
            <FormHelperText>
              {errors.injury?.physicianCleared?.message}
            </FormHelperText>
          </FormControl>
        )}
      />

      {(physicianCleared ?? 'yes') === 'no' && (
        <TextField
          label={t('form.injury.clearance_notes')}
          {...register('injury.clearanceNotes')}
          multiline
          minRows={3}
        />
      )}
    </Stack>
  );
};

export default InjuryDisclosureForm;
