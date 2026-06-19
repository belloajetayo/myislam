import * as Location from "expo-location";
import { mmkv } from "@/utils/storage";
import { appEvents } from "@/utils/events";
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
  try {
    const raw = mmkv.getString(LAST_LOCATION_KEY);
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
    if (latitude === null || longitude === null) return null;

    const looksLikeDefault =
      Math.abs(latitude - DEFAULT_LOCATION.latitude) < 0.001 &&
      Math.abs(longitude - DEFAULT_LOCATION.longitude) < 0.001 &&
      typeof parsed.updatedAt !== "number";

    return {
      latitude,
      longitude,
      city: typeof parsed.city === "string" ? parsed.city : undefined,
      country: typeof parsed.country === "string" ? parsed.country : undefined,
      source:
        parsed.source === "default" || looksLikeDefault ? "default" : "cache",
      updatedAt:
        typeof parsed.updatedAt === "number" ? parsed.updatedAt : undefined,
    };
  } catch {
    return null;
  }
}

export function saveLastLocation(location: ExactLocation) {
  if (location.source === "default") return;
  const saved: ExactLocation = {
    ...location,
    latitude: Math.round(location.latitude * 1000000) / 1000000,
    longitude: Math.round(location.longitude * 1000000) / 1000000,
    updatedAt: Date.now(),
  };
  try {
    mmkv.set(LAST_LOCATION_KEY, JSON.stringify(saved));
    appEvents.emit(LOCATION_UPDATED_EVENT, saved);
  } catch {
    // ignore
  }
}

export async function getBrowserLocation(
  timeout = 12000
): Promise<ExactLocation | null> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: timeout,
    });
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      source: "gps",
    };
  } catch {
    return null;
  }
}

export async function getServerLocation(): Promise<ExactLocation | null> {
  try {
    const { data, error } = await supabase.functions.invoke("get-user-location");
    if (error || !data?.latitude || !data?.longitude) return null;
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
    if (cached && cached.source !== "default") return cached;
  }

  if (allowBrowser) {
    const gpsLocation = await getBrowserLocation(timeout);
    if (gpsLocation) {
      saveLastLocation(gpsLocation);
      return gpsLocation;
    }
  }

  if (!preferCache) {
    const cached = getStoredLastLocation();
    if (cached && cached.source !== "default") return cached;
  }

  const serverLocation = await getServerLocation();
  if (serverLocation) {
    saveLastLocation(serverLocation);
    return serverLocation;
  }

  return DEFAULT_LOCATION;
}
