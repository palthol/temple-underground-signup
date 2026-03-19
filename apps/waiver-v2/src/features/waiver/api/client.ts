const normalizeBaseUrl = (value: string | undefined) => {
  if (!value) return ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

export const getApiBaseUrl = () => {
  const fromEnv = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined)
  return fromEnv ?? ''
}

export const buildApiUrl = (path: string) => {
  const base = getApiBaseUrl()
  if (!base) return path
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

let lastWarmupAt = 0
const WARMUP_INTERVAL_MS = 20_000

export const warmApi = async () => {
  const now = Date.now()
  if (now - lastWarmupAt < WARMUP_INTERVAL_MS) return
  lastWarmupAt = now

  try {
    await fetch(buildApiUrl('/health'), {
      method: 'GET',
      // Keep this request lightweight and detached from page lifecycle.
      keepalive: true,
      cache: 'no-store',
    })
  } catch {
    // Warmup failures are non-blocking by design.
  }
}





