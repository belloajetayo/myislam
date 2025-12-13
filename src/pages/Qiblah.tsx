import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Navigation, MapPin, RotateCcw } from 'lucide-react';

const Qiblah: React.FC = () => {
  const [rotation, setRotation] = useState(135); // Simulated Qiblah direction
  const [calibrating, setCalibrating] = useState(false);

  const handleCalibrate = () => {
    setCalibrating(true);
    setTimeout(() => {
      setCalibrating(false);
    }, 2000);
  };

  return (
    <MobileLayout>
      <div className="p-4 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-primary-foreground">Qiblah Direction</h1>
          <div className="flex items-center justify-center gap-1 text-primary-foreground/70 mt-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">New York, USA</span>
          </div>
        </header>

        {/* Compass Container */}
        <div className="relative animate-scale-in">
          {/* Outer Ring */}
          <div className="w-72 h-72 rounded-full glass border-2 border-primary/30 flex items-center justify-center shadow-glow">
            {/* Compass Markings */}
            <div className="absolute inset-4 rounded-full border border-primary/20">
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
                    transformOrigin: '50% 130px'
                  }}
                />
              ))}
            </div>

            {/* Inner Circle with Qiblah Arrow */}
            <div 
              className={`w-48 h-48 rounded-full gradient-accent shadow-soft flex items-center justify-center transition-transform duration-500 ${
                calibrating ? 'animate-spin-slow' : ''
              }`}
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              {/* Kaaba Icon / Arrow */}
              <div className="relative">
                <div className="w-16 h-16 bg-primary-foreground rounded-2xl flex items-center justify-center shadow-lg transform -translate-y-8">
                  <span className="font-arabic text-primary text-2xl font-bold">🕋</span>
                </div>
                {/* Arrow pointing up (towards Kaaba) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                  <Navigation className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
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
        <div className="mt-8 text-center glass rounded-3xl p-4 w-full max-w-xs shadow-card border border-primary/10 animate-slide-up">
          <p className="text-sm text-muted-foreground">Direction to Makkah</p>
          <p className="text-3xl font-bold text-foreground">{rotation}° SE</p>
          <p className="text-xs text-muted-foreground mt-1">Distance: ~9,500 km</p>
        </div>

        {/* Calibrate Button */}
        <button
          onClick={handleCalibrate}
          disabled={calibrating}
          className="mt-4 flex items-center gap-2 px-6 py-3 gradient-primary rounded-2xl shadow-soft text-primary-foreground font-medium hover:scale-105 transition-transform disabled:opacity-50 animate-slide-up"
          style={{ animationDelay: '0.1s' }}
        >
          <RotateCcw className={`w-5 h-5 ${calibrating ? 'animate-spin' : ''}`} />
          {calibrating ? 'Calibrating...' : 'Calibrate Compass'}
        </button>

        {/* Instructions */}
        <p className="mt-6 text-xs text-primary-foreground/60 text-center max-w-xs animate-fade-in" style={{ animationDelay: '0.2s' }}>
          Hold your device flat and point the arrow towards the Kaaba symbol. 
          Move away from magnetic interference for accuracy.
        </p>
      </div>
    </MobileLayout>
  );
};

export default Qiblah;
