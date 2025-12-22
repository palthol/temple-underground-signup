import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { renderWaiverPdf } from './renderWaiverPdf.js'

vi.mock('../data/fetchWaiver.js', () => ({
  fetchWaiverById: vi.fn().mockResolvedValue({
    waiver: {
      id: 'waiver-123',
      participant_id: 'participant-123',
      consent_acknowledged: true,
      initials_risk_assumption: 'RA',
      initials_release: 'RL',
      initials_indemnification: 'RI',
      initials_media_release: 'RM',
      signature_image_url: 'signatures/waiver-123.png',
      signature_vector_json: [],
      signed_at_utc: '2025-12-13T11:08:08.645261+00:00',
      review_confirm_accuracy: true,
    },
    participant: {
      id: 'participant-123',
      full_name: 'Moises Varillas',
      date_of_birth: '1990-01-01',
      address_line: '123 Main St',
      city: 'Morristown',
      state: 'TN',
      zip: '37814',
      home_phone: null,
      cell_phone: '555-0000',
      email: 'moises@example.com',
      created_at: '2025-12-13T11:08:08.645261+00:00',
    },
    medical: {
      id: 'medical-123',
      waiver_id: 'waiver-123',
      heart_disease: false,
      shortness_of_breath: false,
      high_blood_pressure: false,
      smoking: false,
      diabetes: false,
      family_history: false,
      workouts: true,
      medication: false,
      alcohol: false,
      last_physical: null,
      exercise_restriction: null,
      injuries_knees: false,
      injuries_lower_back: false,
      injuries_neck_shoulders: false,
      injuries_hip_pelvis: false,
      injuries_other_has: false,
      injuries_other_details: null,
      had_recent_injury: false,
      injury_details: null,
      physician_cleared: null,
      clearance_notes: null,
      created_at: null,
      updated_at: null,
    },
    emergencyContact: null,
    audit: {
      id: 'audit-123',
      participant_id: 'participant-123',
      waiver_id: 'waiver-123',
      document_pdf_url: 'signed-waivers/waiver-123.pdf',
      document_sha256: 'fake-sha256',
      identity_snapshot: {},
      locale: 'en',
      content_version: 'waiver.v1',
      created_at: '2025-12-13T11:08:08.77565+00:00',
    },
  }),
}))

const downloadMock = vi.fn()

const supabaseStub = {
  storage: {
    from: vi.fn().mockReturnValue({
      download: downloadMock,
    }),
  },
} as unknown as SupabaseClient

beforeEach(() => {
  const pngBuffer = Buffer.from('fake-png')
  downloadMock.mockResolvedValue({
    data: {
      arrayBuffer: async () => pngBuffer,
    },
    error: null,
  })
})

describe('renderWaiverPdf', () => {
  it('returns payload and html populated from waiver data', async () => {
    const result = await renderWaiverPdf({
      supabase: supabaseStub,
      waiverId: 'waiver-123',
    })

    expect(result.payload.participant.fullName).toBe('Moises Varillas')
    expect(result.payload.document.version).toBe('waiver.v1')
    expect(result.payload.signature.imageDataUrl).toMatch(/^data:image\/png;base64,/)
    expect(result.html).toContain('Moises Varillas')
    expect(result.html).toContain('Temple Underground')
  })
})

