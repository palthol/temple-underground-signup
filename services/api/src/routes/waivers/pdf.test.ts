import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../../pdf/renderers/renderWaiverPdf.js', () => ({
  renderWaiverPdf: vi.fn(),
}))

vi.mock('../../pdf/renderers/generatePdfBuffer.js', () => ({
  generatePdfBuffer: vi.fn(),
}))

import { renderWaiverPdf } from '../../pdf/renderers/renderWaiverPdf.js'
import { generatePdfBuffer } from '../../pdf/renderers/generatePdfBuffer.js'
import { createWaiverPdfRouter } from './pdf.js'

const supabaseStub = {}

beforeEach(() => {
  vi.resetAllMocks()
})

describe('GET /api/waivers/:id/pdf', () => {
  it('requires supabase to be configured', async () => {
    const app = express()
    app.use(
      '/api/waivers',
      createWaiverPdfRouter({
        supabase: null,
      }),
    )

    const res = await request(app).get('/api/waivers/abc/pdf')
    expect(res.status).toBe(500)
    expect(res.body.error).toBe('supabase_not_configured')
  })

  it('streams the generated PDF buffer with headers', async () => {
    ;(renderWaiverPdf as unknown as vi.Mock).mockResolvedValue({
      payload: {
        document: {
          locale: 'en',
          version: 'waiver.v1',
        },
      },
      html: '<html></html>',
    })

    const pdfBuffer = Buffer.from([7, 8, 9])
    ;(generatePdfBuffer as unknown as vi.Mock).mockResolvedValue(pdfBuffer)

    const app = express()
    app.use(
      '/api/waivers',
      createWaiverPdfRouter({
        supabase: supabaseStub,
        requireAuth: (_req, _res, next) => next(),
      }),
    )

    const res = await request(app).get('/api/waivers/waiver-123/pdf')

    expect(renderWaiverPdf).toHaveBeenCalledWith({
      supabase: supabaseStub,
      waiverId: 'waiver-123',
    })
    expect(generatePdfBuffer).toHaveBeenCalledWith({ html: '<html></html>' })

    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.headers['content-disposition']).toContain('waiver-123')
    expect(res.headers['x-waiver-locale']).toBe('en')
    expect(res.headers['x-waiver-version']).toBe('waiver.v1')
    expect(res.body).toEqual(pdfBuffer)
  })
})

