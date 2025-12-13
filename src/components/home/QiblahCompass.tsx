import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const QiblahCompass: React.FC = () => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Simulating compass rotation for demo
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <button className="relative w-12 h-12 glass rounded-2xl shadow-soft flex items-center justify-center border border-primary/20 group hover:scale-105 transition-transform duration-300">
      <div 
        className="transition-transform duration-200"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Compass className="w-6 h-6 text-primary" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-3 h-3 gradient-accent rounded-full animate-pulse-soft" />
      <span className="absolute -bottom-6 text-[10px] text-primary-foreground/80 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Qiblah</span>
    </button>
  );
};

export default QiblahCompass;
