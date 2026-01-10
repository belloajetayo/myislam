import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { ArrowLeft, MapPin, Plane, CheckCircle, XCircle, Calendar, Info, Package, Calculator, Building2, Video, HelpCircle, ClipboardList, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HajjCountdown from '@/components/hajj/HajjCountdown';
import HajjCostCalculator from '@/components/hajj/HajjCostCalculator';
import HajjAgencies from '@/components/hajj/HajjAgencies';
import HajjVideoGuides from '@/components/hajj/HajjVideoGuides';
import HajjFAQ from '@/components/hajj/HajjFAQ';
import HajjBookingLinks from '@/components/hajj/HajjBookingLinks';
import HajjChecklist from '@/components/hajj/HajjChecklist';

const Hajj: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('guide');

  const hajjSteps = [
    { day: 'Day 1 (8th Dhul Hijjah)', title: 'Enter Ihram & Go to Mina', description: 'Put on Ihram garments, make intention, and travel to Mina. Pray Dhuhr, Asr, Maghrib, Isha, and Fajr.' },
    { day: 'Day 2 (9th Dhul Hijjah)', title: 'Day of Arafah', description: 'Travel to Arafah after Fajr. Stand in worship until sunset. This is the most important day of Hajj.' },
    { day: 'Night of 9th-10th', title: 'Muzdalifah', description: 'After sunset, travel to Muzdalifah. Pray Maghrib and Isha combined. Collect pebbles for stoning.' },
    { day: 'Day 3 (10th Dhul Hijjah)', title: 'Eid & Jamarat', description: 'Stone Jamarat al-Aqaba (7 pebbles), sacrifice animal, shave/trim hair, perform Tawaf al-Ifadah.' },
    { day: 'Days 4-6 (11th-13th)', title: 'Days of Tashreeq', description: 'Stay in Mina, stone all three Jamarat daily. Can leave on 12th after stoning if desired.' },
    { day: 'Final', title: 'Farewell Tawaf', description: 'Perform Tawaf al-Wida (farewell) before leaving Makkah.' },
  ];

  const dosAndDonts = {
    dos: ['Make sincere intention', 'Learn all rituals', 'Stay patient', 'Help fellow pilgrims', 'Make plenty of dua', 'Stay hydrated'],
    donts: ['Argue or fight', 'Hunt animals in Ihram', 'Cut hair/nails in Ihram', 'Use perfume in Ihram', 'Cover head (men)', 'Litter sacred places'],
  };

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="flex items-center gap-4 py-2">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gradient-gold">Hajj</h1>
            <p className="text-sm text-primary-foreground/70">Fifth Pillar of Islam</p>
          </div>
        </header>

        {/* Countdown */}
        <HajjCountdown />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 glass h-auto p-1 rounded-2xl">
            <TabsTrigger value="guide" className="text-xs py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="book" className="text-xs py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Plane className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="prepare" className="text-xs py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <ClipboardList className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="learn" className="text-xs py-2 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Video className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          {/* Guide Tab */}
          <TabsContent value="guide" className="space-y-4 mt-4">
            {/* Intro */}
            <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gradient-gold">What is Hajj?</h2>
                  <p className="text-xs text-primary-foreground/70">The Sacred Pilgrimage</p>
                </div>
              </div>
              <p className="text-sm text-primary-foreground/80 leading-relaxed">
                Hajj is the annual Islamic pilgrimage to Makkah, mandatory once for every able-bodied Muslim who can afford it. It takes place during Dhul Hijjah.
              </p>
            </div>

            {/* Steps */}
            <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-gradient-gold">How to Perform Hajj</h3>
              </div>
              <div className="space-y-4">
                {hajjSteps.map((step, index) => (
                  <div key={index} className="relative pl-6 pb-4 border-l-2 border-primary-foreground/20 last:pb-0">
                    <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" />
                    <p className="text-xs text-primary font-medium">{step.day}</p>
                    <h4 className="text-sm font-semibold text-primary-foreground mt-1">{step.title}</h4>
                    <p className="text-xs text-primary-foreground/60 mt-1">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-2xl p-4 border border-primary-foreground/10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-semibold text-gradient-gold">Do's</h4>
                </div>
                <ul className="space-y-2">
                  {dosAndDonts.dos.map((item, index) => (
                    <li key={index} className="text-xs text-primary-foreground/80 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass rounded-2xl p-4 border border-primary-foreground/10">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <h4 className="text-sm font-semibold text-gradient-gold">Don'ts</h4>
                </div>
                <ul className="space-y-2">
                  {dosAndDonts.donts.map((item, index) => (
                    <li key={index} className="text-xs text-primary-foreground/80 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Requirements */}
            <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gradient-gold">Requirements</h3>
              </div>
              <ul className="space-y-2 text-sm text-primary-foreground/80">
                <li>• Must be a Muslim & adult</li>
                <li>• Must be of sound mind</li>
                <li>• Must be physically & financially capable</li>
                <li>• Women need mahram or approved group</li>
              </ul>
            </div>
          </TabsContent>

          {/* Book Tab */}
          <TabsContent value="book" className="space-y-4 mt-4">
            <HajjCostCalculator />
            <HajjAgencies />
            <HajjBookingLinks />
          </TabsContent>

          {/* Prepare Tab */}
          <TabsContent value="prepare" className="space-y-4 mt-4">
            <HajjChecklist />
            <HajjFAQ />
          </TabsContent>

          {/* Learn Tab */}
          <TabsContent value="learn" className="space-y-4 mt-4">
            <HajjVideoGuides />
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default Hajj;
