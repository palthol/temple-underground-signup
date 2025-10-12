import React from 'react';
import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  Stack,
  Typography,
} from '@mui/material';
import { useFormContext } from 'react-hook-form';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const WaiverViewer: React.FC = () => {
  const { t } = useI18n();
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const values = watch();

  return (
    <Stack spacing={3}>
      <Typography variant="h6">
        {t('form.review.title')}
      </Typography>
      <Typography variant="body2">
        {t('form.review.instructions')}
      </Typography>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.review.section.personal')}
        </Typography>
        <Typography variant="body2">
          {values.personalInfo.fullName}
        </Typography>
        <Typography variant="body2">
          {t('form.personal.date_of_birth')}: {values.personalInfo.dateOfBirth}
        </Typography>
        <Typography variant="body2">
          {values.personalInfo.addressLine1}
          {values.personalInfo.addressLine2
            ? `, ${values.personalInfo.addressLine2}`
            : ''}
        </Typography>
        <Typography variant="body2">
          {values.personalInfo.city}, {values.personalInfo.state}{' '}
          {values.personalInfo.postalCode}
        </Typography>
        <Typography variant="body2">
          {values.personalInfo.email}
        </Typography>
        <Typography variant="body2">
          {values.personalInfo.phone}
        </Typography>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.review.section.emergency')}
        </Typography>
        <Typography variant="body2">
          {values.emergencyContact.name} ({values.emergencyContact.relationship})
        </Typography>
        <Typography variant="body2">
          {values.emergencyContact.phone}
        </Typography>
        {values.emergencyContact.email && (
          <Typography variant="body2">
            {values.emergencyContact.email}
          </Typography>
        )}
      </Stack>

      {values.healthAssessment && (
        <Stack spacing={1}>
          <Typography variant="subtitle1">
            {t('form.review.section.health')}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.heartDisease')}: ${
              values.healthAssessment.heartDisease ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.shortnessOfBreath')}: ${
              values.healthAssessment.shortnessOfBreath ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.highBloodPressure')}: ${
              values.healthAssessment.highBloodPressure ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.smoking')}: ${
              values.healthAssessment.smoking ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.diabetes')}: ${
              values.healthAssessment.diabetes ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.familyHistory')}: ${
              values.healthAssessment.familyHistory ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.workouts')}: ${
              values.healthAssessment.workouts ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.medication')}: ${
              values.healthAssessment.medication ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.alcohol')}: ${
              values.healthAssessment.alcohol ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.lastPhysical')}: ${values.healthAssessment.lastPhysical}`}
          </Typography>
          <Typography variant="subtitle2">
            {t('healthAssessment.injuries.title')}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.injuries.knees')}: ${
              values.healthAssessment.injuries.knees ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.injuries.lowerBack')}: ${
              values.healthAssessment.injuries.lowerBack ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.injuries.neckShoulders')}: ${
              values.healthAssessment.injuries.neckShoulders ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.injuries.hipPelvis')}: ${
              values.healthAssessment.injuries.hipPelvis ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          <Typography variant="body2">
            {`${t('healthAssessment.injuries.other')}: ${
              values.healthAssessment.injuries.other.has ? t('common.yes') : t('common.no')
            }`}
          </Typography>
          {values.healthAssessment.injuries.other.has &&
            values.healthAssessment.injuries.other.details && (
              <Typography variant="body2">
                {values.healthAssessment.injuries.other.details}
              </Typography>
            )}
          {values.healthAssessment.exerciseRestriction && (
            <Typography variant="body2">
              {`${t('healthAssessment.exerciseRestriction')}: ${
                values.healthAssessment.exerciseRestriction
              }`}
            </Typography>
          )}
        </Stack>
      )}

      <Stack spacing={1}>
        <Typography variant="subtitle1">
          {t('form.review.section.injury')}
        </Typography>
        <Typography variant="body2">
          {`${t('form.injury.had_recent_injury')}: ${
            values.injury.hadRecentInjury === 'yes'
              ? t('common.yes')
              : t('common.no')
          }`}
        </Typography>
        {values.injury.injuryDetails && (
          <Typography variant="body2">
            {values.injury.injuryDetails}
          </Typography>
        )}
        <Typography variant="body2">
          {`${t('form.injury.physician_cleared')}: ${
            values.injury.physicianCleared === 'yes'
              ? t('common.yes')
              : t('common.no')
          }`}
        </Typography>
        {values.injury.clearanceNotes && (
          <Typography variant="body2">
            {values.injury.clearanceNotes}
          </Typography>
        )}
      </Stack>

      <FormControlLabel
        control={
          <Checkbox
            {...register('review.confirmAccuracy')}
            color="primary"
          />
        }
        label={t('form.review.confirm')}
      />
      {errors.review?.confirmAccuracy && (
        <FormHelperText error>
          {errors.review.confirmAccuracy.message as string}
        </FormHelperText>
      )}
    </Stack>
  );
};

export default WaiverViewer;
