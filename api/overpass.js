/**
 * /api/overpass — Vercel serverless proxy for OpenStreetMap Overpass API.
 * 
 * This bypasses CORS restrictions that Overpass mirrors enforce on
 * production (non-localhost) origins. The client POSTs the raw Overpass
 * QL query here; this function forwards it to the first responsive mirror.
 */

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const TIMEOUT_MS = 9000; // Vercel functions have up to 10s on hobby plan

async function tryMirror(url, body, signal) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json();
}

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Allow cross-origin calls from the app itself
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { query } = req.body ?? {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query field' });
  }

  const body = `data=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let lastError = null;
  for (const mirror of MIRRORS) {
    try {
      const json = await tryMirror(mirror, body, controller.signal);
      clearTimeout(timer);
      return res.status(200).json(json);
    } catch (e) {
      lastError = e;
      if (e.name === 'AbortError') break; // hard timeout hit — stop trying
    }
  }

  clearTimeout(timer);
  console.error('[/api/overpass] All mirrors failed:', lastError?.message);
  return res.status(502).json({ error: 'All Overpass mirrors failed', detail: lastError?.message });
}
