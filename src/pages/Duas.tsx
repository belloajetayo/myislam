import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Heart, Sun, Moon, BookOpen, Star, Home, Compass, HandHeart, ChevronRight, Copy, Share2, X } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "after-salah", name: "Dua After Salah", icon: "🙏", color: "from-emerald-500 to-teal-600", desc: "Post-prayer supplications" },
  { id: "morning", name: "Morning Adhkar", icon: "🌅", color: "from-amber-400 to-orange-500", desc: "Subhe-Sadik to Sunrise" },
  { id: "evening", name: "Evening Adhkar", icon: "🌆", color: "from-rose-500 to-pink-600", desc: "After Asr to Maghrib" },
  { id: "daily", name: "Daily Duas", icon: "📿", color: "from-indigo-500 to-blue-600", desc: "Everyday supplications" },
  { id: "rabbana", name: "40 Rabbana Dua", icon: "📖", color: "from-purple-500 to-violet-600", desc: "Quranic duas starting with Rabbana" },
  { id: "ruquiya", name: "Ruquiya", icon: "🔥", color: "from-red-500 to-orange-600", desc: "Healing & protection duas" },
  { id: "hajj", name: "Hajj & Umrah", icon: "🕋", color: "from-slate-600 to-gray-700", desc: "Pilgrim supplications" },
  { id: "sleep", name: "Sleep & Wake", icon: "🌙", color: "from-blue-600 to-indigo-700", desc: "Before sleep and upon waking" },
  { id: "favorites", name: "My Favorites", icon: "❤️", color: "from-pink-500 to-rose-600", desc: "Your saved duas" },
];

