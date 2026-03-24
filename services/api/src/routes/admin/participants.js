/**
 * @param {import('express').Router} router
 * @param {{ supabase: import('@supabase/supabase-js').SupabaseClient }} ctx
 */
export function registerAdminParticipantRoutes(router, { supabase }) {
  router.post('/participants/merge', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ ok: false, error: 'supabase_not_configured' });
      const { canonical_participant_id, duplicate_participant_id } = req.body || {};
      if (!canonical_participant_id || !duplicate_participant_id) {
        return res.status(400).json({ ok: false, error: 'both_participant_ids_required' });
      }
      const { error } = await supabase.rpc('merge_participants', {
        p_canonical_participant_id: canonical_participant_id,
        p_duplicate_participant_id: duplicate_participant_id,
      });
      if (error) {
        console.error('merge_participants', error);
        return res.status(400).json({ ok: false, error: error.message });
      }
      return res.json({ ok: true });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'server_error' });
    }
  });
}
