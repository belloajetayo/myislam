import React, { useState, useRef, useEffect, useCallback } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import {
  Search,
  BookOpen,
  Bookmark,
  Play,
  ChevronRight,
  Star,
  ChevronLeft,
  Loader2,
  X,
  Moon,
  ScrollText,
  Users,
  ArrowLeft,
  Pause,
  Volume2,
  SkipForward,
  SkipBack,
  WifiOff,
  BookText,
  Download,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  useQuranData,
  duasCollection,
  SurahDetail,
  AudioEdition,
} from "@/hooks/useQuranData";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";

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
        explanation:
          "This foundational hadith teaches that the value of any action depends on the intention behind it.",
      },
      {
        arabic:
          "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
        translation:
          "None of you truly believes until he loves for his brother what he loves for himself.",
        narrator: "Anas ibn Malik",
        source: "Sahih Bukhari 13, Sahih Muslim 45",
        explanation:
          "True faith is demonstrated through genuine concern for others' wellbeing.",
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
        translation:
          "The most complete believers in faith are those with the best character.",
        narrator: "Abu Hurairah",
        source: "Sunan At-Tirmidhi 1162",
        explanation:
          "Good character is a sign of strong faith and is beloved to Allah.",
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
        translation:
          "How wonderful is the case of a believer; there is good for him in everything.",
        narrator: "Suhaib",
        source: "Sahih Muslim 2999",
        explanation:
          "A believer finds blessing in both ease and hardship through gratitude and patience.",
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
        explanation:
          "Cleanliness and purification are fundamental aspects of Islamic practice.",
      },
      {
        arabic: "أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ",
        translation:
          "The closest a servant is to his Lord is when he is in prostration.",
        narrator: "Abu Hurairah",
        source: "Sahih Muslim 482",
        explanation:
          "Sujood is a moment of profound spiritual connection with Allah.",
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
        translation:
          "The best of you are those who are best to their families.",
        narrator: "Aisha",
        source: "Sunan At-Tirmidhi 3895",
        explanation:
          "How we treat our family members reflects our true character.",
      },
    ],
  },
];

