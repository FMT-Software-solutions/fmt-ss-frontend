import { API_ENDPOINTS } from './endpoints';

const SESSION_KEY = 'fmt-analytics-session';

/**
 * Per-tab id kept in sessionStorage rather than a cookie, so it disappears
 * when the tab closes and needs no consent banner.
 */
function sessionId(): string | undefined {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    // Private browsing can block sessionStorage; views still count without it.
    return undefined;
  }
}

function shouldTrack(): boolean {
  if (typeof window === 'undefined') return false;
  if (navigator.doNotTrack === '1' || (window as { doNotTrack?: string }).doNotTrack === '1') {
    return false;
  }
  return true;
}

export function trackPageView(path: string): void {
  if (!shouldTrack()) return;

  const params = new URLSearchParams(window.location.search);
  const payload = {
    path,
    referrer: document.referrer || undefined,
    sessionId: sessionId(),
    screenW: window.screen?.width,
    lang: navigator.language,
    utmSource: params.get('utm_source') ?? undefined,
    utmMedium: params.get('utm_medium') ?? undefined,
    utmCampaign: params.get('utm_campaign') ?? undefined,
  };

  const body = JSON.stringify(payload);
  const url = API_ENDPOINTS.analytics.collect;

  try {
    // sendBeacon survives the page being unloaded mid-navigation, but it
    // cannot perform a CORS preflight. text/plain is a safelisted content
    // type, so this stays a simple cross-origin request; the API parses the
    // body as JSON regardless of the declared type.
    if (navigator.sendBeacon?.(url, new Blob([body], { type: 'text/plain;charset=UTF-8' }))) {
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {
    // Analytics must never surface an error to the visitor.
  });
}
