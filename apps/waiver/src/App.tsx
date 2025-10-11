import React from 'react';
import { Box, Button, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography, CssBaseline } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { enUS, esES } from '@mui/material/locale';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { I18nProvider, useI18n } from './i18n';
const SignaturePad = React.lazy(() => import('./components/SignaturePad'));

type FormValues = {
  full_name: string;
  date_of_birth: string; // ISO yyyy-mm-dd
  email: string;
  phone: string;
  signature: { pngDataUrl: string; vectorJson: any };
};

const Inner: React.FC = () => {
  const { t, locale, setLocale } = useI18n();
  const apiBase = import.meta.env.VITE_API_URL ? String(import.meta.env.VITE_API_URL) : '';

  const [apiStatus, setApiStatus] = React.useState<'unknown' | 'ok' | 'fail'>('unknown');
  const [dbStatus, setDbStatus] = React.useState<'unknown' | 'ok' | 'fail'>('unknown');
  React.useEffect(() => {
    const ping = async () => {
      try {
        const r = await fetch(apiBase ? `${apiBase}/health` : '/health');
        setApiStatus(r.ok ? 'ok' : 'fail');
      } catch { setApiStatus('fail'); }
      try {
        const r = await fetch(apiBase ? `${apiBase}/health/deep` : '/health/deep');
        setDbStatus(r.ok ? 'ok' : 'fail');
      } catch { setDbStatus('fail'); }
    };
    ping();
  }, [apiBase]);
  const schema = React.useMemo(
    () =>
      yup.object({
        full_name: yup.string().required(t('validation.required')),
        date_of_birth: yup.string().required(t('validation.required')),
        email: yup.string().email(t('validation.email')).required(t('validation.required')),
        phone: yup.string().required(t('validation.required')),
        signature: yup
          .object({ pngDataUrl: yup.string(), vectorJson: yup.mixed() })
          .test('signed', t('validation.required'), (v) => !!v && !!v.pngDataUrl),
      }),
    [t]
  );

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: { signature: { pngDataUrl: '', vectorJson: [] } as any } });

  const signature = useWatch({ name: 'signature' as const, control });
  const isSigned = !!(signature && (signature as any).pngDataUrl);

  const [success, setSuccess] = React.useState<{ waiverId: string; participantId: string } | null>(null);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      participant: {
        full_name: data.full_name,
        date_of_birth: data.date_of_birth,
        email: data.email,
        phone: data.phone,
      },
      signature: data.signature,
      locale,
      content_version: 'waiver.v1',
    };
    try {
      const res = await fetch(apiBase ? `${apiBase}/api/waivers/submit` : '/api/waivers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.ok) setSuccess({ waiverId: json.waiverId, participantId: json.participantId });
      else alert('Submit failed');
    } catch (e) {
      console.error(e);
      alert('Submit failed');
    }
  };

  const onError = () => {
    const firstError = Object.keys(errors)[0] as keyof FormValues | undefined;
    if (firstError) setFocus(firstError as any);
  };

  // Theme per locale
  const theme = React.useMemo(() => createTheme({}, locale === 'es' ? esES : enUS), [locale]);
  React.useEffect(() => {
    dayjs.locale(locale === 'es' ? 'es' : 'en');
  }, [locale]);

  if (success) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5">{t('app.title')}</Typography>
            <Typography variant="body1">Submission successful.</Typography>
            <Typography variant="body2">Waiver ID: {success.waiverId}</Typography>
            <Typography variant="body2">Participant ID: {success.participantId}</Typography>
          </Stack>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5">{t('app.title')}</Typography>
        <FormControl size="small" sx={{ width: 140 }}>
          <InputLabel id="lang">Language</InputLabel>
          <Select labelId="lang" label="Language" value={locale} onChange={(e) => setLocale(e.target.value as any)}>
            <MenuItem value="en">{t('lang.en')}</MenuItem>
            <MenuItem value="es">{t('lang.es')}</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="caption">API: {apiStatus}</Typography>
        <Typography variant="caption">DB: {dbStatus}</Typography>
      </Stack>

      <Box component="form" onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Stack spacing={2}>
          {Object.keys(errors).length > 0 && (
            <Typography role="alert" color="error">
              Please fix the highlighted errors before submitting.
            </Typography>
          )}
          <TextField label={t('form.full_name')} {...register('full_name')} error={!!errors.full_name} helperText={errors.full_name?.message} fullWidth />
          <DatePicker
            label={t('form.dob')}
            onChange={(val) => setValue('date_of_birth', val ? (val as any).format('YYYY-MM-DD') : '', { shouldValidate: true })}
            slotProps={{ textField: { error: !!errors.date_of_birth, helperText: errors.date_of_birth?.message } }}
          />
          <TextField type="email" label={t('form.email')} {...register('email')} error={!!errors.email} helperText={errors.email?.message} fullWidth />
          <TextField type="tel" label={t('form.phone')} {...register('phone')} error={!!errors.phone} helperText={(errors as any).phone?.message} fullWidth />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('form.signature')}
            </Typography>
            <React.Suspense fallback={<div>Loading signature...</div>}>
              <SignaturePad onChange={(v) => setValue('signature', v as any, { shouldValidate: true })} />
            </React.Suspense>
            {errors.signature && (
              <FormHelperText error>{(errors.signature as any)?.message}</FormHelperText>
            )}
          </Box>

          <Button type="submit" variant="contained" disabled={isSubmitting || !isSigned}>
            {t('form.submit')}
          </Button>
        </Stack>
      </Box>
    </Container>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <Inner />
  </I18nProvider>
);

export default App;