// Stories of the Prophets - Detailed with video embeds
const prophetStories = [
  {
    id: 1,
    name: "Adam (آدم)",
    title: "The First Human",
    arabicName: "آدم عليه السلام",
    summary:
      "Adam was the first human created by Allah from clay. He was given knowledge of all things and made vicegerent on Earth. His story teaches us about free will, repentance, and Allah's mercy.",
    fullStory: `Prophet Adam (peace be upon him) holds the unique distinction of being the first human created by Allah. His creation was unlike any other - Allah formed him from clay, shaping him with His own hands, and then breathed into him from His spirit.

Allah taught Adam the names of all things, a knowledge that even the angels did not possess. When Allah commanded the angels to prostrate before Adam, they all complied except for Iblis (Satan), who refused out of arrogance, claiming he was better because he was created from fire while Adam was created from clay.

Adam and his wife Hawwa (Eve) were placed in Paradise and given permission to enjoy all its bounties except for one tree. However, Iblis deceived them, and they ate from the forbidden tree. Immediately, they felt shame and sought to cover themselves.

Rather than making excuses, Adam and Hawwa turned to Allah in sincere repentance, saying: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers." (Quran 7:23)

Allah accepted their repentance and sent them to Earth as a test, promising guidance for humanity. Adam became the first prophet, teaching his children about Allah and how to worship Him.`,
    keyLessons: [
      "Importance of repentance (Tawbah) - Allah forgives those who sincerely repent",
      "Dangers of arrogance - Iblis fell from grace due to pride",
      "Allah's infinite mercy - He forgave Adam despite his mistake",
      "Knowledge is a blessing - Adam was honored with knowledge of names",
      "Satan is our enemy - We must be vigilant against his whispers",
    ],
    quranicReferences: [
      "Surah Al-Baqarah 2:30-39",
      "Surah Al-A'raf 7:11-25",
      "Surah Ta-Ha 20:115-123",
      "Surah Sad 38:71-85",
    ],
    videoId: "y3PubD0tA2I",
    image: "🌍",
  },
  {
    id: 2,
    name: "Nuh (نوح)",
    title: "The Patient Preacher",
    arabicName: "نوح عليه السلام",
    summary:
      "Prophet Nuh called his people to worship Allah alone for 950 years. Despite facing rejection, he remained steadfast. He built the Ark by Allah's command to save the believers from the great flood.",
    fullStory: `Prophet Nuh (Noah, peace be upon him) was sent to a people who had abandoned the worship of Allah and turned to idol worship. For an astounding 950 years, Nuh tirelessly called his people to Islam, using every method possible - speaking to them day and night, publicly and privately.

Despite his unwavering efforts, only a handful believed in him. His own wife and one of his sons rejected his message. The disbelievers mocked him, saying only the poor and weak followed him, and demanded he drive them away.

When Allah informed Nuh that no more would believe, He commanded him to build an ark far from any sea. The disbelievers ridiculed him as he constructed the massive ship, but Nuh persevered. When the ark was complete, Allah commanded him to load it with pairs of every animal species and the believers.

Then the great flood came - water burst forth from the earth and poured down from the sky. Nuh called out to his disbelieving son to board the ark, but he refused, thinking he could escape to a mountain. The waves swept him away.

After the flood subsided, the ark rested on Mount Judi. Nuh and the believers descended to repopulate the earth with worshippers of Allah. The entire episode serves as a powerful reminder of Allah's punishment for the arrogant and His salvation for the faithful.`,
    keyLessons: [
      "Patience in dawah - 950 years of persistent calling",
      "Trusting Allah's plan even when results seem absent",
      "Faith over family ties when they oppose truth",
      "Obedience to Allah even in the face of ridicule",
      "Allah's punishment is certain for the arrogant",
    ],
    quranicReferences: [
      "Surah Nuh 71:1-28 (Entire surah)",
      "Surah Hud 11:25-49",
      "Surah Al-Mu'minun 23:23-30",
      "Surah Al-Qamar 54:9-17",
    ],
    videoId: "LGCm2IPlIsU",
    image: "🚢",
  },
  {
    id: 3,
    name: "Ibrahim (إبراهيم)",
    title: "The Friend of Allah (Khalilullah)",
    arabicName: "إبراهيم عليه السلام",
    summary:
      "Ibrahim is known as Khalilullah (Friend of Allah). He was tested with building the Kaaba, sacrificing his son, and being thrown into fire. His unwavering faith made him a model for all believers.",
    fullStory: `Prophet Ibrahim (Abraham, peace be upon him) is one of the greatest prophets and is called "Khalilullah" - the Friend of Allah. His life was a series of incredible tests, each of which he passed with unwavering faith.

As a young man, Ibrahim recognized through reason that the idols his father carved could not be gods. He looked at the stars, moon, and sun, but realized they all set - none could be the true Lord. He declared his devotion to Allah alone.

To prove the powerlessness of idols, Ibrahim smashed them all except the largest, then told his people to ask the big idol what happened. When they realized their foolishness, instead of accepting the truth, they built a massive fire and threw Ibrahim into it. But Allah commanded the fire: "O fire, be coolness and safety upon Ibrahim." (Quran 21:69)

Later, Ibrahim was tested with the command to leave his wife Hajar and infant son Ismail in the barren desert of Mecca. Trusting Allah completely, Hajar ran between the hills of Safa and Marwa searching for water until the well of Zamzam miraculously sprang forth.

The greatest test came when Ibrahim was commanded in a dream to sacrifice his beloved son Ismail. Both father and son submitted to Allah's command. As Ibrahim was about to make the sacrifice, Allah ransomed Ismail with a ram from Paradise. This event is commemorated annually during Eid al-Adha.

Ibrahim and Ismail later built the Kaaba, the first house of worship for Allah, and prayed for the coming of Prophet Muhammad (peace be upon him) from their descendants.`,
    keyLessons: [
      "Complete submission (Islam) to Allah's will",
      "Using intellect to recognize the truth",
      "Rejecting idol worship despite social pressure",
      "Trust in Allah during extreme trials",
      "The reward of sacrifice in Allah's path",
    ],
    quranicReferences: [
      "Surah Al-Baqarah 2:124-131",
      "Surah Ibrahim 14:35-41",
      "Surah As-Saffat 37:83-111",
      "Surah Al-Anbiya 21:51-73",
    ],
    videoId: "ZzWI0EsWrh4",
    image: "🕋",
  },
  {
    id: 4,
    name: "Yusuf (يوسف)",
    title: "The Patient & Beautiful",
    arabicName: "يوسف عليه السلام",
    summary:
      "Yusuf's story is called 'the best of stories' in the Quran. From being thrown in a well by his brothers, to imprisonment, to becoming Egypt's treasurer, his journey shows Allah's perfect planning.",
    fullStory: `The story of Prophet Yusuf (Joseph, peace be upon him) is called "Ahsan al-Qasas" (the best of stories) by Allah Himself. It is a remarkable tale of jealousy, patience, temptation, and ultimate triumph through faith.

Yusuf was blessed with exceptional beauty and was beloved by his father Ya'qub (Jacob). As a child, he had a dream of eleven stars, the sun, and the moon prostrating to him. His jealous brothers, feeling neglected, plotted against him. They threw him into a well and told their father a wolf had eaten him.

Yusuf was rescued by a caravan and sold as a slave in Egypt to a powerful minister. He grew into a handsome young man, and the minister's wife attempted to seduce him. Yusuf firmly refused, saying: "Indeed, my Lord has made good my residence. Indeed, wrongdoers will not succeed." (Quran 12:23)

Despite his innocence, Yusuf was imprisoned for years. In prison, he interpreted dreams and gained a reputation for wisdom. When the king had a troubling dream that none could interpret, Yusuf correctly explained it as a prophecy of seven years of plenty followed by seven years of famine.

The king, impressed, appointed Yusuf as treasurer of Egypt. During the famine, his brothers came seeking grain, not recognizing him. After testing them and finding they had reformed, Yusuf revealed himself and forgave them completely. He brought his entire family to Egypt, fulfilling the dream from his childhood as they all bowed before him in respect.

Yusuf's story ends with his beautiful prayer: "My Lord, You have given me authority and taught me the interpretation of dreams. Creator of the heavens and earth, You are my protector in this world and the Hereafter. Cause me to die a Muslim and join me with the righteous." (Quran 12:101)`,
    keyLessons: [
      "Patience through injustice brings ultimate reward",
      "Maintaining chastity in the face of temptation",
      "Forgiveness of those who wronged us",
      "Dreams can be messages from Allah",
      "Allah's plan is always perfect, even when we can't see it",
    ],
    quranicReferences: [
      "Surah Yusuf 12:1-111 (Entire surah)",
      "Surah Al-An'am 6:84",
      "Surah Ghafir 40:34",
    ],
    videoId: "e0SkM4vEuTg",
    image: "⭐",
  },
  {
    id: 5,
    name: "Musa (موسى)",
    title: "The Speaker with Allah (Kalimullah)",
    arabicName: "موسى عليه السلام",
    summary:
      "Musa is mentioned more than any other prophet in the Quran. His mission to free Bani Israel from Pharaoh, receiving the Torah, and his conversations with Allah are central to his story.",
    fullStory: `Prophet Musa (Moses, peace be upon him) is the most frequently mentioned prophet in the Quran, with his story spanning multiple surahs. He is known as "Kalimullah" - the one who spoke directly with Allah.

Musa was born during a time when Pharaoh was killing all newborn Israelite boys. To save him, his mother placed baby Musa in a basket and set it adrift on the Nile. By Allah's decree, he was found by Pharaoh's wife, who raised him in the palace. Allah reunited Musa with his mother as his wet nurse.

As a young man, Musa accidentally killed an Egyptian while defending an Israelite. Fearing punishment, he fled to Midian, where he married the daughter of Prophet Shu'ayb and worked as a shepherd for ten years.

On his return to Egypt, Allah called to Musa from a burning bush at Mount Tur, appointing him as a prophet and granting him miraculous signs - his staff turning into a serpent and his hand glowing white. Allah commanded him to confront Pharaoh and free the Israelites.

With his brother Harun (Aaron) as his helper, Musa delivered Allah's message to Pharaoh. Despite witnessing nine miraculous signs, Pharaoh's heart remained hardened. Finally, Allah commanded Musa to lead the Israelites out of Egypt. When they reached the sea with Pharaoh's army behind them, Allah parted the waters, allowing them to cross safely while Pharaoh and his army were drowned.

At Mount Sinai, Allah gave Musa the Torah and spoke to him directly. However, the Israelites repeatedly tested Musa's patience - worshipping a golden calf, complaining about food, and refusing to enter the Holy Land. Musa led them for forty years in the desert before his death.`,
    keyLessons: [
      "Standing against tyranny and oppression",
      "Trust in Allah during impossible situations",
      "Humility despite being chosen for greatness",
      "Patience with difficult people",
      "The importance of brotherhood and support (Harun)",
    ],
    quranicReferences: [
      "Surah Al-Baqarah 2:49-61",
      "Surah Al-A'raf 7:103-162",
      "Surah Ta-Ha 20:9-98",
      "Surah Al-Qasas 28:1-46",
      "Surah Al-Kahf 18:60-82",
    ],
    videoId: "rcAM6N7BQII",
    image: "📜",
  },
  {
    id: 6,
    name: "Isa (عيسى)",
    title: "The Messiah (Al-Masih)",
    arabicName: "عيسى عليه السلام",
    summary:
      "Isa was born miraculously to Maryam without a father. He performed miracles by Allah's permission, including healing the sick and raising the dead. He was raised to heaven and will return.",
    fullStory: `Prophet Isa (Jesus, peace be upon him) holds a unique position among the prophets. He was born miraculously to Maryam (Mary) without a father, and his birth itself was a sign from Allah to humanity.

Maryam was a pious woman dedicated to worship in the Temple. The angel Jibril (Gabriel) appeared to her with news that she would have a son. She was bewildered, asking how this could be when no man had touched her. Jibril explained that this was easy for Allah, who simply says "Be" and it is.

When Maryam gave birth under a palm tree, she was distressed about how to face her people. The newborn Isa spoke miraculously from the cradle, defending his mother's honor and declaring: "Indeed, I am the servant of Allah. He has given me the Scripture and made me a prophet." (Quran 19:30)

As an adult, Isa was sent specifically to the Children of Israel. Allah granted him remarkable miracles: he healed the blind and the lepers, raised the dead to life, and created a bird from clay that came alive by Allah's permission. He emphasized that all these were done "by Allah's permission," never claiming divinity for himself.

Isa's message was to worship Allah alone and follow the Torah with some modifications. However, most rejected him. A small group of disciples (Al-Hawariyyun) believed and supported him.

When his enemies plotted to kill him, Allah saved Isa by raising him to heaven alive. Another person was made to resemble him and was crucified instead. Isa will return before the Day of Judgment to establish justice, defeat the Dajjal (Antichrist), and confirm the message of Prophet Muhammad (peace be upon him).`,
    keyLessons: [
      "Miracles are only by Allah's permission",
      "Speaking truth despite opposition",
      "Complete devotion to worship",
      "Isa is a prophet, not divine - he worshipped Allah",
      "Patience in the face of rejection",
    ],
    quranicReferences: [
      "Surah Al-Imran 3:42-60",
      "Surah Maryam 19:16-36",
      "Surah Al-Ma'idah 5:110-120",
      "Surah An-Nisa 4:157-159",
    ],
    videoId: "WvQLVguP8nY",
    image: "✨",
  },
  {
    id: 7,
    name: "Muhammad (محمد)",
    title: "The Final Messenger ﷺ",
    arabicName: "محمد ﷺ",
    summary:
      "The seal of all prophets, sent as a mercy to all worlds. His life exemplifies the perfect implementation of Islam - from his trustworthiness before prophethood to establishing the final message.",
    fullStory: `Prophet Muhammad (peace be upon him) is the final messenger of Allah, sent as "a mercy to all the worlds" (Quran 21:107). His life is the most documented of any prophet, serving as a perfect example for humanity.

Born in Mecca around 570 CE, Muhammad was orphaned young - his father died before his birth and his mother passed when he was six. He was raised first by his grandfather and then his uncle Abu Talib. Even before prophethood, he was known as "Al-Amin" (the Trustworthy) and "As-Sadiq" (the Truthful).

At age 40, while meditating in Cave Hira, the angel Jibril appeared with the first revelation: "Read in the name of your Lord who created." This began 23 years of divine revelation that would become the Quran.

The early years of prophethood in Mecca were marked by persecution. The Prophet and his followers were boycotted, tortured, and killed for their faith. After the deaths of his beloved wife Khadijah and uncle Abu Talib, the Prophet experienced the miraculous Night Journey (Isra) to Jerusalem and Ascension (Mi'raj) to the heavens, where the five daily prayers were prescribed.

In 622 CE, the Prophet migrated to Medina, establishing the first Islamic state. Here, he built a model society based on justice, brotherhood, and worship of Allah alone. Despite facing multiple battles and assassination attempts, Islam spread throughout Arabia.

In 632 CE, the Prophet performed his Farewell Pilgrimage, delivering his famous sermon emphasizing equality, justice, and the completion of the religion. Shortly after, he passed away at age 63, leaving behind the Quran and his Sunnah as guides for humanity until the Day of Judgment.

His life encompassed every human role - husband, father, statesman, judge, military leader, and devoted worshipper - providing guidance for every aspect of life.`,
    keyLessons: [
      "Mercy and compassion in all dealings",
      "Perseverance through extreme hardship",
      "Perfect balance between worship and worldly life",
      "Truthfulness and trustworthiness before and after prophethood",
      "Justice and equality regardless of status",
    ],
    quranicReferences: [
      "Surah Al-Ahzab 33:21",
      "Surah Al-Anbiya 21:107",
      "Surah Al-Fath 48:29",
      "Surah At-Tawbah 9:128",
      "Surah Al-Qalam 68:4",
    ],
    videoId: "DdWxCVYAOCk",
    image: "🌙",
  },
];

