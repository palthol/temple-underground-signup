import { z } from 'zod'
import type { Translate } from './common'

export const createSignatureSchema = (t: Translate) =>
  z
    .object({
      pngDataUrl: z.string().trim(),
      vectorJson: z.unknown(),
    })
    .refine((val) => Boolean(val?.pngDataUrl), {
      path: ['pngDataUrl'],
      message: t('validation.signature_required'),
    })


