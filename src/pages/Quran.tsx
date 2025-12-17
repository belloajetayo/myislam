import React, { useState } from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { Search, BookOpen, Bookmark, Play, ChevronRight, Star, ChevronLeft, Loader2, X, Moon, ScrollText, Users } from 'lucide-react';
import { useQuranData, duasCollection, SurahDetail } from '@/hooks/useQuranData';
import { ScrollArea } from '@/components/ui/scroll-area';

// Hadith Collection
const hadithCollection = [
  {
    id: 1,
    category: "Faith & Belief",
    categoryArabic: "الإيمان",
    hadiths: [
      {
        arabic: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ",
        translation: "Actions are judged by intentions.",
        narrator: "Umar ibn Al-Khattab",
        source: "Sahih Bukhari 1, Sahih Muslim 1907",
        explanation: "This foundational hadith teaches that the value of any action depends on the intention behind it."
      },
      {
        arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation: "None of you truly believes until he loves for his brother what he loves for himself.",
        narrator: "Anas ibn Malik",
        source: "Sahih Bukhari 13, Sahih Muslim 45",
        explanation: "True faith is demonstrated through genuine concern for others' wellbeing."
      }
    ]
  },
  {
    id: 2,
    category: "Good Character",
    categoryArabic: "حسن الخلق",
    hadiths: [
      {
        arabic: "أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا",
        translation: "The most complete believers in faith are those with the best character.",
        narrator: "Abu Hurairah",
        source: "Sunan At-Tirmidhi 1162",
        explanation: "Good character is a sign of strong faith and is beloved to Allah."
      },
      {
        arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
        translation: "Your smile for your brother is charity.",
        narrator: "Abu Dharr",
        source: "Sunan At-Tirmidhi 1956",
        explanation: "Even small acts of kindness carry great reward."
      }
    ]
  },
  {
    id: 3,
    category: "Patience & Gratitude",
    categoryArabic: "الصبر والشكر",
    hadiths: [
      {
        arabic: "عَجَبًا لِأَمْرِ الْمُؤْمِنِ، إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ",
        translation: "How wonderful is the case of a believer; there is good for him in everything.",
        narrator: "Suhaib",
        source: "Sahih Muslim 2999",
        explanation: "A believer finds blessing in both ease and hardship through gratitude and patience."
      }
    ]
  },
  {
    id: 4,
    category: "Worship & Prayer",
    categoryArabic: "العبادة والصلاة",
    hadiths: [
      {
        arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ",
        translation: "Purification is half of faith.",
        narrator: "Abu Malik Al-Ash'ari",
        source: "Sahih Muslim 223",
        explanation: "Cleanliness and purification are fundamental aspects of Islamic practice."
      },
      {
        arabic: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ",
        translation: "The closest a servant is to his Lord is when he is in prostration.",
        narrator: "Abu Hurairah",
        source: "Sahih Muslim 482",
        explanation: "Sujood is a moment of profound spiritual connection with Allah."
      }
    ]
  },
  {
    id: 5,
    category: "Family & Society",
    categoryArabic: "الأسرة والمجتمع",
    hadiths: [
      {
        arabic: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ",
        translation: "The best of you are those who are best to their families.",
        narrator: "Aisha",
        source: "Sunan At-Tirmidhi 3895",
        explanation: "How we treat our family members reflects our true character."
      }
    ]
  }
];

