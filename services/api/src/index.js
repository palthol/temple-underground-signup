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

    // Persist to DB (pseudo; you will replace with Supabase SQL/insert calls)
    const participantId = crypto.randomUUID();
    const waiverId = crypto.randomUUID();

    // Upload signature image if storage configured
    let signatureImageUrl = '';
    if (supabase) {
      const png = Buffer.from(signature.pngDataUrl.split(',')[1], 'base64');
      const key = `signatures/${waiverId}.png`;
      const { error } = await supabase.storage.from('signed-waivers').upload(key, png, { contentType: 'image/png', upsert: true });
      if (error) console.error('Signature upload error', error);
      const { data } = supabase.storage.from('signed-waivers').getPublicUrl(key);
      signatureImageUrl = data.publicUrl; // Note: Prefer private bucket with signed URLs in production
    }

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

    let documentPdfUrl = '';
    if (supabase) {
      const key = `signed-waivers/${waiverId}.pdf`;
      const { error } = await supabase.storage.from('signed-waivers').upload(key, pdfBytes, { contentType: 'application/pdf', upsert: true });
      if (error) console.error('PDF upload error', error);
      const { data } = supabase.storage.from('signed-waivers').getPublicUrl(key);
      documentPdfUrl = data.publicUrl; // Note: use private + signed URL in prod
    }

    // TODO: Insert rows into participants, waivers, audit_trails using Supabase client

    return res.json({ ok: true, waiverId, participantId, documentPdfUrl, sha256: hash });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false, error: 'server_error' });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

