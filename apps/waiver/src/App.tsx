import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Alert, Stack, Button, Typography } from '@mui/material';
import { enUS, esES } from '@mui/material/locale';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { FormProvider, type FieldErrors } from 'react-hook-form';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { I18nProvider, useI18n, type Locale } from './i18n';
import PersonalInfoForm from './components/forms/PersonalInfoForm';
import EmergencyContactForm from './components/forms/EmergencyContactForm';
import HealthAssessmentForm from './components/forms/HealthAssessmentForm';
import InjuryDisclosureForm from './components/forms/InjuryDisclosureForm';
import InitialClausesForm from './components/forms/InitialClausesForm';
import SignatureStep from './components/forms/SignatureStep';
import WaiverViewer from './components/forms/WaiverViewer';
import WaiverWizardLayout from './components/Wizard/WaiverWizardLayout';
import StepNavigation from './components/Wizard/StepNavigation';
import { useWaiverForm } from './hooks/useWaiverForm';
import { useWaiverSteps } from './hooks/useWaiverSteps';
import { useHealthStatus } from './hooks/useHealthStatus';
import { mapFormToSubmissionPayload } from './lib/mapFormToSubmissionPayload';
import type {
  WaiverFormData,
  WaiverStepDefinition,
  WaiverStepId,
  WaiverSubmitResult,
  HealthAssessment,
} from './types/Waiver';


type StepComponents = Record<WaiverStepId, React.ComponentType>;

const stepComponents: StepComponents = {
  personalInfo: PersonalInfoForm,
  emergencyContact: EmergencyContactForm,
  healthAssessment: HealthAssessmentForm,
  injuryDisclosure: InjuryDisclosureForm,
  initialClauses: InitialClausesForm,
  signature: SignatureStep,
  review: WaiverViewer,
};

const contentVersion = 'waiver.v1';

const useThemeForLocale = (locale: Locale) =>
  React.useMemo(
    () => createTheme({}, locale === 'es' ? esES : enUS),
    [locale],
  );

