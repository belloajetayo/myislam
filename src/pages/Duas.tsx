import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Heart, ChevronRight, Copy, Share2, X, Sparkles, BookOpen } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type DuaItem = {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  times?: number;
  benefit: string;
  context?: string;
};

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "after-salah",  name: "Dua After Salah",   icon: "🙏",  color: "from-emerald-500 to-teal-600",    desc: "Post-prayer supplications" },
  { id: "morning",      name: "Morning Adhkar",     icon: "🌅",  color: "from-amber-400 to-orange-500",    desc: "Subhe-Sadik to Sunrise" },
  { id: "evening",      name: "Evening Adhkar",     icon: "🌆",  color: "from-rose-500 to-pink-600",       desc: "After Asr to Maghrib" },
  { id: "daily",        name: "Daily Duas",         icon: "📿",  color: "from-indigo-500 to-blue-600",     desc: "Everyday supplications" },
  { id: "rabbana",      name: "40 Rabbana Dua",     icon: "📖",  color: "from-purple-500 to-violet-600",   desc: "Quranic duas starting with Rabbana" },
  { id: "ruquiya",      name: "Ruquiya",            icon: "🔥",  color: "from-red-500 to-orange-600",      desc: "Healing & protection duas" },
  { id: "sleep",        name: "Sleep & Wake",       icon: "🌙",  color: "from-blue-600 to-indigo-700",     desc: "Before sleep and upon waking" },
  { id: "travel",       name: "Travel Duas",        icon: "✈️",  color: "from-sky-500 to-cyan-600",        desc: "Duas for journeys" },
  { id: "forgiveness",  name: "Forgiveness",        icon: "🤲",  color: "from-teal-500 to-green-600",      desc: "Seeking Allah's forgiveness" },
  { id: "hajj",         name: "Hajj & Umrah",       icon: "🕋",  color: "from-slate-600 to-gray-700",      desc: "Pilgrim supplications" },
  { id: "quran",        name: "Quranic Duas",       icon: "🌟",  color: "from-yellow-500 to-amber-600",    desc: "Duas from the Holy Quran" },
  { id: "favorites",    name: "My Favorites",       icon: "❤️",  color: "from-pink-500 to-rose-600",       desc: "Your saved duas" },
];

