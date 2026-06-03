import { supabase } from "@/integrations/supabase/client";

export interface ExactLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  source?: "gps" | "profile" | "ip" | "cache" | "default";
  updatedAt?: number;
}

const LAST_LOCATION_KEY = "lastLocation";
export const LOCATION_UPDATED_EVENT = "myislam-location-updated";

export const DEFAULT_LOCATION: ExactLocation = {
  latitude: 21.4225,
  longitude: 39.8262,
  city: "Makkah",
  country: "Saudi Arabia",
  source: "default",
};

export function getStoredLastLocation(): ExactLocation | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(LAST_LOCATION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const latitude =
      typeof parsed.latitude === "number"
        ? parsed.latitude
        : typeof parsed.lat === "number"
        ? parsed.lat
        : null;
    const longitude =
      typeof parsed.longitude === "number"
        ? parsed.longitude
        : typeof parsed.lng === "number"
        ? parsed.lng
        : null;

    if (latitude === null || longitude === null) {
      return null;
    }

    const looksLikeDefault =
      Math.abs(latitude - DEFAULT_LOCATION.latitude) < 0.001 &&
      Math.abs(longitude - DEFAULT_LOCATION.longitude) < 0.001 &&
      typeof parsed.updatedAt !== "number";

    return {
      latitude,
      longitude,
      city: typeof parsed.city === "string" ? parsed.city : undefined,
      country: typeof parsed.country === "string" ? parsed.country : undefined,
      source: parsed.source === "default" || looksLikeDefault ? "default" : "cache",
      updatedAt: typeof parsed.updatedAt === "number" ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveLastLocation(location: ExactLocation) {
  if (typeof window === "undefined") return;
  if (location.source === "default") return;

  const savedLocation: ExactLocation = {
    ...location,
    latitude: Math.round(location.latitude * 1000000) / 1000000,
    longitude: Math.round(location.longitude * 1000000) / 1000000,
    updatedAt: Date.now(),
  };

  try {
    localStorage.setItem(
      LAST_LOCATION_KEY,
      JSON.stringify(savedLocation),
    );
    window.dispatchEvent(
      new CustomEvent<ExactLocation>(LOCATION_UPDATED_EVENT, {
        detail: savedLocation,
      }),
    );
  } catch {
    // ignore quota errors
  }
}

export async function getBrowserLocation(timeout = 12000): Promise<ExactLocation | null> {
  if (
    typeof window === "undefined" ||
    typeof navigator === "undefined" ||
    !navigator.geolocation ||
    !window.isSecureContext
  ) {
    return null;
  }

  return new Promise<ExactLocation | null>((resolve) => {
    let resolved = false;
    const timer = window.setTimeout(() => {
      if (resolved) return;
      resolved = true;
      resolve(null);
    }, timeout + 1000);

    const onSuccess = (position: GeolocationPosition) => {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(timer);
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: "gps",
      });
    };

    const onError = () => {
      if (resolved) return;
      resolved = true;
      window.clearTimeout(timer);
      resolve(null);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 300000,
    });
  });
}

export async function getServerLocation(): Promise<ExactLocation | null> {
  try {
    const { data, error } = await supabase.functions.invoke("get-user-location");
    if (error) return null;
    if (!data?.latitude || !data?.longitude) return null;

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      city: data.city || "Unknown",
      country: data.country || "Unknown",
      source: "profile",
    };
  } catch {
    return null;
  }
}

export async function resolveExactLocation(opts?: {
  allowBrowser?: boolean;
  preferCache?: boolean;
  timeout?: number;
}): Promise<ExactLocation> {
  const allowBrowser = opts?.allowBrowser ?? true;
  const preferCache = opts?.preferCache ?? true;
  const timeout = opts?.timeout ?? 12000;

  if (preferCache) {
    const cached = getStoredLastLocation();
    if (cached && cached.source !== "default") {
      return cached;
    }
  }

  if (allowBrowser) {
    const browserLocation = await getBrowserLocation(timeout);
    if (browserLocation) {
      saveLastLocation(browserLocation);
      return browserLocation;
    }
  }

  if (!preferCache) {
    const cached = getStoredLastLocation();
    if (cached && cached.source !== "default") {
      return cached;
    }
  }

  const serverLocation = await getServerLocation();
  if (serverLocation) {
    saveLastLocation(serverLocation);
    return serverLocation;
  }

  return DEFAULT_LOCATION;
}
