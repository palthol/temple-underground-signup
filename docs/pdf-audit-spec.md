# PDF & Audit Spec

PDF Generation
- Library: pdf-lib (or PDFKit) on server.
- Contents: Header, sections for personal/emergency/health/consent summary.
- Signature: embed PNG at signature line; print signer name and UTC timestamp.
- Watermark (optional): "Digitally signed" + reference ID.

Hashing & Storage
- Compute SHA-256 of PDF buffer; store hash in `audit_trails.document_sha256`.
- Upload to Storage: `signed-waivers/{waiverId}.pdf` in private bucket.

Audit JSON
```json
{
  "signed_at": "2025-10-01T00:00:00Z",
  "identity": { "full_name": "...", "email": "...", "phone": "...", "date_of_birth": "YYYY-MM-DD" },
  "signature": { "image_url": ".../signature.png", "vector_json": { "points": [] } },
  "document_pdf_url": ".../waiver.pdf",
  "document_sha256": "abcdef1234..."
}
```

Defensibility
- Store raw signature vector JSON (from signature_pad) and image.
- Maintain append-only audit rows; never mutate signed artifacts.

