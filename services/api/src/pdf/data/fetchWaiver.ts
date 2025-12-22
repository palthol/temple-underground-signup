import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  AuditTrailRecord,
  EmergencyContactRecord,
  ParticipantRecord,
  WaiverJoinedRow,
  WaiverMedicalHistoryRecord,
  WaiverRecord,
} from '../types.js'

const VIEW_NAME = 'view_waiver_documents'

export class WaiverNotFoundError extends Error {
  constructor(waiverId: string) {
    super(`Waiver ${waiverId} not found`)
    this.name = 'WaiverNotFoundError'
  }
}

export class WaiverFetchFailedError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WaiverFetchFailedError'
  }
}

type ViewRow = Record<string, unknown>

const toStringOrNull = (value: unknown): string | null => (typeof value === 'string' ? value : null)

const toBooleanOrNull = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  if (value === null || value === undefined) return null
  return Boolean(value)
}

const toRecordOrNull = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : null

const toJoinedRow = (row: ViewRow): WaiverJoinedRow => {
  const waiver: WaiverRecord = {
    id: String(row.waiver_id),
    participant_id: String(row.participant_id),
    consent_acknowledged: toBooleanOrNull(row.consent_acknowledged),
    initials_risk_assumption: toStringOrNull(row.initials_risk_assumption),
    initials_release: toStringOrNull(row.initials_release),
    initials_indemnification: toStringOrNull(row.initials_indemnification),
    initials_media_release: toStringOrNull(row.initials_media_release),
    signature_image_url: toStringOrNull(row.signature_image_url),
    signature_vector_json: row.signature_vector_json ?? null,
    signed_at_utc: toStringOrNull(row.signed_at_utc),
    review_confirm_accuracy: toBooleanOrNull(row.review_confirm_accuracy),
  }

  const participant: ParticipantRecord | null = {
    id: String(row.participant_id),
    full_name: toStringOrNull(row.participant_full_name),
    date_of_birth: toStringOrNull(row.participant_date_of_birth),
    address_line: toStringOrNull(row.participant_address_line),
    city: toStringOrNull(row.participant_city),
    state: toStringOrNull(row.participant_state),
    zip: toStringOrNull(row.participant_zip),
    home_phone: toStringOrNull(row.participant_home_phone),
    cell_phone: toStringOrNull(row.participant_cell_phone),
    email: toStringOrNull(row.participant_email),
    created_at: null,
  }

  const medical: WaiverMedicalHistoryRecord | null = row.medical_history_id
    ? {
        id: String(row.medical_history_id),
        waiver_id: waiver.id,
        heart_disease: toBooleanOrNull(row.heart_disease),
        shortness_of_breath: toBooleanOrNull(row.shortness_of_breath),
        high_blood_pressure: toBooleanOrNull(row.high_blood_pressure),
        smoking: toBooleanOrNull(row.smoking),
        diabetes: toBooleanOrNull(row.diabetes),
        family_history: toBooleanOrNull(row.family_history),
        workouts: toBooleanOrNull(row.workouts),
        medication: toBooleanOrNull(row.medication),
        alcohol: toBooleanOrNull(row.alcohol),
        last_physical: toStringOrNull(row.last_physical),
        exercise_restriction: toStringOrNull(row.exercise_restriction),
        injuries_knees: toBooleanOrNull(row.injuries_knees),
        injuries_lower_back: toBooleanOrNull(row.injuries_lower_back),
        injuries_neck_shoulders: toBooleanOrNull(row.injuries_neck_shoulders),
        injuries_hip_pelvis: toBooleanOrNull(row.injuries_hip_pelvis),
        injuries_other_has: toBooleanOrNull(row.injuries_other_has),
        injuries_other_details: toStringOrNull(row.injuries_other_details),
        had_recent_injury: toBooleanOrNull(row.had_recent_injury),
        injury_details: toStringOrNull(row.injury_details),
        physician_cleared: toBooleanOrNull(row.physician_cleared),
        clearance_notes: toStringOrNull(row.clearance_notes),
        created_at: toStringOrNull(row.medical_history_created_at),
        updated_at: toStringOrNull(row.medical_history_updated_at),
      }
    : null

  const emergencyContact: EmergencyContactRecord | null = row.emergency_contact_id
    ? {
        id: String(row.emergency_contact_id),
        waiver_id: waiver.id,
        participant_id: waiver.participant_id,
        name: toStringOrNull(row.emergency_contact_name),
        relationship: toStringOrNull(row.emergency_contact_relationship),
        phone: toStringOrNull(row.emergency_contact_phone),
        email: toStringOrNull(row.emergency_contact_email),
        created_at: toStringOrNull(row.emergency_contact_created_at),
      }
    : null

  const audit: AuditTrailRecord | null = row.audit_id
    ? {
        id: String(row.audit_id),
        participant_id: waiver.participant_id,
        waiver_id: waiver.id,
        document_pdf_url: toStringOrNull(row.document_pdf_url),
        document_sha256: toStringOrNull(row.document_sha256),
        identity_snapshot: toRecordOrNull(row.identity_snapshot),
        locale: toStringOrNull(row.locale),
        content_version: toStringOrNull(row.content_version),
        created_at: toStringOrNull(row.audit_created_at),
      }
    : null

  return {
    waiver,
    participant,
    medical,
    emergencyContact,
    audit,
  }
}

/**
 * Fetches a waiver document row from Supabase view `view_waiver_documents`.
 * The view returns a flattened column set (prefixed like `participant_*`),
 * which is normalized here into the structured `WaiverJoinedRow`.
 */
export const fetchWaiverById = async (
  supabase: SupabaseClient,
  waiverId: string,
): Promise<WaiverJoinedRow> => {
  const { data, error } = await supabase
    .from(VIEW_NAME)
    .select('*')
    .eq('waiver_id', waiverId)
    .limit(1)
    .maybeSingle<ViewRow>()

  if (error) {
    throw new WaiverFetchFailedError(error.message)
  }

  if (!data) {
    throw new WaiverNotFoundError(waiverId)
  }

  return toJoinedRow(data)
}

