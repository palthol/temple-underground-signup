import { z } from 'zod'
import type { Translate } from './common'

export const createPersonalInfoSchema = (t: Translate) =>
  z.object({
    fullName: z.string().trim().min(1, t('validation.required')),
    dateOfBirth: z.string().trim().min(1, t('validation.required')),
    addressLine1: z.string().trim().min(1, t('validation.required')),
    addressLine2: z.string().trim().optional().default(''),
    city: z.string().trim().min(1, t('validation.required')),
    state: z.string().trim().min(1, t('validation.required')),
    postalCode: z.string().trim().min(1, t('validation.required')),
    email: z.string().email(t('validation.email')),
    phone: z.string().trim().min(1, t('validation.required')),
  })