const Quran: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "quran" | "dua" | "hadith" | "prophets"
  >("quran");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSurah, setSelectedSurah] = useState<SurahDetail | null>(null);
  const [selectedDuaCategory, setSelectedDuaCategory] = useState<
    (typeof duasCollection)[0] | null
  >(null);
  const [selectedHadithCategory, setSelectedHadithCategory] = useState<
    (typeof hadithCollection)[0] | null
  >(null);
  const [selectedProphet, setSelectedProphet] = useState<
    (typeof prophetStories)[0] | null
  >(null);
  const [loadingSurah, setLoadingSurah] = useState(false);
  const [bookmarkedSurahs, setBookmarkedSurahs] = useState<number[]>([
    36, 67, 112,
  ]);
  const [downloadingSurah, setDownloadingSurah] = useState<number | null>(null);
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>([]);

  // Audio player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState<number>(0);
  const currentAyahRef = useRef<number>(0); // ref copy to avoid stale closures in ended handler
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [showTransliteration, setShowTransliteration] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeAyahRef = useRef<HTMLElement | null>(null);
  const [arabicOnlyMode, setArabicOnlyMode] = useState(false);

  const {
    surahs,
    loading,
    error,
    fetchSurahDetail,
    audioEditions,
    isOffline,
    getCachedSurahCount,
  } = useQuranData();

  // Check which surahs are already cached
  useEffect(() => {
    const checkCachedSurahs = () => {
      const cached: number[] = [];
      for (let i = 1; i <= 114; i++) {
        const key = `quran_cache_surah_${i}_ar.alafasy`;
        if (localStorage.getItem(key)) {
          cached.push(i);
        }
      }
      setDownloadedSurahs(cached);
    };
    checkCachedSurahs();
  }, []);

  const handleDownloadSurah = async (
    surahNumber: number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (
      downloadedSurahs.includes(surahNumber) ||
      downloadingSurah === surahNumber
    )
      return;

    setDownloadingSurah(surahNumber);
    try {
      const detail = await fetchSurahDetail(surahNumber, selectedReciter);
      if (detail) {
        setDownloadedSurahs((prev) => [...prev, surahNumber]);
        toast.success(`Surah ${surahNumber} downloaded for offline reading`);
      } else {
        toast.error("Failed to download surah");
      }
    } catch (err) {
      toast.error("Failed to download surah");
    } finally {
      setDownloadingSurah(null);
    }
  };

  // Popular reciters for easy access
  const popularReciters = audioEditions.filter((e) =>
    [
      "ar.alafasy",
      "ar.abdurrahmaansudais",
      "ar.minshawi",
      "ar.husary",
      "ar.abdulbasitmurattal",
    ].includes(e.identifier),
  );

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery) ||
      surah.number.toString().includes(searchQuery),
  );

  const filteredDuas = duasCollection.filter(
    (dua) =>
      dua.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.categoryArabic.includes(searchQuery),
  );

  const filteredHadiths = hadithCollection.filter(
    (h) =>
      h.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.categoryArabic.includes(searchQuery),
  );

  const filteredProphets = prophetStories.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.arabicName.includes(searchQuery),
  );

  const handleSurahClick = async (surahNumber: number) => {
    setLoadingSurah(true);
    setCurrentAyah(0);
    setIsPlaying(false);
    const detail = await fetchSurahDetail(surahNumber, selectedReciter);
    if (detail) {
      setSelectedSurah(detail);
    }
    setLoadingSurah(false);
  };

  // Swipe navigation for Surah
  const goToNextSurah = useCallback(async () => {
    if (selectedSurah && selectedSurah.number < 114) {
      const nextNumber = selectedSurah.number + 1;
      setLoadingSurah(true);
      setCurrentAyah(0);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      const detail = await fetchSurahDetail(nextNumber, selectedReciter);
      if (detail) setSelectedSurah(detail);
      setLoadingSurah(false);
      toast.success(`Surah ${nextNumber}`);
    }
  }, [selectedSurah, selectedReciter, fetchSurahDetail]);

  const goToPreviousSurah = useCallback(async () => {
    if (selectedSurah && selectedSurah.number > 1) {
      const prevNumber = selectedSurah.number - 1;
      setLoadingSurah(true);
      setCurrentAyah(0);
      setIsPlaying(false);
      if (audioRef.current) audioRef.current.pause();
      const detail = await fetchSurahDetail(prevNumber, selectedReciter);
      if (detail) setSelectedSurah(detail);
      setLoadingSurah(false);
      toast.success(`Surah ${prevNumber}`);
    }
  }, [selectedSurah, selectedReciter, fetchSurahDetail]);

  const { swipeHandlers: surahSwipeHandlers } = useSwipeNavigation({
    onSwipeLeft: goToNextSurah,
    onSwipeRight: goToPreviousSurah,
    minSwipeDistance: 80,
  });

  // Swipe navigation for Dua
  const goToNextDua = useCallback(() => {
    if (selectedDuaCategory) {
      const currentIndex = duasCollection.findIndex(
        (d) => d.id === selectedDuaCategory.id,
      );
      if (currentIndex < duasCollection.length - 1) {
        setSelectedDuaCategory(duasCollection[currentIndex + 1]);
        toast.success(duasCollection[currentIndex + 1].category);
      }
    }
  }, [selectedDuaCategory]);

  const goToPreviousDua = useCallback(() => {
    if (selectedDuaCategory) {
      const currentIndex = duasCollection.findIndex(
        (d) => d.id === selectedDuaCategory.id,
      );
      if (currentIndex > 0) {
        setSelectedDuaCategory(duasCollection[currentIndex - 1]);
        toast.success(duasCollection[currentIndex - 1].category);
      }
    }
  }, [selectedDuaCategory]);

  const { swipeHandlers: duaSwipeHandlers } = useSwipeNavigation({
    onSwipeLeft: goToNextDua,
    onSwipeRight: goToPreviousDua,
    minSwipeDistance: 80,
  });

  const playAyah = useCallback(
    (ayahIndex: number) => {
      if (selectedSurah && selectedSurah.ayahs[ayahIndex]?.audio) {
        if (audioRef.current) {
          audioRef.current.src = selectedSurah.ayahs[ayahIndex].audio!;
          audioRef.current.play();
          currentAyahRef.current = ayahIndex; // keep ref in sync
          setCurrentAyah(ayahIndex);
          setIsPlaying(true);
        }
      }
    },
    [selectedSurah],
  );

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (selectedSurah && selectedSurah.ayahs[currentAyah]?.audio) {
          audioRef.current.src = selectedSurah.ayahs[currentAyah].audio!;
          audioRef.current.play();
          setIsPlaying(true);
        }
      }
    }
  };

  const playNext = () => {
    if (selectedSurah && currentAyah < selectedSurah.ayahs.length - 1) {
      playAyah(currentAyah + 1);
    }
  };

  const playPrevious = () => {
    if (currentAyah > 0) {
      playAyah(currentAyah - 1);
    }
  };

  // Use selectedSurahRef to access latest surah inside the ended handler
  const selectedSurahRef = useRef(selectedSurah);
  useEffect(() => {
    selectedSurahRef.current = selectedSurah;
  }, [selectedSurah]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      const surah = selectedSurahRef.current;
      const nextIndex = currentAyahRef.current + 1;
      if (surah && nextIndex < surah.ayahs.length) {
        // Directly set src and play for zero-delay transition
        if (surah.ayahs[nextIndex]?.audio) {
          audio.src = surah.ayahs[nextIndex].audio!;
          audio.play();
          currentAyahRef.current = nextIndex;
          setCurrentAyah(nextIndex);
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(false);
      }
    };
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []); // register once only — uses refs for current values

  // Auto-scroll to active ayah during playback
  useEffect(() => {
    if (activeAyahRef.current) {
      activeAyahRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentAyah]);

  const toggleBookmark = (surahNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber],
    );
  };

  // Surah Detail View with Audio
  if (selectedSurah) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full" {...surahSwipeHandlers}>
          {/* Hidden audio element — preload for faster transitions */}
          <audio ref={audioRef} className="hidden" preload="auto" />

          <header className="sticky top-0 z-10 p-4 flex items-center gap-4 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
            <button
              onClick={() => {
                setSelectedSurah(null);
                setIsPlaying(false);
                if (audioRef.current) audioRef.current.pause();
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">
                {selectedSurah.englishName}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedSurah.englishNameTranslation} •{" "}
                {selectedSurah.ayahs.length} verses
              </p>
            </div>
            <div className="text-right flex items-center gap-2">
              <p className="font-arabic text-xl text-foreground">
                {selectedSurah.name}
              </p>
              <span className="text-xs text-muted-foreground">
                ({selectedSurah.number}/114)
              </span>
            </div>
          </header>

          {/* Audio Controls */}
          <div className="p-3 border-b border-primary/10 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={playPrevious}
                disabled={currentAyah === 0}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center disabled:opacity-50"
              >
                <SkipBack className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shadow-soft"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-primary-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                )}
              </button>
              <button
                onClick={playNext}
                disabled={currentAyah >= selectedSurah.ayahs.length - 1}
                className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4 text-primary" />
              </button>
              <div className="flex-1 text-center">
                <p className="text-xs text-muted-foreground">
                  Ayah {currentAyah + 1} of {selectedSurah.ayahs.length}
                </p>
              </div>
              <Select
                value={selectedReciter}
                onValueChange={async (value) => {
                  setSelectedReciter(value);
                  if (selectedSurah) {
                    const detail = await fetchSurahDetail(
                      selectedSurah.number,
                      value,
                    );
                    if (detail) setSelectedSurah(detail);
                  }
                }}
              >
                <SelectTrigger className="w-auto h-8 text-xs border-primary/20">
                  <Volume2 className="w-3 h-3 mr-1" />
                  <SelectValue placeholder="Reciter" />
                </SelectTrigger>
                <SelectContent>
                  {(popularReciters.length > 0
                    ? popularReciters
                    : audioEditions.slice(0, 5)
                  ).map((edition) => (
                    <SelectItem
                      key={edition.identifier}
                      value={edition.identifier}
                      className="text-xs"
                    >
                      {edition.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setArabicOnlyMode(!arabicOnlyMode)}
                className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                  arabicOnlyMode
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                }`}
              >
                <BookText className="w-3 h-3" />
                Mushaf
              </button>
              {!arabicOnlyMode && (
                <button
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`text-xs px-3 py-1 rounded-full transition-colors ${
                    showTransliteration
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  Transliteration
                </button>
              )}
            </div>
          </div>

          {/* Arabic-Only Mushaf Mode */}
          {arabicOnlyMode ? (
            <>
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <div className="p-6 text-center border-b border-primary/10 bg-gradient-to-b from-amber-50/50 to-transparent dark:from-amber-900/10">
                  <p className="font-arabic text-3xl text-foreground leading-relaxed">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                </div>
              )}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 pb-12 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-900/5">
                  {/* Surah Name Header */}
                  <div className="text-center mb-8">
                    <p className="font-arabic text-4xl text-foreground mb-2">
                      {selectedSurah.name}
                    </p>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent mx-auto" />
                  </div>

                  {/* Continuous Arabic Text - Like a real Mushaf */}
                  <div className="font-arabic text-2xl md:text-3xl text-foreground text-right leading-[2.5] tracking-wide">
                    {selectedSurah.ayahs.map((ayah, index) => (
                      <span
                        key={ayah.number}
                        ref={
                          currentAyah === index
                            ? (activeAyahRef as React.RefObject<HTMLSpanElement>)
                            : null
                        }
                        className={`cursor-pointer hover:text-primary transition-colors ${
                          currentAyah === index && isPlaying
                            ? "text-primary bg-primary/10 rounded px-1"
                            : ""
                        }`}
                        onClick={() => playAyah(index)}
                      >
                        {ayah.text}
                        <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-primary/10 rounded-full text-primary font-sans">
                          {ayah.numberInSurah}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {selectedSurah.number !== 1 && selectedSurah.number !== 9 && (
                <div className="p-4 text-center border-b border-primary/10">
                  <p className="font-arabic text-2xl text-foreground">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    In the name of Allah, the Most Gracious, the Most Merciful
                  </p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-6 pb-8">
                  {selectedSurah.ayahs.map((ayah, index) => (
                    <div
                      key={ayah.number}
                      ref={
                        currentAyah === index
                          ? (activeAyahRef as React.RefObject<HTMLDivElement>)
                          : null
                      }
                      className={`glass rounded-2xl p-4 border transition-all ${
                        currentAyah === index && isPlaying
                          ? "border-primary bg-primary/5 shadow-lg"
                          : "border-primary/10"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-primary-foreground">
                              {ayah.numberInSurah}
                            </span>
                          </div>
                          <button
                            onClick={() => playAyah(index)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              currentAyah === index && isPlaying
                                ? "bg-primary text-primary-foreground"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                            }`}
                          >
                            {currentAyah === index && isPlaying ? (
                              <Pause className="w-3 h-3" />
                            ) : (
                              <Play className="w-3 h-3 ml-0.5" />
                            )}
                          </button>
                        </div>
                        <p className="font-arabic text-xl text-foreground text-right flex-1 leading-loose">
                          {ayah.text}
                        </p>
                      </div>
                      {showTransliteration &&
                        selectedSurah.transliteration[index] && (
                          <p className="text-sm text-primary/80 pl-11 leading-relaxed mb-2 italic">
                            {selectedSurah.transliteration[index].text}
                          </p>
                        )}
                      {selectedSurah.translation[index] && (
                        <p className="text-sm text-muted-foreground pl-11 leading-relaxed">
                          {selectedSurah.translation[index].text}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </MobileLayout>
    );
  }

  // Dua Detail View
  if (selectedDuaCategory) {
    const currentDuaIndex = duasCollection.findIndex(
      (d) => d.id === selectedDuaCategory.id,
    );
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full" {...duaSwipeHandlers}>
          <header className="sticky top-0 z-10 p-4 flex items-center gap-4 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
            <button
              onClick={() => setSelectedDuaCategory(null)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">
                {selectedDuaCategory.category}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedDuaCategory.duas.length} duas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="font-arabic text-xl text-foreground">
                {selectedDuaCategory.categoryArabic}
              </p>
              <span className="text-xs text-muted-foreground">
                ({currentDuaIndex + 1}/{duasCollection.length})
              </span>
            </div>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {selectedDuaCategory.duas.map((dua, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-5 border border-primary/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 gradient-accent rounded-lg flex items-center justify-center">
                        <Moon className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Dua {index + 1}
                      </span>
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

  // Hadith Detail View
  if (selectedHadithCategory) {
    return (
      <MobileLayout showNav={false}>
        <div className="flex flex-col h-full">
          <header className="sticky top-0 z-10 p-4 flex items-center gap-4 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
            <button
              onClick={() => setSelectedHadithCategory(null)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">
                {selectedHadithCategory.category}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedHadithCategory.hadiths.length} hadiths
              </p>
            </div>
            <p className="font-arabic text-xl text-foreground">
              {selectedHadithCategory.categoryArabic}
            </p>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {selectedHadithCategory.hadiths.map((hadith, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                      <ScrollText className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Hadith {index + 1}
                    </span>
                  </div>
                  <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">
                    {hadith.arabic}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed mb-3 font-medium">
                    "{hadith.translation}"
                  </p>
                  <p className="text-xs text-muted-foreground mb-2 italic">
                    {hadith.explanation}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-amber-600">
                      Narrated by {hadith.narrator}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {hadith.source}
                    </span>
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
          <header className="sticky top-0 z-10 p-4 flex items-center gap-4 border-b border-primary/10 bg-background/95 backdrop-blur-sm">
            <button
              onClick={() => setSelectedProphet(null)}
              className="w-10 h-10 rounded-2xl flex items-center justify-center gradient-primary shadow-soft"
            >
              <ChevronLeft className="w-5 h-5 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gradient-gold">
                {selectedProphet.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {selectedProphet.title}
              </p>
            </div>
            <p className="font-arabic text-xl text-foreground">
              {selectedProphet.arabicName}
            </p>
          </header>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-8">
              {/* Hero Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-6 text-white">
                <div className="absolute top-0 right-0 text-8xl opacity-20">
                  {selectedProphet.image}
                </div>
                <div className="relative z-10">
                  <span className="text-5xl mb-4 block">
                    {selectedProphet.image}
                  </span>
                  <h2 className="text-2xl font-bold mb-1">
                    {selectedProphet.name}
                  </h2>
                  <p className="text-white/80 text-sm">
                    {selectedProphet.title}
                  </p>
                </div>
              </div>

              {/* Video Section */}
              {selectedProphet.videoId && (
                <div className="glass rounded-2xl p-4 border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Play className="w-4 h-4 text-purple-500" />
                    Watch the Story
                  </h3>
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${selectedProphet.videoId}`}
                      title={`Story of ${selectedProphet.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Story Summary */}
              <div className="glass rounded-2xl p-5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Story Overview
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedProphet.summary}
                </p>
              </div>

              {/* Full Story */}
              {selectedProphet.fullStory && (
                <div className="glass rounded-2xl p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-amber-600" />
                    The Complete Story
                  </h3>
                  <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {selectedProphet.fullStory}
                  </div>
                </div>
              )}

              {/* Key Lessons */}
              <div className="glass rounded-2xl p-5 border border-primary/10">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Key Lessons
                </h3>
                <div className="space-y-2">
                  {selectedProphet.keyLessons.map((lesson, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10"
                    >
                      <span className="w-6 h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-sm text-foreground">{lesson}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quranic References */}
              <div className="glass rounded-2xl p-5 border border-green-500/20 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-green-600" />
                  Quranic References
                </h3>
                <div className="space-y-2">
                  {selectedProphet.quranicReferences.map((ref, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm text-green-700 dark:text-green-400 font-medium">
                        {ref}
                      </span>
                    </div>
                  ))}
                </div>
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
        <header className="flex items-center gap-4 py-2 animate-fade-in">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 glass rounded-2xl flex items-center justify-center border border-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5 text-primary-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gradient-gold">
              Iman & Knowledge
            </h1>
            <p className="text-xs text-gradient-gold opacity-80">
              Quran • Hadith • Prophets • Dua
            </p>
          </div>
          {isOffline && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <WifiOff className="w-3 h-3" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          )}
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
            <button onClick={() => setSearchQuery("")}>
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div
          className="glass rounded-2xl p-1 flex border border-primary/10 animate-slide-up overflow-x-auto"
          style={{ animationDelay: "0.1s" }}
        >
          {[
            { key: "quran", label: "Qur'an", icon: BookOpen },
            { key: "dua", label: "Dua", icon: Star },
            { key: "hadith", label: "Hadith", icon: ScrollText },
            { key: "prophets", label: "Prophets", icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all duration-300 flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.key
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quran Tab */}
        {activeTab === "quran" && (
          <>
            <div
              className="gradient-accent rounded-3xl p-4 shadow-glow animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-foreground/80 text-xs">
                    Last Read
                  </p>
                  <h3 className="text-lg font-bold text-primary-foreground">
                    Surah Al-Fatiha
                  </h3>
                  <p className="text-primary-foreground/90 text-sm">
                    The Opening
                  </p>
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
                  <h3 className="text-sm font-semibold text-gradient-gold">
                    All Surahs
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {downloadedSurahs.length} cached
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {filteredSurahs.length} surahs
                    </span>
                  </div>
                </div>
                {filteredSurahs.map((surah, index) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahClick(surah.number)}
                    className="w-full glass rounded-2xl p-4 border border-primary/10 flex items-center gap-4 hover:shadow-soft transition-all duration-300 animate-slide-up"
                    style={{
                      animationDelay: `${0.1 + Math.min(index, 10) * 0.02}s`,
                    }}
                  >
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft">
                      <span className="text-sm font-bold text-primary-foreground">
                        {surah.number}
                      </span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">
                          {surah.englishName}
                        </h4>
                        <button
                          onClick={(e) => toggleBookmark(surah.number, e)}
                        >
                          <Bookmark
                            className={`w-3 h-3 ${bookmarkedSurahs.includes(surah.number) ? "text-islamic-gold fill-islamic-gold" : "text-muted-foreground"}`}
                          />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {surah.numberOfAyahs} verses • {surah.revelationType}
                      </p>
                    </div>
                    <p className="font-arabic text-lg text-foreground">
                      {surah.name}
                    </p>
                    {/* Download button */}
                    <button
                      onClick={(e) => handleDownloadSurah(surah.number, e)}
                      disabled={
                        downloadedSurahs.includes(surah.number) ||
                        downloadingSurah === surah.number
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        downloadedSurahs.includes(surah.number)
                          ? "bg-green-500/20 text-green-600"
                          : downloadingSurah === surah.number
                            ? "bg-primary/10 text-primary"
                            : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      }`}
                      title={
                        downloadedSurahs.includes(surah.number)
                          ? "Downloaded for offline"
                          : "Download for offline"
                      }
                    >
                      {downloadingSurah === surah.number ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : downloadedSurahs.includes(surah.number) ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Hadith Tab */}
        {activeTab === "hadith" && (
          <div className="space-y-3">
            {/* Featured Hadith */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 p-5 shadow-xl animate-slide-up">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <p className="text-white/80 text-xs mb-2">Hadith of the Day</p>
                <p className="font-arabic text-xl text-white text-right leading-loose mb-3">
                  إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ
                </p>
                <p className="text-white text-sm font-medium">
                  "Actions are judged by intentions."
                </p>
                <p className="text-white/70 text-xs mt-2">— Sahih Bukhari</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gradient-gold">
                Hadith Collections
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredHadiths.length} categories
              </span>
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
                  <h4 className="font-semibold text-foreground">
                    {category.category}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {category.hadiths.length} hadiths
                  </p>
                </div>
                <p className="font-arabic text-lg text-foreground">
                  {category.categoryArabic}
                </p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Prophets Tab */}
        {activeTab === "prophets" && (
          <div className="space-y-3">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 p-5 shadow-xl animate-slide-up">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <p className="text-white/80 text-xs mb-2">
                  Stories of the Prophets
                </p>
                <h3 className="text-xl font-bold text-white mb-1">
                  قصص الأنبياء
                </h3>
                <p className="text-white/90 text-sm">
                  Learn from the lives of Allah's chosen messengers
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gradient-gold">
                All Prophets
              </h3>
              <span className="text-xs text-muted-foreground">
                {filteredProphets.length} stories
              </span>
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
                  <h4 className="font-semibold text-foreground">
                    {prophet.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {prophet.title}
                  </p>
                </div>
                <p className="font-arabic text-sm text-foreground">
                  {prophet.arabicName}
                </p>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Dua Tab */}
        {activeTab === "dua" && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gradient-gold">
                  Dua Collections
                </h3>
                <span className="text-xs text-muted-foreground">
                  {filteredDuas.length} categories
                </span>
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
                    <h4 className="font-semibold text-foreground">
                      {duaCategory.category}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {duaCategory.duas.length} duas
                    </p>
                  </div>
                  <p className="font-arabic text-lg text-foreground">
                    {duaCategory.categoryArabic}
                  </p>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            <div
              className="glass rounded-3xl p-5 border border-primary/10 shadow-card animate-slide-up"
              style={{ animationDelay: "0.4s" }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Dua for Guidance
              </h4>
              <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4">
                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ
                حَسَنَةً وَقِنَا عَذَابَ النَّارِ
              </p>
              <p className="text-sm text-muted-foreground italic">
                "Our Lord, give us good in this world and in the Hereafter, and
                protect us from the punishment of the Fire."
              </p>
              <p className="text-xs text-primary mt-2">
                — Surah Al-Baqarah 2:201
              </p>
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default Quran;
