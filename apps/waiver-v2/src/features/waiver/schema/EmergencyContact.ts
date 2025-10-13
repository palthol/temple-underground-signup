import { z } from 'zod'
import type { Translate } from './common'

export const createEmergencyContactSchema = (t: Translate) =>
  z.object({
    name: z.string().trim().optional().default(''),
    relationship: z.string().trim().optional().default(''),
    phone: z.string().trim().optional().default(''),
    email: z.string().trim().email(t('validation.email')).optional().default(''),
  })


