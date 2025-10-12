import React from 'react';
import {
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useI18n } from '../../i18n';
import type { HealthAssessment } from '../../types/Waiver';

type BooleanDraft = boolean | null;

type HealthAssessmentDraft = {
  heartDisease: BooleanDraft;
  shortnessOfBreath: BooleanDraft;
  highBloodPressure: BooleanDraft;
  smoking: BooleanDraft;
  diabetes: BooleanDraft;
  familyHistory: BooleanDraft;
  workouts: BooleanDraft;
  medication: BooleanDraft;
  alcohol: BooleanDraft;
  lastPhysical: string;
  injuries: {
    knees: BooleanDraft;
    lowerBack: BooleanDraft;
    neckShoulders: BooleanDraft;
    hipPelvis: BooleanDraft;
    other: {
      has: BooleanDraft;
      details: string;
    };
  };
  exerciseRestriction: string;
};

type BooleanFieldKey = keyof Pick<
  HealthAssessmentDraft,
  | 'heartDisease'
  | 'shortnessOfBreath'
  | 'highBloodPressure'
  | 'smoking'
  | 'diabetes'
  | 'familyHistory'
  | 'workouts'
  | 'medication'
  | 'alcohol'
>;

type InjuryBooleanFieldKey = keyof Pick<
  HealthAssessmentDraft['injuries'],
  'knees' | 'lowerBack' | 'neckShoulders' | 'hipPelvis'
>;

type Props = {
  value?: HealthAssessment;
  onFormComplete?: (data: HealthAssessment) => void;
};

type ValidationErrors = Record<string, string>;

const createEmptyDraft = (): HealthAssessmentDraft => ({
  heartDisease: null,
  shortnessOfBreath: null,
  highBloodPressure: null,
  smoking: null,
  diabetes: null,
  familyHistory: null,
  workouts: null,
  medication: null,
  alcohol: null,
  lastPhysical: '',
  injuries: {
    knees: null,
    lowerBack: null,
    neckShoulders: null,
    hipPelvis: null,
    other: {
      has: null,
      details: '',
    },
  },
  exerciseRestriction: '',
});

const fromValue = (value?: HealthAssessment): HealthAssessmentDraft => {
  if (!value) return createEmptyDraft();
  return {
    heartDisease: value.heartDisease,
    shortnessOfBreath: value.shortnessOfBreath,
    highBloodPressure: value.highBloodPressure,
    smoking: value.smoking,
    diabetes: value.diabetes,
    familyHistory: value.familyHistory,
    workouts: value.workouts,
    medication: value.medication,
    alcohol: value.alcohol,
    lastPhysical: value.lastPhysical ?? '',
    injuries: {
      knees: value.injuries.knees,
      lowerBack: value.injuries.lowerBack,
      neckShoulders: value.injuries.neckShoulders,
      hipPelvis: value.injuries.hipPelvis,
      other: {
        has: value.injuries.other.has,
        details: value.injuries.other.details ?? '',
      },
    },
    exerciseRestriction: value.exerciseRestriction ?? '',
  };
};

const toHealthAssessment = (
  draft: HealthAssessmentDraft,
): HealthAssessment => ({
  heartDisease: draft.heartDisease ?? false,
  shortnessOfBreath: draft.shortnessOfBreath ?? false,
  highBloodPressure: draft.highBloodPressure ?? false,
  smoking: draft.smoking ?? false,
  diabetes: draft.diabetes ?? false,
  familyHistory: draft.familyHistory ?? false,
  workouts: draft.workouts ?? false,
  medication: draft.medication ?? false,
  alcohol: draft.alcohol ?? false,
  lastPhysical: draft.lastPhysical,
  injuries: {
    knees: draft.injuries.knees ?? false,
    lowerBack: draft.injuries.lowerBack ?? false,
    neckShoulders: draft.injuries.neckShoulders ?? false,
    hipPelvis: draft.injuries.hipPelvis ?? false,
    other: {
      has: draft.injuries.other.has ?? false,
      details:
        draft.injuries.other.has && draft.injuries.other.details.trim().length
          ? draft.injuries.other.details.trim()
          : undefined,
    },
  },
  exerciseRestriction: draft.exerciseRestriction.trim()
    ? draft.exerciseRestriction.trim()
    : undefined,
});