// ─── Full Duas Database with Complete Benefits ───────────────────────────────
const DUAS_DATA: Record<string, DuaItem[]> = {
  "after-salah": [
    {
      arabic: "أَسْتَغْفِرُ اللَّهَ",
      transliteration: "Astaghfirullah",
      translation: "I seek forgiveness from Allah",
      source: "Sahih Muslim",
      times: 3,
      context: "Recite 3 times immediately after Salam",
      benefit: "Erases unintentional distractions and shortcomings made during your prayer, resetting your heart with pure repentance.",
    },
    {
      arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
      transliteration: "Allahumma antas-salamu wa minkas-salamu tabarakta ya dhal-jalali wal-ikram",
      translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honour",
      source: "Sahih Muslim",
      times: 1,
      context: "Directly after Astaghfirullah",
      benefit: "Draws serenity, mental calmness, and divine tranquility (Sakinah) into your heart and preserves the light of prayer.",
    },
    {
      arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
      transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadir",
      translation: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and all praise and He is over all things omnipotent",
      source: "Sahih Bukhari & Muslim",
      times: 1,
      context: "After obligatory prayers",
      benefit: "Affirms complete Tawheed; whoever recites this with conviction has their sins forgiven even if they equal the foam on the sea.",
    },
    {
      arabic: "اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
      transliteration: "Allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta wa la yanfa'u dhal-jaddi minkal-jadd",
      translation: "O Allah, none can prevent what You have willed to bestow and none can bestow what You have willed to prevent, and no wealth or majesty can benefit anyone, for wealth and majesty belong to You",
      source: "Sahih Bukhari & Muslim",
      times: 1,
      context: "After every fard prayer",
      benefit: "Frees the believer from anxiety over worldly sustenance and eradicates jealousy, acknowledging that Allah alone controls all decrees.",
    },
    {
      arabic: "سُبْحَانَ اللَّهِ (٣٣) ، الْحَمْدُ لِلَّهِ (٣٣) ، اللَّهُ أَكْبَرُ (٣٣)",
      transliteration: "SubhanAllah (33x), Alhamdulillah (33x), Allahu Akbar (33x)",
      translation: "Glory be to Allah (33 times), Praise be to Allah (33 times), Allah is the Greatest (33 times)",
      source: "Sahih Muslim 597",
      times: 33,
      context: "The legendary Tasbih Fatimi after each obligatory prayer",
      benefit: "The Prophet ﷺ taught that whoever completes this 99 times and seals with the Kalimah will have all sins forgiven, even if like foam of the sea.",
    },
    {
      arabic: "آيَةُ الْكُرْسِيِّ — اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
      transliteration: "Ayatul Kursi (Surah Al-Baqarah 2:255)",
      translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep...",
      source: "Sunan An-Nasa'i (Sahih)",
      times: 1,
      context: "After every obligatory prayer",
      benefit: "The Prophet ﷺ said: 'Whoever recites Ayatul Kursi after every obligatory prayer, nothing stands between him and entering Paradise except death.'",
    },
    {
      arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ — وَالْمُعَوِّذَتَانِ",
      transliteration: "Surah Al-Ikhlas, Al-Falaq, and An-Nas",
      translation: "Say: He is Allah, the One... (Surahs 112, 113, and 114)",
      source: "Abu Dawud & Tirmidhi",
      times: 3,
      context: "Recite once after Dhuhr, Asr, Isha; recite 3 times after Fajr and Maghrib",
      benefit: "Provides an impregnable shield against the evil eye (Ayn), witchcraft (Sihr), envy (Hasad), and inner whisperings of Satan.",
    },
    {
      arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا",
      transliteration: "Allahumma inni as'aluka 'ilman nafi'an, wa rizqan tayyiban, wa 'amalan mutaqabbala",
      translation: "O Allah, I ask You for beneficial knowledge, wholesome provision, and accepted deeds",
      source: "Sunan Ibn Majah 925",
      times: 1,
      context: "Recited after Fajr prayer",
      benefit: "Secures Allah's barakah for your livelihood and ensures your work and study result in halal sustenance and accepted worship.",
    },
  ],

  morning: [
    {
      arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
      transliteration: "Asbahna wa asbahal mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah",
      translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner",
      source: "Sahih Muslim 2723",
      times: 1,
      context: "Recite at the break of dawn",
      benefit: "Welcomes the morning under Allah's supreme protection and fills your day with guidance, divine assistance, and barakah.",
    },
    {
      arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عهدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
      transliteration: "Sayyidul Istighfar — Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana 'ala 'ahdika wa wa'dika mastata'tu...",
      translation: "The Master Supplication for Forgiveness: O Allah, You are my Lord, there is no deity except You. You created me and I am Your slave...",
      source: "Sahih Bukhari 6306",
      times: 1,
      context: "Say once each morning",
      benefit: "The Prophet ﷺ said: 'Whoever says this in the morning with firm conviction and dies that day before evening, he will be among the people of Paradise.'",
    },
    {
      arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
      transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim",
      translation: "In the Name of Allah with Whose Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing",
      source: "Abu Dawud & Tirmidhi",
      times: 3,
      context: "Recite 3 times every morning",
      benefit: "The Prophet ﷺ guaranteed that anyone who recites this 3 times in the morning will not be afflicted with any sudden calamity or physical harm until evening.",
    },
    {
      arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
      transliteration: "Raditu billahi rabba, wabil-islami dina, wa bi Muhammadin sallallahu alayhi wa sallama nabiyya",
      translation: "I am pleased with Allah as my Lord, with Islam as my religion, and with Muhammad ﷺ as my Prophet",
      source: "Abu Dawud & Tirmidhi",
      times: 3,
      context: "Recite 3 times each morning",
      benefit: "The Prophet ﷺ promised: 'It is a duty upon Allah that He will please the person who recites this on the Day of Resurrection.'",
    },
    {
      arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
      transliteration: "SubhanAllahi wa bihamdihi",
      translation: "Glory be to Allah and all praise is due to Him",
      source: "Sahih Muslim 2691",
      times: 100,
      context: "Recite 100 times in the morning",
      benefit: "All sins are forgiven even if as vast as the sea's foam, and no one will bring better deeds on the Day of Judgment except someone who recited more.",
    },
    {
      arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
      transliteration: "Hasbiyallahu la ilaha illa huwa, 'alayhi tawakkaltu wa huwa rabbul-'arshil-'azim",
      translation: "Allah is sufficient for me. There is no deity except Him. In Him I put my trust, and He is the Lord of the Tremendous Throne",
      source: "Abu Dawud 5081",
      times: 7,
      context: "Recite 7 times in the morning",
      benefit: "Whoever recites this 7 times in the morning, Allah will suffice him in everything that worries or grieves him in both this world and the Hereafter.",
    },
  ],

  evening: [
    {
      arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
      transliteration: "Amsayna wa amsal mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah",
      translation: "We have reached the evening and all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah alone, without partner",
      source: "Sahih Muslim",
      times: 1,
      context: "Recited at sunset / after Asr",
      benefit: "Enters you and your household into divine sanctuary as dusk settles, granting ease and peaceful hours throughout the night.",
    },
    {
      arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
      transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq",
      translation: "I seek refuge in the perfect words of Allah from the evil of what He has created",
      source: "Sahih Muslim 2709",
      times: 3,
      context: "Recite 3 times at evening",
      benefit: "The Prophet ﷺ stated that whoever recites this three times will be safeguarded from all venomous creatures, scorpions, and nocturnal harms through the night.",
    },
    {
      arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
      transliteration: "Allahumma ma amsa bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr",
      translation: "O Allah, whatever blessing I or any of Your creation received this evening is from You alone, so for You is all praise and to You is all gratitude",
      source: "Sunan Abu Dawud 5073",
      times: 1,
      context: "Say upon entering the evening",
      benefit: "Whoever recites this in the evening has fulfilled the entire obligation of gratitude (shukr) owed to Allah for that night.",
    },
    {
      arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ",
      transliteration: "Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqik...",
      translation: "O Allah, in this evening I call upon You, the bearers of Your Throne, Your angels, and all Your creation to witness that You are Allah, none is worthy of worship but You",
      source: "Abu Dawud",
      times: 4,
      context: "Recite 4 times in the evening",
      benefit: "Whoever says this 4 times in the evening, Allah frees his entire body from the punishment of the Hellfire.",
    },
  ],

  daily: [
    {
      arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "Bismillahi tawakkaltu 'alallahi, la hawla wa la quwwata illa billah",
      translation: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah",
      source: "Abu Dawud & Tirmidhi",
      times: 1,
      context: "When leaving the house",
      benefit: "Angels call out: 'You are guided, defended, and protected,' and Satan retreats saying: 'How can you overpower someone who is guided and protected?'",
    },
    {
      arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
      transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni wa ghalabatir-rijal",
      translation: "O Allah, I seek refuge in You from grief and sorrow, helplessness and laziness, miserliness and cowardice, the burden of debts, and being overpowered by men",
      source: "Sahih Bukhari 2893",
      times: 1,
      context: "For anxiety, depression, debt, and stress",
      benefit: "Taught to Abu Umamah when overwhelmed by debts and sadness; reciting this removed all his distress and settled all his debts.",
    },
    {
      arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
      transliteration: "Hasbunallahu wa ni'mal-wakil",
      translation: "Allah is sufficient for us, and He is the Best Disposer of affairs",
      source: "Surah Al-Imran 3:173",
      times: 1,
      context: "When facing trials, fear, or difficulty",
      benefit: "Uttered by Prophet Ibrahim ﷺ when cast into the blazing furnace and the fire became cool and peaceful. Instantly shifts distress into divine triumph.",
    },
    {
      arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
      transliteration: "La hawla wa la quwwata illa billah",
      translation: "There is no power and no strength except with Allah",
      source: "Sahih Bukhari & Muslim",
      times: 1,
      context: "Repeat frequently throughout the day",
      benefit: "A treasure from beneath the Throne of Allah (Arsh) and a spiritual cure for 99 illnesses, the least of which is depression and anxiety.",
    },
    {
      arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
      transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaban-nar",
      translation: "Our Lord! Grant us good in this world and good in the Hereafter and protect us from the torment of the Fire",
      source: "Surah Al-Baqarah 2:201",
      times: 1,
      context: "Most repeated dua by the Prophet ﷺ",
      benefit: "Encompasses all desirable worldly gifts (health, wealth, righteous family) and ultimate eternal success (Jannah and salvation).",
    },
    {
      arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
      transliteration: "Allahumma salli wa sallim 'ala nabiyyina Muhammad",
      translation: "O Allah, send Your peace and blessings upon our Prophet Muhammad ﷺ",
      source: "Sunan At-Tirmidhi",
      times: 10,
      context: "Send salawat morning, evening, and on Fridays",
      benefit: "Whoever sends one blessing upon the Prophet ﷺ, Allah sends ten blessings upon him, erases ten sins, and raises him ten spiritual ranks.",
    },
  ],

  rabbana: [
    {
      arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ",
      transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana mil ladunka rahmatan innaka antal-wahhab",
      translation: "Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower",
      source: "Surah Al-Imran 3:8",
      times: 1,
      benefit: "Protects against doubts, spiritual slips, and losing faith, ensuring steadfastness upon Islam until one's final breath.",
    },
    {
      arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي",
      transliteration: "Rabbish-rah li sadri, wa yassir li amri, wahlul 'uqdatan mil-lisani yafqahu qawli",
      translation: "My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue that they may understand my speech",
      source: "Surah Ta-Ha 20:25-28",
      times: 1,
      benefit: "The supplication of Prophet Musa (AS) for confidence, eloquence, clarity before speaking or taking exams, and total ease in tough assignments.",
    },
    {
      arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
      transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj-'alna lil-muttaqina imama",
      translation: "Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous",
      source: "Surah Al-Furqan 25:74",
      times: 1,
      benefit: "Invokes marital harmony, righteous and pious children, family joy, and leadership in piety and good deeds.",
    },
    {
      arabic: "رَّبِّ زِدْنِي عِلْمًا",
      transliteration: "Rabbi zidni 'ilma",
      translation: "My Lord, increase me in knowledge",
      source: "Surah Ta-Ha 20:114",
      times: 1,
      benefit: "The only worldly blessing Allah commanded the Prophet ﷺ to ask for an increase in; sharpens intellect and opens understanding of truth.",
    },
    {
      arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
      transliteration: "Rabbana dhalamna anfusana wa il lam taghfir lana wa tarhamna lanakunanna minal-khasirin",
      translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers",
      source: "Surah Al-A'raf 7:23",
      times: 1,
      benefit: "The historic prayer of Adam and Hawwa (Eve) through which repentance was accepted by Allah, opening the doors of divine mercy.",
    },
  ],

  ruquiya: [
    {
      arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِهِ وَأَنتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا",
      transliteration: "Allahumma rabban-nasi adhhibil-ba'sa, ishfihi wa antash-shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama",
      translation: "O Allah, Lord of mankind, remove the illness and grant cure. You are the Healer. There is no healing except Your healing — a cure that leaves no sickness behind",
      source: "Sahih Bukhari 5743",
      times: 1,
      context: "Place hand on place of pain and recite",
      benefit: "The Prophet's primary physical and emotional healing prayer. Completely dispels illness with full trust in Allah's cure.",
    },
    {
      arabic: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ",
      transliteration: "A'udhu bi'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhir",
      translation: "I seek refuge in the might and power of Allah from the evil of that which I feel and fear",
      source: "Sahih Muslim 2202",
      times: 7,
      context: "Say Bismillah 3 times, then this 7 times over pain",
      benefit: "Reported by Uthman bin Abi al-As who suffered severe bodily pain since becoming Muslim; reciting this cured him completely.",
    },
    {
      arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنٍ حَاسِدٍ اللَّهُ يَشْفِيكَ",
      transliteration: "Bismillahi arqika min kulli shay'in yu'dhika, min sharri kulli nafsin aw 'ayni hasidin, Allahu yashfika",
      translation: "In the name of Allah I perform Ruqya for you, from everything that harms you, from the evil of every soul or envious eye, may Allah cure you",
      source: "Sahih Muslim 2186",
      times: 3,
      context: "Ruqya recited by Angel Jibril over the Prophet ﷺ",
      benefit: "The premier angelic supplication against evil eye (Hasad), spiritual blockages, psychological trauma, and envy.",
    },
  ],

  sleep: [
    {
      arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
      transliteration: "Bismika Allahumma amutu wa ahya",
      translation: "In Your Name, O Allah, I die and I live",
      source: "Sahih Bukhari 6312",
      times: 1,
      context: "Before falling asleep",
      benefit: "Places your soul in Allah's safekeeping through the minor death (sleep) and grants peaceful rest free from anxiety.",
    },
    {
      arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
      transliteration: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
      translation: "All praise is for Allah Who gave us life after causing us to die, and to Him is the final return",
      source: "Sahih Bukhari 6314",
      times: 1,
      context: "Upon opening your eyes in the morning",
      benefit: "Instantly begins your day with conscious gratitude, resetting your mindset with perspective on life, death, and purpose.",
    },
  ],

  travel: [
    {
      arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ",
      transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
      translation: "Glory to Him Who has subjected this to us, and we could never have achieved it by our own efforts, and to our Lord is our return",
      source: "Surah Az-Zukhruf 43:13-14",
      times: 1,
      context: "Upon boarding car, plane, or train",
      benefit: "Protects against road accidents, travel delays, and vehicle failure, placing your entire journey under divine escort.",
    },
  ],

  forgiveness: [
    {
      arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
      transliteration: "Astaghfirullahal-'adhimal-ladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilayh",
      translation: "I seek forgiveness from Allah the Tremendous, besides Whom there is no deity, the Ever-Living, the Self-Subsisting, and I repent to Him",
      source: "Abu Dawud & Tirmidhi",
      times: 3,
      benefit: "The Prophet ﷺ said: 'Whoever says this, his sins will be forgiven even if he had fled from battle.'",
    },
    {
      arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
      transliteration: "La ilaha illa anta subhanaka inni kuntu minadh-dhalimin",
      translation: "None has the right to be worshipped except You. Glory be to You! Verily I have been of the wrongdoers",
      source: "Surah Al-Anbiya 21:87",
      times: 1,
      benefit: "The supplication of Yunus (Jonah) ﷺ in the whale's belly. The Prophet ﷺ promised: 'No Muslim supplication with this in any distress except Allah answers him.'",
    },
  ],

  hajj: [
    {
      arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ ، لَا شَرِيكَ لَكَ",
      transliteration: "Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak",
      translation: "Here I am O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are Yours, and all sovereignty. You have no partner",
      source: "Sahih Bukhari & Muslim",
      times: 1,
      context: "Talbiyah during Hajj and Umrah",
      benefit: "Every tree, stone, and patch of earth to the right and left of the pilgrim responds with the same call until the ends of the earth.",
    },
  ],

  quran: [
    {
      arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
      transliteration: "Rabbi inni lima anzalta ilayya min khayrin faqir",
      translation: "My Lord, indeed I am, for whatever good You would send down to me, in absolute need",
      source: "Surah Al-Qasas 28:24",
      times: 1,
      benefit: "The prayer of Musa (AS) when destitute and alone in Madyan. Within moments, Allah provided him with shelter, honest work, and a righteous spouse.",
    },
  ],

  favorites: [],
};

