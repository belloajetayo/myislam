import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LocationResponse {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  source: 'ip' | 'cached' | 'provided';
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Parse request body if present
    let providedLocation: { latitude?: number; longitude?: number } = {};
    let shouldCache = false;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        providedLocation = body;
        shouldCache = body.cache === true;
      } catch {
        // No body or invalid JSON, continue
      }
    }

    // Check for authenticated user
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        userId = user.id;
      }
    }

    // If user provided GPS coordinates, cache them and return
    if (providedLocation.latitude && providedLocation.longitude && userId && shouldCache) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader! } },
      });

      // Reverse geocode to get city/country
      let city = 'Unknown';
      let country = 'Unknown';

      try {
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${providedLocation.latitude}&longitude=${providedLocation.longitude}&localityLanguage=en`
        );
        const geoData = await geoResponse.json();
        city = geoData.city || geoData.locality || 'Unknown';
        country = geoData.countryName || 'Unknown';
      } catch (e) {
        console.error('Reverse geocode failed:', e);
      }

      // Update user profile with location
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          latitude: providedLocation.latitude,
          longitude: providedLocation.longitude,
          location_city: city,
          location_country: country,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Failed to cache location:', updateError);
      }

      const response: LocationResponse = {
        city,
        country,
        latitude: providedLocation.latitude,
        longitude: providedLocation.longitude,
        source: 'provided',
      };

      return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check for cached location in user profile
    if (userId) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader! } },
      });

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('latitude, longitude, location_city, location_country')
        .eq('user_id', userId)
        .single();

      if (!profileError && profile?.latitude && profile?.longitude) {
        const response: LocationResponse = {
          city: profile.location_city || 'Unknown',
          country: profile.location_country || 'Unknown',
          latitude: profile.latitude,
          longitude: profile.longitude,
          source: 'cached',
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fall back to IP-based geolocation
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('cf-connecting-ip') ||
                     'unknown';

    let ipLocation = { city: 'Makkah', country: 'Saudi Arabia', latitude: 21.4224779, longitude: 39.8251832 };

    try {
      // Use ipapi.co for IP geolocation (free tier: 1000 requests/day)
      const ipUrl = clientIP !== 'unknown' && clientIP !== '127.0.0.1' 
        ? `https://ipapi.co/${clientIP}/json/`
        : 'https://ipapi.co/json/';
      
      const ipResponse = await fetch(ipUrl);
      const ipData = await ipResponse.json();

      if (ipData.latitude && ipData.longitude) {
        ipLocation = {
          city: ipData.city || 'Unknown',
          country: ipData.country_name || 'Unknown',
          latitude: ipData.latitude,
          longitude: ipData.longitude,
        };
      }
    } catch (e) {
      console.error('IP geolocation failed:', e);
      // Use Makkah as default
    }

    const response: LocationResponse = {
      ...ipLocation,
      source: 'ip',
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-user-location:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        city: 'Makkah',
        country: 'Saudi Arabia',
        latitude: 21.4224779,
        longitude: 39.8251832,
        source: 'ip'
      }),
      { 
        status: 200, // Return 200 with fallback data instead of error
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
