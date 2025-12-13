import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Search, BookOpen, Bookmark, Play, ChevronRight, Star } from 'lucide-react';

const surahs = [
  { number: 1, name: 'Al-Fatiha', arabic: 'الفاتحة', verses: 7, type: 'Meccan' },
  { number: 2, name: 'Al-Baqarah', arabic: 'البقرة', verses: 286, type: 'Medinan' },
  { number: 36, name: 'Ya-Sin', arabic: 'يس', verses: 83, type: 'Meccan', bookmarked: true },
  { number: 55, name: 'Ar-Rahman', arabic: 'الرحمن', verses: 78, type: 'Medinan' },
  { number: 67, name: 'Al-Mulk', arabic: 'الملك', verses: 30, type: 'Meccan', bookmarked: true },
  { number: 112, name: 'Al-Ikhlas', arabic: 'الإخلاص', verses: 4, type: 'Meccan' },
];

const duas = [
  { name: 'Morning Adhkar', arabic: 'أذكار الصباح', category: 'Daily' },
  { name: 'Evening Adhkar', arabic: 'أذكار المساء', category: 'Daily' },
  { name: 'Before Sleep', arabic: 'قبل النوم', category: 'Sleep' },
  { name: 'After Prayer', arabic: 'بعد الصلاة', category: 'Prayer' },
];

const Quran: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quran' | 'dua'>('quran');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <MobileLayout>
      <div className="p-4 space-y-4">
        {/* Header */}
        <header className="text-center py-2 animate-fade-in">
          <h1 className="text-xl font-bold text-gradient-gold">Qur'an & Dua</h1>
          <p className="text-xs text-gradient-gold opacity-80">Read, Listen & Reflect</p>
        </header>

        {/* Search */}
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-primary/10 shadow-soft animate-slide-up">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Surah or Dua..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex border border-primary/10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setActiveTab('quran')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'quran' 
                ? 'gradient-primary text-primary-foreground shadow-soft' 
                : 'text-muted-foreground'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Qur'an
          </button>
          <button
            onClick={() => setActiveTab('dua')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              activeTab === 'dua' 
                ? 'gradient-primary text-primary-foreground shadow-soft' 
                : 'text-muted-foreground'
            }`}
          >
            <Star className="w-4 h-4" />
            Dua
          </button>
        </div>

        {activeTab === 'quran' ? (
          <>
            {/* Last Read */}
            <div className="gradient-accent rounded-3xl p-4 shadow-glow animate-slide-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-xs">Last Read</p>
                  <h3 className="text-lg font-bold text-primary-foreground">Surah Al-Kahf</h3>
                  <p className="text-primary-foreground/90 text-sm">Ayah 45 of 110</p>
                </div>
                <button className="w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors">
                  <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                </button>
              </div>
              <div className="mt-3 w-full h-1.5 bg-primary-foreground/20 rounded-full">
                <div className="h-full w-[41%] bg-primary-foreground rounded-full" />
              </div>
            </div>

            {/* Surah List */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gradient-gold">Surahs</h3>
              {surahs.map((surah, index) => (
                <button
                  key={surah.number}
                  className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                    <span className="text-sm font-bold text-primary-foreground">{surah.number}</span>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{surah.name}</h4>
                      {surah.bookmarked && <Bookmark className="w-3 h-3 text-islamic-gold fill-islamic-gold" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{surah.verses} verses • {surah.type}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-arabic text-lg text-foreground">{surah.arabic}</p>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Dua Categories */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gradient-gold">Daily Duas</h3>
              {duas.map((dua, index) => (
                <button
                  key={index}
                  className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-soft">
                    <Star className="w-5 h-5 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">{dua.name}</h4>
                    <p className="text-xs text-muted-foreground">{dua.category}</p>
                  </div>
                  
                  <p className="font-arabic text-lg text-foreground">{dua.arabic}</p>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Sample Dua Display */}
            <div className="glass rounded-3xl p-5 border border-primary/10 shadow-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h4 className="text-sm font-semibold text-foreground mb-3">Dua for Guidance</h4>
              <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire."
              </p>
              <p className="text-xs text-primary mt-2">— Surah Al-Baqarah 2:201</p>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default Quran;
