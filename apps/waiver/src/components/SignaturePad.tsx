import React from 'react';
import SignaturePadLib, { type PointGroup } from 'signature_pad';
import { Box, Button, Stack } from '@mui/material';
import { useI18n } from '../i18n';
import type { SignatureValue } from '../types/Waiver';

type Props = {
  width?: number;
  height?: number;
  value?: SignatureValue;
  disabled?: boolean;
  onChange?: (data: SignatureValue) => void;
};

const SignaturePad: React.FC<Props> = ({
  width = 600,
  height = 200,
  value,
  disabled,
  onChange,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const padRef = React.useRef<SignaturePadLib | null>(null);
  const { t } = useI18n();
  const [hasPadContent, setHasPadContent] = React.useState<boolean>(
    Boolean(value?.pngDataUrl),
  );

  const readSignature = React.useCallback((): SignatureValue | null => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad || pad.isEmpty()) {
      return null;
    }

    return {
      pngDataUrl: canvas.toDataURL('image/png'),
      vectorJson: pad.toData(),
    };
  }, []);

  const syncPadState = React.useCallback(() => {
    const data = readSignature();
    setHasPadContent(Boolean(data?.pngDataUrl));
  }, [readSignature]);

  const resizeCanvas = React.useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad) return;

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(ratio, ratio);

    if (value?.vectorJson && Array.isArray(value.vectorJson)) {
      try {
        pad.clear();
        pad.fromData(value.vectorJson as PointGroup[]);
      } catch {
        pad.clear();
      }
    } else {
      pad.clear();
    }
  }, [height, width, value]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const pad = new SignaturePadLib(canvas, {
      backgroundColor: 'rgba(255, 255, 255, 1)',
    });
    padRef.current = pad;

    (pad as any).onEnd = syncPadState;
    resizeCanvas();

    const handleResize = () => {
      resizeCanvas();
      syncPadState();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (typeof pad.off === 'function') {
        pad.off();
      }
      padRef.current = null;
    };
  }, [resizeCanvas, syncPadState]);

  React.useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    if (disabled) {
      if (typeof pad.off === 'function') {
        pad.off();
      }
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = 'none';
      }
    } else {
      if (typeof pad.on === 'function') {
        pad.on();
      }
      if (canvasRef.current) {
        canvasRef.current.style.pointerEvents = 'auto';
      }
    }
  }, [disabled]);

  React.useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    if (!value?.vectorJson || !(value.vectorJson as any[]).length) {
      pad.clear();
      setHasPadContent(false);
      return;
    }
    try {
      pad.clear();
      pad.fromData(value.vectorJson as PointGroup[]);
      setHasPadContent(Boolean(value.pngDataUrl));
    } catch {
      pad.clear();
      setHasPadContent(false);
    }
  }, [value]);

  const clear = React.useCallback(() => {
    const pad = padRef.current;
    if (!pad) return;
    pad.clear();
    onChange?.({ pngDataUrl: '', vectorJson: [] });
    setHasPadContent(false);
  }, [onChange]);

  const handleSubmit = React.useCallback(() => {
    const signatureValue = readSignature();
    if (!signatureValue) {
      setHasPadContent(false);
      return;
    }
    onChange?.(signatureValue);
  }, [onChange, readSignature]);

  const canSubmit = !disabled && hasPadContent;

  return (
    <Box>
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <canvas ref={canvasRef} />
      </Box>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          onClick={clear}
          variant="outlined"
          size="small"
          disabled={disabled}
        >
          {t('form.clear_signature')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          size="small"
          disabled={!canSubmit}
        >
          {t('form.submit_signature')}
        </Button>
      </Stack>
    </Box>
  );
};

export default SignaturePad;
