import React, { useState, useEffect, useRef } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Navigation, MapPin, RotateCcw, Building2, Sunrise, Sunset, Info, X } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const KAABA_COORDS = { lat: 21.4225, lng: 39.8262 };

const Qiblah: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [rotation, setRotation] = useState(135);
  const [calibrating, setCalibrating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('Locating...');
  const [showInfo, setShowInfo] = useState(false);

  // Calculate Qiblah direction from user location to Kaaba
  const calculateQiblahDirection = (lat: number, lng: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA_COORDS.lat);
    const dLng = toRad(KAABA_COORDS.lng - lng);
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = toDeg(Math.atan2(y, x));
    
    return (bearing + 360) % 360;
  };

  useEffect(() => {
    let mapInstance: mapboxgl.Map | null = null;
    
    const initMap = async () => {
      if (!mapContainer.current) return;

      // Get Mapbox token from edge function
      let token = '';
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        if (error) throw error;
        token = data.token;
      } catch {
        console.error('Failed to get Mapbox token');
        return;
      }
      
      // Initialize map
      mapboxgl.accessToken = token;
      
      mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        zoom: 2,
        center: [39.8262, 21.4225],
        pitch: 45,
      });
      
      map.current = mapInstance;

      // Add Kaaba marker
      new mapboxgl.Marker({ color: '#FFD700' })
        .setLngLat([KAABA_COORDS.lng, KAABA_COORDS.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<strong>Al-Masjid al-Haram</strong><br/>The Holy Kaaba'))
        .addTo(mapInstance);

      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            
            // Calculate Qiblah direction
            const direction = calculateQiblahDirection(latitude, longitude);
            setRotation(Math.round(direction));
            
            // Add user marker
            if (mapInstance) {
              new mapboxgl.Marker({ color: '#4F46E5' })
                .setLngLat([longitude, latitude])
                .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
                .addTo(mapInstance);
              
              // Draw line from user to Kaaba
              mapInstance.on('load', () => {
                if (mapInstance) {
                  mapInstance.addSource('qiblah-line', {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: {
                        type: 'LineString',
                        coordinates: [
                          [longitude, latitude],
                          [KAABA_COORDS.lng, KAABA_COORDS.lat]
                        ]
                      }
                    }
                  });
                  
                  mapInstance.addLayer({
                    id: 'qiblah-line-layer',
                    type: 'line',
                    source: 'qiblah-line',
                    layout: {
                      'line-join': 'round',
                      'line-cap': 'round'
                    },
                    paint: {
                      'line-color': '#FFD700',
                      'line-width': 3,
                      'line-dasharray': [2, 2]
                    }
                  });
                  
                  // Fit bounds to show both points
                  mapInstance.fitBounds([
                    [Math.min(longitude, KAABA_COORDS.lng) - 10, Math.min(latitude, KAABA_COORDS.lat) - 5],
                    [Math.max(longitude, KAABA_COORDS.lng) + 10, Math.max(latitude, KAABA_COORDS.lat) + 5]
                  ], { padding: 50 });
                }
              });
            }
            
            // Reverse geocode for location name
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`
              );
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                setLocationName(data.features[0].place_name.split(',').slice(0, 2).join(','));
              }
            } catch {
              setLocationName('Location detected');
            }
          },
          () => {
            setLocationName('Enable location access');
          }
        );
      }
    };

    initMap();

    return () => {
      mapInstance?.remove();
    };
  }, []);

  const handleCalibrate = () => {
    setCalibrating(true);
    if (userLocation) {
      const direction = calculateQiblahDirection(userLocation.lat, userLocation.lng);
      setRotation(Math.round(direction));
    }
    setTimeout(() => {
      setCalibrating(false);
    }, 2000);
  };

  const openMosqueSearch = () => {
    if (userLocation) {
      const url = `https://www.google.com/maps/search/mosque+near+me/@${userLocation.lat},${userLocation.lng},14z`;
      window.open(url, '_blank');
    } else {
      window.open('https://www.google.com/maps/search/mosque+near+me', '_blank');
    }
  };

  return (
    <MobileLayout>
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Map Background */}
        <div ref={mapContainer} className="absolute inset-0 z-0" />
        
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/90 z-10" />
        
        {/* Content */}
        <div className="relative z-20 p-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
          {/* Header with Info Button */}
          <header className="text-center mb-4 animate-fade-in w-full">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 bg-clip-text text-transparent">Qiblah Direction</h1>
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
                      <p className="font-semibold text-amber-400 mb-1">From the Sunnah:</p>
                      <p className="italic">"The Prophet ﷺ said: 'What is between the East and West is Qiblah.'"</p>
                      <p className="text-xs text-primary-foreground/60 mt-1">— Sunan Ibn Majah</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold text-amber-400">How to find Qiblah:</p>
                      <ul className="list-disc list-inside space-y-1 text-primary-foreground/80">
                        <li>Face the sunrise direction (East) in the morning</li>
                        <li>Face the sunset direction (West) in the evening</li>
                        <li>Use the compass direction shown above</li>
                        <li>Ask local Muslims for the direction</li>
                        <li>Look for the Mihrab (niche) in any mosque</li>
                      </ul>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <p className="italic text-primary-foreground/80">"Allah does not burden a soul beyond that it can bear."</p>
                      <p className="text-xs text-primary-foreground/60 mt-1">— Quran 2:286</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex items-center justify-center gap-1 text-primary-foreground/90 mt-1">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{locationName}</span>
            </div>
          </header>

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
            {/* Outer Ring */}
            <div className="w-64 h-64 rounded-full glass border-2 border-primary/40 flex items-center justify-center shadow-glow backdrop-blur-md">
              {/* Compass Markings */}
              <div className="absolute inset-4 rounded-full border border-primary/30">
                {/* Cardinal Points */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-primary-foreground">N</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-primary-foreground/60">S</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">W</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">E</span>
                
                {/* Degree Markings */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-3 bg-primary-foreground/30 left-1/2 -translate-x-1/2"
                    style={{ 
                      transform: `translateX(-50%) rotate(${i * 30}deg)`,
                      transformOrigin: '50% 110px'
                    }}
                  />
                ))}
              </div>

              {/* Inner Circle with Qiblah Arrow */}
              <div 
                className={`w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/90 to-purple-600/90 shadow-lg flex items-center justify-center transition-transform duration-500 ${
                  calibrating ? 'animate-spin-slow' : ''
                }`}
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {/* Kaaba Icon / Arrow */}
                <div className="relative">
                  <div className="w-14 h-14 bg-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-6">
                    <span className="text-2xl">🕋</span>
                  </div>
                  {/* Arrow pointing up (towards Kaaba) */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                    <Navigation className="w-7 h-7 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
              </div>
            </div>

            {/* Calibrating Indicator */}
            {calibrating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-soft">
                  <p className="text-sm text-foreground">Calibrating...</p>
                </div>
              </div>
            )}
          </div>

          {/* Direction Info */}
          <div className="mt-4 text-center glass rounded-3xl p-4 w-full max-w-xs shadow-card border border-primary/20 animate-slide-up backdrop-blur-md">
            <p className="text-sm text-primary-foreground/80">Direction to Makkah</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">{rotation}°</p>
            <p className="text-xs text-primary-foreground/60 mt-1">
              {rotation < 90 ? 'NE' : rotation < 180 ? 'SE' : rotation < 270 ? 'SW' : 'NW'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <button
              onClick={handleCalibrate}
              disabled={calibrating}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-purple-600 rounded-2xl shadow-lg text-white font-medium hover:scale-105 transition-transform disabled:opacity-50"
            >
              <RotateCcw className={`w-5 h-5 ${calibrating ? 'animate-spin' : ''}`} />
              {calibrating ? 'Calibrating...' : 'Calibrate'}
            </button>
            
            <button
              onClick={openMosqueSearch}
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl shadow-lg text-white font-medium hover:scale-105 transition-transform"
            >
              <Building2 className="w-5 h-5" />
              Mosque Near Me
            </button>
          </div>

          {/* Instructions */}
          <p className="mt-4 text-xs text-primary-foreground/70 text-center max-w-xs animate-fade-in backdrop-blur-sm bg-background/30 rounded-xl p-2" style={{ animationDelay: '0.2s' }}>
            The map shows a line from your location to the Holy Kaaba. Point the arrow toward Makkah for prayer.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Qiblah;