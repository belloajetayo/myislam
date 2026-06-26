import React from 'react';
import BottomNavigation from './BottomNavigation';
import MiniPlayer from './MiniPlayer';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden">
      {/* Soft Light Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-100 -z-10" />
      
      
      {/* Content */}
      <main className={`relative z-10 ${showNav ? 'pb-[100px]' : ''}`}>
        {children}
      </main>
      
      {/* Mini Player */}
      {showNav && <MiniPlayer />}
      
      {/* Bottom Navigation */}
      {showNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
