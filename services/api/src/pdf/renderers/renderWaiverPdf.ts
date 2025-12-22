import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import * as Mustache from 'mustache'
import type { SupabaseClient } from '@supabase/supabase-js'
import { fetchWaiverById } from '../data/fetchWaiver.js'
import { mapWaiverToPayload } from '../data/mapWaiverToPayload.js'
import type { WaiverPdfPayload } from '../types.js'

const TEMPLATE_URL = new URL('../templates/waiver.html', import.meta.url)
const DEFAULT_DOCUMENT_TITLE = 'Temple Underground — Waiver & Release'
const DEFAULT_LOCALE = 'en'

const FALLBACK_LEGAL_COPY = {
  release: {
    title: 'Release',
    body:
      'In full consideration of the above mentioned risks and hazards and the fact that I am willingly and voluntarily participating in the activities made available by Temple Underground BJJ, I hereby waive, release, remise and discharge Temple Underground BJJ and its agents, officers, principals, employees, and volunteers, of any and all liability, claims, demands, actions or rights of action, or damages of any kind related to, arising from, or in any way connected with my participation in Temple Underground BJJ fitness programs/classes, including those allegedly attributed to the negligent acts or omissions of the above mentioned parties. This agreement shall be binding upon me, my successors, representatives, heirs, executors, assigns, or transferees. If any portion of this agreement is held invalid, the remainder shall remain in full legal force and effect. If signing on behalf of a minor, I give permission for Temple Underground BJJ to administer first aid and to seek medical care as deemed necessary.',
  },
  indemnification: {
    title: 'Indemnification',
    body:
      'I recognize that there is risk involved in the types of activities offered by Temple Underground BJJ. I accept financial responsibility for any injury that I or the participant may cause either to him/herself or to any other participant due to negligence. Should Temple Underground BJJ or anyone acting on their behalf be required to incur attorney’s fees and costs to enforce this agreement, I agree to reimburse them for such fees and costs. I further agree to indemnify and hold harmless Temple Underground BJJ, their principals, agents, employees, and volunteers from liability for the injury or death of any person(s) and damage to property that may result from my negligent or intentional act or omission while participating in activities offered by Temple Underground BJJ.',
  },
  media: {
    title: 'Use of Picture / Film / Likeness',
    body:
      'I agree to allow Temple Underground BJJ, its agents, officers, principals, employees and volunteers to use picture(s), film and/or likeness of me for advertising purposes. If I choose not to allow the use of the same for said purpose, I agree that I must inform Temple Underground BJJ of this in writing.',
  },
  acknowledgement: {
    title: 'Acknowledgement',
    body:
      'I have fully read and fully understand the foregoing assumption of risk and release of liability and I understand that by signing it obligates me to indemnify the parties named for any liability for injury or death of any person and damage to property caused by my negligent or intentional act or omission. I understand that by signing this form I am waiving valuable legal rights.',
  },
} as const satisfies WaiverPdfPayload['legal']

type LegalCopy = WaiverPdfPayload['legal']

type OrganizationInfo = WaiverPdfPayload['organization']

let cachedTemplate: string | null = null

const loadTemplate = async () => {
  if (!cachedTemplate) {
    cachedTemplate = await readFile(TEMPLATE_URL, 'utf8')
  }
  return cachedTemplate
}

const toDataUrl = async (supabase: SupabaseClient, storagePath: string | null): Promise<string | null> => {
  if (!storagePath) return null
  const [bucket, ...pathParts] = storagePath.split('/')
  if (!bucket || !pathParts.length) return null
  const objectPath = pathParts.join('/')
  const { data, error } = await supabase.storage.from(bucket).download(objectPath)
  if (error || !data) {
    console.warn('renderWaiverPdf.signature_download_failed', error)
    return null
  }
  const buffer = Buffer.from(await data.arrayBuffer())
  return `data:image/png;base64,${buffer.toString('base64')}`
}

const resolveLegalCopy = (locale: string, override?: (locale: string) => LegalCopy | null): LegalCopy => {
  const fromOverride = override?.(locale)
  if (fromOverride) return fromOverride
  return FALLBACK_LEGAL_COPY
}

const resolveOrganization = (overrides?: Partial<OrganizationInfo>): OrganizationInfo => ({
  name: process.env.PDF_ORG_NAME || 'Temple Underground BJJ',
  tagline: process.env.PDF_ORG_TAGLINE || 'Brazilian Jiu-Jitsu & Fitness',
  address: process.env.PDF_ORG_ADDRESS || 'Morristown, Tennessee',
  ...overrides,
})

export interface RenderWaiverPdfOptions {
  supabase: SupabaseClient
  waiverId: string
  documentTitle?: string
  organizationOverrides?: Partial<OrganizationInfo>
  legalCopyProvider?: (locale: string) => LegalCopy | null
}

/**
 * Fetches waiver data, maps it into the template payload, hydrates the HTML template,
 * and returns the rendered HTML and PDF buffer.
 */
export interface RenderWaiverPdfResult {
  payload: WaiverPdfPayload
  html: string
}

export const renderWaiverPdf = async ({
  supabase,
  waiverId,
  documentTitle = DEFAULT_DOCUMENT_TITLE,
  organizationOverrides,
  legalCopyProvider,
}: RenderWaiverPdfOptions): Promise<RenderWaiverPdfResult> => {
  const joined = await fetchWaiverById(supabase, waiverId)
  const locale = joined.audit?.locale || DEFAULT_LOCALE
  const template = await loadTemplate()
  const mustacheModule = Mustache as unknown as {
    render?: (template: string, view: unknown) => string
    default?: { render?: (template: string, view: unknown) => string }
  }
  const renderFn = mustacheModule.render ?? mustacheModule.default?.render
  if (typeof renderFn !== 'function') {
    throw new TypeError('mustache_renderer_unavailable')
  }
  const signatureDataUrl = await toDataUrl(supabase, joined.waiver.signature_image_url || null)

  const payload = mapWaiverToPayload(joined, {
    legalCopy: resolveLegalCopy(locale, legalCopyProvider),
    organization: resolveOrganization(organizationOverrides),
    document: {
      title: documentTitle,
      version: joined.audit?.content_version || 'waiver.v1',
      locale,
    },
  })

  payload.signature.imageDataUrl = signatureDataUrl

  const html = renderFn(template, payload)

  return { payload, html }
}

