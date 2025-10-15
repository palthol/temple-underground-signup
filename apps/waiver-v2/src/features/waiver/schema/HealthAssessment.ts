import { z } from 'zod'
import type { Translate } from './common'

export const createHealthAssessmentSchema = (t: Translate) =>
  z.object({
    heartDisease: z.boolean(),
    shortnessOfBreath: z.boolean(),
    highBloodPressure: z.boolean(),
    smoking: z.boolean(),
    diabetes: z.boolean(),
    familyHistory: z.boolean(),
    workouts: z.boolean(),
    medication: z.boolean(),
    alcohol: z.boolean(),
    lastPhysical: z.string().trim().optional().default(''),
    injuries: z
      .object({
        knees: z.boolean(),
        lowerBack: z.boolean(),
        neckShoulders: z.boolean(),
        hipPelvis: z.boolean(),
        other: z
          .object({
            has: z.boolean(),
            details: z.string().trim().optional().default(''),
          })
          .superRefine((val, ctx) => {
            if (val.has && !val.details?.trim()) {
              ctx.addIssue({ code: 'custom', path: ['details'], message: t('validation.required') })
            }
          }),
      })
      .strict(),
    exerciseRestriction: z.string().trim().optional(),
  })


