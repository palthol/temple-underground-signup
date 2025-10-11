import React from 'react';
import { Box, Button, Container, FormControl, FormHelperText, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { I18nProvider, useI18n } from './i18n';
import SignaturePad from './components/SignaturePad';

type FormValues = {
  full_name: string;
  date_of_birth: string; // ISO yyyy-mm-dd
  email: string;
  phone: string;
  signature: { pngDataUrl: string; vectorJson: any };
};

const Inner: React.FC = () => {
  const { t, locale, setLocale } = useI18n();

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
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: yupResolver(schema), defaultValues: { signature: { pngDataUrl: '', vectorJson: [] } as any } });

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
      const res = await fetch(import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/waivers/submit` : '/api/waivers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      alert(`Success: ${JSON.stringify(json)}`);
    } catch (e) {
      console.error(e);
      alert('Submit failed');
    }
  };

  return (
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

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField label={t('form.full_name')} {...register('full_name')} error={!!errors.full_name} helperText={errors.full_name?.message} fullWidth />
          <TextField type="date" label={t('form.dob')} InputLabelProps={{ shrink: true }} {...register('date_of_birth')} error={!!errors.date_of_birth} helperText={errors.date_of_birth?.message} fullWidth />
          <TextField type="email" label={t('form.email')} {...register('email')} error={!!errors.email} helperText={errors.email?.message} fullWidth />
          <TextField type="tel" label={t('form.phone')} {...register('phone')} error={!!errors.phone} helperText={(errors as any).phone?.message} fullWidth />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {t('form.signature')}
            </Typography>
            <SignaturePad onChange={(v) => setValue('signature', v as any, { shouldValidate: true })} />
            {errors.signature && (
              <FormHelperText error>{(errors.signature as any)?.message}</FormHelperText>
            )}
          </Box>

          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {t('form.submit')}
          </Button>
        </Stack>
      </Box>
    </Container>
  );
};

const App: React.FC = () => (
  <I18nProvider>
    <Inner />
  </I18nProvider>
);

export default App;
