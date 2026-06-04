import React from 'react';
import {
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
  Navigation,
  ExternalLink,
  Building2,
  Search,
} from 'lucide-react';
import useNearbyMosques from '../../hooks/useNearbyMosques';

const RADIUS_M = 20000;

/** Format metres → "350 m" or "2.4 km" */
const fmtDist = (m) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

/** Open Google Maps mosque search centred on user coords */
const openGoogleMapsSearch = (lat, lng) => {
  const url = lat && lng
    ? `https://www.google.com/maps/search/mosque/@${lat},${lng},14z`
    : 'https://www.google.com/maps/search/mosque+near+me';
  window.open(url, '_blank');
};

/** Open the mosque in the device's native map app */
const openInMaps = (name, lat, lng) => {
  // iOS prefers Apple Maps; Android / desktop uses Google Maps
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    window.open(
      `maps://maps.apple.com/?q=${encodeURIComponent(name)}&ll=${lat},${lng}`,
      '_blank'
    );
  } else {
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${lat},${lng}`,
      '_blank'
    );
  }
};

export default function MosqueNearMe({ userCoords = null }) {
  const { mosques, location, loading, error, refetch } =
    useNearbyMosques(RADIUS_M, userCoords);

  // ── Loading — no location yet ──────────────────────────────────────────────
  if (loading && !location) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-emerald-500 animate-spin" />
        </div>
        <p className="font-semibold text-base">Acquiring your location…</p>
        <p className="text-xs text-muted-foreground max-w-[220px]">
          Allow location access when prompted by your browser.
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && !mosques.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <p className="font-semibold text-base">Could not load mosques</p>
        <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
          {error}
        </p>
        <div className="flex flex-col gap-2 mt-1 w-full max-w-[200px]">
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-emerald-500/10 border border-emerald-500/30 text-emerald-500
              text-sm font-medium hover:bg-emerald-500/20 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <button
            onClick={() => openGoogleMapsSearch(location?.latitude, location?.longitude)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-blue-500/10 border border-blue-500/30 text-blue-500
              text-sm font-medium hover:bg-blue-500/20 transition-colors"
          >
            <Search className="w-4 h-4" />
            Search on Google Maps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div>
          <h2 className="font-bold text-base flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-500" />
            Mosques Near You
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Within 20 km
            {loading && location
              ? ' · Searching…'
              : ` · ${mosques.length} found`}
          </p>
        </div>

        <button
          onClick={refetch}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl
            border border-border/40 hover:bg-accent transition-colors
            disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
          )}
          Refresh
        </button>
      </div>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Soft refresh banner while list is already visible */}
        {loading && location && (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/5
            border-b border-emerald-500/10 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
            Updating results…
          </div>
        )}

        {/* Empty state */}
        {!loading && mosques.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center gap-3
            py-10 px-6 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
              <MapPin className="w-7 h-7 text-muted-foreground opacity-50" />
            </div>
            <p className="font-semibold text-base">No Mosques Found</p>
            <p className="text-xs text-muted-foreground max-w-[220px]">
              None found within 20 km. Try Google Maps for a broader search.
            </p>
            <div className="flex flex-col gap-2 mt-1 w-full max-w-[200px]">
              <button
                onClick={refetch}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                  bg-emerald-500/10 border border-emerald-500/30 text-emerald-500
                  text-sm font-medium hover:bg-emerald-500/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Search Again
              </button>
              <button
                onClick={() => openGoogleMapsSearch(location?.latitude, location?.longitude)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                  bg-blue-500/10 border border-blue-500/30 text-blue-500
                  text-sm font-medium hover:bg-blue-500/20 transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                Open Google Maps
              </button>
            </div>
          </div>
        )}

        {/* Mosque cards */}
        <div className="p-3 space-y-2">
          {mosques.map((mosque, idx) => (
            <button
              key={mosque.id ?? `${mosque.lat}-${mosque.lng}-${idx}`}
              onClick={() => openInMaps(mosque.name, mosque.lat, mosque.lng)}
              className="w-full text-left flex items-start gap-3 p-3.5 rounded-2xl
                border border-border/40 bg-card hover:bg-accent/40
                hover:border-emerald-500/30 transition-all duration-150
                active:scale-[0.98] group"
            >
              {/* Distance badge / icon */}
              <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10
                flex items-center justify-center mt-0.5">
                <MapPin className="w-5 h-5 text-emerald-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug truncate pr-1">
                  {mosque.name}
                </p>

                {mosque.address ? (
                  <p className="text-[11px] text-muted-foreground mt-0.5
                    line-clamp-1 leading-relaxed">
                    {mosque.address}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5 italic">
                    Address not available
                  </p>
                )}

                <div className="flex items-center justify-between mt-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px]
                    font-bold text-emerald-600 bg-emerald-500/10
                    px-2 py-0.5 rounded-full">
                    <Navigation className="w-2.5 h-2.5" />
                    {fmtDist(mosque.distance)} away
                  </span>
                  <span className="text-[10px] text-muted-foreground/60
                    flex items-center gap-0.5 group-hover:text-blue-500
                    transition-colors">
                    Open in Maps
                    <ExternalLink className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom padding so last card isn't flush against safe-area */}
        {mosques.length > 0 && <div className="h-4" />}
      </div>
    </div>
  );
}
