import React from 'react';
import SignaturePadLib from 'signature_pad';
import { Box, Button, Typography } from '@mui/material';
import { useI18n } from '../i18n';

type Props = {
  width?: number;
  height?: number;
  onChange?: (data: { pngDataUrl: string; vectorJson: any }) => void;
};

const SignaturePad: React.FC<Props> = ({ width = 600, height = 200, onChange }) => {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const padRef = React.useRef<SignaturePadLib | null>(null);
  const { t } = useI18n();

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    // scale for device pixel ratio
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(ratio, ratio);
    const pad = new SignaturePadLib(canvas, { backgroundColor: 'rgba(255,255,255,1)' });
    padRef.current = pad;

    const update = () => {
      if (!pad.isEmpty()) {
        const pngDataUrl = canvas.toDataURL('image/png');
        const vectorJson = pad.toData();
        onChange?.({ pngDataUrl, vectorJson });
      } else {
        onChange?.({ pngDataUrl: '', vectorJson: [] });
      }
    };
    // Use library callback instead of addEventListener
    const prevOnEnd = pad.onEnd;
    pad.onEnd = () => {
      update();
      if (typeof prevOnEnd === 'function') prevOnEnd();
    };
    return () => {
      try { (pad as any).off?.(); } catch {}
      try { (pad as any).onEnd = undefined; } catch {}
      padRef.current = null;
    };
  }, [width, height, onChange]);

  const clear = () => {
    padRef.current?.clear();
    onChange?.({ pngDataUrl: '', vectorJson: [] });
  };

  return (
    <Box>
      <Box sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
        <canvas ref={canvasRef} />
      </Box>
      <Button onClick={clear} sx={{ mt: 1 }} variant="outlined" size="small">
        {t('form.clear_signature')}
      </Button>
    </Box>
  );
};

export default SignaturePad;