// Stories of the Prophets
const prophetStories = [
  {
    id: 1,
    name: "Adam (آدم)",
    title: "The First Human",
    arabicName: "آدم عليه السلام",
    summary: "Adam was the first human created by Allah from clay. He was given knowledge of all things and made vicegerent on Earth. His story teaches us about free will, repentance, and Allah's mercy.",
    keyLessons: ["Importance of repentance (Tawbah)", "Dangers of arrogance (from Iblis)", "Allah's infinite mercy"],
    quranicReference: "Surah Al-Baqarah 2:30-39",
    image: "🌍"
  },
  {
    id: 2,
    name: "Nuh (نوح)",
    title: "The Patient Preacher",
    arabicName: "نوح عليه السلام",
    summary: "Prophet Nuh called his people to worship Allah alone for 950 years. Despite facing rejection, he remained steadfast. He built the Ark by Allah's command to save the believers from the great flood.",
    keyLessons: ["Patience in dawah", "Trusting Allah's plan", "Family bonds vs faith"],
    quranicReference: "Surah Nuh 71:1-28",
    image: "🚢"
  },
  {
    id: 3,
    name: "Ibrahim (إبراهيم)",
    title: "The Friend of Allah",
    arabicName: "إبراهيم عليه السلام",
    summary: "Ibrahim is known as Khalilullah (Friend of Allah). He was tested with building the Kaaba, sacrificing his son, and being thrown into fire. His unwavering faith made him a model for all believers.",
    keyLessons: ["Complete submission to Allah", "Rejecting idol worship", "Trust during extreme trials"],
    quranicReference: "Surah Ibrahim 14:35-41",
    image: "🕋"
  },
  {
    id: 4,
    name: "Yusuf (يوسف)",
    title: "The Patient & Beautiful",
    arabicName: "يوسف عليه السلام",
    summary: "Yusuf's story is called 'the best of stories' in the Quran. From being thrown in a well by his brothers, to imprisonment, to becoming Egypt's treasurer, his journey shows Allah's perfect planning.",
    keyLessons: ["Patience through injustice", "Chastity and moral integrity", "Forgiveness of those who wrong us"],
    quranicReference: "Surah Yusuf 12:1-111",
    image: "⭐"
  },
  {
    id: 5,
    name: "Musa (موسى)",
    title: "The Speaker with Allah",
    arabicName: "موسى عليه السلام",
    summary: "Musa is mentioned more than any other prophet in the Quran. His mission to free Bani Israel from Pharaoh, receiving the Torah, and his conversations with Allah are central to his story.",
    keyLessons: ["Standing against tyranny", "Trusting Allah in difficulty", "Humility despite greatness"],
    quranicReference: "Surah Al-Qasas 28:1-46",
    image: "📜"
  },
  {
    id: 6,
    name: "Isa (عيسى)",
    title: "The Messiah",
    arabicName: "عيسى عليه السلام",
    summary: "Isa was born miraculously to Maryam without a father. He performed miracles by Allah's permission, including healing the sick and raising the dead. He was raised to heaven and will return.",
    keyLessons: ["Miracles are by Allah's will", "Speaking truth to power", "Devotion to worship"],
    quranicReference: "Surah Al-Imran 3:45-55",
    image: "✨"
  },
  {
    id: 7,
    name: "Muhammad (محمد)",
    title: "The Final Messenger",
    arabicName: "محمد ﷺ",
    summary: "The seal of all prophets, sent as a mercy to all worlds. His life exemplifies the perfect implementation of Islam - from his trustworthiness before prophethood to establishing the final message.",
    keyLessons: ["Mercy and compassion", "Perseverance in hardship", "Perfect balance in life"],
    quranicReference: "Surah Al-Ahzab 33:21",
    image: "🌙"
  }
];

