import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { ArrowLeft, MapPin, Plane, CheckCircle, XCircle, Calendar, Info, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Hajj: React.FC = () => {
  const navigate = useNavigate();

  const hajjSteps = [
    { day: 'Day 1 (8th Dhul Hijjah)', title: 'Enter Ihram & Go to Mina', description: 'Put on Ihram garments, make intention, and travel to Mina. Pray Dhuhr, Asr, Maghrib, Isha, and Fajr.' },
    { day: 'Day 2 (9th Dhul Hijjah)', title: 'Day of Arafah', description: 'Travel to Arafah after Fajr. Stand in worship until sunset. This is the most important day of Hajj.' },
    { day: 'Night of 9th-10th', title: 'Muzdalifah', description: 'After sunset, travel to Muzdalifah. Pray Maghrib and Isha combined. Collect pebbles for stoning.' },
    { day: 'Day 3 (10th Dhul Hijjah)', title: 'Eid & Jamarat', description: 'Stone Jamarat al-Aqaba (7 pebbles), sacrifice animal, shave/trim hair, perform Tawaf al-Ifadah.' },
    { day: 'Days 4-6 (11th-13th)', title: 'Days of Tashreeq', description: 'Stay in Mina, stone all three Jamarat daily. Can leave on 12th after stoning if desired.' },
    { day: 'Final', title: 'Farewell Tawaf', description: 'Perform Tawaf al-Wida (farewell) before leaving Makkah.' },
  ];

  const dosAndDonts = {
    dos: [
      'Make sincere intention for Hajj',
      'Learn all rituals before going',
      'Stay patient and calm',
      'Help fellow pilgrims',
      'Make plenty of dua',
      'Maintain hygiene',
      'Stay hydrated',
      'Keep documents safe',
    ],
    donts: [
      'Argue or fight',
      'Hunt animals in Ihram',
      'Cut hair/nails in Ihram',
      'Use perfume in Ihram',
      'Cover head (men) in Ihram',
      'Engage in marital relations',
      'Waste food or resources',
      'Litter sacred places',
    ],
  };

  const packingList = [
    'Ihram garments (2 sets)',
    'Comfortable walking sandals',
    'Medications & first aid',
    'Sunscreen & umbrella',
    'Prayer mat',
    'Quran & dua book',
    'Money belt',
    'Reusable water bottle',
    'Unscented toiletries',
    'Copies of documents',
  ];

  const bookingLinks = [
    { name: 'Saudi Arabia eVisa', url: 'https://visa.visitsaudi.com/' },
    { name: 'Nusuk Hajj Portal', url: 'https://hajj.nusuk.sa/' },
  ];

  return (
    <MobileLayout showNav={false}>
      <div className="p-4 space-y-6">
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

        {/* Intro Card */}
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
            Hajj is the annual Islamic pilgrimage to Makkah, Saudi Arabia, and is mandatory once in a lifetime for every able-bodied Muslim who can afford it. It takes place during the month of Dhul Hijjah.
          </p>
        </div>

        {/* Hajj Steps */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-islamic-gold" />
            <h3 className="text-lg font-bold text-gradient-gold">How to Perform Hajj</h3>
          </div>
          <div className="space-y-4">
            {hajjSteps.map((step, index) => (
              <div key={index} className="relative pl-6 pb-4 border-l-2 border-primary-foreground/20 last:pb-0">
                <div className="absolute -left-2 top-0 w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-violet-500" />
                <p className="text-xs text-islamic-gold font-medium">{step.day}</p>
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

        {/* Packing List */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <h3 className="text-lg font-bold text-gradient-gold mb-4">Packing Essentials</h3>
          <div className="grid grid-cols-2 gap-2">
            {packingList.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-primary-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Links */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-5 h-5 text-islamic-gold" />
            <h3 className="text-lg font-bold text-gradient-gold">Plan Your Hajj</h3>
          </div>
          <div className="space-y-3">
            {bookingLinks.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 bg-primary/5 rounded-xl hover:bg-primary/10 transition-colors"
              >
                <span className="text-sm text-primary-foreground">{link.name}</span>
                <ExternalLink className="w-4 h-4 text-primary-foreground/60" />
              </a>
            ))}
            <p className="text-xs text-primary-foreground/60 mt-2">
              * We recommend booking through authorized Hajj agencies in your country for a smoother experience.
            </p>
          </div>
        </div>

        {/* Requirements */}
        <div className="glass rounded-3xl p-5 border border-primary-foreground/10 shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-5 h-5 text-islamic-gold" />
            <h3 className="font-semibold text-gradient-gold">Hajj Requirements</h3>
          </div>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li>• Must be a Muslim</li>
            <li>• Must be an adult (reached puberty)</li>
            <li>• Must be of sound mind</li>
            <li>• Must be physically able</li>
            <li>• Must be financially capable</li>
            <li>• Women need a mahram (male guardian) or a group</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Hajj;
