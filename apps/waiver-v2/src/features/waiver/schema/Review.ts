import { z } from 'zod'
import type { Translate } from './common'

export const createReviewSchema = (t: Translate) =>
  z.object({
    confirmAccuracy: z.boolean().refine((v) => v === true, {
      message: t('validation.confirm_accuracy'),
    }),
  })


