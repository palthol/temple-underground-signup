import { z } from 'zod'
import type { Translate } from './common'

export const createClausesSchema = (t: Translate) =>
  z.object({
    riskInitials: z.string().trim().length(2, t('validation.initials_length')),
    releaseInitials: z.string().trim().length(2, t('validation.initials_length')),
    indemnificationInitials: z.string().trim().length(2, t('validation.initials_length')),
    mediaInitials: z.string().trim().length(2, t('validation.initials_length')),
    acceptedTerms: z.boolean().refine((v) => v === true, { message: t('validation.accept_terms') }),
  })


