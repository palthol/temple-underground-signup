import { z } from 'zod'
import type { Translate } from './common'

export const createEmergencyContactSchema = (t: Translate) =>
  z.object({
    name: z.string().trim().min(1, t('validation.required')),
    relationship: z.string().trim().min(1, t('validation.required')),
    phone: z.string().trim().min(1, t('validation.required')),
    email: z.string().trim().email(t('validation.email')).optional().default(''),
  })


