import React from 'react';
import BottomNavigation from './BottomNavigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen max-w-md mx-auto relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 gradient-primary islamic-pattern -z-10" />
      
      {/* Content */}
      <main className={`relative z-10 ${showNav ? 'pb-24' : ''}`}>
        {children}
      </main>
      
      {/* Bottom Navigation */}
      {showNav && <BottomNavigation />}
    </div>
  );
};

export default MobileLayout;
