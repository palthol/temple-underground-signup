import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
// CORS: allow configured origin or all in dev
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
if (allowedOrigin === '*') {
  app.use(cors());
} else {
  app.use(cors({ origin: allowedOrigin }));
}
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;
const SIGNATURES_BUCKET = process.env.SIGNATURES_BUCKET || 'signatures';
const WAIVERS_BUCKET = process.env.WAIVERS_BUCKET || 'signed-waivers';

const normalizeString = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const yesNoToBoolean = (value) => {
  if (typeof value !== 'string') return null;
  const lower = value.trim().toLowerCase();
  if (lower === 'yes') return true;
  if (lower === 'no') return false;
  return null;
};

const hasEmergencyContactDetails = (contact) => {
  if (!contact || typeof contact !== 'object') return false;
  return Boolean(
    normalizeString(contact.name) ||
      normalizeString(contact.relationship) ||
      normalizeString(contact.phone) ||
      normalizeString(contact.email)
  );
};

const buildMedicalHistoryPayload = (waiverId, medical) => {
  if (!medical || typeof medical !== 'object') return null;
  const injuries = medical.injuries && typeof medical.injuries === 'object' ? medical.injuries : {};
  const otherInjury = injuries.other && typeof injuries.other === 'object' ? injuries.other : {};
  const hadRecentInjury = yesNoToBoolean(medical.had_recent_injury);
  const physicianCleared = yesNoToBoolean(medical.physician_cleared);

  return {
    waiver_id: waiverId,
    heart_disease: Boolean(medical.heart_disease),
    shortness_of_breath: Boolean(medical.shortness_of_breath),
    high_blood_pressure: Boolean(medical.high_blood_pressure),
    smoking: Boolean(medical.smoking),
    diabetes: Boolean(medical.diabetes),
    family_history: Boolean(medical.family_history),
    workouts: Boolean(medical.workouts),
    medication: Boolean(medical.medication),
    alcohol: Boolean(medical.alcohol),
    last_physical: normalizeString(medical.last_physical),
    exercise_restriction: normalizeString(medical.exercise_restriction),
    injuries_knees: Boolean(injuries.knees),
    injuries_lower_back: Boolean(injuries.lower_back),
    injuries_neck_shoulders: Boolean(injuries.neck_shoulders),
    injuries_hip_pelvis: Boolean(injuries.hip_pelvis),
    injuries_other_has: Boolean(otherInjury.has),
    injuries_other_details: normalizeString(otherInjury.details),
    had_recent_injury: hadRecentInjury ?? false,
    injury_details: normalizeString(medical.injury_details),
    physician_cleared: physicianCleared,
    clearance_notes: normalizeString(medical.clearance_notes),
  };
};

const summarizePayload = (body) => {
  if (!body || typeof body !== 'object') return { hasBody: false };
  const participant = body.participant && typeof body.participant === 'object' ? body.participant : null;
  const emergency = body.emergency_contact && typeof body.emergency_contact === 'object' ? body.emergency_contact : null;
  const medical = body.medical_information && typeof body.medical_information === 'object' ? body.medical_information : null;
  const legal = body.legal_confirmation && typeof body.legal_confirmation === 'object' ? body.legal_confirmation : null;
  const signature = body.signature && typeof body.signature === 'object' ? body.signature : null;
  const review = body.review && typeof body.review === 'object' ? body.review : null;

  return {
    participant: participant
      ? {
          full_name: Boolean(participant.full_name),
          date_of_birth: Boolean(participant.date_of_birth),
          email: Boolean(participant.email),
          phone: Boolean(participant.phone),
          address_line: Boolean(participant.address_line),
        }
      : null,
    emergency_contact: emergency
      ? {
          name: Boolean(emergency.name),
          relationship: Boolean(emergency.relationship),
          phone: Boolean(emergency.phone),
          email: Boolean(emergency.email),
        }
      : null,
    medical_information: medical
      ? {
          keys: Object.keys(medical).length,
          injuries: typeof medical.injuries === 'object' ? Object.keys(medical.injuries) : null,
        }
      : null,
    legal_confirmation: legal
      ? {
          accepted_terms: Boolean(legal.accepted_terms),
          risk_initials: Boolean(legal.risk_initials),
          release_initials: Boolean(legal.release_initials),
          indemnification_initials: Boolean(legal.indemnification_initials),
          media_initials: Boolean(legal.media_initials),
        }
      : null,
    signature: signature
      ? {
          pngDataUrl: Boolean(signature.pngDataUrl),
          vectorJsonLength: Array.isArray(signature.vectorJson) ? signature.vectorJson.length : undefined,
        }
      : null,
    review: review ? { confirm_accuracy: Boolean(review.confirm_accuracy) } : null,
    locale: typeof body.locale === 'string',
    content_version: typeof body.content_version === 'string',
  };
};

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get('/health/deep', async (_req, res) => {
  try {
    if (!supabase) return res.status(500).json({ ok: false, db: false, error: 'supabase_not_configured' });
    const { error } = await supabase.from('participants').select('id', { count: 'exact', head: true });
    if (error) return res.status(500).json({ ok: false, db: false, error: 'db_unreachable' });
    return res.json({ ok: true, db: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, db: false, error: 'server_error' });
  }
});

