import { Router, type RequestHandler } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'
import { renderWaiverPdf } from '../../pdf/renderers/renderWaiverPdf.js'
import { WaiverFetchFailedError, WaiverNotFoundError } from '../../pdf/data/fetchWaiver.js'

type RequireAuth = RequestHandler | RequestHandler[]

type CreateWaiverPdfRouterOptions = {
  supabase: SupabaseClient | null
  requireAuth?: RequireAuth
}

export const createWaiverPdfRouter = ({ supabase, requireAuth }: CreateWaiverPdfRouterOptions) => {
  const router = Router()

  const handlers: RequestHandler[] = []
  if (requireAuth) {
    if (Array.isArray(requireAuth)) {
      handlers.push(...requireAuth)
    } else {
      handlers.push(requireAuth)
    }
  }

  handlers.push(async (req, res) => {
    if (!supabase) {
      res.status(500).json({ ok: false, error: 'supabase_not_configured' })
      return
    }

    const waiverId = req.params.id
    if (!waiverId) {
      res.status(400).json({ ok: false, error: 'waiver_id_required' })
      return
    }

    try {
      const { payload, html } = await renderWaiverPdf({
        supabase,
        waiverId,
      })

      res.status(200).json({
        ok: true,
        waiverId,
        payload,
        html,
      })
    } catch (error) {
      if (error instanceof WaiverNotFoundError) {
        res.status(404).json({ ok: false, error: 'waiver_not_found' })
        return
      }
      if (error instanceof WaiverFetchFailedError) {
        res.status(502).json({ ok: false, error: 'waiver_fetch_failed' })
        return
      }
      console.error('waiver.pdf.render_failed', error)
      res.status(500).json({ ok: false, error: 'render_failed' })
    }
  })

  router.get('/:id/pdf', handlers)

  return router
}

