import React, { useState, useEffect } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Clock, Cloud, Sun, Wind, ExternalLink, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const MeccaLive: React.FC = () => {
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [makkahTime, setMakkahTime] = useState('');

  // Update Makkah local time every second
  useEffect(() => {
    const updateMakkahTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Riyadh',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(now);
      setMakkahTime(formatted);
    };

    updateMakkahTime();
    const interval = setInterval(updateMakkahTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Mock weather data for Mecca
  const weatherData = {
    temp: 38,
    condition: 'Sunny',
    humidity: 25,
    wind: 12,
  };

  // Saudi Quran TV Channel live stream.
  // Makkah Live HD channel — uses YouTube's `live_stream` embed which auto-picks the current live broadcast,
  // avoiding "video is private/unavailable" errors when a specific video ID expires.
  const muteParam = isMuted ? 1 : 0;
  const youtubeEmbedUrl = `https://www.youtube.com/embed/live_stream?channel=UCxQg2bDLN-WUTKsoBLDQRpA&autoplay=1&mute=${muteParam}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;

  return (
    <div
      className={`relative bg-card rounded-3xl overflow-hidden shadow-card border border-border animate-slide-up ${
        isTheaterMode ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Islamic geometric pattern overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(212,175,55,0.3)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(16,185,129,0.2)_0%,transparent_50%)]" />
      </div>

      {/* Header */}
      <div className="relative flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-islamic-gold/10 via-transparent to-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-islamic-gold to-amber-600 flex items-center justify-center shadow-lg">
            <span className="text-lg">🕋</span>
          </div>
          <div>
            <h3 className="font-bold text-foreground text-sm">Mecca Live</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">Live from Al-Masjid al-Haram</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (!hasStarted) setHasStarted(true);
              setIsMuted((prev) => !prev);
            }}
            className="h-8 w-8"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsTheaterMode((prev) => !prev)}
            className="h-8 w-8"
            title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode'}
          >
            {isTheaterMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Video Player */}
      <div className={`relative ${isTheaterMode ? 'h-[60vh]' : 'aspect-video'} bg-black`}>
        {hasStarted ? (
          <>
            {/* key remounts iframe so YouTube picks up the new mute param immediately */}
            <iframe
              key={`mecca-${isMuted ? 'muted' : 'unmuted'}`}
              src={youtubeEmbedUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Mecca Live Stream - Saudi Quran TV"
              loading="eager"
            />
            {isMuted && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center pointer-events-none">
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
                  <VolumeX className="w-4 h-4 text-white" />
                  <span className="text-xs text-white">Tap unmute button to hear audio</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <button
            onClick={() => setHasStarted(true)}
            className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black hover:from-zinc-900 transition-colors group"
            aria-label="Play Mecca Live Stream"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.4)_0%,transparent_60%)]" />
            <div className="relative w-20 h-20 rounded-full bg-islamic-gold/90 flex items-center justify-center shadow-2xl group-hover:scale-110 group-active:scale-95 transition-transform">
              <Play className="w-10 h-10 text-black fill-black ml-1" />
            </div>
            <p className="relative mt-4 text-white text-sm font-semibold">Tap to play live stream</p>
            <p className="relative text-white/60 text-xs mt-1">Saudi Quran TV · Al-Masjid al-Haram</p>
          </button>
        )}
      </div>

      {/* Live Information Section */}
      <div className="p-4 space-y-4">
        {/* Makkah Time & Weather Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Makkah Local Time */}
          <div className="bg-gradient-to-br from-islamic-gold/15 to-islamic-gold/5 rounded-2xl p-3 border border-islamic-gold/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-islamic-gold/20 flex items-center justify-center">
                <Clock className="w-4 h-4 text-islamic-gold" />
              </div>
              <span className="text-xs text-muted-foreground">Makkah Time</span>
            </div>
            <p className="text-lg font-bold text-foreground tabular-nums">{makkahTime}</p>
          </div>

          {/* Weather Status */}
          <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 rounded-2xl p-3 border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <Sun className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-xs text-muted-foreground">Weather</span>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-lg font-bold text-foreground">{weatherData.temp}°C</p>
              <span className="text-xs text-muted-foreground">{weatherData.condition}</span>
            </div>
          </div>
        </div>

        {/* Weather Details */}
        <div className="flex items-center justify-center gap-6 py-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Cloud className="w-4 h-4" />
            <span className="text-xs">Humidity: {weatherData.humidity}%</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wind className="w-4 h-4" />
            <span className="text-xs">Wind: {weatherData.wind} km/h</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            to="/prayer"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-lg">🕐</span>
            <span className="text-xs font-medium text-foreground">Prayer Times</span>
          </Link>
          <Link
            to="/quran"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-lg">🤲</span>
            <span className="text-xs font-medium text-foreground">Dua of Day</span>
          </Link>
          <Link
            to="/qiblah"
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-lg">🧭</span>
            <span className="text-xs font-medium text-foreground">Qibla Finder</span>
          </Link>
        </div>

        {/* Attribution */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
          <span className="text-[10px] text-muted-foreground">Stream by Saudi Quran TV</span>
          <a
            href="https://www.youtube.com/channel/UCG_6fU7v_T3Yn_K9XpU_fCw"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            View Channel
          </a>
        </div>
      </div>

      {/* Theater mode backdrop */}
      {isTheaterMode && (
        <div
          className="fixed inset-0 bg-black/80 -z-10"
          onClick={() => setIsTheaterMode(false)}
        />
      )}
    </div>
  );
};

export default MeccaLive;
