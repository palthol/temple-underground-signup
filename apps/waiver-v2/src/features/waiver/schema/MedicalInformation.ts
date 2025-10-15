import { z } from 'zod'
import type { Translate } from './common'
import { yesNoSchema } from './common'

export const createMedicalInformationSchema = (t: Translate) =>
  z
    .object({
      heartDisease: z.boolean(),
      shortnessOfBreath: z.boolean(),
      highBloodPressure: z.boolean(),
      smoking: z.boolean(),
      diabetes: z.boolean(),
      familyHistory: z.boolean(),
      workouts: z.boolean(),
      medication: z.boolean(),
      alcohol: z.boolean(),
      lastPhysical: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined)
        .default(''),
      exerciseRestriction: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined)
        .default(''),
      injuries: z
        .object({
          knees: z.boolean(),
          lowerBack: z.boolean(),
          neckShoulders: z.boolean(),
          hipPelvis: z.boolean(),
          other: z
            .object({
              has: z.boolean(),
              details: z
                .string()
                .trim()
                .optional()
                .transform((value) => value || undefined)
                .default(''),
            })
            .superRefine((val, ctx) => {
              if (val.has && !val.details?.trim()) {
                ctx.addIssue({
                  code: 'custom',
                  path: ['details'],
                  message: t('validation.required'),
                })
              }
            }),
        })
        .strict(),
      hadRecentInjury: yesNoSchema,
      injuryDetails: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined)
        .default(''),
      physicianCleared: z
        .string()
        .trim()
        .transform((value) => (value.length ? value : undefined))
        .optional()
        .pipe(yesNoSchema.optional()),
      clearanceNotes: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || undefined)
        .default(''),
    })
    .superRefine((value, ctx) => {
      if (value.hadRecentInjury === 'yes' && !value.injuryDetails?.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['injuryDetails'],
          message: t('validation.required'),
        })
      }
    })



