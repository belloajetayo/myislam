import { supabase } from "@/integrations/supabase/client";

export interface ExactLocation {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  source?: "gps" | "profile" | "ip" | "cache" | "default";
}

const LAST_LOCATION_KEY = "lastLocation";
const DEFAULT_LOCATION: ExactLocation = {
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

    return {
      latitude,
      longitude,
      source: "cache",
    };
  } catch {
    return null;
  }
}

export function saveLastLocation(location: ExactLocation) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      LAST_LOCATION_KEY,
      JSON.stringify({ latitude: location.latitude, longitude: location.longitude }),
    );
  } catch {
    // ignore quota errors
  }
}

export async function getBrowserLocation(timeout = 15000): Promise<ExactLocation | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;

  return new Promise<ExactLocation | null>((resolve) => {
    const onSuccess = (position: GeolocationPosition) => {
      resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: "gps",
      });
    };

    const onError = () => {
      resolve(null);
    };

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout,
      maximumAge: 0,
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
}): Promise<ExactLocation> {
  const allowBrowser = opts?.allowBrowser ?? true;
  const preferCache = opts?.preferCache ?? true;

  if (preferCache) {
    const cached = getStoredLastLocation();
    if (cached) {
      return cached;
    }
  }

  if (allowBrowser) {
    const browserLocation = await getBrowserLocation();
    if (browserLocation) {
      saveLastLocation(browserLocation);
      return browserLocation;
    }
  }

  if (!preferCache) {
    const cached = getStoredLastLocation();
    if (cached) {
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
