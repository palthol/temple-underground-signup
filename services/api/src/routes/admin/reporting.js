/**
 * Read-only reporting: SELECT from whitelisted views (service role bypasses RLS).
 * @param {import('express').Router} router
 * @param {{ supabase: import('@supabase/supabase-js').SupabaseClient }} ctx
 */

/** Slug -> exact Postgres view name (public schema) */
export const REPORTING_VIEWS = Object.freeze({
  'payment-board': 'view_member_payment_board',
  'payment-reminders': 'view_member_payment_reminders',
  'orphan-waivers': 'view_orphan_waivers',
  'orphan-waiver-summary': 'view_orphan_waiver_summary',
  'charge-net': 'view_charge_net',
  'waiver-documents': 'view_waiver_documents',
  'participant-entitlements': 'participant_entitlement_status',
});

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

export function registerAdminReportingRoutes(router, { supabase }) {
  router.get('/reporting/views/:slug', async (req, res) => {
    try {
      if (!supabase) return res.status(500).json({ ok: false, error: 'supabase_not_configured' });
      const slug = String(req.params.slug || '').toLowerCase();
      const viewName = REPORTING_VIEWS[slug];
      if (!viewName) {
        return res.status(400).json({
          ok: false,
          error: 'unknown_view',
          allowed: Object.keys(REPORTING_VIEWS),
        });
      }
      let limit = Number.parseInt(String(req.query.limit || ''), 10);
      if (!Number.isFinite(limit) || limit < 1) limit = DEFAULT_LIMIT;
      limit = Math.min(limit, MAX_LIMIT);

      const { data, error } = await supabase.from(viewName).select('*').limit(limit);
      if (error) {
        console.error('reporting view select', viewName, error);
        return res.status(400).json({ ok: false, error: error.message, view: viewName });
      }
      return res.json({
        ok: true,
        slug,
        view: viewName,
        limit,
        rowCount: Array.isArray(data) ? data.length : 0,
        rows: data ?? [],
      });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ ok: false, error: 'server_error' });
    }
  });
}
