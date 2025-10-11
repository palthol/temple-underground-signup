import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseServiceRole ? createClient(supabaseUrl, supabaseServiceRole) : null;

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/waivers/submit', async (req, res) => {
  try {
    const { participant, signature, locale = 'en', content_version = 'waiver.v1' } = req.body || {};
    if (!participant?.full_name || !participant?.date_of_birth || !participant?.email) {
      return res.status(400).json({ ok: false, error: 'invalid_payload' });
    }
    if (!signature?.pngDataUrl) {
      return res.status(400).json({ ok: false, error: 'signature_required' });
    }

    // Ensure we have Supabase configured
    if (!supabase) {
      return res.status(500).json({ ok: false, error: 'supabase_not_configured' });
    }

    // Upsert/find participant by email (and optional dob)
    let participantId;
    {
      const { data: existing, error: findErr } = await supabase
        .from('participants')
        .select('id')
        .eq('email', participant.email)
        .limit(1)
        .maybeSingle();
      if (findErr) {
        console.error('participants.find error', findErr);
        return res.status(500).json({ ok: false, error: 'db_find_participant_failed' });
      }
      if (existing?.id) {
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
          home_phone: participant.home_phone ?? null,
          cell_phone: participant.cell_phone ?? null,
        };
        const { data: inserted, error: insErr } = await supabase
          .from('participants')
          .insert(insertPayload)
          .select('id')
          .single();
        if (insErr) {
          console.error('participants.insert error', insErr);
          return res.status(500).json({ ok: false, error: 'db_insert_participant_failed' });
        }
        participantId = inserted.id;
      }
    }

    // Create waiver id to use for storage keys
    const waiverId = crypto.randomUUID();

    // Upload signature image if storage configured
    const png = Buffer.from(signature.pngDataUrl.split(',')[1], 'base64');
    const signatureBucket = 'signatures';
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

    const pdfBucket = 'signed-waivers';
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
        consent_acknowledged: true, // minimal slice assumption
        initials_risk_assumption: null,
        initials_release: null,
        initials_indemnification: null,
        initials_media_release: null,
        signature_image_url: signatureImageUrl,
        signature_vector_json: signature.vectorJson ?? [],
      });
      if (wErr) console.error('waivers.insert error', wErr);
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

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
