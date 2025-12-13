import { z } from 'zod'

export type Translate = (key: string) => string

export const yesNoSchema = z.enum(['yes', 'no'])