// ─── DuaCard Component ─────────────────────────────────────────────────────────
const DuaCard: React.FC<{
  dua: DuaItem;
  index: number;
  onFavorite: () => void;
  isFav: boolean;
  onRecited?: () => void;
}> = ({ dua, index, onFavorite, isFav, onRecited }) => {
  const [count, setCount] = useState(0);
  const target = dua.times ?? 1;

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n[Benefit]: ${dua.benefit}\n\n[Reference]: ${dua.source}\n\nvia MyIslam App`
    );
    toast.success("Dua and benefit copied! 📋");
  };

  const handleShare = () => {
    navigator.share?.({
      title: "Dua from MyIslam",
      text: `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\nBenefit: ${dua.benefit}\n\n[${dua.source}]`,
    });
  };

  const incrementCount = () => {
    const next = count + 1;
    if (next <= target) {
      setCount(next);
      if (next === target) {
        onRecited?.();
        toast.success("Masha'Allah! Completed and logged to progress ✨");
      }
    } else {
      setCount(0);
    }
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-800">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
          <span className="text-white text-xs font-black">{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide truncate">
            {target > 1 ? `${target}× Repeat — ` : "Recite Once — "}
            {dua.context ?? "Recite with sincerity"}
          </p>
        </div>
        {target > 1 && (
          <div className="px-2 py-0.5 rounded-full bg-white dark:bg-white/10 border border-indigo-200 dark:border-indigo-700 text-[10px] font-black text-indigo-600 dark:text-indigo-300">
            {target}×
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Arabic Calligraphy */}
        <p className="text-right text-2xl font-arabic leading-loose text-gray-900 dark:text-white" dir="rtl">
          {dua.arabic}
        </p>

        {/* Transliteration */}
        <div className="p-2.5 rounded-xl bg-gray-50/80 dark:bg-white/5">
          <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
            Transliteration
          </p>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 italic leading-relaxed">
            {dua.transliteration}
          </p>
        </div>

        {/* Translation */}
        <div>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
            Translation
          </p>
          <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed font-medium">
            {dua.translation}
          </p>
        </div>

        {/* Highlighted Virtue & Benefit Section */}
        {dua.benefit && (
          <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-100/30 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-transparent border border-amber-200/80 dark:border-amber-800/60 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                Virtue & Spiritual Benefit
              </p>
            </div>
            <p className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed font-medium">
              {dua.benefit}
            </p>
          </div>
        )}

        {/* Reference */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
          <span className="font-medium">Source: {dua.source}</span>
        </div>

        {/* Counter + Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-indigo-50 dark:border-indigo-900/50">
          <button
            onClick={incrementCount}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              count === target && target > 0
                ? "bg-emerald-500 text-white shadow-sm"
                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
            }`}
          >
            <span>{count === target && target > 0 ? "✓ Completed" : `Recite ${count}/${target}`}</span>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
              title="Copy"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 transition-colors"
              title="Share"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onFavorite}
              className={`p-2 rounded-xl transition-colors ${
                isFav ? "text-red-500" : "text-gray-400 hover:text-red-400"
              }`}
              title="Favorite"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const Duas: React.FC = () => {
  const navigate = useNavigate();
  const { addDua } = useProgress();
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<DuaItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("myislam_fav_duas") || "[]");
    } catch {
      return [];
    }
  });

  const handleBack = () => {
    if (activeCategory) {
      setActiveCategory(null);
      setSearch("");
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const saveFavorites = (favs: DuaItem[]) => {
    setFavorites(favs);
    localStorage.setItem("myislam_fav_duas", JSON.stringify(favs));
  };

  const toggleFav = (dua: DuaItem) => {
    const exists = favorites.some((f) => f.arabic === dua.arabic);
    if (exists) {
      saveFavorites(favorites.filter((f) => f.arabic !== dua.arabic));
      toast.info("Removed from favorites");
    } else {
      saveFavorites([...favorites, dua]);
      addDua();
      toast.success("Saved to favorites ❤️");
    }
  };

  const isFav = (dua: DuaItem) => favorites.some((f) => f.arabic === dua.arabic);

  const currentDuas =
    activeCategory === "favorites"
      ? favorites
      : activeCategory
      ? DUAS_DATA[activeCategory] || []
      : [];

  const filtered = search
    ? currentDuas.filter(
        (d) =>
          d.transliteration.toLowerCase().includes(search.toLowerCase()) ||
          d.translation.toLowerCase().includes(search.toLowerCase()) ||
          (d.benefit && d.benefit.toLowerCase().includes(search.toLowerCase())) ||
          d.arabic.includes(search)
      )
    : currentDuas;

  const currentCat = CATEGORIES.find((c) => c.id === activeCategory);

  // Category Detail View
  if (activeCategory) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4 pb-12 max-w-lg mx-auto">
          {/* Header */}
          <header className="flex items-center gap-3 py-2">
            <button
              onClick={() => {
                setActiveCategory(null);
                setSearch("");
              }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 hover:bg-muted active:scale-95 transition-all shadow-sm"
              aria-label="Back to categories"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground flex items-center gap-1.5">
                <span>{currentCat?.icon}</span>
                <span>{currentCat?.name}</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "dua" : "duas"} with benefits
              </p>
            </div>
          </header>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords or benefits..."
              className="w-full pl-9 pr-9 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-800 bg-white/70 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Duas List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🤲</p>
              <p className="text-sm text-muted-foreground">
                {activeCategory === "favorites"
                  ? "No favorites saved yet. Tap ❤️ on any dua to keep it here."
                  : "No supplications matched your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((dua, i) => (
                <DuaCard
                  key={i}
                  dua={dua}
                  index={i + 1}
                  onFavorite={() => toggleFav(dua)}
                  isFav={isFav(dua)}
                  onRecited={() => addDua(1)}
                />
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // Categories Grid (Home)
  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-12 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center gap-3 py-2">
          <button
            onClick={handleBack}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/70 dark:bg-white/10 border border-indigo-100 dark:border-indigo-800 hover:bg-muted active:scale-95 transition-all shadow-sm"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Dua & Adhkar
            </h1>
            <p className="text-xs text-muted-foreground">
              Authentic supplications with spiritual benefits
            </p>
          </div>
        </header>

        {/* Favorites banner */}
        {favorites.length > 0 && (
          <button
            onClick={() => setActiveCategory("favorites")}
            className="w-full flex items-center gap-3 p-3.5 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/20 border border-rose-200 dark:border-rose-800 shadow-sm active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-sm text-white">
              ❤️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">My Favorites</p>
              <p className="text-xs text-muted-foreground">{favorites.length} saved supplications</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.filter((c) => c.id !== "favorites").map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-3xl border border-indigo-100 dark:border-indigo-800/80 hover:border-indigo-300 dark:hover:border-indigo-700 shadow-sm active:scale-95 transition-all"
            >
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl shadow-md`}
              >
                {cat.icon}
              </div>
              <p className="text-[11px] font-bold text-foreground text-center leading-tight">
                {cat.name}
              </p>
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2.5 text-center">
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">11</p>
            <p className="text-[10px] text-muted-foreground font-medium">Categories</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {Object.values(DUAS_DATA).reduce((acc, curr) => acc + curr.length, 0)}+
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">Authentic Duas</p>
          </div>
          <div className="p-3 bg-white/70 dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800">
            <p className="text-lg font-black text-rose-500">{favorites.length}</p>
            <p className="text-[10px] text-muted-foreground font-medium">Favorites</p>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default Duas;
