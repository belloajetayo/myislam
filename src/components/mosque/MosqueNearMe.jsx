import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Loader2,
  RefreshCw,
  AlertCircle,
  Navigation,
  ExternalLink,
  Building2,
  Search,
  Car,
  Clock,
  CheckCircle2,
  ChevronRight,
  Map as MapIcon,
  List as ListIcon,
  Sparkles,
  Phone,
  Globe,
  Share2,
} from 'lucide-react';
import useNearbyMosques from '../../hooks/useNearbyMosques';
import { usePrayerTimes } from '../../hooks/usePrayerTimes';

const RADIUS_M = 20000;

/** Format metres → "350 m" or "2.4 km" */
const fmtDist = (m) =>
  m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;

/** Calculate travel time in minutes */
const getTravelMinutes = (meters) => {
  const km = meters / 1000;
  // Driving average ~30-40 km/h with traffic
  const drivingMins = Math.max(1, Math.round(km * 2.4));
  // Walking average ~4.8 km/h (~12.5 mins per km)
  const walkingMins = Math.max(1, Math.round(km * 12.5));
  return { drivingMins, walkingMins };
};

/** Determine if mosque hosts Friday Jumu'ah prayer */
const getJumuahInfo = (mosque) => {
  const name = (mosque.name || '').toLowerCase();
  const tags = mosque.tags || {};
  const isMusalla = /musalla|prayer\s*room|namaz\s*khana|zawiya|small\s*mosque/i.test(name) || tags.amenity === 'prayer_room';
  const isGrand = /jami|jamia|grand|central|islamic\s*center|markaz|centre/i.test(name);

  if (isMusalla) {
    return {
      holdsJumuah: false,
      label: 'Musalla (Daily Prayers Only)',
      badge: 'Musalla',
      khutbahTime: null,
      desc: 'Usually daily 5 prayers only. Please confirm Jumu\'ah locally.',
      color: 'amber',
    };
  }

  return {
    holdsJumuah: true,
    label: isGrand ? 'Grand Jumu\'ah Mosque' : 'Friday Jumu\'ah Held',
    badge: 'Jumu\'ah ✅',
    khutbahTime: 'Khutbah 1:15 PM • Salah 1:45 PM',
    desc: 'Regular Friday Jumu\'ah congregational prayer and daily 5 prayers.',
    color: 'emerald',
  };
};

/** Open Google Maps turn-by-turn navigation */
const openGoogleMapsDirections = (lat, lng, name = '') => {
  const query = name ? encodeURIComponent(name) : `${lat},${lng}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${query}&travelmode=driving`;
  window.open(url, '_blank');
};

/** Open general Google Maps search around user */
const openGoogleMapsSearch = (lat, lng) => {
  const url = lat && lng
    ? `https://www.google.com/maps/search/mosque/@${lat},${lng},14z`
    : 'https://www.google.com/maps/search/mosque+near+me';
  window.open(url, '_blank');
};

