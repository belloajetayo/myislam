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
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
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

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<"granted" | "denied">;
}

const Qiblah: React.FC = () => {
  const navigate = useNavigate();
  const { cacheLocation } = useLocationCache();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const locationFetched = useRef(false);
  const mapInitialized = useRef(false);
  const locationCached = useRef(false);
  const mosquesLoaded = useRef(false);
  const deviceHeadingRef = useRef<number>(0);
  const watchId = useRef<number | null>(null);
  const [qiblahDirection, setQiblahDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [smoothedHeading, setSmoothedHeading] = useState<number>(0);
  const [calibrating, setCalibrating] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locationName, setLocationName] = useState("Locating...");
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [nearbyMosques, setNearbyMosques] = useState<
    Array<{
      name: string;
      address: string;
      distance: string;
      distanceNum: number;
      lat: number;
      lng: number;
    }>
  >([]);
  const [selectedMosque, setSelectedMosque] = useState<{
    name: string;
    lat: number;
    lng: number;
  } | null>(null);
  const mosqueMapContainer = useRef<HTMLDivElement>(null);
  const mosqueMap = useRef<mapboxgl.Map | null>(null);
  const [loadingMosques, setLoadingMosques] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [showInfo, setShowInfo] = useState(false);
  const [showMosqueMap, setShowMosqueMap] = useState(false);
  const [compassSupported, setCompassSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Calculate Qiblah direction from user location to Kaaba
  const calculateQiblahDirection = useCallback((lat: number, lng: number) => {
    return calculateQiblaBearing(lat, lng);
  }, []);

  // Handle device orientation for compass with smoothing
  const handleOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      let heading: number;
      let isTrueNorth = false;

      // 1. Best: absolute orientation event (Android/Chrome)
      if (event.type === "deviceorientationabsolute" && event.alpha !== null) {
        heading = 360 - event.alpha;
        isTrueNorth = true;
      }
      // 2. iOS True North
      else if (
        "webkitCompassHeading" in event &&
        typeof (event as any).webkitCompassHeading === "number"
      ) {
        heading = (event as any).webkitCompassHeading;
        isTrueNorth = true;
      }
      // 3. Fallback: standard alpha with magnetic declination correction
      else if (event.alpha !== null) {
        heading = 360 - event.alpha;
        // Apply correction if location is available
        if (userLocation) {
          const declination = getMagneticDeclination(
            userLocation.lat,
            userLocation.lng,
          );
          heading = (heading + declination + 360) % 360;
        }
      } else {
        return;
      }

      deviceHeadingRef.current = heading;
      setDeviceHeading(heading);

      // Apply damping for smooth needle movement
      setSmoothedHeading((prev) => {
        const diff = heading - prev;
        let normalizedDiff = diff;
        if (diff > 180) normalizedDiff = diff - 360;
        if (diff < -180) normalizedDiff = diff + 360;
        return (prev + normalizedDiff * 0.2 + 360) % 360;
      });
    },
    [userLocation],
  );

  // Request compass permission (especially for iOS 13+)
  const requestCompassPermission = useCallback(async () => {
    const DeviceOrientationEventTyped =
      DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;

    if (typeof DeviceOrientationEventTyped.requestPermission === "function") {
      try {
        const permission =
          await DeviceOrientationEventTyped.requestPermission();
        if (permission === "granted") {
          setPermissionGranted(true);
          window.addEventListener("deviceorientation", handleOrientation, true);
        } else {
          setCompassSupported(false);
        }
      } catch (error) {
        console.error("Compass permission error:", error);
        setCompassSupported(false);
      }
    } else {
      setPermissionGranted(true);
      // Try absolute first for Android/Chrome
      window.addEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
      // Also add standard as fallback
      window.addEventListener("deviceorientation", handleOrientation, true);

      setTimeout(() => {
        if (deviceHeadingRef.current === 0) {
          setCompassSupported(false);
        }
      }, 3000);
    }
  }, [handleOrientation]);

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

    if (!navigator.geolocation) {
      const cached = localStorage.getItem("lastLocation");
      if (cached) {
        const loc = JSON.parse(cached);
        setUserLocation(loc);
        setQiblahDirection(
          parseInt(localStorage.getItem("lastQiblahDirection") || "0"),
        );
        setLocationName("Cached location (GPS unavailable)");
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
        setQiblahDirection(Math.round(direction * 100) / 100);

        // Cache for offline use
        localStorage.setItem(
          "lastLocation",
          JSON.stringify({ lat: precisionLat, lng: precisionLng }),
        );
        localStorage.setItem(
          "lastQiblahDirection",
          String(Math.round(direction * 100) / 100),
        );

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
            setQiblahDirection(Math.round(direction * 100) / 100);
            localStorage.setItem(
              "lastLocation",
              JSON.stringify({ lat: latitude, lng: longitude }),
            );
            localStorage.setItem(
              "lastQiblahDirection",
              String(Math.round(direction)),
            );

            // Cache to profile
            if (!locationCached.current) {
              locationCached.current = true;
              cacheLocation({ latitude, longitude });
            }
          },
          () => {
            const cached = localStorage.getItem("lastLocation");
            const cachedDirection = localStorage.getItem("lastQiblahDirection");
            if (cached) {
              setUserLocation(JSON.parse(cached));
              setLocationName("Last known location");
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
  }, [calculateQiblahDirection, cacheLocation]);

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
      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener(
        "deviceorientationabsolute",
        handleOrientation,
        true,
      );
    };
  }, [userLocation, isOffline, handleOrientation]);

  // Calculate the rotation needed for the compass needle
  // The needle should point toward Qiblah relative to the device's current heading
  // Use smoothed heading for butter-smooth animation
  const compassRotation = qiblahDirection - smoothedHeading;

  // Check if facing Qiblah (within ±2 degrees)
  const isFacingQiblah =
    Math.abs(compassRotation % 360) < 2 ||
    Math.abs(compassRotation % 360) > 358;

  const handleCalibrate = () => {
    setCalibrating(true);
    requestCompassPermission();

    if (userLocation) {
      const direction = calculateQiblahDirection(
        userLocation.lat,
        userLocation.lng,
      );
      setQiblahDirection(Math.round(direction * 100) / 100);
    }

    setTimeout(() => {
      setCalibrating(false);
    }, 2000);
  };

  // Fetch nearby mosques using OpenStreetMap Overpass API for actual mosque POIs
  const fetchNearbyMosques = useCallback(
    async (location: { lat: number; lng: number }) => {
      if (mosquesLoaded.current || loadingMosques) return;

      setLoadingMosques(true);
      mosquesLoaded.current = true;

      try {
        // Use Overpass API to find actual mosques within 20km radius
        const radius = 20000; // 20km in meters
        const query = `
        [out:json][timeout:25];
        (
          node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${location.lat},${location.lng});
          way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${location.lat},${location.lng});
          node["building"="mosque"](around:${radius},${location.lat},${location.lng});
          way["building"="mosque"](around:${radius},${location.lat},${location.lng});
        );
        out center body;
      `;

        const response = await fetch(
          "https://overpass-api.de/api/interpreter",
          {
            method: "POST",
            body: `data=${encodeURIComponent(query)}`,
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          },
        );

        const data = await response.json();

        if (data.elements && data.elements.length > 0) {
          const mosques = data.elements
            .map((element: any) => {
              // Get coordinates (nodes have lat/lon directly, ways have center)
              const lat = element.lat || element.center?.lat;
              const lng = element.lon || element.center?.lon;

              if (!lat || !lng) return null;

              const distanceKm = calculateDistance(
                location.lat,
                location.lng,
                lat,
                lng,
              );
              const name =
                element.tags?.name ||
                element.tags?.["name:en"] ||
                element.tags?.["name:ar"] ||
                "Mosque";
              const address = element.tags?.["addr:street"]
                ? `${element.tags?.["addr:street"]}, ${element.tags?.["addr:city"] || ""}`
                : element.tags?.["addr:full"] || "Address not available";

              return {
                name,
                address,
                distance:
                  distanceKm < 1
                    ? `${Math.round(distanceKm * 1000)}m`
                    : `${distanceKm.toFixed(1)}km`,
                distanceNum: distanceKm,
                lat,
                lng,
              };
            })
            .filter(Boolean);

          // Sort by distance and limit to 10
          mosques.sort((a: any, b: any) => a.distanceNum - b.distanceNum);
          setNearbyMosques(mosques.slice(0, 10));
        } else {
          setNearbyMosques([]);
        }
      } catch (error) {
        console.error("Failed to fetch mosques:", error);
        setNearbyMosques([]);
        mosquesLoaded.current = false; // Allow retry on error
      } finally {
        setLoadingMosques(false);
      }
    },
    [loadingMosques],
  );

  // Calculate distance between two coordinates in km
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

  const openMosqueInMaps = (lat: number, lng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(name)}`;
    window.open(url, "_blank");
  };

  const openGoogleMapsSearch = () => {
    if (userLocation) {
      window.open(
        `https://www.google.com/maps/search/mosque/@${userLocation.lat},${userLocation.lng},14z`,
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

  // Load mosques when dialog opens (only once)
  useEffect(() => {
    if (showMosqueMap && userLocation && !mosquesLoaded.current) {
      fetchNearbyMosques(userLocation);
    }
  }, [showMosqueMap, userLocation, fetchNearbyMosques]);

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
                className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
              >
                <ArrowLeft className="w-5 h-5 text-primary-foreground" />
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

          {/* Compass permission notice */}
          {!permissionGranted && (
            <button
              onClick={requestCompassPermission}
              className="mb-4 flex items-center gap-2 px-4 py-2 bg-islamic-gold/20 border border-islamic-gold/30 rounded-xl text-sm text-islamic-gold animate-pulse"
            >
              <Compass className="w-4 h-4" />
              Tap to enable live compass
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

          {/* Compass Container */}
          <div className="relative animate-scale-in">
            {/* Outer Ring - rotates with device using smoothed heading */}
            <div
              className="w-64 h-64 rounded-full glass border-2 border-primary/40 flex items-center justify-center shadow-glow backdrop-blur-md"
              style={{
                transform: `rotate(${-smoothedHeading}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              {/* Compass Markings */}
              <div className="absolute inset-4 rounded-full border border-primary/30">
                {/* Cardinal Points */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500">
                  N
                </span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-primary-foreground/60">
                  S
                </span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">
                  W
                </span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">
                  E
                </span>

                {/* Degree Markings */}
                {[...Array(36)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute left-1/2 ${i % 3 === 0 ? "w-0.5 h-4 bg-primary-foreground/50" : "w-px h-2 bg-primary-foreground/30"}`}
                    style={{
                      transform: `translateX(-50%) rotate(${i * 10}deg)`,
                      transformOrigin: "50% 110px",
                      top: "4px",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Inner Circle with Qiblah Arrow - points to Qiblah */}
            <div
              className={`absolute inset-0 flex items-center justify-center ${calibrating ? "animate-pulse" : ""}`}
            >
              <div
                className={`w-40 h-40 rounded-full shadow-lg flex items-center justify-center ${
                  isFacingQiblah
                    ? "bg-gradient-to-br from-emerald-500/90 to-teal-600/90 ring-4 ring-emerald-400/50"
                    : "bg-gradient-to-br from-amber-500/90 to-purple-600/90"
                }`}
                style={{
                  transform: `rotate(${compassRotation}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* Kaaba Icon / Arrow */}
                <div className="relative">
                  <div className="w-14 h-14 bg-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-6">
                    <span className="text-2xl">🕋</span>
                  </div>
                  {/* Arrow pointing up (towards Kaaba) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                    <Navigation className="w-7 h-7 text-primary-foreground fill-primary-foreground drop-shadow-lg" />
                  </div>
                </div>
              </div>
            </div>

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
            <p
              className={`text-xs ${isFacingQiblah ? "text-emerald-400 font-semibold" : "text-primary-foreground/60"}`}
            >
              {isFacingQiblah
                ? "✓ You are facing Qiblah!"
                : compassRotation > 0
                  ? `Turn ${Math.round(Math.abs(compassRotation))}° right`
                  : `Turn ${Math.round(Math.abs(compassRotation))}° left`}
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
                onClick={() => setShowMosqueMap(true)}
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
                  {/* In-app map with direction line */}
                  <div
                    ref={mosqueMapContainer}
                    className="w-full h-64 rounded-xl overflow-hidden border border-primary/20"
                  />
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
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
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
                        <p className="text-sm">No mosques found nearby</p>
                        <p className="text-xs mt-1">
                          Try searching in Google Maps
                        </p>
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