const DUAS_DATA: Record<string, { arabic: string; transliteration: string; translation: string; source: string; times?: number }[]> = {
  morning: [
    { arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ", transliteration: "Asbahna wa asbahal mulku lillah", translation: "We have reached the morning and at this very time all sovereignty belongs to Allah", source: "Muslim", times: 1 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq", translation: "I seek refuge in the perfect words of Allah from the evil of what He has created", source: "Muslim", times: 3 },
    { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un", translation: "In the name of Allah with Whose name nothing can cause harm", source: "Abu Dawud", times: 3 },
    { arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا", transliteration: "Allahumma bika asbahna wa bika amsayna", translation: "O Allah, by You we enter the morning and by You we enter the evening", source: "Abu Dawud", times: 1 },
    { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "Subhanallahi wa bihamdihi", translation: "Glory be to Allah and praise be to Him", source: "Bukhari", times: 100 },
  ],
  evening: [
    { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ", transliteration: "Amsayna wa amsal mulku lillah", translation: "We have reached the evening and at this very time all sovereignty belongs to Allah", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ", transliteration: "Allahumma inni amsaytu ush-hiduka", translation: "O Allah, I have reached the evening and call upon You to witness", source: "Abu Dawud", times: 4 },
    { arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ", transliteration: "Allahumma ma amsa bi min ni'mah", translation: "O Allah, whatever blessing I or any of Your creation have received in the evening", source: "Abu Dawud", times: 1 },
  ],
  "after-salah": [
    { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", source: "Muslim", times: 3 },
    { arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ", transliteration: "Allahumma antas-salamu wa minkas-salam", translation: "O Allah, You are As-Salaam and from You is all peace", source: "Muslim", times: 1 },
    { arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "La ilaha illallahu wahdahu la sharika lah", translation: "None has the right to be worshipped except Allah alone", source: "Bukhari", times: 1 },
    { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Glory be to Allah", source: "Muslim", times: 33 },
    { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise is due to Allah", source: "Muslim", times: 33 },
    { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", source: "Muslim", times: 34 },
  ],
  daily: [
    { arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", translation: "In the name of Allah", source: "Bukhari", times: 1 },
    { arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا", transliteration: "Alhamdulillahil-ladhi at'amana wa saqana", translation: "Praise be to Allah Who has fed us and given us drink", source: "Abu Dawud", times: 1 },
    { arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا", transliteration: "Allahumma barik lana fima razaqtana", translation: "O Allah, bless us in what You have provided for us", source: "Ibn-Al-Sunni", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ", transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyah", translation: "O Allah, I ask You for pardon and well-being", source: "Ahmad", times: 1 },
  ],
  rabbana: [
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan", translation: "Our Lord! Grant us good in this world and good in the Hereafter", source: "Al-Baqarah 2:201", times: 1 },
    { arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا", transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana", translation: "Our Lord! Let not our hearts deviate after You have guided us", source: "Al-Imran 3:8", times: 1 },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا", transliteration: "Rabbanaghfir lana dhunubana", translation: "Our Lord! Forgive us our sins", source: "Al-Imran 3:193", times: 1 },
    { arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا", transliteration: "Rabbana dhalamna anfusana", translation: "Our Lord! We have wronged ourselves", source: "Al-Araf 7:23", times: 1 },
  ],
  ruquiya: [
    { arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ", transliteration: "Bismillahi arqika min kulli shay'in yu'dhika", translation: "In the name of Allah I perform ruqya for you, from everything that harms you", source: "Muslim", times: 3 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ", transliteration: "A'udhu bikalimatillahit-tammati min kulli shaytanin", translation: "I seek refuge in the perfect words of Allah from every devil", source: "Bukhari", times: 1 },
  ],
  hajj: [
    { arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ", transliteration: "Labbayk Allahumma labbayk", translation: "Here I am O Allah, here I am. Here I am, You have no partner, here I am", source: "Bukhari", times: 1 },
    { arabic: "اللَّهُمَّ اجْعَلْ هَذَا حَجًّا مَبْرُورًا", transliteration: "Allahumma-j'al hadha hajjan mabrura", translation: "O Allah make this an accepted pilgrimage", source: "Hadith", times: 1 },
  ],
  sleep: [
    { arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", translation: "In Your name O Allah, I die and I live", source: "Bukhari", times: 1 },
    { arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak", translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants", source: "Abu Dawud", times: 3 },
  ],
  favorites: [],
};

type DuaItem = { arabic: string; transliteration: string; translation: string; source: string; times?: number };

const DuaCard: React.FC<{ dua: DuaItem; index: number; onFavorite: () => void; isFav: boolean }> = ({ dua, index, onFavorite, isFav }) => {
  const handleCopy = () => {
    navigator.clipboard?.writeText(`${dua.arabic}\n${dua.transliteration}\n${dua.translation}\n[${dua.source}]`);
    toast.success("Copied to clipboard");
  };
  const handleShare = () => {
    navigator.share?.({ title: "Dua from MyIslam", text: `${dua.arabic}\n${dua.transliteration}\n${dua.translation}\n[${dua.source}]` });
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">{index}</span>
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 line-clamp-1">{dua.transliteration.split(' ').slice(0, 4).join(' ')}...</p>
        </div>
        {dua.times && (
          <div className="w-7 h-7 rounded-full bg-white dark:bg-white/10 border border-indigo-200 flex items-center justify-center">
            <span className="text-[10px] font-black text-indigo-600">{dua.times}x</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Arabic */}
        <p className="text-right text-xl leading-loose text-gray-900 dark:text-white font-arabic mb-3">{dua.arabic}</p>

        {/* Transliteration */}
        <p className="text-sm text-indigo-600 dark:text-indigo-300 italic mb-2">{dua.transliteration}</p>

        {/* Translation */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{dua.translation}</p>

        {/* Source + actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">[{dua.source}]</span>
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button onClick={handleShare} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button onClick={onFavorite} className={`p-1.5 rounded-lg transition-colors ${isFav ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}>
              <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Duas: React.FC = () => {
  const navigate = useNavigate();
  const { addDua } = useProgress();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<DuaItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("myislam_fav_duas") || "[]"); } catch { return []; }
  });

  const saveFavorites = (favs: DuaItem[]) => {
    setFavorites(favs);
    localStorage.setItem("myislam_fav_duas", JSON.stringify(favs));
  };

  const toggleFav = (dua: DuaItem) => {
    const exists = favorites.some(f => f.arabic === dua.arabic);
    if (exists) saveFavorites(favorites.filter(f => f.arabic !== dua.arabic));
    else { saveFavorites([...favorites, dua]); addDua(); toast.success("Added to favorites 🤲"); }
  };

  const isFav = (dua: DuaItem) => favorites.some(f => f.arabic === dua.arabic);

  const currentDuas = activeCategory === "favorites"
    ? favorites
    : activeCategory
    ? (DUAS_DATA[activeCategory] || [])
    : [];

  const filtered = search
    ? currentDuas.filter(d =>
        d.transliteration.toLowerCase().includes(search.toLowerCase()) ||
        d.translation.toLowerCase().includes(search.toLowerCase())
      )
    : currentDuas;

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  if (activeCategory) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4 pb-8">
          {/* Header */}
          <header className="flex items-center gap-3 py-3">
            <button onClick={() => { setActiveCategory(null); setSearch(""); }} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
              <ArrowLeft className="w-5 h-5 text-indigo-600" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground">{currentCat?.icon} {currentCat?.name}</h1>
              <p className="text-xs text-muted-foreground">{currentCat?.desc}</p>
            </div>
          </header>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search duas..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5 text-sm focus:outline-none focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Duas */}
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🤲</p>
              <p className="text-sm text-muted-foreground">{activeCategory === "favorites" ? "No favorites yet. Heart a dua to save it!" : "No duas found"}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((dua, i) => (
                <DuaCard key={i} dua={dua} index={i + 1} onFavorite={() => toggleFav(dua)} isFav={isFav(dua)} />
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button onClick={() => navigate("/")} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>Dua and Adhkar</h1>
            <p className="text-xs text-muted-foreground">Daily supplications & remembrance</p>
          </div>
        </header>

        {/* Category grid */}
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 shadow-sm active:scale-95 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md`}>
                {cat.icon}
              </div>
              <p className="text-[11px] font-bold text-foreground text-center leading-tight">{cat.name}</p>
            </button>
          ))}
        </div>

        {/* Favorites count */}
        {favorites.length > 0 && (
          <button
            onClick={() => setActiveCategory("favorites")}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800"
          >
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span className="flex-1 text-sm font-semibold text-foreground">My Favorites</span>
            <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-0.5 rounded-full">{favorites.length} saved</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </MobileLayout>
  );
};

export default Duas;
