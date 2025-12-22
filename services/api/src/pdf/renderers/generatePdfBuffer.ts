import { chromium, type Page } from 'playwright-core'

export interface GeneratePdfBufferOptions {
  html: string
  headerTemplate?: string
  footerTemplate?: string
  preferCssPageSize?: boolean
}

const DEFAULT_PDF_OPTIONS = {
  format: 'Letter',
  printBackground: true,
  margin: {
    top: '0.6in',
    bottom: '0.6in',
    left: '0.6in',
    right: '0.6in',
  },
} as const

const applyPageContent = async (page: Page, html: string) => {
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
}

export const generatePdfBuffer = async ({
  html,
  headerTemplate,
  footerTemplate,
  preferCssPageSize = false,
}: GeneratePdfBufferOptions): Promise<Buffer> => {
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await applyPageContent(page, html)
    const pdfBuffer = await page.pdf({
      ...DEFAULT_PDF_OPTIONS,
      headerTemplate,
      footerTemplate,
      displayHeaderFooter: Boolean(headerTemplate || footerTemplate),
      preferCSSPageSize: preferCssPageSize,
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}

