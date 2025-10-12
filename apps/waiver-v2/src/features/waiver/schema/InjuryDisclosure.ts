import { z } from 'zod'
import type { Translate } from './common'
import { yesNoSchema } from './common'

export const createInjuryDisclosureSchema = (_t: Translate) =>
  z.object({
    hadRecentInjury: yesNoSchema,
    injuryDetails: z.string().trim().optional().default(''),
    physicianCleared: yesNoSchema,
    clearanceNotes: z.string().trim().optional().default(''),
  })


