import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Fasting: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout showNav={true}>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center gap-4 py-3 px-4 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">Sawm (Fasting)</h1>
            <p className="text-sm text-muted-foreground">Fourth Pillar of Islam</p>
          </div>
        </header>

        {/* Embedded myRamadan App */}
        <div className="flex-1 w-full">
          <iframe
            src="https://myramadan.lovable.app/"
            className="w-full h-full border-0"
            title="myRamadan Tracker"
            allow="geolocation; microphone; camera"
            loading="lazy"
          />
        </div>
      </div>
    </MobileLayout>
  );
};

export default Fasting;
