import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import QiblahCompass from '@/components/home/QiblahCompass';
import MIAAssistant from '@/components/home/MIAAssistant';

import PrayerCalendar from '@/components/home/PrayerCalendar';
import QuickShortcuts from '@/components/home/QuickShortcuts';
import ProgressTracker from '@/components/home/ProgressTracker';
import DailyReminders from '@/components/home/DailyReminders';
import FeaturedContent from '@/components/home/FeaturedContent';
import { Bell, User, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Logged out successfully');
  };

  return (
    <MobileLayout>
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-24 w-48 h-48 bg-gradient-to-tr from-islamic-gold/15 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-gradient-to-bl from-secondary/15 to-transparent rounded-full blur-2xl" />
      </div>

      <div className="relative p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center justify-between py-3 animate-fade-in">
          <QiblahCompass />
          
          <div className="text-center flex-1 mx-4">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-soft" />
              <h1 className="text-2xl font-bold text-gradient-gold tracking-tight">My Islam</h1>
              <Sparkles className="w-4 h-4 text-primary animate-pulse-soft" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Assalamu Alaikum</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative w-11 h-11 glass rounded-2xl flex items-center justify-center border border-border hover:border-primary/30 hover:shadow-soft active:scale-95 transition-all duration-200">
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-background" />
            </button>
            {user ? (
              <button 
                onClick={handleLogout}
                className="w-11 h-11 glass rounded-2xl flex items-center justify-center border border-border hover:border-destructive/30 hover:bg-destructive/5 active:scale-95 transition-all duration-200"
              >
                <LogOut className="w-5 h-5 text-foreground" />
              </button>
            ) : (
              <button 
                onClick={() => navigate('/auth')}
                className="w-11 h-11 gradient-primary rounded-2xl flex items-center justify-center shadow-soft hover:shadow-glow active:scale-95 transition-all duration-200"
              >
                <User className="w-5 h-5 text-primary-foreground" />
              </button>
            )}
          </div>
        </header>

        {/* Quick Shortcuts */}
        <QuickShortcuts />


        {/* Daily Reminders */}
        <DailyReminders />

        {/* Progress Tracker */}
        <ProgressTracker />

        {/* Prayer Calendar */}
        <PrayerCalendar />

        {/* Featured Content */}
        <FeaturedContent />

        {/* MIA Assistant */}
        <MIAAssistant />
      </div>
    </MobileLayout>
  );
};

export default Index;