app.post('/api/waivers/submit', async (req, res) => {
  try {
    console.log('waiver.submit payload summary', summarizePayload(req.body));
    const {
      participant,
      signature,
      emergency_contact: emergencyContact,
      medical_information: medicalInformation,
      legal_confirmation: legalConfirmation,
      review,
      locale = 'en',
      content_version = 'waiver.v1',
    } = req.body || {};
    const errors = [];
    if (!participant?.full_name) errors.push({ field: 'participant.full_name', messageKey: 'validation.required' });
    if (!participant?.date_of_birth) errors.push({ field: 'participant.date_of_birth', messageKey: 'validation.required' });
    if (!participant?.email) errors.push({ field: 'participant.email', messageKey: 'validation.required' });
    if (!participant?.phone) errors.push({ field: 'participant.phone', messageKey: 'validation.required' });
    if (!legalConfirmation?.accepted_terms) errors.push({ field: 'legal_confirmation.accepted_terms', messageKey: 'validation.required' });
    if (!legalConfirmation?.risk_initials) errors.push({ field: 'legal_confirmation.risk_initials', messageKey: 'validation.required' });
    if (!legalConfirmation?.release_initials) errors.push({ field: 'legal_confirmation.release_initials', messageKey: 'validation.required' });
    if (!legalConfirmation?.indemnification_initials)
      errors.push({ field: 'legal_confirmation.indemnification_initials', messageKey: 'validation.required' });
    if (!legalConfirmation?.media_initials) errors.push({ field: 'legal_confirmation.media_initials', messageKey: 'validation.required' });
    if (!signature?.pngDataUrl) errors.push({ field: 'signature', messageKey: 'validation.required' });
    if (errors.length) return res.status(400).json({ ok: false, errors });

    // Ensure we have Supabase configured
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'supabase_not_configured' });
    }

    // Upsert/find participant by email + DOB + phone
    let participantId;
    {
      const { data: existing, error: findErr } = await supabase
        .from('participants')
        .select('id, cell_phone, home_phone')
        .eq('email', participant.email)
        .eq('date_of_birth', participant.date_of_birth)
        .limit(1)
        .maybeSingle();
      if (findErr) {
        console.error('participants.find error', findErr);
        return res.status(500).json({ ok: false, errors: [{ field: 'participant', messageKey: 'server.db_find_participant_failed' }] });
      }
      const phone = String(participant.phone);
      if (existing?.id && (existing.cell_phone === phone || existing.home_phone === phone)) {
        participantId = existing.id;
      } else {
        const insertPayload = {
          full_name: participant.full_name,
          date_of_birth: participant.date_of_birth,
          email: participant.email,
          address_line: participant.address_line ?? null,
          city: participant.city ?? null,
          state: participant.state ?? null,
          zip: participant.zip ?? null,
          home_phone: null,
          cell_phone: phone,
        };
        const { data: inserted, error: insErr } = await supabase
          .from('participants')
          .insert(insertPayload)
          .select('id')
          .single();
        if (insErr) {
          console.error('participants.insert error', insErr);
          return res.status(500).json({ ok: false, errors: [{ field: 'participant', messageKey: 'server.db_insert_participant_failed' }] });
        }
        participantId = inserted.id;
      }
    }

    // Create waiver id to use for storage keys
    const waiverId = crypto.randomUUID();

    // Upload signature image if storage configured
    const png = Buffer.from(signature.pngDataUrl.split(',')[1], 'base64');
    const signatureBucket = SIGNATURES_BUCKET; // keep private
    const signatureKey = `${waiverId}.png`;
    {
      const { error: upErr } = await supabase.storage
        .from(signatureBucket)
        .upload(signatureKey, png, { contentType: 'image/png', upsert: true });
      if (upErr) console.error('Signature upload error', upErr);
    }
    const signatureImageUrl = `${signatureBucket}/${signatureKey}`; // store object path; generate signed URL when reading

    // Generate PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const { width, height } = page.getSize();
    const fontSize = 12;
    page.drawText('Temple Underground — Health Assessment & Waiver', { x: 50, y: height - 50, size: 16, font });
    page.drawText(`Name: ${participant.full_name}`, { x: 50, y: height - 90, size: fontSize, font });
    page.drawText(`DOB: ${participant.date_of_birth}`, { x: 50, y: height - 110, size: fontSize, font });
    page.drawText(`Email: ${participant.email}`, { x: 50, y: height - 130, size: fontSize, font });
    page.drawText(`Locale: ${locale}  Content: ${content_version}`, { x: 50, y: height - 150, size: fontSize, font });

    // Signature image embed
    try {
      const pngBytes = Buffer.from(signature.pngDataUrl.split(',')[1], 'base64');
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const pngDims = pngImage.scale(0.5);
      page.drawText('Signature:', { x: 50, y: height - 200, size: fontSize, font });
      page.drawImage(pngImage, { x: 120, y: height - 250, width: pngDims.width, height: pngDims.height });
    } catch (e) {
      console.error('Signature embed failed', e);
    }

    const pdfBytes = await pdfDoc.save();
    const hash = crypto.createHash('sha256').update(pdfBytes).digest('hex');

    const pdfBucket = WAIVERS_BUCKET;
    const pdfKey = `${waiverId}.pdf`;
    {
      const { error: pdfErr } = await supabase.storage
        .from(pdfBucket)
        .upload(pdfKey, pdfBytes, { contentType: 'application/pdf', upsert: true });
      if (pdfErr) console.error('PDF upload error', pdfErr);
    }
    const documentPdfUrl = `${pdfBucket}/${pdfKey}`; // store object path; generate signed URL when reading

    // Insert waiver row
    {
      const { error: wErr } = await supabase.from('waivers').insert({
        id: waiverId,
        participant_id: participantId,
        consent_acknowledged: Boolean(legalConfirmation?.accepted_terms),
        initials_risk_assumption: legalConfirmation?.risk_initials ?? null,
        initials_release: legalConfirmation?.release_initials ?? null,
        initials_indemnification: legalConfirmation?.indemnification_initials ?? null,
        initials_media_release: legalConfirmation?.media_initials ?? null,
        signature_image_url: signatureImageUrl,
        signature_vector_json: signature.vectorJson ?? [],
        review_confirm_accuracy: Boolean(review?.confirm_accuracy),
      });
      if (wErr) console.error('waivers.insert error', wErr);
    }

    // Upsert emergency contact if provided
    if (hasEmergencyContactDetails(emergencyContact)) {
      const emergencyPayload = {
        waiver_id: waiverId,
        participant_id: participantId,
        name: normalizeString(emergencyContact.name),
        relationship: normalizeString(emergencyContact.relationship),
        phone: normalizeString(emergencyContact.phone),
        email: normalizeString(emergencyContact.email),
      };
      const { error: ecErr } = await supabase.from('emergency_contacts').insert(emergencyPayload);
      if (ecErr) console.error('emergency_contacts.insert error', ecErr);
    }

    // Insert medical history details
    const medicalPayload = buildMedicalHistoryPayload(waiverId, medicalInformation);
    if (medicalPayload) {
      const { error: mhErr } = await supabase.from('waiver_medical_histories').insert(medicalPayload);
      if (mhErr) console.error('waiver_medical_histories.insert error', mhErr);
    }

    // Build identity snapshot
    const identity_snapshot = {
      full_name: participant.full_name,
      email: participant.email,
      date_of_birth: participant.date_of_birth,
    };

    // Insert audit row
    {
      const { error: aErr } = await supabase.from('audit_trails').insert({
        participant_id: participantId,
        waiver_id: waiverId,
        document_pdf_url: documentPdfUrl,
        document_sha256: hash,
        identity_snapshot,
        locale,
        content_version,
      });
      if (aErr) console.error('audit_trails.insert error', aErr);
    }

    return res.json({ ok: true, waiverId, participantId, sha256: hash });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

