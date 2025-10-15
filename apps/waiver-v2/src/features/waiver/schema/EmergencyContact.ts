import { z } from 'zod'
import type { Translate } from './common'

export const createEmergencyContactSchema = (t: Translate) =>
  z.object({
    name: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .default(''),
    relationship: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .default(''),
    phone: z
      .string()
      .trim()
      .optional()
      .transform((value) => value || undefined)
      .default(''),
    email: z
      .string()
      .trim()
      .optional()
      .default('')
      .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
        message: t('validation.email'),
      }),
  })


