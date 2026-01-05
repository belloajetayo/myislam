import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QiblahCompass: React.FC = () => {
  const navigate = useNavigate();
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.3) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <button 
      onClick={() => navigate('/qiblah')}
      className="relative w-12 h-12 gradient-warm rounded-2xl shadow-soft flex items-center justify-center group hover:shadow-glow active:scale-95 transition-all duration-300"
    >
      <div 
        className="transition-transform duration-150 ease-out"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <Compass className="w-6 h-6 text-primary-foreground" />
      </div>
      <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-islamic-green rounded-full border-2 border-background animate-pulse" />
      <span className="absolute -bottom-7 text-[10px] text-foreground font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Qiblah
      </span>
    </button>
  );
};

export default QiblahCompass;
