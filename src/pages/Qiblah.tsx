import React, { useState, useEffect, useRef, useCallback } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Navigation, MapPin, RotateCcw, Building2, Sunrise, Sunset, Info, ArrowLeft, Compass, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const Qiblah: React.FC = () => {
  const navigate = useNavigate();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [qiblahDirection, setQiblahDirection] = useState<number>(0);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [calibrating, setCalibrating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationName, setLocationName] = useState('Locating...');
  const [showInfo, setShowInfo] = useState(false);
  const [showMosqueMap, setShowMosqueMap] = useState(false);
  const [compassSupported, setCompassSupported] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Calculate Qiblah direction from user location to Kaaba
  const calculateQiblahDirection = useCallback((lat: number, lng: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;
    
    const lat1 = toRad(lat);
    const lat2 = toRad(KAABA_COORDS.lat);
    const dLng = toRad(KAABA_COORDS.lng - lng);
    
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const bearing = toDeg(Math.atan2(y, x));
    
    return (bearing + 360) % 360;
  }, []);

  // Handle device orientation for compass
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading: number;
    
    // iOS provides webkitCompassHeading
    if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
    } 
    // Android and others use alpha
    else if (event.alpha !== null) {
      heading = 360 - event.alpha;
    } else {
      return;
    }
    
    setDeviceHeading(heading);
  }, []);

  // Request compass permission (especially for iOS 13+)
  const requestCompassPermission = useCallback(async () => {
    const DeviceOrientationEventTyped = DeviceOrientationEvent as unknown as DeviceOrientationEventiOS;
    
    if (typeof DeviceOrientationEventTyped.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEventTyped.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setCompassSupported(false);
        }
      } catch (error) {
        console.error('Compass permission error:', error);
        setCompassSupported(false);
      }
    } else {
      // Non-iOS or older iOS - just add listener
      setPermissionGranted(true);
      window.addEventListener('deviceorientation', handleOrientation, true);
      
      // Check if events are actually being received
      setTimeout(() => {
        if (deviceHeading === 0) {
          // Might not be supported
          setCompassSupported(false);
        }
      }, 3000);
    }
  }, [handleOrientation, deviceHeading]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize compass and map
  useEffect(() => {
    let mapInstance: mapboxgl.Map | null = null;
    
    // Get user location first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Calculate Qiblah direction
          const direction = calculateQiblahDirection(latitude, longitude);
          setQiblahDirection(Math.round(direction));
          
          // Store location for offline use
          localStorage.setItem('lastLocation', JSON.stringify({ lat: latitude, lng: longitude }));
          localStorage.setItem('lastQiblahDirection', String(Math.round(direction)));
        },
        () => {
          // Try to use cached location
          const cached = localStorage.getItem('lastLocation');
          const cachedDirection = localStorage.getItem('lastQiblahDirection');
          if (cached) {
            setUserLocation(JSON.parse(cached));
            setLocationName('Last known location');
          }
          if (cachedDirection) {
            setQiblahDirection(parseInt(cachedDirection));
          }
        },
        { enableHighAccuracy: true }
      );
    }

    // Initialize map only if online
    const initMap = async () => {
      if (!mapContainer.current || isOffline) return;

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

      // Add user marker if location available
      if (userLocation) {
        new mapboxgl.Marker({ color: '#4F46E5' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<strong>Your Location</strong>'))
          .addTo(mapInstance);
        
        // Draw line from user to Kaaba
        mapInstance.on('load', () => {
          if (mapInstance && userLocation) {
            mapInstance.addSource('qiblah-line', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: [
                    [userLocation.lng, userLocation.lat],
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
              [Math.min(userLocation.lng, KAABA_COORDS.lng) - 10, Math.min(userLocation.lat, KAABA_COORDS.lat) - 5],
              [Math.max(userLocation.lng, KAABA_COORDS.lng) + 10, Math.max(userLocation.lat, KAABA_COORDS.lat) + 5]
            ], { padding: 50 });
          }
        });
        
        // Reverse geocode for location name
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${userLocation.lng},${userLocation.lat}.json?access_token=${token}`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            setLocationName(data.features[0].place_name.split(',').slice(0, 2).join(','));
          }
        } catch {
          setLocationName('Location detected');
        }
      }
    };

    initMap();

    return () => {
      mapInstance?.remove();
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [calculateQiblahDirection, handleOrientation, isOffline, userLocation]);

  // Calculate the rotation needed for the compass needle
  // The needle should point toward Qiblah relative to the device's current heading
  const compassRotation = qiblahDirection - deviceHeading;

  const handleCalibrate = () => {
    setCalibrating(true);
    requestCompassPermission();
    
    if (userLocation) {
      const direction = calculateQiblahDirection(userLocation.lat, userLocation.lng);
      setQiblahDirection(Math.round(direction));
    }
    
    setTimeout(() => {
      setCalibrating(false);
    }, 2000);
  };

  const getMosqueMapUrl = () => {
    if (userLocation) {
      return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=mosque+near+me&center=${userLocation.lat},${userLocation.lng}&zoom=14`;
    }
    return `https://www.google.com/maps/embed/v1/search?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=mosque+near+me&zoom=12`;
  };

  return (
    <MobileLayout>
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Map Background - only show when online */}
        {!isOffline && <div ref={mapContainer} className="absolute inset-0 z-0" />}
        
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
                onClick={() => navigate('/')}
                className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
              >
                <ArrowLeft className="w-5 h-5 text-primary-foreground" />
              </button>
              <div className="flex-1 text-center">
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
                          <p className="font-semibold text-amber-400">How to use:</p>
                          <ul className="list-disc list-inside space-y-1 text-primary-foreground/80">
                            <li>Hold your phone flat and level</li>
                            <li>The compass will point toward Makkah</li>
                            <li>Rotate yourself until the arrow points up</li>
                            <li>That's your Qiblah direction!</li>
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
            {/* Outer Ring - rotates with device */}
            <div 
              className="w-64 h-64 rounded-full glass border-2 border-primary/40 flex items-center justify-center shadow-glow backdrop-blur-md transition-transform duration-100"
              style={{ transform: `rotate(${-deviceHeading}deg)` }}
            >
              {/* Compass Markings */}
              <div className="absolute inset-4 rounded-full border border-primary/30">
                {/* Cardinal Points */}
                <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-red-500">N</span>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-primary-foreground/60">S</span>
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">W</span>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-primary-foreground/60">E</span>
                
                {/* Degree Markings */}
                {[...Array(36)].map((_, i) => (
                  <div
                    key={i}
                    className={`absolute left-1/2 ${i % 3 === 0 ? 'w-0.5 h-4 bg-primary-foreground/50' : 'w-px h-2 bg-primary-foreground/30'}`}
                    style={{ 
                      transform: `translateX(-50%) rotate(${i * 10}deg)`,
                      transformOrigin: '50% 110px',
                      top: '4px'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Inner Circle with Qiblah Arrow - points to Qiblah */}
            <div 
              className={`absolute inset-0 flex items-center justify-center ${calibrating ? 'animate-pulse' : ''}`}
            >
              <div 
                className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-500/90 to-purple-600/90 shadow-lg flex items-center justify-center transition-transform duration-300"
                style={{ transform: `rotate(${compassRotation}deg)` }}
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
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-soft">
                  <p className="text-sm text-foreground">Calibrating...</p>
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
                <p className="text-xs text-primary-foreground/60">Your Heading</p>
                <p className="text-lg font-bold text-primary-foreground">{Math.round(deviceHeading)}°</p>
              </div>
              <div className="w-px h-8 bg-primary/30" />
              <div>
                <p className="text-xs text-primary-foreground/60">Qiblah</p>
                <p className="text-lg font-bold bg-gradient-to-r from-amber-400 to-purple-500 bg-clip-text text-transparent">{qiblahDirection}°</p>
              </div>
            </div>
            <p className="text-xs text-primary-foreground/60">
              {Math.abs(compassRotation) < 5 
                ? '✓ You are facing Qiblah!' 
                : compassRotation > 0 
                  ? `Turn ${Math.round(Math.abs(compassRotation))}° right` 
                  : `Turn ${Math.round(Math.abs(compassRotation))}° left`}
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
          <Dialog open={showMosqueMap} onOpenChange={setShowMosqueMap}>
            <DialogContent className="max-w-lg w-[95vw] h-[70vh] p-0 overflow-hidden border-primary/20">
              <DialogHeader className="p-4 pb-2">
                <DialogTitle className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Mosques Near You
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full h-full min-h-[50vh]">
                <iframe
                  src={getMosqueMapUrl()}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mosques Near Me"
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Instructions */}
          <p className="mt-4 text-xs text-primary-foreground/70 text-center max-w-xs animate-fade-in backdrop-blur-sm bg-background/30 rounded-xl p-2" style={{ animationDelay: '0.2s' }}>
            Hold your phone flat. The compass arrow points toward Makkah. Rotate until the arrow points straight up.
          </p>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Qiblah;