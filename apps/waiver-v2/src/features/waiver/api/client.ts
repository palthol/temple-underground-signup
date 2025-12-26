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





