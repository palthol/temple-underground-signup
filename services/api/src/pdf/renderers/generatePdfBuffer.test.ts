import { describe, expect, it, vi } from 'vitest'

type PlaywrightMocks = {
  pdfMock: ReturnType<typeof vi.fn>
  setContentMock: ReturnType<typeof vi.fn>
  emulateMediaMock: ReturnType<typeof vi.fn>
  newPageMock: ReturnType<typeof vi.fn>
  closeMock: ReturnType<typeof vi.fn>
  launchMock: ReturnType<typeof vi.fn>
}

const getMocks = () => (globalThis as Record<PropertyKey, unknown>).__playwrightMocks__ as PlaywrightMocks

vi.mock('playwright-core', () => {
  const pdfMock = vi.fn().mockResolvedValue(Uint8Array.from([1, 2, 3]))
  const setContentMock = vi.fn()
  const emulateMediaMock = vi.fn()
  const newPageMock = vi.fn().mockResolvedValue({
    setContent: setContentMock,
    emulateMedia: emulateMediaMock,
    pdf: pdfMock,
  })
  const closeMock = vi.fn()
  const launchMock = vi.fn().mockResolvedValue({
    newPage: newPageMock,
    close: closeMock,
  })

  ;(globalThis as Record<PropertyKey, unknown>).__playwrightMocks__ = {
    pdfMock,
    setContentMock,
    emulateMediaMock,
    newPageMock,
    closeMock,
    launchMock,
  } satisfies PlaywrightMocks

  return {
    chromium: {
      launch: launchMock,
    },
  }
})

import { generatePdfBuffer } from './generatePdfBuffer.js'

describe('generatePdfBuffer', () => {
  it('launches chromium, renders html, and returns a buffer', async () => {
    const html = '<html><body><h1>Hello</h1></body></html>'
    const result = await generatePdfBuffer({ html })

    const mocks = getMocks()
    expect(mocks.setContentMock).toHaveBeenCalledWith(html, { waitUntil: 'networkidle' })
    expect(mocks.emulateMediaMock).toHaveBeenCalledWith({ media: 'print' })
    expect(mocks.pdfMock).toHaveBeenCalledWith(
      expect.objectContaining({
        displayHeaderFooter: false,
        format: 'Letter',
        printBackground: true,
      }),
    )
    expect(Buffer.isBuffer(result)).toBe(true)
    expect(Array.from(result)).toEqual([1, 2, 3])
    expect(mocks.closeMock).toHaveBeenCalled()
  })

  it('enables headers when provided', async () => {
    const mocks = getMocks()
    mocks.pdfMock.mockResolvedValueOnce(Uint8Array.from([4]))
    await generatePdfBuffer({ html: '<html></html>', headerTemplate: '<div>Header</div>' })
    expect(mocks.pdfMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        displayHeaderFooter: true,
        headerTemplate: '<div>Header</div>',
      }),
    )
  })
})

