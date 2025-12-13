import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import QiblahCompass from '@/components/home/QiblahCompass';
import AIAssistant from '@/components/home/AIAssistant';
import PrayerCalendar from '@/components/home/PrayerCalendar';
import QuickShortcuts from '@/components/home/QuickShortcuts';
import ProgressTracker from '@/components/home/ProgressTracker';
import { Bell, User } from 'lucide-react';

const Index: React.FC = () => {
  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between py-2 animate-fade-in">
          <QiblahCompass />
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-gradient-gold">My Islam</h1>
            <p className="text-xs text-gradient-gold opacity-80">Assalamu Alaikum</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10 hover:scale-105 transition-transform">
              <Bell className="w-5 h-5 text-primary-foreground" />
            </button>
            <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10 hover:scale-105 transition-transform">
              <User className="w-5 h-5 text-primary-foreground" />
            </button>
          </div>
        </header>

        {/* Quick Shortcuts */}
        <QuickShortcuts />

        {/* AI Assistant */}
        <AIAssistant />

        {/* Progress Tracker */}
        <ProgressTracker />

        {/* Prayer Calendar */}
        <PrayerCalendar />
      </div>
    </MobileLayout>
  );
};

export default Index;
