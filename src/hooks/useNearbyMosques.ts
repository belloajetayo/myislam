import { useState, useEffect, useCallback, useRef } from "react";
import { useSharedLocation } from "@/context/useSharedLocation";

const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.fr/api/interpreter",
];
const MIRROR_TIMEOUT_MS = 6000;
const OVERALL_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface Mosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
}

function haversineM(lat1: number, lng1: number, lat2: number, lng2: number) {
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

function buildQuery(lat: number, lng: number, radius: number) {
  return (
    `[out:json][timeout:6];` +
    `(nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});` +
    `nwr["building"="mosque"](around:${radius},${lat},${lng});` +
    `nwr["amenity"="mosque"](around:${radius},${lat},${lng}););` +
    `out center tags;`
  );
}

function fetchMirror(url: string, query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => { ctrl.abort(); reject(new Error("timeout")); }, MIRROR_TIMEOUT_MS);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: ctrl.signal,
    })
      .then(res => { clearTimeout(timer); if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(json => resolve(Array.isArray(json?.elements) ? json.elements : []))
      .catch(e => { clearTimeout(timer); reject(e); });
  });
}

function raceMirrors(query: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    let failCount = 0;
    MIRRORS.forEach(url => {
      fetchMirror(url, query)
        .then(resolve)
        .catch(() => { failCount++; if (failCount === MIRRORS.length) reject(new Error("all_mirrors_failed")); });
    });
  });
}

function parseElements(elements: any[], userLat: number, userLng: number, radiusM: number): Mosque[] {
  const seen = new Set<string>();
  return elements
    .map(el => {
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lon;
      if (typeof lat !== "number" || typeof lng !== "number") return null;
      const dist = haversineM(userLat, userLng, lat, lng);
      if (dist > radiusM) return null;
      const tags = el.tags ?? {};
      const name = tags.name || tags["name:en"] || tags["name:ar"] || "Mosque";
      const addrParts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean);
      const address = tags["addr:full"] || addrParts.join(", ") || "";
      const key = `${lat.toFixed(4)}|${lng.toFixed(4)}|${name.toLowerCase()}`;
      if (seen.has(key)) return null;
      seen.add(key);
      return { id: key, name, address, lat, lng, distance: dist };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.distance - b.distance)
    .slice(0, 15) as Mosque[];
}

function cacheRead(lat: number, lng: number): Mosque[] | null {
  try {
    const raw = localStorage.getItem(`mnm_${lat.toFixed(2)}_${lng.toFixed(2)}`);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL_MS ? data : null;
  } catch { return null; }
}

function cacheWrite(lat: number, lng: number, data: Mosque[]) {
  try {
    localStorage.setItem(`mnm_${lat.toFixed(2)}_${lng.toFixed(2)}`, JSON.stringify({ ts: Date.now(), data }));
  } catch { /* quota */ }
}

export default function useNearbyMosques(radiusMeters = 20000) {
  const { location } = useSharedLocation();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const bypassCacheRef = useRef(false);

  useEffect(() => {
    if (!location) return;
    let cancelled = false;
    const { latitude: lat, longitude: lng } = location;

    async function run() {
      if (!bypassCacheRef.current) {
        const cached = cacheRead(lat, lng);
        if (cached) {
          if (!cancelled) { setMosques(cached); setLoading(false); }
          return;
        }
      }
      bypassCacheRef.current = false;
      setLoading(true);
      setError(null);
      try {
        const query = buildQuery(lat, lng, radiusMeters);
        const hardTimeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("overall_timeout")), OVERALL_TIMEOUT_MS));
        const elements = await Promise.race([raceMirrors(query), hardTimeout]);
        if (cancelled) return;
        const parsed = parseElements(elements, lat, lng, radiusMeters);
        setMosques(parsed);
        if (parsed.length) cacheWrite(lat, lng, parsed);
      } catch (e: any) {
        if (!cancelled) {
          const isTimeout = e.message === "overall_timeout" || e.message === "timeout";
          setError(isTimeout
            ? "Search timed out. Try again or use Google Maps."
            : "Could not reach mosque search service. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, [location, radiusMeters, tick]);

  const refetch = useCallback(() => {
    setMosques([]);
    bypassCacheRef.current = true;
    setError(null);
    setTick(n => n + 1);
  }, []);

  return { mosques, loading, error, refetch };
}
