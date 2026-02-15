import { z } from 'zod'
import { siteConfig } from '../config/site'
import type { LeadPayload, LeadResponse, LeadSubmitStrategy } from '../types/lead'

export const leadSchema = z
  .object({
    name: z.string().min(2, 'Please enter your full name.'),
    email: z.string().email('Please enter a valid email.').optional().or(z.literal('')),
    phone: z
      .string()
      .regex(/^[0-9()+\-\s]{7,20}$/, 'Please enter a valid phone number.')
      .optional()
      .or(z.literal('')),
    goals: z.enum(['first-class', 'fitness-confidence', 'competition', 'weight-management', 'youth-inquiry']),
    preferredTime: z.string().min(2, 'Tell us your preferred training time.'),
    notes: z.string().max(500, 'Please keep notes under 500 characters.').optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: 'Please provide at least an email or phone number.',
    path: ['email'],
  })

export type LeadFormData = z.infer<typeof leadSchema>

export async function submitLead(payload: LeadPayload, strategy: LeadSubmitStrategy): Promise<LeadResponse> {
  if (strategy === 'endpoint') {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // TODO: replace with your real backend endpoint and response handling contract.
    if (!response.ok) {
      return { success: false, message: 'Unable to submit right now. Please call us directly.' }
    }
    return { success: true, message: 'Thanks. We will reach out shortly.' }
  }

  const subject = encodeURIComponent(`Trial Class Inquiry - ${siteConfig.business.name}`)
  const body = encodeURIComponent(
    [
      `Name: ${payload.name}`,
      `Email: ${payload.email ?? ''}`,
      `Phone: ${payload.phone ?? ''}`,
      `Goal: ${payload.goals}`,
      `Preferred Time: ${payload.preferredTime}`,
      '',
      'Notes:',
      payload.notes ?? 'N/A',
    ].join('\n'),
  )

  window.location.href = `mailto:${siteConfig.business.email}?subject=${subject}&body=${body}`
  return { success: true, message: 'Your email app has been opened.' }
}
