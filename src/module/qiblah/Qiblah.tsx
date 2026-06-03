import React, { useState, useEffect, useRef, useCallback } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  Navigation,
  MapPin,
  RotateCcw,
  Building2,
  Sunrise,
  Sunset,
  Info,
  ArrowLeft,
  Compass,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { getStoredLastLocation, saveLastLocation } from "@/hooks/useExactLocation";
import { useSharedLocation } from "@/context/useSharedLocation";
import { useLocationCache } from "@/hooks/useLocationCache";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  KAABA_COORDS,
  calculateQiblaBearing,
  getMagneticDeclination,
} from "@/utils/geo";

interface DeviceOrientationEventiOS extends Omit<DeviceOrientationEvent, 'absolute'> {
  requestPermission?: () => Promise<"granted" | "denied">;
  webkitCompassHeading?: number;
  absolute?: boolean;
}

// Calculate distance between two coordinates in km - moved outside component for stability
const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const MOSQUE_SEARCH_RADIUS_METERS = 20000;
const MOSQUE_SEARCH_RADIUS_KM = MOSQUE_SEARCH_RADIUS_METERS / 1000;

type MosqueEntry = {
  name: string;
  address: string;
  distance: string;
  distanceNum: number;
  lat: number;
  lng: number;
};

type OverpassElement = {
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const isLikelyFallbackLocation = (loc: { lat: number; lng: number }) =>
  Math.abs(loc.lat - 21.4225) < 0.1 && Math.abs(loc.lng - 39.8262) < 0.1;

const Qiblah: React.FC = () => {
  const navigate = useNavigate();
  const { location: sharedLocation, refreshLocation } = useSharedLocation();
  const { cacheLocation } = useLocationCache();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const locationFetched = useRef(false);
  const mapInitialized = useRef(false);
  const locationCached = useRef(false);
  const mosquesLoaded = useRef(false);
  const mosquesFetchedForLocation = useRef<{ lat: number; lng: number } | null>(null);
  const deviceHeadingRef = useRef<number>(0);
  const targetHeadingRef = useRef<number>(0);
  const smoothedHeadingRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const watchId = useRef<number | null>(null);
  const userLocationRef = useRef<{ lat: number; lng: number } | null>(null);
  const listenersAdded = useRef(false);
  // DOM refs for direct animation — avoids 60fps React re-renders
  const compassRingRef = useRef<HTMLDivElement | null>(null);
  const compassNeedleRef = useRef<HTMLDivElement | null>(null);
  const turnTextRef = useRef<HTMLParagraphElement | null>(null);
  const facingRingRef = useRef<HTMLDivElement | null>(null);
  const qiblahDirectionRef = useRef<number>(0);
  const cachedExactLocation = sharedLocation ?? getStoredLastLocation();
  const cachedUserLocation = cachedExactLocation
    ? { lat: cachedExactLocation.latitude, lng: cachedExactLocation.longitude }
    : null;

  const [qiblahDirection, setQiblahDirection] = useState<number>(
    cachedUserLocation
      ? calculateQiblaBearing(cachedUserLocation.lat, cachedUserLocation.lng)
      : 0,
  );
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [calibrating, setCalibrating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(cachedUserLocation);
  const [locationName, setLocationName] = useState(
    cachedExactLocation?.city
      ? `${cachedExactLocation.city}, ${cachedExactLocation.country || ""}`.trim()
      : cachedUserLocation
        ? "Cached location"
        : "Locating...",
  );
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [nearbyMosques, setNearbyMosques] = useState<
    MosqueEntry[]
  >([]);
  const [selectedMosque, setSelectedMosque] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const mosqueMapContainer = useRef<HTMLDivElement>(null);
  const mosqueMap = useRef<mapboxgl.Map | null>(null);
  const [loadingMosques, setLoadingMosques] = useState(false);
  const [mosqueSearchStatus, setMosqueSearchStatus] = useState<"idle" | "timeout" | "error" | "empty">("idle");
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [showMosqueMap, setShowMosqueMap] = useState(false);
  const [refreshingMosqueLocation, setRefreshingMosqueLocation] = useState(false);
  const [compassSupported, setCompassSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Calculate Qiblah direction from user location to Kaaba
  const calculateQiblahDirection = useCallback((lat: number, lng: number) => {
    return calculateQiblaBearing(lat, lng);
  }, []);

  // Sync refs with state
  useEffect(() => {
    userLocationRef.current = userLocation;
  }, [userLocation]);

  useEffect(() => {
    qiblahDirectionRef.current = qiblahDirection;
  }, [qiblahDirection]);

  // Throttle deviceHeading display to ~5fps to avoid triggering re-renders on every orientation event
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceHeading(deviceHeadingRef.current);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Smooth animation loop — uses direct DOM manipulation (NO setState) to avoid 60fps React re-renders
  useEffect(() => {
    const animate = () => {
      const target = targetHeadingRef.current;
      const current = smoothedHeadingRef.current;

      let diff = target - current;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;

      const next = (current + diff * 0.12 + 360) % 360;
      smoothedHeadingRef.current = next;

      // Direct DOM updates — zero React re-renders
      if (compassRingRef.current) {
        compassRingRef.current.style.transform = `rotate(${-next}deg)`;
      }
      const compassRot = qiblahDirectionRef.current - next;
      if (compassNeedleRef.current) {
        compassNeedleRef.current.style.transform = `rotate(${compassRot}deg)`;
      }
      const normRot = ((compassRot % 360) + 360) % 360;
      const facing = normRot < 2 || normRot > 358;
      if (facingRingRef.current) {
        facingRingRef.current.style.display = facing ? 'block' : 'none';
      }
      if (turnTextRef.current) {
        if (facing) {
          turnTextRef.current.textContent = '✓ You are facing Qiblah!';
          turnTextRef.current.className = 'text-xs text-emerald-400 font-semibold';
        } else {
          const turn = normRot > 180 ? 360 - normRot : normRot;
          const dir = normRot > 180 ? 'left' : 'right';
          turnTextRef.current.textContent = `Turn ${Math.round(turn)}° ${dir}`;
          turnTextRef.current.className = 'text-xs text-primary-foreground/60';
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Handle device orientation — only update refs (no setState here, display throttled via interval)
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number;
    const extEvent = event as DeviceOrientationEventiOS;

    if (
      "webkitCompassHeading" in event &&
      typeof extEvent.webkitCompassHeading === "number"
    ) {
      heading = extEvent.webkitCompassHeading;
    } else if (
      (event.type === "deviceorientationabsolute" || extEvent.absolute) &&
      event.alpha !== null
    ) {
      heading = 360 - event.alpha;
    } else if (event.alpha !== null) {
      heading = 360 - event.alpha;
      const cachedLoc = userLocationRef.current;
      if (cachedLoc) {
        const declination = getMagneticDeclination(cachedLoc.lat, cachedLoc.lng);
        heading = (heading + declination + 360) % 360;
      }
    } else {
      return;
    }

    deviceHeadingRef.current = heading;
    targetHeadingRef.current = heading;
  }, []);

  // Request compass permission (especially for iOS 13+)
  const requestCompassPermission = useCallback(async () => {
    if (listenersAdded.current) return;

    const DeviceOrientationEventTyped =
      DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;

    if (typeof DeviceOrientationEventTyped.requestPermission === "function") {
      // iOS 13+ requires explicit user gesture
      try {
        const permission =
          await DeviceOrientationEventTyped.requestPermission();
        if (permission === "granted") {
          setPermissionGranted(true);
          window.addEventListener("deviceorientation", handleOrientation, true);
          listenersAdded.current = true;
        } else {
          setCompassSupported(false);
        }
      } catch (error) {
        console.error("Compass permission error:", error);
        setCompassSupported(false);
      }
    } else {
      // Android / Desktop — no permission needed, attach immediately
      setPermissionGranted(true);

      // Try deviceorientationabsolute first (True North on Android Chrome)
      let absoluteFired = false;
      const onAbsolute = (e: DeviceOrientationEvent) => {
        absoluteFired = true;
        handleOrientation(e);
      };

      window.addEventListener("deviceorientationabsolute", onAbsolute, true);

      // Fallback to standard deviceorientation if absolute never fires
      setTimeout(() => {
        if (!absoluteFired) {
          window.addEventListener("deviceorientation", handleOrientation, true);
        }
      }, 500);

      listenersAdded.current = true;

      // If nothing fires at all after 3s, mark as unsupported
      setTimeout(() => {
        if (deviceHeadingRef.current === 0 && !absoluteFired) {
          setCompassSupported(false);
        }
      }, 3000);
    }
  }, [handleOrientation]);

  // Auto-start listener on mount (works for Android; iOS still needs tap)
  useEffect(() => {
    const DeviceOrientationEventTyped =
      DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
    // Only auto-start when requestPermission API is NOT present (non-iOS)
    if (typeof DeviceOrientationEventTyped.requestPermission !== "function") {
      requestCompassPermission();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch user location with watchPosition for continuous updates
  useEffect(() => {
    if (locationFetched.current) return;
    locationFetched.current = true;

    if (sharedLocation) {
      const loc = { lat: sharedLocation.latitude, lng: sharedLocation.longitude };
      const direction = calculateQiblahDirection(loc.lat, loc.lng);
      const roundedDir = Math.round(direction * 100) / 100;
      setUserLocation(loc);
      setQiblahDirection(roundedDir);
      setLocationName(
        sharedLocation.city
          ? `${sharedLocation.city}, ${sharedLocation.country || ""}`.trim()
          : sharedLocation.source === "default"
            ? "Makkah, Saudi Arabia"
            : "Shared location",
      );
      localStorage.setItem("lastQiblahDirection", String(roundedDir));
    }

    const fallbackToIPOrMakkah = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-user-location");
        if (!error && data && data.latitude && data.longitude) {
          const lat = Math.round(data.latitude * 1000000) / 1000000;
          const lng = Math.round(data.longitude * 1000000) / 1000000;
          const loc = { lat, lng };
          setUserLocation(loc);
          const direction = calculateQiblahDirection(lat, lng);
          const roundedDir = Math.round(direction * 100) / 100;
          setQiblahDirection(roundedDir);
          setLocationName(data.city ? `${data.city}, ${data.country}` : "Location detected");
          saveLastLocation({
            latitude: lat,
            longitude: lng,
            city: data.city || "Unknown",
            country: data.country || "Unknown",
            source: "profile",
          });
          localStorage.setItem("lastQiblahDirection", String(roundedDir));
          return;
        }
      } catch (err) {
        console.warn("Failed to fallback to IP location:", err);
      }

      // Final default fallback (Makkah)
      const lat = 21.4224779;
      const lng = 39.8251832;
      const loc = { lat, lng };
      setUserLocation(loc);
      const direction = calculateQiblahDirection(lat, lng);
      const roundedDir = Math.round(direction * 100) / 100;
      setQiblahDirection(roundedDir);
      setLocationName("Makkah, Saudi Arabia");
      saveLastLocation({
        latitude: lat,
        longitude: lng,
        city: "Makkah",
        country: "Saudi Arabia",
        source: "default",
      });
      localStorage.setItem("lastQiblahDirection", String(roundedDir));
    };

    if (!navigator.geolocation) {
      const cached = getStoredLastLocation();
      if (cached) {
        const loc = { lat: cached.latitude, lng: cached.longitude };
        setUserLocation(loc);
        setQiblahDirection(
          parseFloat(
            localStorage.getItem("lastQiblahDirection") ||
              String(calculateQiblaBearing(loc.lat, loc.lng)),
          ),
        );
        setLocationName("Cached location (GPS unavailable)");
      } else {
        fallbackToIPOrMakkah();
      }
      return;
    }

    // Use watchPosition for continuous high-accuracy GPS stream
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log(
          `GPS Update: ${latitude.toFixed(6)}, ${longitude.toFixed(6)} (accuracy: ${accuracy}m)`,
        );

        // Round to 6 decimal places for precision (sub-meter accuracy)
        const precisionLat = Math.round(latitude * 1000000) / 1000000;
        const precisionLng = Math.round(longitude * 1000000) / 1000000;

        setUserLocation({ lat: precisionLat, lng: precisionLng });
        setGpsAccuracy(Math.round(accuracy));

        // Calculate Qiblah with 2-decimal precision
        const direction = calculateQiblahDirection(precisionLat, precisionLng);
        const roundedDir = Math.round(direction * 100) / 100;
        setQiblahDirection(roundedDir);

        // Cache for offline/system use
        saveLastLocation({
          latitude: precisionLat,
          longitude: precisionLng,
          source: "gps",
        });
        localStorage.setItem("lastQiblahDirection", String(roundedDir));

        // Cache to user profile when accuracy is good (< 100m) and not already cached
        if (accuracy < 100 && !locationCached.current) {
          locationCached.current = true;
          cacheLocation({ latitude: precisionLat, longitude: precisionLng });
        }
      },
      (error) => {
        console.warn("GPS watch error:", error.message);
        // Fall back to single getCurrentPosition
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setGpsAccuracy(Math.round(accuracy));
            const direction = calculateQiblahDirection(latitude, longitude);
            const roundedDir = Math.round(direction * 100) / 100;
            setQiblahDirection(roundedDir);
            saveLastLocation({
              latitude,
              longitude,
              source: "gps",
            });
            localStorage.setItem("lastQiblahDirection", String(roundedDir));

            // Cache to profile
            if (!locationCached.current) {
              locationCached.current = true;
              cacheLocation({ latitude, longitude });
            }
          },
          () => {
            const cached = getStoredLastLocation();
            const cachedDirection = localStorage.getItem("lastQiblahDirection");
            if (cached) {
              setUserLocation({ lat: cached.latitude, lng: cached.longitude });
              setLocationName("Last known location");
            } else {
              fallbackToIPOrMakkah();
            }
            if (cachedDirection) {
              setQiblahDirection(parseFloat(cachedDirection));
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 0, // Always get fresh GPS data
      },
    );

    // Cleanup watchPosition on unmount
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [calculateQiblahDirection, cacheLocation, sharedLocation]);

  // Initialize map AFTER location is available
  useEffect(() => {
    if (!userLocation || mapInitialized.current || isOffline) return;
    if (!mapContainer.current) return;

    mapInitialized.current = true;
    let mapInstance: mapboxgl.Map | null = null;

    const initMap = async () => {
      let token = "";
      try {
        const { data, error } =
          await supabase.functions.invoke("get-mapbox-token");
        if (error) throw error;
        token = data.token;
        setMapboxToken(token);
      } catch {
        console.error("Failed to get Mapbox token");
        return;
      }

      mapboxgl.accessToken = token;

      mapInstance = new mapboxgl.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        zoom: 2,
        center: [KAABA_COORDS.lng, KAABA_COORDS.lat],
        pitch: 45,
      });

      map.current = mapInstance;

      new mapboxgl.Marker({ color: "#FFD700" })
        .setLngLat([KAABA_COORDS.lng, KAABA_COORDS.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            "<strong>Al-Masjid al-Haram</strong><br/>The Holy Kaaba",
          ),
        )
        .addTo(mapInstance);

      new mapboxgl.Marker({ color: "#4F46E5" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"),
        )
        .addTo(mapInstance);

      mapInstance.on("load", () => {
        if (mapInstance) {
          mapInstance.addSource("qiblah-line", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [userLocation.lng, userLocation.lat],
                  [KAABA_COORDS.lng, KAABA_COORDS.lat],
                ],
              },
            },
          });

          mapInstance.addLayer({
            id: "qiblah-line-layer",
            type: "line",
            source: "qiblah-line",
            layout: { "line-join": "round", "line-cap": "round" },
            paint: {
              "line-color": "#FFD700",
              "line-width": 3,
              "line-dasharray": [2, 2],
            },
          });

          mapInstance.fitBounds(
            [
              [
                Math.min(userLocation.lng, KAABA_COORDS.lng) - 10,
                Math.min(userLocation.lat, KAABA_COORDS.lat) - 5,
              ],
              [
                Math.max(userLocation.lng, KAABA_COORDS.lng) + 10,
                Math.max(userLocation.lat, KAABA_COORDS.lat) + 5,
              ],
            ],
            { padding: 50 },
          );
        }
      });

      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.lng},${userLocation.lat}.json?access_token=${token}`,
        );
        const data = await response.json();
        if (data.features && data.features.length > 0) {
          setLocationName(
            data.features[0].place_name.split(",").slice(0, 2).join(","),
          );
        }
      } catch {
        setLocationName("Location detected");
      }
    };

    initMap();

    return () => {
      mapInstance?.remove();
    };
  }, [userLocation, isOffline]);

  // Overall cleanup for orientation listeners
  useEffect(() => {
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
    };
  }, [handleOrientation]);

  // Compass rotation and facing are now computed inside the RAF loop via DOM refs
  // These values are only used for the calibrate button handler
  const getCompassRotation = () => qiblahDirectionRef.current - smoothedHeadingRef.current;

  const handleCalibrate = () => {
    setCalibrating(true);
    requestCompassPermission();
    if (userLocation) {
      const direction = calculateQiblahDirection(userLocation.lat, userLocation.lng);
      setQiblahDirection(Math.round(direction * 100) / 100);
    }
    setTimeout(() => setCalibrating(false), 2000);
  };

  // Fetch nearby mosques using OpenStreetMap Overpass API (with cache + mirror fallback)
  const fetchNearbyMosques = useCallback(
    async (location: { lat: number; lng: number }, force = false) => {
      // Guard: skip if already fetching for this same location (within 1km)
      if (!force && mosquesLoaded.current) {
        const prev = mosquesFetchedForLocation.current;
        if (prev) {
          const drift = calculateDistance(prev.lat, prev.lng, location.lat, location.lng);
          if (drift < 1) return; // Same area, don't re-fetch
        } else {
          // If a request was started but no location was recorded yet, avoid duplicate requests until it resolves.
          return;
        }
      }

      setLoadingMosques(true);
      setMosqueSearchStatus("idle");
      mosquesLoaded.current = true;
      mosquesFetchedForLocation.current = location;

      // Cache key rounded to ~1km grid
      const cacheKey = `mosques_${location.lat.toFixed(2)}_${location.lng.toFixed(2)}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as { ts: number; mosques: MosqueEntry[] };
          if (!force && Date.now() - parsed.ts < 24 * 60 * 60 * 1000 && parsed.mosques.length) {
            setNearbyMosques(parsed.mosques);
            setLoadingMosques(false);
            return;
          }
        }
      } catch { /* ignore */ }

      const radius = MOSQUE_SEARCH_RADIUS_METERS;
      const primaryQuery = `
        [out:json][timeout:18];
        (
          nwr["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${location.lat},${location.lng});
          nwr["building"="mosque"](around:${radius},${location.lat},${location.lng});
          nwr["amenity"="mosque"](around:${radius},${location.lat},${location.lng});
          nwr["religion"="muslim"]["name"~"mosque|masjid|juma|jummah|islamic centre|islamic center",i](around:${radius},${location.lat},${location.lng});
        );
        out center tags;
      `;

      const nameFallbackQuery = `
        [out:json][timeout:18];
        (
          nwr["name"~"mosque|masjid|juma|jummah|islamic centre|islamic center",i](around:${radius},${location.lat},${location.lng});
        );
        out center tags;
      `;

      const endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
        "https://overpass.openstreetmap.fr/api/interpreter",
      ];

      const fetchOverpassEndpoint = async (url: string, queryText: string) => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 18000);
        try {
          const response = await fetch(url, {
            method: "POST",
            body: `data=${encodeURIComponent(queryText)}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            signal: controller.signal,
          });

          if (!response.ok) {
            return { elements: [] as OverpassElement[], timedOut: false, failed: true };
          }

          const data = await response.json();
          return {
            elements: Array.isArray(data?.elements) ? (data.elements as OverpassElement[]) : [],
            timedOut: false,
            failed: false,
          };
        } catch (e) {
          const timedOut = e instanceof DOMException && e.name === "AbortError";
          console.warn(`Overpass mirror failed (${url}):`, e);
          return { elements: [] as OverpassElement[], timedOut, failed: !timedOut };
        } finally {
          window.clearTimeout(timeoutId);
        }
      };

      const fetchFromMirrors = async (queryText: string) => {
        const results = await Promise.all(
          endpoints.map((endpoint) => fetchOverpassEndpoint(endpoint, queryText)),
        );
        return {
          elements: results.find((result) => result.elements.length > 0)?.elements ?? [],
          sawTimeout: results.some((result) => result.timedOut),
          sawError: results.some((result) => result.failed),
        };
      };

      let elements: OverpassElement[] = [];
      let sawTimeout = false;
      let sawError = false;

      const primaryResult = await fetchFromMirrors(primaryQuery);
      elements = primaryResult.elements;
      sawTimeout = primaryResult.sawTimeout;
      sawError = primaryResult.sawError;

      if (elements.length === 0) {
        const fallbackResult = await fetchFromMirrors(nameFallbackQuery);
        elements = fallbackResult.elements;
        sawTimeout = sawTimeout || fallbackResult.sawTimeout;
        sawError = sawError || fallbackResult.sawError;
      }

      if (elements.length > 0) {
        const seen = new Set<string>();
        const mosques = elements
          .map((element): MosqueEntry | null => {
            const lat = element.lat ?? element.center?.lat;
            const lng = element.lon ?? element.center?.lon;
            if (typeof lat !== "number" || typeof lng !== "number") return null;
            const distanceKm = calculateDistance(location.lat, location.lng, lat, lng);
            if (distanceKm > MOSQUE_SEARCH_RADIUS_KM) return null;
            const tags = element.tags ?? {};
            const rawName = tags.name || tags["name:en"] || tags["name:ar"] || "";
            const mosqueLike =
              tags.religion === "muslim" ||
              tags.amenity === "mosque" ||
              tags.building === "mosque" ||
              /mosque|masjid|juma|jummah|islamic centre|islamic center/i.test(rawName);
            if (!mosqueLike) return null;
            const name =
              rawName ||
              "Mosque";
            const addressParts = [
              tags["addr:housenumber"],
              tags["addr:street"],
              tags["addr:suburb"],
              tags["addr:city"],
            ].filter(Boolean);
            const address = tags["addr:full"] || addressParts.join(", ") || "Address not available";
            return {
              name,
              address,
              distance: distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`,
              distanceNum: distanceKm,
              lat,
              lng,
            };
          })
          .filter((m): m is MosqueEntry => m !== null)
          .filter((mosque) => {
            const key = `${mosque.lat.toFixed(5)}|${mosque.lng.toFixed(5)}|${mosque.name.toLowerCase()}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

        mosques.sort((a, b) => a.distanceNum - b.distanceNum);
        const top = mosques.slice(0, 20);
        setNearbyMosques(top);
        if (top.length > 0) {
          setMosqueSearchStatus("idle");
          try {
            localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), mosques: top }));
          } catch {
            // Cache writes can fail in private browsing or storage pressure.
          }
        } else {
          setMosqueSearchStatus(sawTimeout || sawError ? "timeout" : "empty");
          mosquesLoaded.current = false;
          mosquesFetchedForLocation.current = null;
        }
      } else {
        setNearbyMosques([]);
        setMosqueSearchStatus(sawTimeout || sawError ? "timeout" : "empty");
        mosquesLoaded.current = false;
        mosquesFetchedForLocation.current = null;
      }

      setLoadingMosques(false);
    },
    [],
  );

  const requestPreciseMosqueLocation = useCallback(async () => {
    setRefreshingMosqueLocation(true);
    setShowMosqueMap(true);
    try {
      const resolved = await refreshLocation({ preferCache: false });
      const nextLocation = { lat: resolved.latitude, lng: resolved.longitude };
      setUserLocation(nextLocation);

      const direction = calculateQiblahDirection(nextLocation.lat, nextLocation.lng);
      const roundedDir = Math.round(direction * 100) / 100;
      setQiblahDirection(roundedDir);
      localStorage.setItem("lastQiblahDirection", String(roundedDir));

      setLocationName(
        resolved.city
          ? `${resolved.city}, ${resolved.country || ""}`.trim()
          : resolved.source === "default"
            ? "Precise location unavailable"
            : "Location detected",
      );

      mosquesLoaded.current = false;
      mosquesFetchedForLocation.current = null;

      if (resolved.source === "default" || isLikelyFallbackLocation(nextLocation)) {
        setNearbyMosques([]);
        setLoadingMosques(false);
        setMosqueSearchStatus("error");
        return;
      }

      await fetchNearbyMosques(nextLocation, true);
    } catch (err) {
      console.warn("Unable to refresh mosque search location:", err);
      setNearbyMosques([]);
      setLoadingMosques(false);
      setMosqueSearchStatus("error");
    } finally {
      setRefreshingMosqueLocation(false);
    }
  }, [calculateQiblahDirection, fetchNearbyMosques, refreshLocation]);

  const openMosqueDialog = () => {
    setShowMosqueMap(true);
    if (!userLocation || isLikelyFallbackLocation(userLocation)) {
      void requestPreciseMosqueLocation();
    }
  };


  const openMosqueInMaps = (lat: number, lng: number, name?: string) => {
    const destination = name ? `${name} ${lat},${lng}` : `${lat},${lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=walking`;
    window.open(url, "_blank");
  };

  const openGoogleMapsSearch = () => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/search/mosque/@${userLocation.lat},${userLocation.lng},12z`,
        "_blank",
      );
    } else {
      window.open(
        "https://www.google.com/maps/search/mosque+near+me",
        "_blank",
      );
    }
  };

  // Handle mosque selection - show map with direction line
  const handleMosqueSelect = useCallback(
    (mosque: { name: string; lat: number; lng: number }) => {
      setSelectedMosque(mosque);

      // Initialize map after a short delay to allow DOM to update
      setTimeout(() => {
        if (!mosqueMapContainer.current || !mapboxToken || !userLocation)
          return;

        // Remove existing map if any
        mosqueMap.current?.remove();

        mapboxgl.accessToken = mapboxToken;

        const newMap = new mapboxgl.Map({
          container: mosqueMapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [
            (userLocation.lng + mosque.lng) / 2,
            (userLocation.lat + mosque.lat) / 2,
          ],
          zoom: 12,
        });

        mosqueMap.current = newMap;

        newMap.on("load", () => {
          // Add user marker
          new mapboxgl.Marker({ color: "#4F46E5" })
            .setLngLat([userLocation.lng, userLocation.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML("<strong>Your Location</strong>"),
            )
            .addTo(newMap);

          // Add mosque marker
          new mapboxgl.Marker({ color: "#10B981" })
            .setLngLat([mosque.lng, mosque.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(`<strong>${mosque.name}</strong>`),
            )
            .addTo(newMap);

          // Add straight line from user to mosque
          newMap.addSource("route-line", {
            type: "geojson",
            data: {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [userLocation.lng, userLocation.lat],
                  [mosque.lng, mosque.lat],
                ],
              },
            },
          });

          newMap.addLayer({
            id: "route-line-layer",
            type: "line",
            source: "route-line",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#10B981",
              "line-width": 4,
              "line-dasharray": [2, 1],
            },
          });

          // Fit bounds to show both points
          const bounds = new mapboxgl.LngLatBounds()
            .extend([userLocation.lng, userLocation.lat])
            .extend([mosque.lng, mosque.lat]);

          newMap.fitBounds(bounds, { padding: 60 });
        });
      }, 100);
    },
    [mapboxToken, userLocation],
  );

  // Load mosques when dialog opens or when real GPS location arrives
  useEffect(() => {
    if (!showMosqueMap || !userLocation) return;

    // If we have a previously-fetched location and it's within 1km of current, skip
    const prev = mosquesFetchedForLocation.current;
    if (prev && !isLikelyFallback(userLocation)) {
      const drift = calculateDistance(prev.lat, prev.lng, userLocation.lat, userLocation.lng);
      if (drift < 1 && nearbyMosques.length > 0) return; // Already have good results
    }

    // If we only have the Makkah fallback, ask the user for a precise location instead of searching Makkah.
    if (isLikelyFallbackLocation(userLocation)) {
      setLoadingMosques(refreshingMosqueLocation);
      if (!refreshingMosqueLocation) {
        setMosqueSearchStatus("error");
      }
      return;
    }

    // Real GPS is available — reset guard and fetch
    mosquesLoaded.current = false;
    fetchNearbyMosques(userLocation);
  }, [showMosqueMap, userLocation, fetchNearbyMosques, nearbyMosques.length, refreshingMosqueLocation]);

  return (
    <MobileLayout>
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Map Background - only show when online */}
        {!isOffline && (
          <div ref={mapContainer} className="absolute inset-0 z-0" />
        )}

        {/* Offline background */}
        {isOffline && (
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-islamic-green/20 via-background to-islamic-gold/10" />
        )}

        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90 z-10" />

        {/* Content */}
        <div className="relative z-20 p-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Offline indicator */}
          {isOffline && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full text-xs">
              <AlertCircle className="w-3 h-3" />
              Offline Mode
            </div>
          )}

          {/* Header with Back Button */}
          <header className="w-full mb-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                    Qiblah Direction
                  </h1>
                  <Dialog open={showInfo} onOpenChange={setShowInfo}>
                    <DialogTrigger asChild>
                      <button className="p-1.5 rounded-full bg-primary/20 hover:bg-primary/30 transition-colors">
                        <Info className="w-4 h-4 text-primary-foreground" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="glass border-primary/20 max-w-sm mx-4">
                      <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">
                          Finding Qiblah - Hadith Guidance
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 text-sm text-primary-foreground/90">
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <p className="font-semibold text-amber-400 mb-1">
                            Precision Tips:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-xs text-primary-foreground/80">
                            <li>Hold phone flat (parallel to ground)</li>
                            <li>Avoid metal cases or magnets</li>
                            <li>If inaccurate, move phone in a "∞" motion</li>
                            <li>Wait for GPS accuracy to improve (±10m)</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <p className="font-semibold text-amber-400 mb-1">
                            From the Sunnah:
                          </p>
                          <p className="italic">
                            "The Prophet ﷺ said: 'What is between the East and
                            West is Qiblah.'"
                          </p>
                          <p className="text-xs text-primary-foreground/60 mt-1">
                            — Sunan Ibn Majah
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="font-semibold text-amber-400">
                            How to use:
                          </p>
                          <ul className="list-disc list-inside space-y-1 text-primary-foreground/80">
                            <li>Hold your phone flat and level</li>
                            <li>The compass will point toward Makkah</li>
                            <li>Rotate yourself until the arrow points up</li>
                            <li>That's your Qiblah direction!</li>
                          </ul>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <p className="italic text-primary-foreground/80">
                            "Allah does not burden a soul beyond that it can
                            bear."
                          </p>
                          <p className="text-xs text-primary-foreground/60 mt-1">
                            — Quran 2:286
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex items-center justify-center gap-1 text-primary-foreground/90 mt-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{locationName}</span>
                </div>
              </div>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>
          </header>

          {/* Compass permission notice — iOS only (requires explicit user gesture) */}
          {!permissionGranted &&
            typeof (
              DeviceOrientationEvent as unknown as DeviceOrientationEventiOS
            ).requestPermission === "function" && (
              <button
                onClick={requestCompassPermission}
                className="mb-4 flex items-center gap-2 px-4 py-2 bg-islamic-gold/20 border border-islamic-gold/30 rounded-xl text-sm text-islamic-gold animate-pulse"
              >
                <Compass className="w-4 h-4" />
                Tap to enable compass (iOS)
              </button>
            )}

          {/* Sun Direction Indicators */}
          <div className="flex justify-between w-full max-w-xs mb-4 animate-fade-in">
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-amber-500/30">
              <Sunrise className="w-5 h-5 text-amber-400" />
              <div className="text-xs">
                <p className="text-primary-foreground/60">Sunrise</p>
                <p className="font-semibold text-amber-400">East (90°)</p>
              </div>
            </div>
            <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 border border-orange-500/30">
              <Sunset className="w-5 h-5 text-orange-400" />
              <div className="text-xs">
                <p className="text-primary-foreground/60">Sunset</p>
                <p className="font-semibold text-orange-400">West (270°)</p>
              </div>
            </div>
          </div>

          {/* Redesigned Compass Container */}
          <div className="relative animate-scale-in my-8">
            {/* Outer Ring with Cardinal Points and Degree Markings */}
            <div
              ref={compassRingRef}
              className="w-72 h-72 rounded-full glass border-4 border-islamic-gold/30 flex items-center justify-center shadow-2xl relative z-10"
              style={{ willChange: "transform" }}
            >
              {/* Dial with Map Background */}
              <div className="absolute inset-2 rounded-full overflow-hidden border border-primary/20 bg-emerald-500/5">
                {/* Stylized Map Pattern */}
                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M10 10h80v80H10z' fill='none' stroke='%2310b981' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%2310b981' stroke-width='0.5'/%3E%3Cpath d='M10 50h80M50 10v80' stroke='%2310b981' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")`,
                    backgroundSize: "100% 100%",
                  }}
                />
              </div>

              {/* Cardinal Points */}
              <div className="absolute inset-0 p-4 font-bold">
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-lg text-emerald-500">
                  N
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-lg text-primary-foreground/60">
                  S
                </span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-lg text-primary-foreground/60">
                  W
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-lg text-primary-foreground/60">
                  E
                </span>
              </div>

              {/* Degree Markings */}
              {[...Array(72)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute left-1/2 ${i % 9 === 0 ? "w-0.5 h-6 bg-islamic-gold/60" : i % 3 === 0 ? "w-px h-3 bg-primary-foreground/40" : "w-px h-1.5 bg-primary-foreground/20"}`}
                  style={{
                    transform: `translateX(-50%) rotate(${i * 5}deg)`,
                    transformOrigin: "50% 140px",
                    top: "4px",
                  }}
                />
              ))}
            </div>

            {/* Free-Moving Needle with Qiblah Arrow */}
            <div
              ref={compassNeedleRef}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{ willChange: "transform" }}
            >
              <div className="relative w-12 h-64 flex flex-col items-center justify-center">
                {/* Needle Shape */}
                <svg
                  width="40"
                  height="240"
                  viewBox="0 0 40 240"
                  className="drop-shadow-xl overflow-visible"
                >
                  {/* Bottom half (Blue - South) */}
                  <path d="M20 120 L5 120 L20 230 L35 120 Z" fill="#3b82f6" />
                  {/* Top half (Red - North/Qiblah) */}
                  <path d="M20 120 L5 120 L20 10 L35 120 Z" fill="#ef4444" />
                  {/* Center hub */}
                  <circle
                    cx="20"
                    cy="120"
                    r="4"
                    fill="white"
                    stroke="#1f2937"
                    strokeWidth="2"
                  />
                </svg>

                {/* Kaaba Icon at the tip of the Red needle */}
                <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 transform">
                  <div className="w-10 h-10 bg-[#121212] rounded-lg flex items-center justify-center shadow-xl border border-amber-500/30">
                    <span className="text-xl">🕋</span>
                  </div>
                  {/* Arrow Pointing UP */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                    <Navigation className="w-6 h-6 text-emerald-400 fill-emerald-400 drop-shadow-glow" />
                  </div>
                </div>
              </div>
            </div>

            {/* Checkmark indicator for being on target — visibility toggled via ref in RAF */}
            <div
              ref={facingRingRef}
              className="absolute -inset-4 rounded-full border-4 border-emerald-400/50 animate-pulse z-0"
              style={{ display: 'none' }}
            />

            {/* Calibrating Indicator */}
            {calibrating && (
              <div className="absolute inset-0 flex items-center justify-center z-30">
                <div className="bg-card/90 backdrop-blur-md rounded-2xl px-6 py-4 shadow-xl border border-primary/20 text-center animate-in zoom-in-95">
                  <RotateCcw className="w-8 h-8 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">
                    Calibrating Precision
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Move phone in figure-8 motion
                  </p>
                </div>
              </div>
            )}

            {/* Compass not supported warning */}
            {!compassSupported && permissionGranted && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                Manual compass - rotate phone to align
              </div>
            )}
          </div>

          {/* Direction Info */}
          <div className="mt-4 text-center glass rounded-3xl p-4 w-full max-w-xs shadow-card border border-primary/20 animate-slide-up backdrop-blur-md">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs text-primary-foreground/60">
                  Your Heading
                </p>
                <p className="text-lg font-bold text-primary-foreground">
                  {Math.round(deviceHeading)}°
                </p>
              </div>
              <div className="w-px h-8 bg-primary/30" />
              <div>
                <p className="text-xs text-primary-foreground/60">Qiblah</p>
                <p className="text-lg font-bold bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">
                  {qiblahDirection}°
                </p>
              </div>
              <div className="w-px h-8 bg-primary/30" />
              <div>
                <p className="text-xs text-primary-foreground/60">GPS</p>
                <p
                  className={`text-lg font-bold ${gpsAccuracy && gpsAccuracy < 10 ? "text-emerald-400" : gpsAccuracy && gpsAccuracy < 50 ? "text-amber-400" : "text-red-400"}`}
                >
                  ±{gpsAccuracy || "--"}m
                </p>
              </div>
            </div>
            {/* Turn text is updated directly via ref in the RAF loop — no re-render needed */}
            <p ref={turnTextRef} className="text-xs text-primary-foreground/60">
              Calculating direction...
            </p>
          </div>

          {/* Action Buttons */}
          <div
            className="flex gap-3 mt-4 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl shadow-lg text-white font-medium hover:scale-105 transition-transform disabled:opacity-50"
            >
              <RotateCcw
                className={`w-5 h-5 ${calibrating ? "animate-spin" : ""}`}
              />
              {calibrating ? "Calibrating..." : "Calibrate"}
            </button>

            {!isOffline && (
              <button
                onClick={openMosqueDialog}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg text-white font-medium hover:scale-105 transition-transform"
              >
                <Building2 className="w-5 h-5" />
                Mosque Near Me
              </button>
            )}
          </div>

          {/* Mosque Map Dialog */}
          <Dialog
            open={showMosqueMap}
            onOpenChange={(open) => {
              setShowMosqueMap(open);
              if (!open) {
                setSelectedMosque(null);
                mosqueMap.current?.remove();
                mosqueMap.current = null;
              }
            }}
          >
            <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-hidden border-primary/20">
              <DialogHeader className="pb-2">
                <DialogTitle className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  {selectedMosque ? selectedMosque.name : "Mosques Near You"}
                </DialogTitle>
              </DialogHeader>

              {selectedMosque ? (
                <div className="space-y-3">
                  {/* In-app map with direction line — only when Mapbox token available */}
                  {mapboxToken ? (
                    <div
                      ref={mosqueMapContainer}
                      className="w-full h-64 rounded-xl overflow-hidden border border-primary/20"
                    />
                  ) : (
                    <div className="w-full h-32 rounded-xl border border-primary/20 bg-muted/30 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <MapPin className="w-8 h-8 opacity-40" />
                      <p className="text-xs">Map preview unavailable</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedMosque(null);
                        mosqueMap.current?.remove();
                        mosqueMap.current = null;
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-muted rounded-xl font-medium hover:bg-muted/80 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to List
                    </button>
                    <button
                      onClick={() =>
                        openMosqueInMaps(
                          selectedMosque.lat,
                          selectedMosque.lng,
                          selectedMosque.name,
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {loadingMosques ? (
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        <p className="mt-3 text-sm text-muted-foreground">
                          {refreshingMosqueLocation ? "Getting your precise location..." : "Searching mosques within 20km..."}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Results are sorted by distance from your current location.
                        </p>
                      </div>
                    ) : nearbyMosques.length > 0 ? (
                      nearbyMosques.map((mosque, index) => (
                        <button
                          key={index}
                          onClick={() => handleMosqueSelect(mosque)}
                          className="w-full p-3 bg-muted/50 hover:bg-muted rounded-xl text-left transition-colors group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground truncate">
                                {mosque.name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {mosque.address}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-emerald-500 font-medium">
                                {mosque.distance}
                              </span>
                              <MapPin className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Building2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {mosqueSearchStatus === "timeout"
                            ? "Mosque map data is taking too long"
                            : mosqueSearchStatus === "error"
                              ? "Precise location is needed to find nearby mosques"
                            : "No mosques found nearby"}
                        </p>
                        <p className="text-xs mt-1">
                          Search uses a 20km radius from your actual location
                        </p>
                        <button
                          onClick={requestPreciseMosqueLocation}
                          disabled={refreshingMosqueLocation}
                          className="mt-4 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition-colors disabled:opacity-60"
                        >
                          {refreshingMosqueLocation ? "Checking location..." : "Use precise location"}
                        </button>
                        <button
                          onClick={() => {
                            if (userLocation) {
                              mosquesLoaded.current = false;
                              mosquesFetchedForLocation.current = null;
                              fetchNearbyMosques(userLocation, true);
                            }
                          }}
                          className="mt-2 px-4 py-2 rounded-xl bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                        >
                          Try again
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={openGoogleMapsSearch}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl text-white font-medium hover:scale-[1.02] transition-transform"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search in Google Maps
                  </button>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Instructions */}
          <p
            className="mt-4 text-xs text-primary-foreground/70 text-center max-w-xs animate-fade-in backdrop-blur-sm bg-background/30 rounded-xl p-2"
            style={{ animationDelay: "0.2s" }}
          >
            Hold your phone flat. The compass arrow points toward Makkah. Rotate
            until the arrow points straight up.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Qiblah;
