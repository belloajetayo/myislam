import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useNearbyMosques
 * ─────────────────
 * Fetches mosques within `radiusMeters` of the user using the OpenStreetMap
 * Overpass API. Races mirrors and takes the first successful response.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

const MIRRORS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.fr/api/interpreter',
];

const MIRROR_TIMEOUT_MS = 6000;   // 6 seconds per mirror
const OVERALL_TIMEOUT_MS = 8000;  // 8 seconds hard ceiling
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6-hour cache

// ── Helpers ───────────────────────────────────────────────────────────────────

function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Lean query — single nwr block, small timeout clause */
function buildQuery(lat, lng, radius) {
  return (
    `[out:json][timeout:6];` +
    `(nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});` +
    `nwr["building"="mosque"](around:${radius},${lat},${lng});` +
    `nwr["amenity"="mosque"](around:${radius},${lat},${lng}););` +
    `out center tags;`
  );
}

/** Fire a single POST to one mirror; resolve with elements array or reject */
function fetchMirror(url, query) {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      ctrl.abort();
      reject(new Error('timeout'));
    }, MIRROR_TIMEOUT_MS);

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      signal: ctrl.signal,
    })
      .then((res) => {
        clearTimeout(timer);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        const els = Array.isArray(json?.elements) ? json.elements : [];
        resolve(els);
      })
      .catch((e) => {
        clearTimeout(timer);
        reject(e);
      });
  });
}

/** Races mirrors. Resolves with first success; ignores individual failures. */
function raceMirrors(query) {
  return new Promise((resolve, reject) => {
    let rejectCount = 0;
    const total = MIRRORS.length;

    MIRRORS.forEach((url) => {
      fetchMirror(url, query)
        .then((val) => resolve(val))
        .catch((err) => {
          rejectCount++;
          if (rejectCount === total) {
            reject(new Error('all_mirrors_failed'));
          }
        });
    });
  });
}

/** Race all mirrors with a hard overall ceiling. Returns elements array. */
async function fetchFromOverpass(query) {
  const t0 = Date.now();

  const hardTimeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('overall_timeout')), OVERALL_TIMEOUT_MS)
  );

  try {
    const elements = await Promise.race([raceMirrors(query), hardTimeout]);
    console.log(`[useNearbyMosques] Overpass responded in ${Date.now() - t0}ms, ${elements.length} elements`);
    return Array.isArray(elements) ? elements : [];
  } catch (e) {
    console.warn(`[useNearbyMosques] Overpass query failed after ${Date.now() - t0}ms:`, e.message);
    throw e;
  }
}

function parseElements(elements, userLat, userLng, radiusM) {
  const seen = new Set();
  return elements
    .map((el) => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (typeof lat !== 'number' || typeof lng !== 'number') return null;

      const dist = haversineM(userLat, userLng, lat, lng);
      if (dist > radiusM) return null;

      const tags  = el.tags ?? {};
      const name  = tags.name || tags['name:en'] || tags['name:ar'] || 'Mosque';
      const addrParts = [
        tags['addr:housenumber'], tags['addr:street'],
        tags['addr:suburb'],      tags['addr:city'],
      ].filter(Boolean);
      const address = tags['addr:full'] || addrParts.join(', ') || '';

      // Deduplicate by rounded coords + name
      const key = `${lat.toFixed(4)}|${lng.toFixed(4)}|${name.toLowerCase()}`;
      if (seen.has(key)) return null;
      seen.add(key);

      return { id: key, name, address, lat, lng, distance: dist };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 15);
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

function cacheRead(lat, lng) {
  try {
    const raw = localStorage.getItem(`mnm_${lat.toFixed(2)}_${lng.toFixed(2)}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL_MS ? data : null;
  } catch { return null; }
}

function cacheWrite(lat, lng, data) {
  try {
    localStorage.setItem(
      `mnm_${lat.toFixed(2)}_${lng.toFixed(2)}`,
      JSON.stringify({ ts: Date.now(), data })
    );
  } catch { /* quota exceeded — ignore */ }
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export default function useNearbyMosques(radiusMeters = 20000, initialCoords = null) {
  const [mosques,  setMosques]  = useState([]);
  const [location, setLocation] = useState(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      return { latitude: initialCoords.lat, longitude: initialCoords.lng };
    }
    return null;
  });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [tick, setTick] = useState(0);   // bump to re-trigger
  const bypassCacheRef = useRef(false);

  // Synchronize location if initialCoords changes
  useEffect(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      setLocation({ latitude: initialCoords.lat, longitude: initialCoords.lng });
    }
  }, [initialCoords?.lat, initialCoords?.lng]);

  // ── 1. Geolocation ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialCoords?.lat && initialCoords?.lng) {
      return; // Skip geolocation entirely if we already have coordinates
    }

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError(null);

    const id = navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ latitude: coords.latitude, longitude: coords.longitude });
      },
      (err) => {
        const msgs = {
          1: 'Location permission denied. Enable it in your browser settings.',
          2: 'GPS signal unavailable. Check location services.',
          3: 'Location request timed out. Try again.',
        };
        setError(msgs[err.code] ?? 'Could not get your location.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );

    return () => {
      /* getCurrentPosition has no cancel — no-op cleanup */
      void id;
    };
  }, [tick, initialCoords?.lat, initialCoords?.lng]);

  // ── 2. Fetch mosques once location arrives ──────────────────────────────────
  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    const { latitude: lat, longitude: lng } = location;

    async function run() {
      // Serve from cache instantly if fresh and not bypassed
      if (!bypassCacheRef.current) {
        const cached = cacheRead(lat, lng);
        if (cached) {
          if (!cancelled) { setMosques(cached); setLoading(false); }
          return;
        }
      }
      // Reset bypass for next triggers
      bypassCacheRef.current = false;

      setLoading(true);
      setError(null);

      try {
        const query    = buildQuery(lat, lng, radiusMeters);
        const elements = await fetchFromOverpass(query);

        if (cancelled) return;

        const parsed = parseElements(elements, lat, lng, radiusMeters);
        setMosques(parsed);

        if (parsed.length) {
          cacheWrite(lat, lng, parsed);
        }
      } catch (e) {
        if (!cancelled) {
          const isTimeout = e.message === 'overall_timeout' || e.message === 'timeout';
          setError(
            isTimeout
              ? 'Search timed out (slow connection or Overpass API busy). Use "Search on Google Maps" below.'
              : 'Could not reach mosque search service. Try again or use Google Maps.'
          );
        }
        console.error('[useNearbyMosques]', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [location, radiusMeters, tick]);

  // ── 3. Manual refetch ───────────────────────────────────────────────────────
  const refetch = useCallback(() => {
    setMosques([]);
    bypassCacheRef.current = true;
    if (!initialCoords) {
      setLocation(null);
    }
    setError(null);
    setTick((n) => n + 1);
  }, [initialCoords]);

  return { mosques, location, loading, error, refetch };
}