const Quran: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'quran' | 'dua' | 'hadith' | 'prophets'>('quran');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [selectedDuaCategory, setSelectedDuaCategory] = useState<typeof duasCollection[0] | null>(null);
  const [selectedHadithCategory, setSelectedHadithCategory] = useState<typeof hadithCollection[0] | null>(null);
  const [selectedProphet, setSelectedProphet] = useState<typeof prophetStories[0] | null>(null);
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

  const filteredHadiths = hadithCollection.filter(h =>
    h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.categoryArabic.includes(searchQuery)
  );

  const filteredProphets = prophetStories.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.arabicName.includes(searchQuery)
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

          {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
            <div className="p-4 text-center border-b border-primary/10">
              <p className="font-arabic text-2xl text-foreground">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="text-sm text-muted-foreground mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </div>
          )}

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
          <header className="p-4 flex items-center gap-4 border-b border-primary/10">
            <button 
              onClick={() => setSelectedDuaCategory(null)}
              className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">{selectedDuaCategory.category}</h1>
              <p className="text-xs text-primary-foreground/70">{selectedDuaCategory.duas.length} duas</p>
            </div>
            <p className="font-arabic text-xl text-foreground">{selectedDuaCategory.categoryArabic}</p>
          </header>

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
                  <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">{dua.arabic}</p>
                  <p className="text-sm text-foreground leading-relaxed mb-2">{dua.translation}</p>
                  <p className="text-xs text-primary">— {dua.reference}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </MobileLayout>
    );
  }

  // Hadith Detail View
  if (selectedHadithCategory) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full">
          <header className="p-4 flex items-center gap-4 border-b border-primary/10">
            <button 
              onClick={() => setSelectedHadithCategory(null)}
              className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">{selectedHadithCategory.category}</h1>
              <p className="text-xs text-primary-foreground/70">{selectedHadithCategory.hadiths.length} hadiths</p>
            </div>
            <p className="font-arabic text-xl text-foreground">{selectedHadithCategory.categoryArabic}</p>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {selectedHadithCategory.hadiths.map((hadith, index) => (
                <div key={index} className="glass rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <ScrollText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">Hadith {index + 1}</span>
                  </div>
                  <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">{hadith.arabic}</p>
                  <p className="text-sm text-foreground leading-relaxed mb-3 font-medium">"{hadith.translation}"</p>
                  <p className="text-xs text-muted-foreground mb-2 italic">{hadith.explanation}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-amber-600">Narrated by {hadith.narrator}</span>
                    <span className="text-xs text-muted-foreground">{hadith.source}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </MobileLayout>
    );
  }

  // Prophet Story Detail View
  if (selectedProphet) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full">
          <header className="p-4 flex items-center gap-4 border-b border-primary/10">
            <button 
              onClick={() => setSelectedProphet(null)}
              className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">{selectedProphet.name}</h1>
              <p className="text-xs text-primary-foreground/70">{selectedProphet.title}</p>
            </div>
            <p className="font-arabic text-xl text-foreground">{selectedProphet.arabicName}</p>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {/* Hero Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
                <div className="absolute top-0 right-0 text-8xl opacity-20">{selectedProphet.image}</div>
                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">{selectedProphet.image}</span>
                  <h2 className="text-2xl font-bold mb-1">{selectedProphet.name}</h2>
                  <p className="text-white/80 text-sm">{selectedProphet.title}</p>
                </div>
              </div>

              {/* Story Summary */}
              <div className="glass rounded-2xl p-5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Story Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedProphet.summary}</p>
              </div>

              {/* Key Lessons */}
              <div className="glass rounded-2xl p-5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Key Lessons
                </h3>
                <div className="space-y-2">
                  {selectedProphet.keyLessons.map((lesson, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-amber-500/10">
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quranic Reference */}
              <div className="glass rounded-2xl p-5 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  Quranic Reference
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400 font-medium">{selectedProphet.quranicReference}</p>
              </div>
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
          <h1 className="text-xl font-bold text-gradient-gold">Iman & Knowledge</h1>
          <p className="text-xs text-gradient-gold opacity-80">Quran • Hadith • Prophets • Dua</p>
        </header>

        {/* Search */}
        <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-primary/10 shadow-soft animate-slide-up">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="glass rounded-2xl p-1 flex border border-primary/10 animate-slide-up overflow-x-auto" style={{ animationDelay: '0.1s' }}>
          {[
            { key: 'quran', label: "Qur'an", icon: BookOpen },
            { key: 'hadith', label: 'Hadith', icon: ScrollText },
            { key: 'prophets', label: 'Prophets', icon: Users },
            { key: 'dua', label: 'Dua', icon: Star },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'gradient-primary text-primary-foreground shadow-soft' 
                  : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quran Tab */}
        {activeTab === 'quran' && (
          <>
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

            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {error && (
              <div className="text-center py-8">
                <p className="text-destructive">{error}</p>
              </div>
            )}

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
                    <p className="font-arabic text-lg text-foreground">{surah.name}</p>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Hadith Tab */}
        {activeTab === 'hadith' && (
          <div className="space-y-3">
            {/* Featured Hadith */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 shadow-xl animate-slide-up">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <p className="text-white/80 text-xs mb-2">Hadith of the Day</p>
                <p className="font-arabic text-xl text-white text-right leading-loose mb-3">
                  إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
                </p>
                <p className="text-white text-sm font-medium">"Actions are judged by intentions."</p>
                <p className="text-white/70 text-xs mt-2">— Sahih Bukhari</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gradient-gold">Hadith Collections</h3>
              <span className="text-xs text-muted-foreground">{filteredHadiths.length} categories</span>
            </div>

            {filteredHadiths.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setSelectedHadithCategory(category)}
                className="w-full glass rounded-2xl p-4 border border-amber-500/20 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up bg-gradient-to-r from-amber-500/5 to-orange-500/5"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-soft">
                  <ScrollText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{category.category}</h4>
                  <p className="text-xs text-muted-foreground">{category.hadiths.length} hadiths</p>
                </div>
                <p className="font-arabic text-lg text-foreground">{category.categoryArabic}</p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Prophets Tab */}
        {activeTab === 'prophets' && (
          <div className="space-y-3">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 shadow-xl animate-slide-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <p className="text-white/80 text-xs mb-2">Stories of the Prophets</p>
                <h3 className="text-xl font-bold text-white mb-1">قصص الأنبياء</h3>
                <p className="text-white/90 text-sm">Learn from the lives of Allah's chosen messengers</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gradient-gold">All Prophets</h3>
              <span className="text-xs text-muted-foreground">{filteredProphets.length} stories</span>
            </div>

            {filteredProphets.map((prophet, index) => (
              <button
                key={prophet.id}
                onClick={() => setSelectedProphet(prophet)}
                className="w-full glass rounded-2xl p-4 border border-purple-500/20 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up bg-gradient-to-r from-purple-500/5 to-indigo-500/5"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-soft text-2xl">
                  {prophet.image}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-foreground">{prophet.name}</h4>
                  <p className="text-xs text-muted-foreground">{prophet.title}</p>
                </div>
                <p className="font-arabic text-sm text-foreground">{prophet.arabicName}</p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Dua Tab */}
        {activeTab === 'dua' && (
          <>
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
