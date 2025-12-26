import { Buffer } from 'node:buffer'
import { chromium } from 'playwright-core'

const DEFAULT_PDF_OPTIONS = {
  format: 'Letter',
  printBackground: true,
  margin: {
    top: '0.6in',
    bottom: '0.6in',
    left: '0.6in',
    right: '0.6in',
  },
}

const applyPageContent = async (page, html) => {
  await page.setContent(html, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
}

export const generatePdfBuffer = async ({
  html,
  headerTemplate,
  footerTemplate,
  preferCssPageSize = false,
}) => {
  const browser = await chromium.launch()

  try {
    const page = await browser.newPage()
    await applyPageContent(page, html)

    const pdf = await page.pdf({
      ...DEFAULT_PDF_OPTIONS,
      headerTemplate,
      footerTemplate,
      displayHeaderFooter: Boolean(headerTemplate || footerTemplate),
      preferCSSPageSize: preferCssPageSize,
    })

    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