export default function MosqueNearMe({ userCoords = null }) {
  const { mosques, location, loading, error, refetch } =
    useNearbyMosques(RADIUS_M, userCoords);

  const { prayerTimes, currentPrayer, nextPrayer, loading: prayerLoading } = usePrayerTimes();

  const [viewMode, setViewMode] = useState('map'); // 'map' | 'list'
  const [selectedMosqueId, setSelectedMosqueId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'jumuah' | 'walking' | 'close'

  const userLat = userCoords?.lat ?? location?.latitude;
  const userLng = userCoords?.lng ?? location?.longitude;

  // Selected mosque or fallback to first
  const selectedMosque = useMemo(() => {
    if (!mosques.length) return null;
    if (selectedMosqueId) {
      return mosques.find((m) => m.id === selectedMosqueId) || mosques[0];
    }
    return mosques[0];
  }, [mosques, selectedMosqueId]);

  // Is today Friday?
  const isFriday = new Date().getDay() === 5;

  // Calculate minutes until next prayer
  const nextPrayerMinutes = useMemo(() => {
    if (!prayerTimes || !nextPrayer || !prayerTimes[nextPrayer]) return null;
    const clean = prayerTimes[nextPrayer].split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target.getTime() < now.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    const diffMs = target.getTime() - now.getTime();
    return Math.max(1, Math.round(diffMs / (60 * 1000)));
  }, [prayerTimes, nextPrayer]);

  // Filtered mosques
  const filteredMosques = useMemo(() => {
    let list = mosques;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.address && m.address.toLowerCase().includes(q))
      );
    }

    if (activeFilter === 'jumuah') {
      list = list.filter((m) => getJumuahInfo(m).holdsJumuah);
    } else if (activeFilter === 'walking') {
      list = list.filter((m) => getTravelMinutes(m.distance).walkingMins <= 20);
    } else if (activeFilter === 'close') {
      list = list.filter((m) => m.distance <= 3000);
    }

    return list;
  }, [mosques, searchQuery, activeFilter]);

  // Google Map Embed URL
  const googleMapEmbedUrl = useMemo(() => {
    if (selectedMosque) {
      const query = encodeURIComponent(`${selectedMosque.name}, ${selectedMosque.address || ''}`);
      return `https://maps.google.com/maps?q=${query}&ll=${selectedMosque.lat},${selectedMosque.lng}&z=16&output=embed`;
    }
    if (userLat && userLng) {
      return `https://maps.google.com/maps?q=mosques&ll=${userLat},${userLng}&z=14&output=embed`;
    }
    return `https://maps.google.com/maps?q=mosque+near+me&output=embed`;
  }, [selectedMosque, userLat, userLng]);

  // ── Loading state ─────────────────────────────────────────────────────────────
  if (loading && !location) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 px-6 text-center h-full">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center animate-pulse">
          <Loader2 className="w-7 h-7 text-emerald-600 animate-spin" />
        </div>
        <p className="font-bold text-base text-foreground">Locating Mosques Near You…</p>
        <p className="text-xs text-muted-foreground max-w-[240px]">
          Acquiring your location and finding working Google Maps of nearby masjids.
        </p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (error && !mosques.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-6 text-center h-full">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="w-7 h-7 text-rose-500" />
        </div>
        <p className="font-bold text-base text-foreground">Could not load local mosques</p>
        <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed">
          {error}
        </p>
        <div className="flex flex-col gap-2 mt-2 w-full max-w-[220px]">
          <button
            onClick={refetch}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-emerald-600 text-white text-xs font-bold shadow-soft hover:bg-emerald-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Try Again
          </button>
          <button
            onClick={() => openGoogleMapsSearch(userLat, userLng)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
              bg-blue-600 text-white text-xs font-bold shadow-soft hover:bg-blue-700 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            Search on Google Maps
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* ── TOP HEADER WITH VIEW TOGGLES ── */}
      <div className="px-3 py-2.5 border-b border-border/50 bg-card/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5 leading-none">
                Mosques Near You
                {isFriday && (
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Jumu'ah Today 🌙
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {mosques.length} masjids found • Within 20 km
              </p>
            </div>
          </div>

          {/* Map vs List View Switcher */}
          <div className="flex items-center bg-muted/80 p-0.5 rounded-xl border border-border/40">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>List ({filteredMosques.length})</span>
            </button>
          </div>
        </div>

        {/* Next Prayer Banner */}
        {nextPrayer && prayerTimes && (
          <div className="mt-2 py-1.5 px-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span className="text-muted-foreground">
                Next Prayer: <strong className="text-foreground">{nextPrayer} ({prayerTimes[nextPrayer]})</strong>
              </span>
            </div>
            {nextPrayerMinutes !== null && (
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full text-[11px]">
                in {nextPrayerMinutes} mins
              </span>
            )}
          </div>
        )}

        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-0.5 no-scrollbar text-[11px]">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            All Mosques
          </button>
          <button
            onClick={() => setActiveFilter('jumuah')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeFilter === 'jumuah'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            🕌 Jumu'ah Mosques
          </button>
          <button
            onClick={() => setActiveFilter('walking')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeFilter === 'walking'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            🚶 Walkable (&lt;20 min)
          </button>
          <button
            onClick={() => setActiveFilter('close')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors ${
              activeFilter === 'close'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted'
            }`}
          >
            📍 Within 3 km
          </button>
        </div>
      </div>

      {/* ── MAP VIEW MODE ── */}
      {viewMode === 'map' && (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Interactive Working Google Map Embed */}
          <div className="flex-1 relative w-full bg-slate-900 overflow-hidden">
            <iframe
              title="Google Maps Mosques"
              src={googleMapEmbedUrl}
              className="w-full h-full border-0 filter saturate-[1.1]"
              loading="lazy"
              allowFullScreen
            />

            {/* Float Button: Open Full Google Maps app */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={() => {
                  if (selectedMosque) {
                    openGoogleMapsDirections(selectedMosque.lat, selectedMosque.lng, selectedMosque.name);
                  } else {
                    openGoogleMapsSearch(userLat, userLng);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-gray-900/95 text-blue-600 dark:text-blue-400 font-bold text-xs shadow-lg border border-border/40 hover:scale-105 active:scale-95 transition-transform backdrop-blur-md"
              >
                <Navigation className="w-3.5 h-3.5 fill-current" />
                <span>Open Google Maps</span>
              </button>
            </div>
          </div>

          {/* Bottom Card for Selected Mosque */}
          {selectedMosque && (
            <div className="p-3 bg-card border-t border-border/50 shadow-lg flex-shrink-0">
              {(() => {
                const { drivingMins, walkingMins } = getTravelMinutes(selectedMosque.distance);
                const jumuah = getJumuahInfo(selectedMosque);
                const canWalkInTime = nextPrayerMinutes && walkingMins <= nextPrayerMinutes;

                return (
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-foreground truncate">
                            {selectedMosque.name}
                          </h3>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              jumuah.color === 'emerald'
                                ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {jumuah.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {selectedMosque.address || 'Address registered on Google Maps'}
                        </p>
                      </div>

                      <button
                        onClick={() => openGoogleMapsDirections(selectedMosque.lat, selectedMosque.lng, selectedMosque.name)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft flex items-center gap-1 flex-shrink-0 active:scale-95 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Navigate</span>
                      </button>
                    </div>

                    {/* Distance & Travel Time Badges */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20">
                        <Car className="w-4 h-4 text-sky-600 shrink-0" />
                        <div>
                          <p className="font-bold text-sky-700 dark:text-sky-300 leading-none">
                            {drivingMins} min drive
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {fmtDist(selectedMosque.distance)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Navigation className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                            {walkingMins} min walk
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {canWalkInTime ? '🟢 Reach in time' : '🚗 Drive recommended'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Jumu'ah & Prayer Status Row */}
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/40">
                      <span className="text-muted-foreground flex items-center gap-1 truncate">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{jumuah.holdsJumuah ? (jumuah.khutbahTime || 'Friday Jumu\'ah Held') : jumuah.label}</span>
                      </span>

                      {/* Select other mosque pill switcher */}
                      <span className="text-[10px] text-muted-foreground font-semibold flex-shrink-0">
                        {mosques.indexOf(selectedMosque) + 1} of {mosques.length}
                      </span>
                    </div>

                    {/* Horizontal carousel to switch mosques on map */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
                      {filteredMosques.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => setSelectedMosqueId(m.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all border ${
                            selectedMosque.id === m.id
                              ? 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm'
                              : 'bg-muted/60 text-muted-foreground hover:bg-muted border-border/40'
                          }`}
                        >
                          {m.name.length > 20 ? `${m.name.slice(0, 18)}…` : m.name} ({getTravelMinutes(m.distance).drivingMins}m)
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── LIST VIEW MODE ── */}
      {viewMode === 'list' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {/* Search bar */}
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search mosque by name or street…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-card border border-border/60 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {filteredMosques.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Building2 className="w-10 h-10 mx-auto opacity-30 mb-2" />
              <p className="text-xs font-semibold">No mosques matched your criteria</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="mt-2 text-xs text-emerald-600 font-bold hover:underline"
              >
                Reset filters
              </button>
            </div>
          )}

          {filteredMosques.map((mosque, idx) => {
            const { drivingMins, walkingMins } = getTravelMinutes(mosque.distance);
            const jumuah = getJumuahInfo(mosque);
            const isSelected = selectedMosque?.id === mosque.id;

            return (
              <div
                key={mosque.id ?? idx}
                className={`p-3.5 rounded-2xl border transition-all duration-200 bg-card ${
                  isSelected
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-border/50 hover:border-emerald-500/30 hover:shadow-soft'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm text-foreground">
                        {mosque.name}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          jumuah.color === 'emerald'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {jumuah.badge}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {mosque.address || 'Address registered on Google Maps'}
                    </p>
                  </div>

                  {/* Quick directions button */}
                  <button
                    onClick={() => openGoogleMapsDirections(mosque.lat, mosque.lng, mosque.name)}
                    className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-soft flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                    title="Navigate in Google Maps"
                  >
                    <Navigation className="w-4 h-4" />
                  </button>
                </div>

                {/* Distance & Time in Minutes Badges */}
                <div className="flex items-center gap-2 mt-2.5 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-700 dark:text-sky-300 font-bold border border-sky-500/20">
                    <Car className="w-3.5 h-3.5" />
                    {drivingMins} mins drive ({fmtDist(mosque.distance)})
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
                    <Navigation className="w-3.5 h-3.5" />
                    {walkingMins} mins walk
                  </span>
                </div>

                {/* Jumu'ah & Next Prayer Details */}
                <div className="mt-2.5 pt-2 border-t border-border/40 space-y-1 text-xs">
                  {/* Jumu'ah Information */}
                  <div className="flex items-center gap-1.5 text-foreground">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="text-[11px]">
                      <strong>Friday Jumu'ah:</strong> {jumuah.holdsJumuah ? (jumuah.khutbahTime || 'Held with Khutbah') : jumuah.label}
                    </span>
                  </div>

                  {/* Next Prayer Congregation */}
                  {nextPrayer && prayerTimes && (
                    <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>
                        Next Congregation: <strong>{nextPrayer} at {prayerTimes[nextPrayer]}</strong>
                        {nextPrayerMinutes !== null && (
                          <span className="ml-1 text-emerald-600 font-semibold">
                            (in {nextPrayerMinutes}m)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-border/30 text-xs">
                  <button
                    onClick={() => {
                      setSelectedMosqueId(mosque.id);
                      setViewMode('map');
                    }}
                    className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                  >
                    <MapIcon className="w-3.5 h-3.5" />
                    <span>View on Google Map</span>
                  </button>

                  <button
                    onClick={() => openGoogleMapsDirections(mosque.lat, mosque.lng, mosque.name)}
                    className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold hover:underline"
                  >
                    <span>Google Maps Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}

          <div className="h-4" />
        </div>
      )}
    </div>
  );
}
