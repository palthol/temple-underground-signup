import { z } from 'zod'
import type { Translate } from './common'
import { yesNoSchema } from './common'

export const createInjuryDisclosureSchema = (t: Translate) =>
  z.object({
    hadRecentInjury: yesNoSchema,
    injuryDetails: z.string().trim().optional().default(''),
    physicianCleared: yesNoSchema.optional(),
    clearanceNotes: z.string().trim().optional().default(''),
  }).superRefine((value, ctx) => {
    if (value.hadRecentInjury === 'yes' && !value.injuryDetails?.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['injuryDetails'],
        message: t('validation.required'),
      })
    }
  })


