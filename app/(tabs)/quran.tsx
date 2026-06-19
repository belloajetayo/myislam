import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  Switch,
  Linking,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Search,
  BookOpen,
  Bookmark,
  Play,
  ChevronRight,
  Star,
  ChevronLeft,
  X,
  Moon,
  ScrollText,
  Users,
  Pause,
  Volume2,
  SkipForward,
  SkipBack,
  WifiOff,
  BookText,
  Download,
  Check,
  ArrowUp,
} from "lucide-react-native";
import { useQuranData, duasCollection, type SurahDetail } from "@/hooks/useQuranData";
import { useAudio } from "@/context/AudioContext";
import { useProgress } from "@/hooks/useProgress";

// ─── Data ─────────────────────────────────────────────────────────────────────

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
        explanation: "This foundational hadith teaches that the value of any action depends on the intention behind it.",
      },
      {
        arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation: "None of you truly believes until he loves for his brother what he loves for himself.",
        narrator: "Anas ibn Malik",
        source: "Sahih Bukhari 13, Sahih Muslim 45",
        explanation: "True faith is demonstrated through genuine concern for others' wellbeing.",
      },
    ],
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
        explanation: "Good character is a sign of strong faith and is beloved to Allah.",
      },
      {
        arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
        translation: "Your smile for your brother is charity.",
        narrator: "Abu Dharr",
        source: "Sunan At-Tirmidhi 1956",
        explanation: "Even small acts of kindness carry great reward.",
      },
    ],
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
        explanation: "A believer finds blessing in both ease and hardship through gratitude and patience.",
      },
    ],
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
        explanation: "Cleanliness and purification are fundamental aspects of Islamic practice.",
      },
      {
        arabic: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ",
        translation: "The closest a servant is to his Lord is when he is in prostration.",
        narrator: "Abu Hurairah",
        source: "Sahih Muslim 482",
        explanation: "Sujood is a moment of profound spiritual connection with Allah.",
      },
    ],
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
        explanation: "How we treat our family members reflects our true character.",
      },
    ],
  },
];

