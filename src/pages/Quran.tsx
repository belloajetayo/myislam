import React, { useState, useEffect } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Search, BookOpen, Bookmark, Play, ChevronRight, Star, ChevronLeft, Loader2, X, Moon } from 'lucide-react';
import { useQuranData, duasCollection, Surah, SurahDetail } from '@/hooks/useQuranData';
import { ScrollArea } from '@/components/ui/scroll-area';

const Quran: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quran' | 'dua'>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [selectedDuaCategory, setSelectedDuaCategory] = useState<typeof duasCollection[0] | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([36, 67, 112]);
  
  const { surahs, loading, error, fetchSurahDetail } = useQuranData();

  const filteredSurahs = surahs.filter(surah => 
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.name.includes(searchQuery) ||
    surah.number.toString().includes(searchQuery)
  );

  const filteredDuas = duasCollection.filter(dua =>
    dua.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dua.categoryArabic.includes(searchQuery)
  );

  const handleSurahClick = async (surahNumber: number) => {
    setLoadingSurah(true);
    const detail = await fetchSurahDetail(surahNumber);
    if (detail) {
      setSelectedSurah(detail);
    }
    setLoadingSurah(false);
  };

  const toggleBookmark = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSurahs(prev => 
      prev.includes(surahNumber) 
        ? prev.filter(n => n !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  // Surah Detail View
  if (selectedSurah) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 flex items-center gap-4 border-b border-primary/10">
            <button 
              onClick={() => setSelectedSurah(null)}
              className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">{selectedSurah.englishName}</h1>
              <p className="text-xs text-primary-foreground/70">
                {selectedSurah.englishNameTranslation} • {selectedSurah.ayahs.length} verses
              </p>
            </div>
            <div className="text-right">
              <p className="font-arabic text-xl text-foreground">{selectedSurah.name}</p>
            </div>
          </header>

          {/* Bismillah */}
          {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
            <div className="p-4 text-center border-b border-primary/10">
              <p className="font-arabic text-2xl text-foreground">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="text-sm text-muted-foreground mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </div>
          )}

          {/* Ayahs */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6 pb-8">
              {selectedSurah.ayahs.map((ayah, index) => (
                <div key={ayah.number} className="glass rounded-2xl p-4 border border-primary/10">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-primary-foreground">{ayah.numberInSurah}</span>
                    </div>
                    <p className="font-arabic text-xl text-foreground text-right flex-1 leading-loose">
                      {ayah.text}
                    </p>
                  </div>
                  {selectedSurah.translation[index] && (
                    <p className="text-sm text-muted-foreground pl-11 leading-relaxed">
                      {selectedSurah.translation[index].text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </MobileLayout>
    );
  }

  // Dua Detail View
  if (selectedDuaCategory) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <header className="p-4 flex items-center gap-4 border-b border-primary/10">
            <button 
              onClick={() => setSelectedDuaCategory(null)}
              className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">{selectedDuaCategory.category}</h1>
              <p className="text-xs text-primary-foreground/70">
                {selectedDuaCategory.duas.length} duas
              </p>
            </div>
            <div className="text-right">
              <p className="font-arabic text-xl text-foreground">{selectedDuaCategory.categoryArabic}</p>
            </div>
          </header>

          {/* Duas */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {selectedDuaCategory.duas.map((dua, index) => (
                <div key={index} className="glass rounded-2xl p-5 border border-primary/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                        <Moon className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Dua {index + 1}</span>
                    </div>
                    {dua.times > 1 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                        Repeat {dua.times}x
                      </span>
                    )}
                  </div>
                  <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">
                    {dua.arabic}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {dua.translation}
                  </p>
                  <p className="text-xs text-primary">— {dua.reference}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </MobileLayout>
    );
  }

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
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
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
                  <h3 className="text-lg font-bold text-primary-foreground">Surah Al-Fatiha</h3>
                  <p className="text-primary-foreground/90 text-sm">The Opening</p>
                </div>
                <button 
                  onClick={() => handleSurahClick(1)}
                  className="w-12 h-12 bg-primary-foreground/20 rounded-2xl flex items-center justify-center hover:bg-primary-foreground/30 transition-colors"
                >
                  {loadingSurah ? (
                    <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
                  ) : (
                    <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                  )}
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Surah List */}
            {!loading && !error && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gradient-gold">All Surahs</h3>
                  <span className="text-xs text-muted-foreground">{filteredSurahs.length} surahs</span>
                </div>
                {filteredSurahs.slice(0, 20).map((surah, index) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahClick(surah.number)}
                    className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${0.2 + index * 0.03}s` }}
                  >
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                      <span className="text-sm font-bold text-primary-foreground">{surah.number}</span>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{surah.englishName}</h4>
                        <button onClick={(e) => toggleBookmark(surah.number, e)}>
                          <Bookmark className={`w-3 h-3 ${bookmarkedSurahs.includes(surah.number) ? 'text-islamic-gold fill-islamic-gold' : 'text-muted-foreground'}`} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{surah.numberOfAyahs} verses • {surah.revelationType}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-arabic text-lg text-foreground">{surah.name}</p>
                    </div>
                    
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
                {filteredSurahs.length > 20 && (
                  <p className="text-center text-xs text-muted-foreground py-2">
                    Showing first 20 results. Refine your search to see more.
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Dua Categories */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gradient-gold">Dua Collections</h3>
                <span className="text-xs text-muted-foreground">{filteredDuas.length} categories</span>
              </div>
              {filteredDuas.map((duaCategory, index) => (
                <button
                  key={duaCategory.id}
                  onClick={() => setSelectedDuaCategory(duaCategory)}
                  className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                >
                  <div className="w-10 h-10 gradient-accent rounded-xl flex items-center justify-center shadow-soft">
                    <Star className="w-5 h-5 text-primary-foreground" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <h4 className="font-semibold text-foreground">{duaCategory.category}</h4>
                    <p className="text-xs text-muted-foreground">{duaCategory.duas.length} duas</p>
                  </div>
                  
                  <p className="font-arabic text-lg text-foreground">{duaCategory.categoryArabic}</p>
                  
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Featured Dua */}
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
