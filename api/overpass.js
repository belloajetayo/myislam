/**
 * /api/overpass — Vercel serverless proxy for mosque discovery.
 *
 * Strategy (in order):
 *   1. Overpass API via GET (sometimes permitted from cloud IPs where POST is blocked)
 *   2. Nominatim OpenStreetMap search (does NOT block cloud/Vercel IPs — reliable fallback)
 *
 * The client sends: { query, lat, lng, radius }
 *   - query  : raw Overpass QL string (used for Overpass path)
 *   - lat    : user latitude  (used for Nominatim bounding box)
 *   - lng    : user longitude
 *   - radius : search radius in metres
 */

const OVERPASS_MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

const UA = 'MyIslamApp/1.0 (https://myislam-liard.vercel.app; contact@myislam.app)';
const TIMEOUT_MS = 8000;

// ─── Overpass via GET ─────────────────────────────────────────────────────────

async function tryOverpassGet(mirrorUrl, query, signal) {
  const url = `${mirrorUrl}?data=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Overpass GET ${res.status}: ${txt.slice(0, 120)}`);
  }
  const json = await res.json();
  if (!Array.isArray(json?.elements)) throw new Error('Overpass: unexpected response shape');
  return json; // { elements: [...] }
}

async function tryAllOverpass(query, signal) {
  let last;
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      return await tryOverpassGet(mirror, query, signal);
    } catch (e) {
      last = e;
      if (signal?.aborted) break;
      console.warn(`[api/overpass] mirror ${mirror} failed:`, e.message);
    }
  }
  throw last ?? new Error('Overpass: all mirrors failed');
}

// ─── Nominatim fallback ───────────────────────────────────────────────────────

const MOSQUE_KEYWORDS = ['mosque', 'masjid', 'jami', 'jamia', 'مسجد', 'جامع', 'maschid', 'moschee'];

function isMosque(place) {
  const name = (place.name || place.display_name || '').toLowerCase();
  const tags = place.extratags || {};
  // Accept if name suggests mosque, OR if OSM tags say religion=muslim
  if (MOSQUE_KEYWORDS.some((kw) => name.includes(kw))) return true;
  if (tags.religion === 'muslim') return true;
  return false;
}

function placeToElement(p) {
  return {
    type: 'node',
    id: p.place_id,
    lat: parseFloat(p.lat),
    lon: parseFloat(p.lon),
    tags: {
      name: p.name || p.display_name?.split(',')[0] || 'Mosque',
      amenity: 'place_of_worship',
      religion: 'muslim',
      'addr:full': p.display_name ?? '',
    },
  };
}

async function nominatimQuery(params, signal) {
  const url = new URL(NOMINATIM_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '50');
  url.searchParams.set('extratags', '1');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
    signal,
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function tryNominatim(lat, lng, radiusM, signal) {
  // Build bounding box
  const radiusKm = radiusM / 1000;
  const deltaLat = radiusKm / 111;
  const deltaLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const viewbox = [
    (lng - deltaLng).toFixed(6), // left
    (lat + deltaLat).toFixed(6), // top
    (lng + deltaLng).toFixed(6), // right
    (lat - deltaLat).toFixed(6), // bottom
  ].join(',');

  // Run two queries in parallel:
  //   A) all places_of_worship in bbox (then filter to mosques by name/tags)
  //   B) direct keyword search for "mosque" in bbox
  const [worshipResults, keywordResults] = await Promise.allSettled([
    nominatimQuery({ amenity: 'place_of_worship', bounded: '1', viewbox }, signal),
    nominatimQuery({ q: 'mosque', bounded: '1', viewbox }, signal),
  ]);

  const allPlaces = [
    ...(worshipResults.status === 'fulfilled' ? worshipResults.value : []),
    ...(keywordResults.status === 'fulfilled' ? keywordResults.value : []),
  ];

  // Deduplicate by place_id and filter to mosques
  const seen = new Set();
  const elements = allPlaces
    .filter((p) => {
      if (seen.has(p.place_id)) return false;
      seen.add(p.place_id);
      return isMosque(p);
    })
    .map(placeToElement);

  return { elements, _source: 'nominatim' };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, lat, lng, radius } = req.body ?? {};

  if (!lat || !lng) {
    return res.status(400).json({ error: 'Missing lat/lng fields' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    // ── Path 1: Overpass GET ─────────────────────────────────────────────────
    if (query && typeof query === 'string') {
      try {
        const json = await tryAllOverpass(query, controller.signal);
        clearTimeout(timer);
        console.log(`[api/overpass] Overpass OK — ${json.elements.length} elements`);
        return res.status(200).json(json);
      } catch (e) {
        if (controller.signal.aborted) {
          clearTimeout(timer);
          return res.status(504).json({ error: 'Timeout', detail: e.message });
        }
        console.warn('[api/overpass] Overpass failed, trying Nominatim:', e.message);
      }
    }

    // ── Path 2: Nominatim ────────────────────────────────────────────────────
    const radiusM = Number(radius) || 20000;
    const json = await tryNominatim(Number(lat), Number(lng), radiusM, controller.signal);
    clearTimeout(timer);
    console.log(`[api/overpass] Nominatim OK — ${json.elements.length} elements`);
    return res.status(200).json(json);
  } catch (e) {
    clearTimeout(timer);
    const status = controller.signal.aborted ? 504 : 502;
    console.error('[api/overpass] All sources failed:', e.message);
    return res.status(status).json({ error: 'All mosque sources failed', detail: e.message });
  }
}