// Simple admin gate: require ADMIN_API_KEY header match
function requireAdmin(req, res, next) {
  const key = req.header('x-admin-key');
  if (!process.env.ADMIN_API_KEY || key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ ok: false, error: 'unauthorized' });
  }
  next();
}

// Admin: fetch waiver metadata and return signed URLs
app.get('/api/admin/waivers/:id', requireAdmin, async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ ok: false, error: 'supabase_not_configured' });
    const waiverId = req.params.id;

    const { data: waiver, error: wErr } = await supabase
      .from('waivers')
      .select('participant_id, signature_image_url')
      .eq('id', waiverId)
      .maybeSingle();
    if (wErr || !waiver) return res.status(404).json({ ok: false, error: 'not_found' });

    const { data: audit, error: aErr } = await supabase
      .from('audit_trails')
      .select('document_pdf_url, document_sha256, locale, content_version, created_at, identity_snapshot')
      .eq('waiver_id', waiverId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (aErr || !audit) return res.status(404).json({ ok: false, error: 'audit_not_found' });

    // Create signed URLs (5 minutes)
    const [sigBucket, sigKey] = String(waiver.signature_image_url).split('/');
    const [pdfBucket, pdfKey] = String(audit.document_pdf_url).split('/');
    const expiresIn = 60 * 5;

    const { data: sigSigned, error: sigErr } = await supabase.storage.from(sigBucket).createSignedUrl(sigKey, expiresIn);
    const { data: pdfSigned, error: pdfErr } = await supabase.storage.from(pdfBucket).createSignedUrl(pdfKey, expiresIn);
    if (sigErr || pdfErr) {
      console.error('signed url error', sigErr || pdfErr);
      return res.status(500).json({ ok: false, error: 'signed_url_failed' });
    }

    return res.json({
      ok: true,
      waiverId,
      participantId: waiver.participant_id,
      signatureUrl: sigSigned.signedUrl,
      documentPdfUrl: pdfSigned.signedUrl,
      documentSha256: audit.document_sha256,
      locale: audit.locale,
      content_version: audit.content_version,
      created_at: audit.created_at,
      identity_snapshot: audit.identity_snapshot,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
