import React from 'react';
import { Box, FormHelperText, Stack, Typography } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import type { WaiverFormData } from '../../types/Waiver';
import { useI18n } from '../../i18n';

const LazySignaturePad = React.lazy(() => import('../SignaturePad'));

type Props = {
  onSignatureStateChange?: (signed: boolean) => void;
};

const SignatureStep: React.FC<Props> = ({ onSignatureStateChange }) => {
  const { t } = useI18n();
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<WaiverFormData>();

  const signature = watch('signature');
  const handleSignatureChange = React.useCallback(
    (value: WaiverFormData['signature']) => {
      setValue('signature', value, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('signature.pngDataUrl', value.pngDataUrl, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue('signature.vectorJson', value.vectorJson, {
        shouldValidate: true,
        shouldDirty: true,
      });
      onSignatureStateChange?.(Boolean(value?.pngDataUrl));
    },
    [onSignatureStateChange, setValue],
  );

  const signatureError = errors.signature?.message as string | undefined;

  return (
    <Stack spacing={2}>
      <Typography variant="body1">
        {t('form.signature.instructions')}
      </Typography>
      <React.Suspense fallback={<Box sx={{ height: 220 }} />}>
        <LazySignaturePad
          value={signature}
          onChange={handleSignatureChange}
          disabled={false}
        />
      </React.Suspense>
      {signatureError && (
        <FormHelperText error>{signatureError}</FormHelperText>
      )}
    </Stack>
  );
};

export default SignatureStep;
