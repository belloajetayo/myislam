import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ExactLocation,
  getStoredLastLocation,
  LOCATION_UPDATED_EVENT,
  resolveExactLocation,
} from "@/hooks/useExactLocation";
import { LocationContext } from "@/context/location-context";

const initialStoredLocation = () => {
  const stored = getStoredLastLocation();
  return stored?.source === "default" ? null : stored;
};

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<ExactLocation | null>(initialStoredLocation);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLocation = useCallback(async (opts?: { preferCache?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const resolved = await resolveExactLocation({
        allowBrowser: true,
        preferCache: opts?.preferCache ?? false,
        timeout: 12000,
      });
      setLocation(resolved);
      return resolved;
    } catch (err) {
      setError("Unable to resolve location");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshLocation({ preferCache: false });
  }, [refreshLocation]);

  useEffect(() => {
    const handleLocationUpdate = (event: Event) => {
      const next = (event as CustomEvent<ExactLocation>).detail;
      if (next) setLocation(next);
    };

    window.addEventListener(LOCATION_UPDATED_EVENT, handleLocationUpdate);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, handleLocationUpdate);
  }, []);

  const value = useMemo(
    () => ({ location, loading, error, refreshLocation }),
    [location, loading, error, refreshLocation],
  );

  // Render children immediately — location loads silently in background
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