const prophetStories = [
  {
    id: 1,
    name: "Adam (آدم)",
    title: "The First Human",
    arabicName: "آدم عليه السلام",
    summary: "Adam was the first human created by Allah from clay. He was given knowledge of all things and made vicegerent on Earth. His story teaches us about free will, repentance, and Allah's mercy.",
    keyLessons: [
      "Importance of repentance (Tawbah) — Allah forgives those who sincerely repent",
      "Dangers of arrogance — Iblis fell from grace due to pride",
      "Allah's infinite mercy — He forgave Adam despite his mistake",
      "Knowledge is a blessing — Adam was honored with knowledge of names",
    ],
    quranicReferences: ["Surah Al-Baqarah 2:30-39", "Surah Al-A'raf 7:11-25", "Surah Ta-Ha 20:115-123"],
    image: "🌍",
    videoId: "y3PubD0tA2I",
  },
  {
    id: 2,
    name: "Nuh (نوح)",
    title: "The Patient Preacher",
    arabicName: "نوح عليه السلام",
    summary: "Prophet Nuh called his people to worship Allah alone for 950 years. Despite facing rejection, he remained steadfast. He built the Ark by Allah's command to save the believers from the great flood.",
    keyLessons: [
      "Patience in dawah — 950 years of persistent calling",
      "Trusting Allah's plan even when results seem absent",
      "Faith over family ties when they oppose truth",
      "Obedience to Allah even in the face of ridicule",
    ],
    quranicReferences: ["Surah Nuh 71:1-28", "Surah Hud 11:25-49", "Surah Al-Mu'minun 23:23-30"],
    image: "🚢",
    videoId: "LGCm2IPlIsU",
  },
  {
    id: 3,
    name: "Ibrahim (إبراهيم)",
    title: "The Friend of Allah (Khalilullah)",
    arabicName: "إبراهيم عليه السلام",
    summary: "Ibrahim is known as Khalilullah (Friend of Allah). He was tested with building the Kaaba, sacrificing his son, and being thrown into fire. His unwavering faith made him a model for all believers.",
    keyLessons: [
      "Complete submission (Islam) to Allah's will",
      "Using intellect to recognize the truth",
      "Rejecting idol worship despite social pressure",
      "Trust in Allah during extreme trials",
    ],
    quranicReferences: ["Surah Al-Baqarah 2:124-131", "Surah As-Saffat 37:83-111", "Surah Al-Anbiya 21:51-73"],
    image: "🕋",
    videoId: "ZzWI0EsWrh4",
  },
  {
    id: 4,
    name: "Yusuf (يوسف)",
    title: "The Patient & Beautiful",
    arabicName: "يوسف عليه السلام",
    summary: "Yusuf's story is called 'the best of stories' in the Quran. From being thrown in a well by his brothers, to imprisonment, to becoming Egypt's treasurer, his journey shows Allah's perfect planning.",
    keyLessons: [
      "Patience through injustice brings ultimate reward",
      "Maintaining chastity in the face of temptation",
      "Forgiveness of those who wronged us",
      "Allah's plan is always perfect, even when we can't see it",
    ],
    quranicReferences: ["Surah Yusuf 12:1-111 (Entire surah)", "Surah Al-An'am 6:84"],
    image: "⭐",
    videoId: "e0SkM4vEuTg",
  },
  {
    id: 5,
    name: "Musa (موسى)",
    title: "The Speaker with Allah (Kalimullah)",
    arabicName: "موسى عليه السلام",
    summary: "Musa is mentioned more than any other prophet in the Quran. His mission to free Bani Israel from Pharaoh, receiving the Torah, and his conversations with Allah are central to his story.",
    keyLessons: [
      "Standing against tyranny and oppression",
      "Trust in Allah during impossible situations",
      "Humility despite being chosen for greatness",
      "The importance of brotherhood and support",
    ],
    quranicReferences: ["Surah Ta-Ha 20:9-98", "Surah Al-A'raf 7:103-162", "Surah Al-Qasas 28:1-46"],
    image: "📜",
    videoId: "rcAM6N7BQII",
  },
  {
    id: 6,
    name: "Isa (عيسى)",
    title: "The Messiah (Al-Masih)",
    arabicName: "عيسى عليه السلام",
    summary: "Isa was born miraculously to Maryam without a father. He performed miracles by Allah's permission, including healing the sick and raising the dead. He was raised to heaven and will return.",
    keyLessons: [
      "Miracles are only by Allah's permission",
      "Isa is a prophet, not divine — he worshipped Allah",
      "Complete devotion to worship",
      "Patience in the face of rejection",
    ],
    quranicReferences: ["Surah Al-Imran 3:42-60", "Surah Maryam 19:16-36", "Surah Al-Ma'idah 5:110-120"],
    image: "✨",
    videoId: "WvQLVguP8nY",
  },
  {
    id: 7,
    name: "Muhammad (محمد)",
    title: "The Final Messenger ﷺ",
    arabicName: "محمد ﷺ",
    summary: "The seal of all prophets, sent as a mercy to all worlds. His life exemplifies the perfect implementation of Islam — from his trustworthiness before prophethood to establishing the final message.",
    keyLessons: [
      "Mercy and compassion in all dealings",
      "Perseverance through extreme hardship",
      "Perfect balance between worship and worldly life",
      "Justice and equality regardless of status",
    ],
    quranicReferences: ["Surah Al-Ahzab 33:21", "Surah Al-Anbiya 21:107", "Surah Al-Fath 48:29"],
    image: "🌙",
    videoId: "DdWxCVYAOCk",
  },
];

// ─── Styles ────────────────────────────────────────────────────────────────────
const BG = "#110e24";
const GOLD = "#F59E0B";
const GREEN = "#10B981";
const CARD_BG = "rgba(255,255,255,0.05)";
const CARD_BORDER = "rgba(255,255,255,0.08)";
const MUTED = "rgba(255,255,255,0.4)";
const WHITE = "rgba(255,255,255,0.92)";

// ─── Component ────────────────────────────────────────────────────────────────
type Tab = "quran" | "dua" | "hadith" | "prophets";

