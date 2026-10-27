// ---------------------------------------------------------------------------
// Marketing attribution: which campaign brought the customer who ordered.
//
// A shopper usually lands from an ad with ?utm_source=... on the URL, then
// browses, and the parameters are gone from the address bar long before
// checkout. AttributionCapture records them on arrival; checkout reads them
// back and sends them with the order.
//
// Two touches are kept:
//   first — the very first visit this browser made (never overwritten)
//   last  — the most recent visit that arrived with campaign parameters
// so marketing can credit either the ad that introduced the customer or the
// one that finally converted them.
//
// Stored in localStorage, so it survives closing the tab and the Safepay
// redirect. Expires after ATTRIBUTION_TTL_DAYS of no new campaign visit.
// ---------------------------------------------------------------------------

export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;
const CLICK_ID_KEYS = ['fbclid', 'gclid', 'ttclid'] as const;

type UtmKey = (typeof UTM_KEYS)[number];
type ClickIdKey = (typeof CLICK_ID_KEYS)[number];

export type Touch = Partial<Record<UtmKey | ClickIdKey, string>> & {
  landing_page?: string;
  referrer?: string;
  at?: string;
};

export interface Attribution {
  first?: Touch;
  last?: Touch;
}

const STORAGE_KEY = 'raanae_attribution';
const ATTRIBUTION_TTL_DAYS = 90;
const MAX_VALUE_LENGTH = 200;

function clean(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.trim().slice(0, MAX_VALUE_LENGTH);
  return v || undefined;
}

function cleanTouch(raw: unknown): Touch | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const src = raw as Record<string, unknown>;
  const touch: Touch = {};
  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS, 'landing_page', 'referrer', 'at'] as const) {
    const v = clean(src[key]);
    if (v) touch[key] = v;
  }
  return Object.keys(touch).length ? touch : undefined;
}

/**
 * Validates attribution that arrived from the browser. Unknown keys are
 * dropped and every value is trimmed and length-capped, so a crafted request
 * cannot write arbitrary data into the order row.
 */
export function sanitizeAttribution(raw: unknown): Attribution | null {
  if (!raw || typeof raw !== 'object') return null;
  const src = raw as Record<string, unknown>;
  const result: Attribution = {};
  const first = cleanTouch(src.first);
  const last = cleanTouch(src.last);
  if (first) result.first = first;
  if (last) result.last = last;
  return first || last ? result : null;
}

// --- Browser side ----------------------------------------------------------

function read(): Attribution {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const stored = JSON.parse(raw) as Attribution & { expires?: number };
    if (stored.expires && stored.expires < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return { first: stored.first, last: stored.last };
  } catch {
    return {};
  }
}

function write(data: Attribution) {
  try {
    const expires = Date.now() + ATTRIBUTION_TTL_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, expires }));
  } catch {
    /* Private mode or storage full: attribution is best-effort. */
  }
}

/** The referring site, or undefined when it is this site itself. */
function externalReferrer(): string | undefined {
  if (!document.referrer) return undefined;
  try {
    const ref = new URL(document.referrer);
    return ref.host === window.location.host ? undefined : ref.origin + ref.pathname;
  } catch {
    return undefined;
  }
}

/** Records the current page visit. Call on every route change; it only writes when there is something new. */
export function captureAttribution() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const touch: Touch = {};
  for (const key of [...UTM_KEYS, ...CLICK_ID_KEYS]) {
    const v = clean(params.get(key));
    if (v) touch[key] = v;
  }
  const isCampaignVisit = Object.keys(touch).length > 0;

  const stored = read();
  // Only a new campaign visit, or a browser with no history at all, is worth recording.
  if (!isCampaignVisit && stored.first) return;

  touch.landing_page = clean(window.location.pathname);
  touch.referrer = clean(externalReferrer());
  touch.at = new Date().toISOString();

  write({
    first: stored.first ?? touch,
    last: isCampaignVisit ? touch : stored.last,
  });
}

/** What checkout sends with the order, or null when nothing was recorded. */
export function getAttribution(): Attribution | null {
  if (typeof window === 'undefined') return null;
  return sanitizeAttribution(read());
}