const booleanFieldKeys: BooleanFieldKey[] = [
  'heartDisease',
  'shortnessOfBreath',
  'highBloodPressure',
  'smoking',
  'diabetes',
  'familyHistory',
  'workouts',
  'medication',
  'alcohol',
];

const injuryBooleanKeys: InjuryBooleanFieldKey[] = [
  'knees',
  'lowerBack',
  'neckShoulders',
  'hipPelvis',
];

const HealthAssessmentForm: React.FC<Props> = ({ value, onFormComplete }) => {
  const { t } = useI18n();

  const initialDraft = React.useMemo(() => fromValue(value), [value]);
  const [form, setForm] = React.useState<HealthAssessmentDraft>(initialDraft);
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [hasInteracted, setHasInteracted] = React.useState<boolean>(Boolean(value));
  const serializedPayloadRef = React.useRef<string>('');

  React.useEffect(() => {
    setForm(initialDraft);
    setHasInteracted(Boolean(value));
  }, [initialDraft, value]);

  const requiredMessage = t('validation.required');

  const validate = React.useCallback(
    (draft: HealthAssessmentDraft): ValidationErrors => {
      const nextErrors: ValidationErrors = {};

      booleanFieldKeys.forEach((field) => {
        if (draft[field] === null) {
          nextErrors[field] = requiredMessage;
        }
      });

      injuryBooleanKeys.forEach((field) => {
        if (draft.injuries[field] === null) {
          nextErrors[`injuries.${field}`] = requiredMessage;
        }
      });

      if (draft.injuries.other.has === null) {
        nextErrors['injuries.other.has'] = requiredMessage;
      } else if (
        draft.injuries.other.has &&
        !draft.injuries.other.details.trim().length
      ) {
        nextErrors['injuries.other.details'] = requiredMessage;
      }

      if (!draft.lastPhysical.trim().length) {
        nextErrors.lastPhysical = requiredMessage;
      }

      return nextErrors;
    },
    [requiredMessage],
  );

  React.useEffect(() => {
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0 && onFormComplete) {
      const payload = toHealthAssessment(form);
      const serialized = JSON.stringify(payload);
      if (serialized !== serializedPayloadRef.current) {
        serializedPayloadRef.current = serialized;
        onFormComplete(payload);
      }
    } else {
      serializedPayloadRef.current = '';
    }
  }, [form, onFormComplete, validate]);

  const handleBooleanChange = (
    field: keyof HealthAssessmentDraft,
    value: boolean,
  ) => {
    setHasInteracted(true);
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInjuryBooleanChange = (
    field: keyof HealthAssessmentDraft['injuries'],
    value: boolean,
  ) => {
    setHasInteracted(true);
    setForm((prev) => ({
      ...prev,
      injuries: {
        ...prev.injuries,
        [field]: value,
      },
    }));
  };

  const handleOtherInjuryChange = (value: boolean) => {
    setHasInteracted(true);
    setForm((prev) => ({
      ...prev,
      injuries: {
        ...prev.injuries,
        other: {
          ...prev.injuries.other,
          has: value,
          details: value ? prev.injuries.other.details : '',
        },
      },
    }));
  };

  const handleOtherDetailsChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { value: nextValue } = event.target;
    setHasInteracted(true);
    setForm((prev) => ({
      ...prev,
      injuries: {
        ...prev.injuries,
        other: {
          ...prev.injuries.other,
          details: nextValue,
        },
      },
    }));
  };

  const handleExerciseRestrictionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setHasInteracted(true);
    setForm((prev) => ({
      ...prev,
      exerciseRestriction: event.target.value,
    }));
  };

  const renderBooleanQuestion = (
    field: BooleanFieldKey,
    label: string,
  ) => (
    <BooleanQuestion
      key={field}
      label={label}
      value={form[field]}
      onChange={(value) => handleBooleanChange(field, value)}
      error={hasInteracted ? errors[field] : undefined}
      yesLabel={t('common.yes')}
      noLabel={t('common.no')}
    />
  );

  const renderInjuryQuestion = (
    field: InjuryBooleanFieldKey,
    label: string,
  ) => (
    <BooleanQuestion
      key={field}
      label={label}
      value={form.injuries[field]}
      onChange={(value) => handleInjuryBooleanChange(field, value)}
      error={hasInteracted ? errors[`injuries.${field}`] : undefined}
      yesLabel={t('common.yes')}
      noLabel={t('common.no')}
    />
  );

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Typography variant="h6">{t('healthAssessment.sectionTitle')}</Typography>
        {renderBooleanQuestion('heartDisease', t('healthAssessment.heartDisease'))}
        {renderBooleanQuestion(
          'shortnessOfBreath',
          t('healthAssessment.shortnessOfBreath'),
        )}
        {renderBooleanQuestion(
          'highBloodPressure',
          t('healthAssessment.highBloodPressure'),
        )}
        {renderBooleanQuestion('smoking', t('healthAssessment.smoking'))}
        {renderBooleanQuestion('diabetes', t('healthAssessment.diabetes'))}
        {renderBooleanQuestion(
          'familyHistory',
          t('healthAssessment.familyHistory'),
        )}
        {renderBooleanQuestion('workouts', t('healthAssessment.workouts'))}
        {renderBooleanQuestion('medication', t('healthAssessment.medication'))}
        {renderBooleanQuestion('alcohol', t('healthAssessment.alcohol'))}
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <DatePicker
          label={t('healthAssessment.lastPhysical')}
          value={form.lastPhysical ? dayjs(form.lastPhysical) : null}
          onChange={(date) => {
            setHasInteracted(true);
            setForm((prev) => ({
              ...prev,
              lastPhysical: date ? date.format('YYYY-MM-DD') : '',
            }));
          }}
          slotProps={{
            textField: {
              error: hasInteracted && Boolean(errors.lastPhysical),
              helperText: hasInteracted ? errors.lastPhysical : undefined,
              fullWidth: true,
            },
          }}
        />
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="subtitle1">
          {t('healthAssessment.injuries.title')}
        </Typography>
        {renderInjuryQuestion('knees', t('healthAssessment.injuries.knees'))}
        {renderInjuryQuestion(
          'lowerBack',
          t('healthAssessment.injuries.lowerBack'),
        )}
        {renderInjuryQuestion(
          'neckShoulders',
          t('healthAssessment.injuries.neckShoulders'),
        )}
        {renderInjuryQuestion(
          'hipPelvis',
          t('healthAssessment.injuries.hipPelvis'),
        )}
        <BooleanQuestion
          label={t('healthAssessment.injuries.other')}
          value={form.injuries.other.has}
          onChange={handleOtherInjuryChange}
          error={hasInteracted ? errors['injuries.other.has'] : undefined}
          yesLabel={t('common.yes')}
          noLabel={t('common.no')}
        />
        {form.injuries.other.has && (
          <TextField
            label={t('healthAssessment.injuries.other')}
            value={form.injuries.other.details}
            onChange={handleOtherDetailsChange}
            error={hasInteracted && Boolean(errors['injuries.other.details'])}
            helperText={
              hasInteracted ? errors['injuries.other.details'] : undefined
            }
            multiline
            minRows={2}
          />
        )}
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <TextField
          label={t('healthAssessment.exerciseRestriction')}
          value={form.exerciseRestriction}
          onChange={handleExerciseRestrictionChange}
          multiline
          minRows={3}
        />
      </Stack>
    </Stack>
  );
};

type BooleanQuestionProps = {
  label: string;
  value: BooleanDraft;
  onChange: (value: boolean) => void;
  error?: string;
  yesLabel: string;
  noLabel: string;
};

const BooleanQuestion: React.FC<BooleanQuestionProps> = ({
  label,
  value,
  onChange,
  error,
  yesLabel,
  noLabel,
}) => (
  <FormControl component="fieldset" error={Boolean(error)}>
    <FormLabel component="legend">{label}</FormLabel>
    <RadioGroup
      row
      value={value === null ? '' : value ? 'yes' : 'no'}
      onChange={(event) => onChange(event.target.value === 'yes')}
    >
      <FormControlLabel value="yes" control={<Radio />} label={yesLabel} />
      <FormControlLabel value="no" control={<Radio />} label={noLabel} />
    </RadioGroup>
    {error && <FormHelperText>{error}</FormHelperText>}
  </FormControl>
);

export default HealthAssessmentForm;