export default function QuranScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("quran");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [selectedDua, setSelectedDua] = useState<typeof duasCollection[0] | null>(null);
  const [selectedHadith, setSelectedHadith] = useState<typeof hadithCollection[0] | null>(null);
  const [selectedProphet, setSelectedProphet] = useState<typeof prophetStories[0] | null>(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [bookmarked, setBookmarked] = useState<number[]>([36, 67, 112]);
  const [showTranslit, setShowTranslit] = useState(true);
  const [mushafMode, setMushafMode] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);
  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null);
  const [lastRead, setLastRead] = useState(() => {
    const num = localStorage.getItem("myislam_last_read_surah_number");
    const name = localStorage.getItem("myislam_last_read_surah_name");
    const trans = localStorage.getItem("myislam_last_read_surah_translation");
    return { number: num ? parseInt(num) : 1, name: name || "Al-Fatiha", translation: trans || "The Opening" };
  });

  const { surahs, loading, error, fetchSurahDetail, audioEditions, isOffline } = useQuranData();
  const { isPlaying, currentSurah, currentAyahIndex, selectedReciter, setSelectedReciter, playSurah, togglePlayPause, playNext, playPrevious, audioProgress } = useAudio();
  const { addQuranPages } = useProgress();

  const ayahListRef = useRef<FlatList>(null);
  const isViewingCurrent = !!(currentSurah && selectedSurah && currentSurah.number === selectedSurah.number);

  // Check cached surahs on mount
  useEffect(() => {
    const cached: number[] = [];
    for (let i = 1; i <= 114; i++) {
      if (localStorage.getItem(`quran_cache_surah_${i}_ar.alafasy`)) cached.push(i);
    }
    setDownloadedSurahs(cached);
  }, []);

  // Scroll to active ayah during playback
  useEffect(() => {
    if (isViewingCurrent && ayahListRef.current && selectedSurah) {
      try {
        ayahListRef.current.scrollToIndex({ index: currentAyahIndex, animated: true, viewPosition: 0.3 });
      } catch (_) {}
    }
  }, [currentAyahIndex, isViewingCurrent]);

  const openSurah = useCallback(async (surahNumber: number) => {
    setLoadingSurah(true);
    const detail = await fetchSurahDetail(surahNumber, selectedReciter);
    if (detail) {
      setSelectedSurah(detail);
      localStorage.setItem("myislam_last_read_surah_number", surahNumber.toString());
      localStorage.setItem("myislam_last_read_surah_name", detail.englishName);
      localStorage.setItem("myislam_last_read_surah_translation", detail.englishNameTranslation);
      setLastRead({ number: surahNumber, name: detail.englishName, translation: detail.englishNameTranslation });
    }
    setLoadingSurah(false);
  }, [fetchSurahDetail, selectedReciter]);

  const downloadSurah = useCallback(async (num: number) => {
    if (downloadedSurahs.includes(num) || downloadingSurah === num) return;
    setDownloadingSurah(num);
    const detail = await fetchSurahDetail(num, "ar.alafasy");
    if (detail) setDownloadedSurahs(prev => [...prev, num]);
    setDownloadingSurah(null);
  }, [downloadedSurahs, downloadingSurah, fetchSurahDetail]);

  const popularReciters = audioEditions.filter(e =>
    ["ar.alafasy", "ar.abdurrahmaansudais", "ar.minshawi", "ar.husary", "ar.abdulbasitmurattal"].includes(e.identifier)
  );
  const reciterOptions = popularReciters.length > 0 ? popularReciters : audioEditions.slice(0, 5);
  const currentReciterName = reciterOptions.find(r => r.identifier === selectedReciter)?.englishName || selectedReciter;

  const filterText = searchQuery.toLowerCase();
  const filteredSurahs = surahs.filter(s =>
    s.englishName.toLowerCase().includes(filterText) ||
    s.name.includes(searchQuery) ||
    s.number.toString().includes(searchQuery)
  );
  const filteredDuas = duasCollection.filter(d =>
    d.category.toLowerCase().includes(filterText) || d.categoryArabic.includes(searchQuery)
  );
  const filteredHadiths = hadithCollection.filter(h =>
    h.category.toLowerCase().includes(filterText) || h.categoryArabic.includes(searchQuery)
  );
  const filteredProphets = prophetStories.filter(p =>
    p.name.toLowerCase().includes(filterText) || p.arabicName.includes(searchQuery)
  );

  // ── Surah Reading View ──────────────────────────────────────────────────────
  if (selectedSurah) {
    const ayahs = selectedSurah.ayahs || [];
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <TouchableOpacity onPress={() => setSelectedSurah(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontSize: 17, fontWeight: "700" }}>{selectedSurah.englishName}</Text>
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{selectedSurah.englishNameTranslation} · {ayahs.length} verses</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ color: WHITE, fontSize: 20 }}>{selectedSurah.name}</Text>
            <Text style={{ color: MUTED, fontSize: 11 }}>{selectedSurah.number}/114</Text>
          </View>
        </View>

        {/* Audio Controls */}
        <View style={{ padding: 12, paddingBottom: 8, backgroundColor: "rgba(245,158,11,0.04)", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <TouchableOpacity
              onPress={() => isViewingCurrent && currentAyahIndex > 0 ? playPrevious() : null}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.12)", alignItems: "center", justifyContent: "center", marginRight: 8, opacity: isViewingCurrent && currentAyahIndex > 0 ? 1 : 0.4 }}>
              <SkipBack size={16} color={GOLD} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => isViewingCurrent ? togglePlayPause() : playSurah(selectedSurah, 0)}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
              {isViewingCurrent && isPlaying ? <Pause size={20} color="white" fill="white" /> : <Play size={20} color="white" fill="white" />}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => isViewingCurrent && currentAyahIndex < ayahs.length - 1 ? playNext() : null}
              style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.12)", alignItems: "center", justifyContent: "center", marginRight: 8, opacity: isViewingCurrent && currentAyahIndex < ayahs.length - 1 ? 1 : 0.4 }}>
              <SkipForward size={16} color={GOLD} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ color: MUTED, fontSize: 11, marginBottom: 4 }}>
                Ayah {(isViewingCurrent ? currentAyahIndex : 0) + 1} of {ayahs.length}
              </Text>
              <View style={{ height: 3, backgroundColor: "rgba(245,158,11,0.15)", borderRadius: 2 }}>
                <View style={{ height: 3, backgroundColor: GOLD, borderRadius: 2, width: `${isViewingCurrent ? audioProgress : 0}%` }} />
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowReciterModal(true)} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.12)", paddingHorizontal: 8, paddingVertical: 6, borderRadius: 10 }}>
              <Volume2 size={12} color={GOLD} />
              <Text style={{ color: GOLD, fontSize: 10, marginLeft: 4 }} numberOfLines={1}>{currentReciterName.split(" ")[0]}</Text>
            </TouchableOpacity>
          </View>

          {/* Mode buttons */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity onPress={() => setMushafMode(!mushafMode)} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: mushafMode ? GREEN : "rgba(16,185,129,0.12)" }}>
              <Text style={{ color: mushafMode ? "white" : GREEN, fontSize: 11 }}>Mushaf</Text>
            </TouchableOpacity>
            {!mushafMode && (
              <TouchableOpacity onPress={() => setShowTranslit(!showTranslit)} style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: showTranslit ? GOLD : "rgba(245,158,11,0.12)" }}>
                <Text style={{ color: showTranslit ? "white" : GOLD, fontSize: 11 }}>Transliteration</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => { addQuranPages(1); Alert.alert("", "Logged 1 page of Quran read! Mashallah. 🌙"); }}
              style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, backgroundColor: "rgba(16,185,129,0.12)", flexDirection: "row", alignItems: "center" }}>
              <Check size={11} color={GREEN} />
              <Text style={{ color: GREEN, fontSize: 11, marginLeft: 4 }}>Log Page</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bismillah */}
        {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
          <View style={{ padding: 16, alignItems: "center", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
            <Text style={{ color: WHITE, fontSize: 22, textAlign: "center" }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
            {!mushafMode && <Text style={{ color: MUTED, fontSize: 12, marginTop: 4 }}>In the name of Allah, the Most Gracious, the Most Merciful</Text>}
          </View>
        )}

        {/* Ayah List */}
        <FlatList
          ref={ayahListRef}
          data={ayahs}
          keyExtractor={item => item.number.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
          onScrollToIndexFailed={() => {}}
          renderItem={({ item, index }) => {
            const isActive = isViewingCurrent && currentAyahIndex === index;
            if (mushafMode) {
              return (
                <View style={{ marginBottom: 0 }}>
                  <Text style={{ color: isActive && isPlaying ? GOLD : WHITE, fontSize: 22, textAlign: "right", lineHeight: 44 }}>
                    {item.text}
                    <Text style={{ color: GOLD, fontSize: 14 }}> ۝{item.numberInSurah}</Text>
                  </Text>
                </View>
              );
            }
            return (
              <View style={{ backgroundColor: isActive ? "rgba(245,158,11,0.08)" : CARD_BG, borderRadius: 16, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: isActive ? "rgba(245,158,11,0.3)" : CARD_BORDER }}>
                <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 10 }}>
                  <View style={{ alignItems: "center", marginRight: 12 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center", marginBottom: 6 }}>
                      <Text style={{ color: GOLD, fontSize: 12, fontWeight: "700" }}>{item.numberInSurah}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => isViewingCurrent && currentAyahIndex === index ? togglePlayPause() : playSurah(selectedSurah, index)}
                      style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: isActive && isPlaying ? GOLD : "rgba(245,158,11,0.15)", alignItems: "center", justifyContent: "center" }}>
                      {isActive && isPlaying ? <Pause size={11} color="white" fill="white" /> : <Play size={11} color={GOLD} fill={GOLD} />}
                    </TouchableOpacity>
                  </View>
                  <Text style={{ flex: 1, color: WHITE, fontSize: 20, textAlign: "right", lineHeight: 38 }}>{item.text}</Text>
                </View>
                {showTranslit && selectedSurah.transliteration?.[index] && (
                  <Text style={{ color: "rgba(245,158,11,0.7)", fontSize: 12, fontStyle: "italic", marginBottom: 6, paddingLeft: 44, lineHeight: 18 }}>
                    {selectedSurah.transliteration[index].text}
                  </Text>
                )}
                {selectedSurah.translation?.[index] && (
                  <Text style={{ color: MUTED, fontSize: 13, paddingLeft: 44, lineHeight: 19 }}>
                    {selectedSurah.translation[index].text}
                  </Text>
                )}
              </View>
            );
          }}
        />

        {/* Scroll to top FAB */}
        <TouchableOpacity
          onPress={() => ayahListRef.current?.scrollToIndex({ index: 0, animated: true })}
          style={{ position: "absolute", right: 16, bottom: 20, width: 42, height: 42, borderRadius: 21, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: GOLD, shadowOpacity: 0.4, shadowRadius: 8 }}>
          <ArrowUp size={20} color="white" />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Dua Detail View ─────────────────────────────────────────────────────────
  if (selectedDua) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <TouchableOpacity onPress={() => setSelectedDua(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontSize: 17, fontWeight: "700" }}>{selectedDua.category}</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{selectedDua.duas.length} duas</Text>
          </View>
          <Text style={{ color: WHITE, fontSize: 20 }}>{selectedDua.categoryArabic}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {selectedDua.duas.map((dua, i) => (
            <View key={i} style={{ backgroundColor: CARD_BG, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                    <Moon size={14} color="#8B5CF6" />
                  </View>
                  <Text style={{ color: MUTED, fontSize: 12 }}>Dua {i + 1}</Text>
                </View>
                {dua.times > 1 && (
                  <View style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: GOLD, fontSize: 11 }}>Repeat {dua.times}×</Text>
                  </View>
                )}
              </View>
              <Text style={{ color: WHITE, fontSize: 20, textAlign: "right", lineHeight: 38, marginBottom: 10 }}>{dua.arabic}</Text>
              <Text style={{ color: WHITE, fontSize: 13, lineHeight: 20, marginBottom: 6 }}>{dua.translation}</Text>
              <Text style={{ color: GOLD, fontSize: 12 }}>— {dua.reference}</Text>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Hadith Detail View ──────────────────────────────────────────────────────
  if (selectedHadith) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <TouchableOpacity onPress={() => setSelectedHadith(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontSize: 17, fontWeight: "700" }}>{selectedHadith.category}</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{selectedHadith.hadiths.length} hadiths</Text>
          </View>
          <Text style={{ color: WHITE, fontSize: 20 }}>{selectedHadith.categoryArabic}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {selectedHadith.hadiths.map((h, i) => (
            <View key={i} style={{ backgroundColor: "rgba(245,158,11,0.04)", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "rgba(245,158,11,0.15)" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.2)", alignItems: "center", justifyContent: "center", marginRight: 8 }}>
                  <ScrollText size={14} color={GOLD} />
                </View>
                <Text style={{ color: MUTED, fontSize: 12 }}>Hadith {i + 1}</Text>
              </View>
              <Text style={{ color: WHITE, fontSize: 20, textAlign: "right", lineHeight: 38, marginBottom: 10 }}>{h.arabic}</Text>
              <Text style={{ color: WHITE, fontSize: 13, lineHeight: 20, fontWeight: "600", marginBottom: 6 }}>"{h.translation}"</Text>
              <Text style={{ color: MUTED, fontSize: 12, fontStyle: "italic", lineHeight: 18, marginBottom: 8 }}>{h.explanation}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.06)", paddingTop: 8 }}>
                <Text style={{ color: GOLD, fontSize: 12 }}>Narrated by {h.narrator}</Text>
                <Text style={{ color: MUTED, fontSize: 11 }}>{h.source}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Prophet Story View ──────────────────────────────────────────────────────
  if (selectedProphet) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
        <View style={{ flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.06)" }}>
          <TouchableOpacity onPress={() => setSelectedProphet(null)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
            <ChevronLeft size={20} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ color: GOLD, fontSize: 17, fontWeight: "700" }}>{selectedProphet.name}</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{selectedProphet.title}</Text>
          </View>
          <Text style={{ color: WHITE, fontSize: 18 }}>{selectedProphet.arabicName}</Text>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          {/* Hero */}
          <View style={{ backgroundColor: "#4F46E5", borderRadius: 20, padding: 20, marginBottom: 16, alignItems: "center" }}>
            <Text style={{ fontSize: 56, marginBottom: 8 }}>{selectedProphet.image}</Text>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "700", marginBottom: 4 }}>{selectedProphet.name}</Text>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>{selectedProphet.title}</Text>
          </View>

          {/* Watch on YouTube */}
          <TouchableOpacity
            onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${selectedProphet.videoId}`)}
            style={{ backgroundColor: "rgba(239,68,68,0.1)", borderRadius: 14, padding: 14, marginBottom: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
            <Play size={16} color="#EF4444" fill="#EF4444" style={{ marginRight: 10 }} />
            <Text style={{ color: "#EF4444", fontSize: 14, fontWeight: "600" }}>Watch Story on YouTube</Text>
          </TouchableOpacity>

          {/* Summary */}
          <View style={{ backgroundColor: CARD_BG, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <BookOpen size={16} color={GOLD} style={{ marginRight: 8 }} />
              <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>Story Overview</Text>
            </View>
            <Text style={{ color: MUTED, fontSize: 13, lineHeight: 20 }}>{selectedProphet.summary}</Text>
          </View>

          {/* Key Lessons */}
          <View style={{ backgroundColor: CARD_BG, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: CARD_BORDER }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Star size={16} color={GOLD} style={{ marginRight: 8 }} />
              <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>Key Lessons</Text>
            </View>
            {selectedProphet.keyLessons.map((lesson, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", backgroundColor: "rgba(245,158,11,0.06)", borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD, alignItems: "center", justifyContent: "center", marginRight: 10, marginTop: 1 }}>
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "700" }}>{i + 1}</Text>
                </View>
                <Text style={{ color: WHITE, fontSize: 13, lineHeight: 19, flex: 1 }}>{lesson}</Text>
              </View>
            ))}
          </View>

          {/* Quranic References */}
          <View style={{ backgroundColor: "rgba(16,185,129,0.04)", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "rgba(16,185,129,0.15)" }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <BookOpen size={16} color={GREEN} style={{ marginRight: 8 }} />
              <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>Quranic References</Text>
            </View>
            {selectedProphet.quranicReferences.map((ref, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(16,185,129,0.08)", borderRadius: 8, padding: 8, marginBottom: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: GREEN, marginRight: 10 }} />
                <Text style={{ color: GREEN, fontSize: 13, fontWeight: "600" }}>{ref}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Main List View ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }} edges={["top"]}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: GOLD, fontSize: 22, fontWeight: "700" }}>Iman & Knowledge</Text>
            <Text style={{ color: MUTED, fontSize: 12, marginTop: 2 }}>Quran · Hadith · Prophets · Dua</Text>
          </View>
          {isOffline && (
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4 }}>
              <WifiOff size={12} color={GOLD} />
              <Text style={{ color: GOLD, fontSize: 11, marginLeft: 4 }}>Offline</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD_BG, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: CARD_BORDER }}>
          <Search size={17} color={MUTED} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search..."
            placeholderTextColor={MUTED}
            style={{ flex: 1, color: WHITE, marginLeft: 10, fontSize: 14 }}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={16} color={MUTED} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", marginHorizontal: 20, marginBottom: 14, backgroundColor: CARD_BG, borderRadius: 14, padding: 4, borderWidth: 1, borderColor: CARD_BORDER }}>
        {([
          { key: "quran", label: "Qur'an", Icon: BookOpen },
          { key: "dua", label: "Dua", Icon: Star },
          { key: "hadith", label: "Hadith", Icon: ScrollText },
          { key: "prophets", label: "Prophets", Icon: Users },
        ] as { key: Tab; label: string; Icon: any }[]).map(({ key, label, Icon }) => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveTab(key)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: activeTab === key ? GOLD : "transparent", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            <Icon size={12} color={activeTab === key ? "white" : MUTED} />
            <Text style={{ color: activeTab === key ? "white" : MUTED, fontSize: 11, fontWeight: "600", marginLeft: 4 }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === "quran" && (
        <FlatList
          data={filteredSurahs}
          keyExtractor={item => item.number.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListHeaderComponent={() => (
            <>
              {/* Last read card */}
              <TouchableOpacity
                onPress={() => openSurah(lastRead.number)}
                style={{ backgroundColor: "rgba(245,158,11,0.12)", borderRadius: 18, padding: 16, marginBottom: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: MUTED, fontSize: 11, marginBottom: 2 }}>Last Read</Text>
                  <Text style={{ color: GOLD, fontSize: 17, fontWeight: "700" }}>{lastRead.name}</Text>
                  <Text style={{ color: "rgba(245,158,11,0.7)", fontSize: 13 }}>{lastRead.translation}</Text>
                </View>
                {loadingSurah ? <ActivityIndicator color={GOLD} /> : <Play size={24} color={GOLD} fill={GOLD} />}
              </TouchableOpacity>
              {loading && <ActivityIndicator color={GOLD} style={{ marginTop: 20, marginBottom: 10 }} size="large" />}
              {error && <Text style={{ color: "#EF4444", textAlign: "center", marginBottom: 10 }}>{error}</Text>}
              {!loading && !error && (
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                  <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600" }}>All Surahs</Text>
                  <Text style={{ color: MUTED, fontSize: 12 }}>{filteredSurahs.length} surahs</Text>
                </View>
              )}
            </>
          )}
          renderItem={({ item }) => {
            const isCurrent = currentSurah?.number === item.number;
            const isDownloading = downloadingSurah === item.number;
            const isDownloaded = downloadedSurahs.includes(item.number);
            return (
              <TouchableOpacity
                onPress={() => openSurah(item.number)}
                activeOpacity={0.75}
                style={{ flexDirection: "row", alignItems: "center", backgroundColor: isCurrent ? "rgba(245,158,11,0.08)" : CARD_BG, borderRadius: 14, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: isCurrent ? "rgba(245,158,11,0.25)" : CARD_BORDER }}>
                <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: isCurrent ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                  <Text style={{ color: isCurrent ? GOLD : MUTED, fontSize: 13, fontWeight: "700" }}>{item.number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: isCurrent ? GOLD : WHITE, fontSize: 15, fontWeight: "600", marginRight: 6 }}>{item.englishName}</Text>
                    <TouchableOpacity onPress={() => setBookmarked(prev => prev.includes(item.number) ? prev.filter(n => n !== item.number) : [...prev, item.number])}>
                      <Bookmark size={12} color={bookmarked.includes(item.number) ? GOLD : MUTED} fill={bookmarked.includes(item.number) ? GOLD : "none"} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{item.numberOfAyahs} verses · {item.revelationType}</Text>
                </View>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginRight: 10 }}>{item.name}</Text>
                <TouchableOpacity
                  onPress={() => downloadSurah(item.number)}
                  disabled={isDownloaded || isDownloading}
                  style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: isDownloaded ? "rgba(16,185,129,0.12)" : "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", marginRight: 6 }}>
                  {isDownloading ? <ActivityIndicator size="small" color={GOLD} /> : isDownloaded ? <Check size={14} color={GREEN} /> : <Download size={14} color={MUTED} />}
                </TouchableOpacity>
                <ChevronRight size={16} color={MUTED} />
              </TouchableOpacity>
            );
          }}
        />
      )}

      {activeTab === "dua" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600" }}>Dua Collections</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{filteredDuas.length} categories</Text>
          </View>
          {filteredDuas.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setSelectedDua(cat)} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", backgroundColor: CARD_BG, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: CARD_BORDER }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(139,92,246,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Star size={18} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>{cat.category}</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{cat.duas.length} duas</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginRight: 8 }}>{cat.categoryArabic}</Text>
              <ChevronRight size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
          {/* Featured dua */}
          <View style={{ backgroundColor: CARD_BG, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: CARD_BORDER, marginTop: 4 }}>
            <Text style={{ color: WHITE, fontSize: 14, fontWeight: "600", marginBottom: 10 }}>Dua for Guidance</Text>
            <Text style={{ color: WHITE, fontSize: 20, textAlign: "right", lineHeight: 38, marginBottom: 10 }}>
              رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
            </Text>
            <Text style={{ color: MUTED, fontSize: 13, fontStyle: "italic", lineHeight: 19 }}>
              "Our Lord, give us good in this world and in the Hereafter, and protect us from the punishment of the Fire."
            </Text>
            <Text style={{ color: GOLD, fontSize: 12, marginTop: 6 }}>— Surah Al-Baqarah 2:201</Text>
          </View>
        </ScrollView>
      )}

      {activeTab === "hadith" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {/* Featured */}
          <View style={{ backgroundColor: "#C2410C", borderRadius: 18, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 6 }}>Hadith of the Day</Text>
            <Text style={{ color: "white", fontSize: 20, textAlign: "right", lineHeight: 38, marginBottom: 8 }}>إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ</Text>
            <Text style={{ color: "white", fontSize: 14, fontWeight: "600" }}>"Actions are judged by intentions."</Text>
            <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 }}>— Sahih Bukhari</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600" }}>Hadith Collections</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{filteredHadiths.length} categories</Text>
          </View>
          {filteredHadiths.map(cat => (
            <TouchableOpacity key={cat.id} onPress={() => setSelectedHadith(cat)} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(245,158,11,0.04)", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(245,158,11,0.12)" }}>
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(245,158,11,0.18)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <ScrollText size={18} color={GOLD} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>{cat.category}</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{cat.hadiths.length} hadiths</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 18, marginRight: 8 }}>{cat.categoryArabic}</Text>
              <ChevronRight size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {activeTab === "prophets" && (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
          {/* Banner */}
          <View style={{ backgroundColor: "#4338CA", borderRadius: 18, padding: 16, marginBottom: 16 }}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 4 }}>Stories of the Prophets</Text>
            <Text style={{ color: "white", fontSize: 20, fontWeight: "700", marginBottom: 4 }}>قصص الأنبياء</Text>
            <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 13 }}>Learn from the lives of Allah's chosen messengers</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ color: GOLD, fontSize: 13, fontWeight: "600" }}>All Prophets</Text>
            <Text style={{ color: MUTED, fontSize: 12 }}>{filteredProphets.length} stories</Text>
          </View>
          {filteredProphets.map(p => (
            <TouchableOpacity key={p.id} onPress={() => setSelectedProphet(p)} activeOpacity={0.75} style={{ flexDirection: "row", alignItems: "center", backgroundColor: "rgba(79,70,229,0.06)", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "rgba(79,70,229,0.15)" }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(79,70,229,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                <Text style={{ fontSize: 24 }}>{p.image}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: WHITE, fontSize: 15, fontWeight: "600" }}>{p.name}</Text>
                <Text style={{ color: MUTED, fontSize: 12, marginTop: 1 }}>{p.title}</Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginRight: 8 }}>{p.arabicName}</Text>
              <ChevronRight size={16} color={MUTED} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Reciter Picker Modal */}
      <Modal visible={showReciterModal} transparent animationType="slide" onRequestClose={() => setShowReciterModal(false)}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onPress={() => setShowReciterModal(false)} />
        <View style={{ backgroundColor: "#1a1635", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "60%" }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ color: GOLD, fontSize: 16, fontWeight: "700" }}>Choose Reciter</Text>
            <TouchableOpacity onPress={() => setShowReciterModal(false)}>
              <X size={20} color={MUTED} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={reciterOptions}
            keyExtractor={item => item.identifier}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => { setSelectedReciter(item.identifier); setShowReciterModal(false); }}
                style={{ flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, marginBottom: 6, backgroundColor: selectedReciter === item.identifier ? "rgba(245,158,11,0.12)" : CARD_BG, borderWidth: 1, borderColor: selectedReciter === item.identifier ? "rgba(245,158,11,0.3)" : CARD_BORDER }}>
                <Text style={{ flex: 1, color: selectedReciter === item.identifier ? GOLD : WHITE, fontSize: 14 }}>{item.englishName}</Text>
                {selectedReciter === item.identifier && <Check size={16} color={GOLD} />}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}
