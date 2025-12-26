import { Buffer } from 'node:buffer'
import { readFile } from 'node:fs/promises'
import * as Mustache from 'mustache'
import { fetchWaiverById } from '../data/fetchWaiver.js'
import { mapWaiverToPayload } from '../data/mapWaiverToPayload.js'
import { getLegalCopy } from '../legal/legalCopy.js'

const TEMPLATE_URL = new URL('../templates/waiver.html', import.meta.url)
const DEFAULT_DOCUMENT_TITLE = 'Temple Underground — Waiver & Release'
const DEFAULT_LOCALE = 'en'

const FALLBACK_LEGAL_COPY = getLegalCopy('en')

const loadTemplate = async () => {
  if (!loadTemplate.cache) {
    loadTemplate.cache = await readFile(TEMPLATE_URL, 'utf8')
  }
  return loadTemplate.cache
}

const toDataUrl = async (supabase, storagePath) => {
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

const resolveLegalCopy = (locale, override) => {
  const fromOverride = override?.(locale)
  if (fromOverride) return fromOverride
  return getLegalCopy(locale) ?? FALLBACK_LEGAL_COPY
}

const resolveOrganization = (overrides = {}) => ({
  name: process.env.PDF_ORG_NAME || 'Temple Underground BJJ',
  tagline: process.env.PDF_ORG_TAGLINE || 'Brazilian Jiu-Jitsu & Fitness',
  address: process.env.PDF_ORG_ADDRESS || 'Morristown, Tennessee',
  ...overrides,
})

export const renderWaiverPdf = async ({
  supabase,
  waiverId,
  documentTitle = DEFAULT_DOCUMENT_TITLE,
  organizationOverrides,
  legalCopyProvider,
}) => {
  const joined = await fetchWaiverById(supabase, waiverId)
  const locale = joined.audit?.locale || DEFAULT_LOCALE
  const template = await loadTemplate()
  const mustacheModule = Mustache
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


