CREATE OR REPLACE VIEW public.view_waiver_documents
  WITH (security_invoker = on) AS
 SELECT w.id AS waiver_id,
    w.participant_id,
    w.initials_risk_assumption,
    w.initials_release,
    w.initials_indemnification,
    w.initials_media_release,
    w.signature_image_url,
    w.signature_vector_json,
    w.signed_at_utc,
    w.review_confirm_accuracy,
    w.consent_acknowledged,
    p.full_name AS participant_full_name,
    p.date_of_birth AS participant_date_of_birth,
    p.address_line AS participant_address_line,
    p.city AS participant_city,
    p.state AS participant_state,
    p.zip AS participant_zip,
    p.home_phone AS participant_home_phone,
    p.cell_phone AS participant_cell_phone,
    p.email AS participant_email,
    mh.id AS medical_history_id,
    mh.heart_disease,
    mh.shortness_of_breath,
    mh.high_blood_pressure,
    mh.smoking,
    mh.diabetes,
    mh.family_history,
    mh.workouts,
    mh.medication,
    mh.alcohol,
    mh.last_physical,
    mh.exercise_restriction,
    mh.injuries_knees,
    mh.injuries_lower_back,
    mh.injuries_neck_shoulders,
    mh.injuries_hip_pelvis,
    mh.injuries_other_has,
    mh.injuries_other_details,
    mh.had_recent_injury,
    mh.injury_details,
    mh.physician_cleared,
    mh.clearance_notes,
    mh.created_at AS medical_history_created_at,
    mh.updated_at AS medical_history_updated_at,
    ec.id AS emergency_contact_id,
    ec.name AS emergency_contact_name,
    ec.relationship AS emergency_contact_relationship,
    ec.phone AS emergency_contact_phone,
    ec.email AS emergency_contact_email,
    ec.created_at AS emergency_contact_created_at,
    at.id AS audit_id,
    at.document_pdf_url,
    at.document_sha256,
    at.identity_snapshot,
    at.locale,
    at.content_version,
    at.created_at AS audit_created_at
   FROM waivers w
     LEFT JOIN participants p ON p.id = w.participant_id
     LEFT JOIN LATERAL ( SELECT mh2.id,
            mh2.waiver_id,
            mh2.heart_disease,
            mh2.shortness_of_breath,
            mh2.high_blood_pressure,
            mh2.smoking,
            mh2.diabetes,
            mh2.family_history,
            mh2.workouts,
            mh2.medication,
            mh2.alcohol,
            mh2.last_physical,
            mh2.exercise_restriction,
            mh2.injuries_knees,
            mh2.injuries_lower_back,
            mh2.injuries_neck_shoulders,
            mh2.injuries_hip_pelvis,
            mh2.injuries_other_has,
            mh2.injuries_other_details,
            mh2.had_recent_injury,
            mh2.injury_details,
            mh2.physician_cleared,
            mh2.clearance_notes,
            mh2.created_at,
            mh2.updated_at
           FROM waiver_medical_histories mh2
          WHERE mh2.waiver_id = w.id
          ORDER BY (COALESCE(mh2.created_at, mh2.updated_at)) DESC NULLS LAST
         LIMIT 1) mh ON true
     LEFT JOIN LATERAL ( SELECT ec2.id,
            ec2.waiver_id,
            ec2.participant_id,
            ec2.name,
            ec2.relationship,
            ec2.phone,
            ec2.email,
            ec2.created_at
           FROM emergency_contacts ec2
          WHERE ec2.waiver_id = w.id
          ORDER BY (COALESCE(ec2.created_at, '1970-01-01 00:00:00+00'::timestamp with time zone)) DESC
         LIMIT 1) ec ON true
     LEFT JOIN LATERAL ( SELECT at2.id,
            at2.participant_id,
            at2.waiver_id,
            at2.document_pdf_url,
            at2.document_sha256,
            at2.identity_snapshot,
            at2.locale,
            at2.content_version,
            at2.created_at
           FROM audit_trails at2
          WHERE at2.waiver_id = w.id
          ORDER BY (COALESCE(at2.created_at, '1970-01-01 00:00:00+00'::timestamp with time zone)) DESC
         LIMIT 1) at ON true;