const WaiverFlow: React.FC = () => {
  const { t, locale, setLocale } = useI18n();
  const apiBase =
    import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '';

  const { methods, stepFields } = useWaiverForm(t);
  const { apiStatus, dbStatus } = useHealthStatus(apiBase);
  const theme = useThemeForLocale(locale);

  const stepDefinitions = React.useMemo<WaiverStepDefinition[]>(
    () => [
      { id: 'personalInfo', fieldPaths: stepFields.personalInfo },
      { id: 'emergencyContact', fieldPaths: stepFields.emergencyContact },
      { id: 'healthAssessment', fieldPaths: stepFields.healthAssessment },
      { id: 'injuryDisclosure', fieldPaths: stepFields.injuryDisclosure },
      { id: 'initialClauses', fieldPaths: stepFields.initialClauses },
      { id: 'signature', fieldPaths: stepFields.signature },
      { id: 'review', fieldPaths: stepFields.review },
    ],
    [stepFields],
  );

  const {
    step,
    index,
    total,
    isFirst,
    isLast,
    goNext,
    goBack,
    reset: resetSteps,
  } = useWaiverSteps(stepDefinitions);

  const [success, setSuccess] = React.useState<WaiverSubmitResult | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [isSignatureComplete, setSignatureComplete] = React.useState<boolean>(
    Boolean(methods.getValues('signature.pngDataUrl')),
  );

  const CurrentStepComponent = stepComponents[step.id];
  const {
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { isSubmitting },
    setFocus,
    setValue,
  } = methods;

  const signatureValue = watch('signature.pngDataUrl');
  const confirmAccuracy = watch('review.confirmAccuracy');
  const healthAssessmentValue = watch('healthAssessment');

  const isHealthAssessmentComplete = React.useMemo(() => {
    if (!healthAssessmentValue) return false;
    const booleanFields: (keyof HealthAssessment)[] = [
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
    const booleansValid = booleanFields.every(
      (field) => typeof healthAssessmentValue[field] === 'boolean',
    );
    const injuriesValid =
      typeof healthAssessmentValue.injuries?.knees === 'boolean' &&
      typeof healthAssessmentValue.injuries?.lowerBack === 'boolean' &&
      typeof healthAssessmentValue.injuries?.neckShoulders === 'boolean' &&
      typeof healthAssessmentValue.injuries?.hipPelvis === 'boolean' &&
      typeof healthAssessmentValue.injuries?.other?.has === 'boolean' &&
      (!healthAssessmentValue.injuries?.other?.has ||
        Boolean(
          healthAssessmentValue.injuries?.other?.details?.trim().length,
        ));
    const dateValid = Boolean(healthAssessmentValue.lastPhysical?.trim().length);
    return booleansValid && injuriesValid && dateValid;
  }, [healthAssessmentValue]);

  const disableNext =
    (step.id === 'healthAssessment' && !isHealthAssessmentComplete) ||
    (step.id === 'signature' && !isSignatureComplete) ||
    (step.id === 'review' && !confirmAccuracy);

  React.useEffect(() => {
    setSignatureComplete(Boolean(signatureValue));
  }, [signatureValue]);

  const handleHealthComplete = React.useCallback(
    (data: HealthAssessment) => {
      setValue('healthAssessment', data, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const stepTitles = React.useMemo<Record<WaiverStepId, string>>(
    () => ({
      personalInfo: t('steps.personal_info.title'),
      emergencyContact: t('steps.emergency_contact.title'),
      healthAssessment: t('steps.health_assessment.title'),
      injuryDisclosure: t('steps.injury_disclosure.title'),
      initialClauses: t('steps.initial_clauses.title'),
      signature: t('steps.signature.title'),
      review: t('steps.review.title'),
    }),
    [t],
  );

  const languageOptions = React.useMemo(
    () => [
      { value: 'en' as Locale, label: t('lang.en') },
      { value: 'es' as Locale, label: t('lang.es') },
    ],
    [t],
  );

  const stepIndicator = React.useMemo(
    () => `${t('wizard.step')} ${index + 1} ${t('wizard.of')} ${total}`,
    [index, t, total],
  );

  const focusFirstError = React.useCallback(
    (errors: FieldErrors<WaiverFormData>) => {
      const findPath = (
        errorTree: FieldErrors<WaiverFormData>,
        prefix = '',
      ): string | null => {
        for (const key of Object.keys(errorTree)) {
          const value = errorTree[key as keyof typeof errorTree];
          const path = prefix ? `${prefix}.${key}` : key;
          if (!value) continue;
          if ('type' in value) {
            return path;
          }
          const nested = findPath(
            value as FieldErrors<WaiverFormData>,
            path,
          );
          if (nested) return nested;
        }
        return null;
      };

      const firstPath = findPath(errors);
      if (firstPath) {
        setFocus(firstPath as any, { shouldSelect: true });
      }
    },
    [setFocus],
  );

  const submitWaiver = React.useCallback(
    async (formData: WaiverFormData) => {
      setSubmitError(null);
      const payload = mapFormToSubmissionPayload(formData, locale, contentVersion);
      try {
        const response = await fetch(
          apiBase ? `${apiBase}/api/waivers/submit` : '/api/waivers/submit',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        const json = await response.json();
        if (json?.ok) {
          setSuccess({
            waiverId: json.waiverId,
            participantId: json.participantId,
          });
          reset();
          resetSteps();
        } else {
          setSubmitError(t('form.submit_failed'));
        }
      } catch {
        setSubmitError(t('form.submit_failed'));
      }
    },
    [apiBase, locale, reset, resetSteps, t],
  );

  const handleNext = React.useCallback(async () => {
    const valid = await trigger(step.fieldPaths, { shouldFocus: true });
    if (!valid) return;
    if (isLast) {
      await handleSubmit(submitWaiver, focusFirstError)();
    } else {
      setSubmitError(null);
      goNext();
    }
  }, [
    focusFirstError,
    goNext,
    handleSubmit,
    isLast,
    step.fieldPaths,
    submitWaiver,
    trigger,
  ]);

  const handleBack = React.useCallback(() => {
    setSubmitError(null);
    goBack();
  }, [goBack]);

  React.useEffect(() => {
    dayjs.locale(locale === 'es' ? 'es' : 'en');
  }, [locale]);

  if (success) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Stack spacing={2} sx={{ maxWidth: 480, mx: 'auto', py: 8 }}>
            <Typography variant="h5">{t('app.title')}</Typography>
            <Alert severity="success">{t('form.submit_success')}</Alert>
            <Typography variant="body2">
              {t('form.success.waiver_id')}: {success.waiverId}
            </Typography>
            <Typography variant="body2">
              {t('form.success.participant_id')}: {success.participantId}
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                reset();
                resetSteps();
                setSubmitError(null);
                setSuccess(null);
              }}
            >
              {t('form.success.start_new')}
            </Button>
          </Stack>
        </LocalizationProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <FormProvider {...methods}>
          <WaiverWizardLayout
            locale={locale}
            onLocaleChange={setLocale}
            title={t('app.title')}
            stepTitle={stepTitles[step.id]}
            stepIndicator={stepIndicator}
            statuses={{ apiStatus, dbStatus }}
            statusLabels={{
              api: t('status.api'),
              db: t('status.db'),
            }}
            languageLabel={t('wizard.language')}
            languageOptions={languageOptions}
          >
            {step.id === 'healthAssessment' ? (
              <HealthAssessmentForm
                value={healthAssessmentValue ?? undefined}
                onFormComplete={handleHealthComplete}
              />
            ) : step.id === 'signature' ? (
              <SignatureStep
                onSignatureStateChange={setSignatureComplete}
              />
            ) : (
              <CurrentStepComponent />
            )}
            {submitError && <Alert severity="error">{submitError}</Alert>}
            <StepNavigation
              isFirstStep={isFirst}
              isLastStep={isLast}
              onBack={handleBack}
              onNext={handleNext}
              disabledNext={disableNext}
              isSubmitting={isSubmitting}
              labels={{
                back: t('nav.back'),
                next: t('nav.next'),
                submit: t('nav.submit'),
              }}
            />
          </WaiverWizardLayout>
        </FormProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <WaiverFlow />
  </I18nProvider>
);

export default App;
