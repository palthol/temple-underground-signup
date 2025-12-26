import { buildApiUrl } from './client'

export type GetWaiverPdfResult =
  | { ok: true; blob: Blob; fileName: string }
  | { ok: false; status: number; error?: string }

const getAdminKeyHeader = () => {
  const key = import.meta.env.VITE_API_ADMIN_KEY as string | undefined
  if (!key) return undefined
  return key
}

export const getWaiverPdf = async (waiverId: string): Promise<GetWaiverPdfResult> => {
  const url = buildApiUrl(`/api/waivers/${waiverId}/pdf`)
  const headers: Record<string, string> = {}
  const adminKey = getAdminKeyHeader()
  if (adminKey) headers['x-admin-key'] = adminKey

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    })

    if (!response.ok) {
      let error: string | undefined
      try {
        const json = (await response.json()) as { error?: string; message?: string }
        error = json.error ?? json.message
      } catch {
        // Ignore parse errors; fall through to generic message
      }
      return { ok: false, status: response.status, error }
    }

    const blob = await response.blob()

    // Use the filename provided by the server if present
    const contentDisposition = response.headers.get('content-disposition') ?? ''
    const match = contentDisposition.match(/filename="?([^";]+)"?/i)
    const fallbackName = `waiver-${waiverId}.pdf`
    const fileName = match ? match[1] : fallbackName

    return { ok: true, blob, fileName }
  } catch (error) {
    return { ok: false, status: 0, error: error instanceof Error ? error.message : 'network_error' }
  }
}





