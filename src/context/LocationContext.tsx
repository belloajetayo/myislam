import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { Loader2, MapPin } from "lucide-react";
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
  const [initialReady, setInitialReady] = useState(false);
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
      setInitialReady(true);
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

  if (!initialReady) {
    return (
      <MobileLayout showNav={false}>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass rounded-3xl border border-primary/15 p-5 shadow-card w-full max-w-xs text-center">
            <div className="w-12 h-12 rounded-2xl gradient-accent mx-auto flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold text-gradient-gold">Preparing Location</h1>
            <p className="text-xs text-muted-foreground mt-2">
              Allow location access so prayer times stay consistent across the app.
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-islamic-gold mx-auto mt-4" />
          </div>
        </div>
      </MobileLayout>
    );
  }

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}
