import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export function useLocationCache() {
  const cachedRef = useRef(false);

  const cacheLocation = useCallback(async (location: LocationData) => {
    if (cachedRef.current) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Call edge function to cache location
      const { error } = await supabase.functions.invoke('get-user-location', {
        method: 'POST',
        body: {
          latitude: location.latitude,
          longitude: location.longitude,
          cache: true,
        },
      });

      if (!error) {
        cachedRef.current = true;
        console.log('Location cached to profile successfully');
      }
    } catch (err) {
      console.error('Failed to cache location:', err);
    }
  }, []);

  const getCachedLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Try to get cached location from profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('latitude, longitude, location_city, location_country')
        .eq('user_id', user.id)
        .single();

      if (error || !profile?.latitude || !profile?.longitude) {
        return null;
      }

      return {
        latitude: profile.latitude,
        longitude: profile.longitude,
        city: profile.location_city || undefined,
        country: profile.location_country || undefined,
      };
    } catch (err) {
      console.error('Failed to get cached location:', err);
      return null;
    }
  }, []);

  return { cacheLocation, getCachedLocation };
}
