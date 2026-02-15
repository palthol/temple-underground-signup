type EventPayload = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    gtag?: (command: string, eventName: string, payload?: EventPayload) => void
  }
}

export function trackEvent(eventName: string, payload?: EventPayload): void {
  // TODO: wire GA4 or another analytics tool globally.
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, payload)
  }
}
