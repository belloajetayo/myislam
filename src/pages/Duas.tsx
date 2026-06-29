import React, { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Search, Heart, ChevronRight, Copy, Share2, X } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type DuaItem = {
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  times?: number;
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

// ─── Full Duas Database ────────────────────────────────────────────────────────
const DUAS_DATA: Record<string, DuaItem[]> = {
  "after-salah": [
    { arabic: "أَسْتَغْفِرُ اللَّهَ", transliteration: "Astaghfirullah", translation: "I seek forgiveness from Allah", source: "Muslim", times: 3 },
    { arabic: "اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ", transliteration: "Allahumma antas-salamu wa minkas-salamu tabarakta ya dhal-jalali wal-ikram", translation: "O Allah, You are Peace and from You comes peace. Blessed are You, O Owner of majesty and honour", source: "Muslim", times: 1 },
    { arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadir", translation: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and all praise and He is over all things omnipotent", source: "Bukhari & Muslim", times: 1 },
    { arabic: "اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ", transliteration: "Allahumma la mani'a lima a'tayta wa la mu'tiya lima mana'ta wa la yanfa'u dhal-jaddi minkal-jadd", translation: "O Allah, none can prevent what You have willed to bestow and none can bestow what You have willed to prevent, and no wealth or majesty can benefit anyone, for wealth and majesty belong to You", source: "Bukhari & Muslim", times: 1 },
    { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Glory be to Allah", source: "Muslim", times: 33 },
    { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise is due to Allah", source: "Muslim", times: 33 },
    { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest", source: "Muslim", times: 34 },
    { arabic: "آيَةُ الْكُرْسِيِّ — اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ", transliteration: "Ayatul Kursi — Allahu la ilaha illa huwal-hayyul-qayyum, la ta'khudhuhu sinatun wa la nawm (full verse)", translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep (recite full verse 2:255)", source: "An-Nasa'i", times: 1 },
    { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ — وَالْمُعَوِّذَتَانِ", transliteration: "Qul Huwallahu Ahad + Al-Falaq + An-Nas (Surahs 112, 113, 114)", translation: "Recite Surah Al-Ikhlas, Al-Falaq and An-Nas — whoever recites them 3 times in the morning and evening, they will suffice him against everything", source: "Abu Dawud & Tirmidhi", times: 3 },
    { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا", transliteration: "Allahumma inni as'aluka ilman nafi'an wa rizqan tayyiban wa 'amalan mutaqabbala", translation: "O Allah, I ask You for beneficial knowledge, good provision and accepted deeds", source: "Ibn Majah", times: 1 },
  ],
  morning: [
    { arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "Asbahna wa asbahal mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah", translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ", transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu wa ilaykan-nushur", translation: "O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the resurrection", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana ala ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika alayya wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa ant", translation: "O Allah You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I seek refuge in You from the evil of which I have committed, I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You (Sayyidul Istighfar)", source: "Bukhari", times: 1 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq", translation: "I seek refuge in the perfect words of Allah from the evil of what He has created", source: "Muslim", times: 3 },
    { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim", translation: "In the name of Allah with Whose name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing", source: "Abu Dawud & Tirmidhi", times: 3 },
    { arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", transliteration: "Raditu billahi rabba, wabil-islami dina, wa bi Muhammadin sallallahu alayhi wa sallama nabiyya", translation: "I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet", source: "Abu Dawud & Tirmidhi", times: 3 },
    { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", translation: "Glory be to Allah and praise be to Him", source: "Muslim", times: 100 },
    { arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", transliteration: "La ilaha illallahu wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shay'in qadir", translation: "None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and all praise and He is over all things omnipotent", source: "Bukhari", times: 10 },
    { arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي اللَّهُمَّ عَافِنِي فِي سَمْعِي اللَّهُمَّ عَافِنِي فِي بَصَرِي لَا إِلَهَ إِلَّا أَنْتَ", transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari, la ilaha illa ant", translation: "O Allah, grant my body health. O Allah, grant my hearing health. O Allah, grant my sight health. None has the right to be worshipped except You", source: "Abu Dawud", times: 3 },
    { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ وَالْفَقْرِ وَأَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ لَا إِلَهَ إِلَّا أَنْتَ", transliteration: "Allahumma inni a'udhu bika minal-kufri wal-faqri wa a'udhu bika min 'adhaabil-qabri la ilaha illa ant", translation: "O Allah I seek refuge in You from disbelief and poverty, and I seek refuge in You from the punishment of the grave. None has the right to be worshipped except You", source: "An-Nasa'i", times: 3 },
    { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعِلْمَ النَّافِعَ وَالرِّزْقَ الطَّيِّبَ وَالْعَمَلَ الْمُتَقَبَّلَ", transliteration: "Allahumma inni as'alukal-'ilman-nafi'a, war-rizqat-tayyiba, wal-'amalal-mutaqabbal", translation: "O Allah, I ask You for beneficial knowledge, good provision and accepted deeds", source: "Ibn Majah", times: 1 },
    { arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", transliteration: "Hasbiyallahu la ilaha illa huwa, alayhi tawakkaltu wa huwa rabbul-arshil-azim", translation: "Allah is sufficient for me. There is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne", source: "Abu Dawud", times: 7 },
  ],
  evening: [
    { arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ", transliteration: "Amsayna wa amsal mulku lillah, walhamdulillah, la ilaha illallahu wahdahu la sharika lah", translation: "We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah, alone, without partner", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا وَبِكَ أَصْبَحْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ", transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu wa ilaykal-masir", translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is our return", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ", transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka (Sayyidul Istighfar — full dua)", translation: "O Allah You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant... (full Sayyidul Istighfar)", source: "Bukhari", times: 1 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", transliteration: "A'udhu bikalimatil-lahit-tammati min sharri ma khalaq", translation: "I seek refuge in the perfect words of Allah from the evil of what He has created", source: "Muslim", times: 3 },
    { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim", translation: "In the name of Allah with Whose name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing", source: "Abu Dawud & Tirmidhi", times: 3 },
    { arabic: "رَضِيتُ بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا", transliteration: "Raditu billahi rabba, wabil-islami dina, wa bi Muhammadin sallallahu alayhi wa sallama nabiyya", translation: "I am pleased with Allah as my Lord, with Islam as my religion and with Muhammad ﷺ as my Prophet", source: "Abu Dawud & Tirmidhi", times: 3 },
    { arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", transliteration: "SubhanAllahi wa bihamdihi", translation: "Glory be to Allah and praise be to Him", source: "Muslim", times: 100 },
    { arabic: "اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لَا شَرِيكَ لَكَ فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ", transliteration: "Allahumma ma amsa bi min ni'matin aw bi-ahadin min khalqika faminka wahdaka la sharika lak, falakal-hamdu wa lakash-shukr", translation: "O Allah, whatever blessing I or any of Your creation have received in the evening is from You alone, without partner, so for You is all praise and unto You all thanks", source: "Abu Dawud", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ وَمَلَائِكَتَكَ وَجَمِيعَ خَلْقِكَ أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلَّا أَنْتَ وَحْدَكَ لَا شَرِيكَ لَكَ وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ", transliteration: "Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata 'arshika wa mala'ikataka wa jami'a khalqika annaka antallahu la ilaha illa anta wahdaka la sharika lak wa anna Muhammadan abduka wa rasuluk", translation: "O Allah, I have reached the evening calling on You to witness, and calling on the bearers of Your Throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner, and that Muhammad is Your slave and Your Messenger", source: "Abu Dawud", times: 4 },
  ],
  daily: [
    { arabic: "بِسْمِ اللَّهِ", transliteration: "Bismillah", translation: "In the name of Allah — say before eating, drinking, any action", source: "Bukhari & Muslim", times: 1 },
    { arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ", transliteration: "Bismillahi wa 'ala barakatillah", translation: "In the name of Allah and with the blessings of Allah (before eating)", source: "Abu Dawud", times: 1 },
    { arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ", transliteration: "Alhamdulillahil-ladhi at'amana wa saqana wa ja'alana muslimin", translation: "Praise be to Allah Who has fed us and given us drink and Who has made us Muslims (after eating)", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ", transliteration: "Allahumma barik lana fima razaqtana wa qina 'adhaaban-nar", translation: "O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire", source: "Ibn Al-Sunni", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ", transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyata fid-dunya wal-akhira", translation: "O Allah, I ask You for pardon and well-being in this life and the next", source: "Ibn Majah", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَالْعَجْزِ وَالْكَسَلِ وَالْبُخْلِ وَالْجُبْنِ وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ", transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazani, wal-'ajzi wal-kasali, wal-bukhli wal-jubni, wa dala'id-dayni wa ghalabatir-rijal", translation: "O Allah, I seek refuge in You from anxiety, sorrow, weakness, laziness, miserliness, cowardice, the burden of debts and from being overpowered by men", source: "Bukhari", times: 1 },
    { arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", transliteration: "Hasbunallahu wa ni'mal-wakil", translation: "Allah is Sufficient for us and He is the Best Disposer of affairs", source: "Bukhari", times: 1 },
    { arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "La hawla wa la quwwata illa billah", translation: "There is no power and no strength except with Allah", source: "Bukhari & Muslim", times: 1 },
    { arabic: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي", transliteration: "Allahummaghfir li warhamni wahdinni wa 'afini warzuqni", translation: "O Allah, forgive me, have mercy on me, guide me, grant me well-being and provide for me", source: "Muslim", times: 1 },
    { arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", transliteration: "SubhanAllahi walhamdulillahi wa la ilaha illallahu wallahu akbar", translation: "Glory be to Allah, praise be to Allah, there is none worthy of worship but Allah, Allah is the Greatest", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", transliteration: "Allahumma salli wa sallim 'ala nabiyyina Muhammad", translation: "O Allah, send peace and blessings upon our Prophet Muhammad ﷺ", source: "Hadith", times: 10 },
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaaban-nar", translation: "Our Lord! Grant us good in this world and good in the Hereafter and save us from the punishment of the Fire", source: "Al-Baqarah 2:201", times: 1 },
    { arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ", transliteration: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik", translation: "O Allah, help me to remember You, to give thanks to You, and to worship You in an excellent manner", source: "Abu Dawud", times: 1 },
  ],
  rabbana: [
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaaban-nar", translation: "Our Lord! Grant us good in this world and good in the Hereafter and save us from the punishment of the Fire", source: "Al-Baqarah 2:201", times: 1 },
    { arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", transliteration: "Rabbana afrigh 'alayna sabran wa thabbit aqdamana wansurna 'alal-qawmil-kafirin", translation: "Our Lord! Pour upon us patience and plant firmly our feet and give us victory over the disbelieving people", source: "Al-Baqarah 2:250", times: 1 },
    { arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا", transliteration: "Rabbana la tu'akhidhna in nasina aw akhta'na", translation: "Our Lord! Do not impose blame upon us if we have forgotten or erred", source: "Al-Baqarah 2:286", times: 1 },
    { arabic: "رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا", transliteration: "Rabbana wa la tahmil 'alayna isran kama hamaltahu 'alal-ladhina min qablina", translation: "Our Lord! And lay not upon us a burden like that which You laid upon those before us", source: "Al-Baqarah 2:286", times: 1 },
    { arabic: "رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", transliteration: "Rabbana wa la tuhammilna ma la taqata lana bih, wa'fu 'anna waghfir lana warhamna, anta mawlana fansurna 'alal-qawmil-kafirin", translation: "Our Lord! And burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people", source: "Al-Baqarah 2:286", times: 1 },
    { arabic: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً إِنَّكَ أَنتَ الْوَهَّابُ", transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana wa hab lana mil ladunka rahmatan innaka antal-wahhab", translation: "Our Lord! Let not our hearts deviate after You have guided us and grant us from Yourself mercy. Indeed, You are the Bestower", source: "Al-Imran 3:8", times: 1 },
    { arabic: "رَبَّنَا إِنَّنَا آمَنَّا فَاغْفِرْ لَنَا ذُنُوبَنَا وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana innana amanna faghfir lana dhunubana wa qina 'adhaaban-nar", translation: "Our Lord! Indeed we have believed, so forgive us our sins and protect us from the punishment of the Fire", source: "Al-Imran 3:16", times: 1 },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِي أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ", transliteration: "Rabbanaghfir lana dhunubana wa israfana fi amrina wa thabbit aqdamana wansurna 'alal-qawmil-kafirin", translation: "Our Lord! Forgive us our sins and the excess committed in our affairs and plant firmly our feet and give us victory over the disbelieving people", source: "Al-Imran 3:147", times: 1 },
    { arabic: "رَبَّنَا مَا خَلَقْتَ هَذَا بَاطِلًا سُبْحَانَكَ فَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana ma khalaqta hadha batilan subhanaka faqina 'adhaaban-nar", translation: "Our Lord! You have not created this aimlessly; exalted are You. Then protect us from the punishment of the Fire", source: "Al-Imran 3:191", times: 1 },
    { arabic: "رَبَّنَا إِنَّكَ مَن تُدْخِلِ النَّارَ فَقَدْ أَخْزَيْتَهُ وَمَا لِلظَّالِمِينَ مِنْ أَنصَارٍ", transliteration: "Rabbana innaka man tudkhilin-nara faqad akhzaytah wa ma lidh-dhalimina min ansar", translation: "Our Lord! Indeed, whoever You admit to the Fire — You have disgraced him, and for the wrongdoers there are no helpers", source: "Al-Imran 3:192", times: 1 },
    { arabic: "رَبَّنَا إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِي لِلْإِيمَانِ أَنْ آمِنُوا بِرَبِّكُمْ فَآمَنَّا", transliteration: "Rabbana innana sami'na munadiyan yunadi lil-imani an aminu birabbikum fa-amanna", translation: "Our Lord! Indeed we have heard a caller calling to faith, saying: Believe in your Lord, and we have believed", source: "Al-Imran 3:193", times: 1 },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّئَاتِنَا وَتَوَفَّنَا مَعَ الْأَبْرَارِ", transliteration: "Rabbanaghfir lana dhunubana wa kaffir 'anna sayyi'atina wa tawaffana ma'al-abrar", translation: "Our Lord! Forgive us our sins and remove from us our misdeeds and cause us to die with the righteous", source: "Al-Imran 3:193", times: 1 },
    { arabic: "رَبَّنَا وَآتِنَا مَا وَعَدتَّنَا عَلَى رُسُلِكَ وَلَا تُخْزِنَا يَوْمَ الْقِيَامَةِ إِنَّكَ لَا تُخْلِفُ الْمِيعَادَ", transliteration: "Rabbana wa atina ma wa'adtana 'ala rusulika wa la tukhzina yawmal-qiyamah, innaka la tukhlifu'l-mi'ad", translation: "Our Lord! And grant us what You promised us through Your messengers and do not disgrace us on the Day of Resurrection. Indeed, You do not fail in Your promise", source: "Al-Imran 3:194", times: 1 },
    { arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", transliteration: "Rabbana dhalamna anfusana wa il lam taghfir lana wa tarhamna lanakuunanna minal-khasirin", translation: "Our Lord! We have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers", source: "Al-Araf 7:23", times: 1 },
    { arabic: "رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظَّالِمِينَ", transliteration: "Rabbana la taj'alna ma'al-qawmidh-dhalimin", translation: "Our Lord! Do not place us with the wrongdoing people", source: "Al-Araf 7:47", times: 1 },
    { arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ", transliteration: "Rabbana afrigh 'alayna sabran wa tawaffana muslimin", translation: "Our Lord! Pour upon us patience and let us die as Muslims in submission to You", source: "Al-Araf 7:126", times: 1 },
    { arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ", transliteration: "Rabbana la taj'alna fitnatan lil-qawmidh-dhalimin wa najjina birahmatika minal-qawmil-kafirin", translation: "Our Lord! Make us not a trial for the wrongdoing people and save us by Your mercy from the disbelieving people", source: "Yunus 10:85-86", times: 1 },
    { arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِن ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ", transliteration: "Rabbij-'alni muqimas-salati wa min dhurriyyati, rabbana wa taqabbal du'a", translation: "My Lord! Make me an establisher of prayer, and my descendants. Our Lord, and accept my supplication", source: "Ibrahim 14:40", times: 1 },
    { arabic: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", transliteration: "Rabbanaghfir li wa liwalidayya wa lil-mu'minina yawma yaqumul-hisab", translation: "Our Lord! Forgive me and my parents and the believers the Day the account is established", source: "Ibrahim 14:41", times: 1 },
    { arabic: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", transliteration: "Rabbana atina mil ladunka rahmatan wa hayyi' lana min amrina rashada", translation: "Our Lord! Grant us mercy from Yourself, and facilitate for us our affair in the right way", source: "Al-Kahf 18:10", times: 1 },
    { arabic: "رَّبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilma", translation: "My Lord! Increase me in knowledge", source: "Ta-Ha 20:114", times: 1 },
    { arabic: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي", transliteration: "Rabbish-rah li sadri wa yassir li amri wahlul 'uqdatan mil-lisani yafqahu qawli", translation: "My Lord, expand for me my breast, ease for me my task and untie the knot from my tongue that they may understand my speech", source: "Ta-Ha 20:25-28", times: 1 },
    { arabic: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا", transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yunin waj-'alna lil-muttaqina imama", translation: "Our Lord! Grant us from among our wives and offspring comfort to our eyes and make us a leader for the righteous", source: "Al-Furqan 25:74", times: 1 },
    { arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لِي فِي ذُرِّيَّتِي", transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya wa 'ala walidayya wa an a'mala salihan tardahu wa aslih li fi dhurriyyati", translation: "My Lord! Enable me to be grateful for Your favour which You have bestowed upon me and upon my parents and to work righteousness of which You will approve and make righteous for me my offspring", source: "Al-Ahqaf 46:15", times: 1 },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا", transliteration: "Rabbanaghfir lana wa li-ikhwaninal-ladhina sabaquna bil-iman wa la taj'al fi qulubina ghillan lil-ladhina amanu", translation: "Our Lord! Forgive us and our brothers who preceded us in faith and put not in our hearts any resentment toward those who have believed", source: "Al-Hashr 59:10", times: 1 },
    { arabic: "رَبَّنَا أَتْمِمْ لَنَا نُورَنَا وَاغْفِرْ لَنَا إِنَّكَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", transliteration: "Rabbana atmim lana nurana waghfir lana innaka 'ala kulli shay'in qadir", translation: "Our Lord! Perfect our light for us and forgive us. Indeed, You are over all things competent", source: "At-Tahrim 66:8", times: 1 },
  ],
  ruquiya: [
    { arabic: "بِسْمِ اللَّهِ أَرْقِيكَ مِنْ كُلِّ شَيْءٍ يُؤْذِيكَ مِنْ شَرِّ كُلِّ نَفْسٍ أَوْ عَيْنٍ أَوْ حَاسِدٍ اللَّهُ يَشْفِيكَ بِسْمِ اللَّهِ أَرْقِيكَ", transliteration: "Bismillahi arqika min kulli shay'in yu'dhika, min sharri kulli nafsin aw 'aynin aw hasidin, Allahu yashfika, bismillahi arqika", translation: "In the name of Allah I perform ruqya for you, from everything that harms you, from the evil of every soul or envious eye, may Allah heal you, in the name of Allah I perform ruqya for you", source: "Muslim", times: 3 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ", transliteration: "A'udhu bikalimatil-lahit-tammati min kulli shaytanin wa hammatin wa min kulli 'aynin lammah", translation: "I seek refuge in the perfect words of Allah from every devil and every poisonous reptile, and from every evil eye", source: "Bukhari", times: 3 },
    { arabic: "اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ اشْفِهِ وَأَنتَ الشَّافِي لَا شِفَاءَ إِلَّا شِفَاؤُكَ شِفَاءً لَا يُغَادِرُ سَقَمًا", transliteration: "Allahumma rabban-nasi adhhibil-ba'sa, ishfihi wa antash-shafi, la shifa'a illa shifa'uka, shifa'an la yughadiru saqama", translation: "O Allah, Lord of mankind, remove the harm and heal. You are the Healer. There is no healing except Your healing — a healing that leaves no illness", source: "Bukhari & Muslim", times: 1 },
    { arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ", transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i wa huwas-sami'ul-'alim", translation: "In the name of Allah with Whose name nothing can cause harm on earth or in the heavens, and He is the All-Hearing, the All-Knowing", source: "Abu Dawud", times: 3 },
    { arabic: "أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ", transliteration: "A'udhu bi'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhir", translation: "I seek refuge in the might and power of Allah from the evil of what I feel and what I fear", source: "Muslim", times: 7 },
    { arabic: "آيَةُ الْكُرْسِيِّ — اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", transliteration: "Ayatul Kursi (Al-Baqarah 2:255) — recite full verse", translation: "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence... Recite Ayatul Kursi once for protection", source: "Bukhari", times: 1 },
    { arabic: "سُورَةُ الْإِخْلَاصِ وَالْمُعَوِّذَتَانِ", transliteration: "Surah Al-Ikhlas (112) + Al-Falaq (113) + An-Nas (114)", translation: "Recite all three surahs — blow into cupped hands and wipe over the body for healing and protection", source: "Bukhari & Muslim", times: 3 },
    { arabic: "امْسَحِ الْبَأْسَ رَبَّ النَّاسِ بِيَدِكَ الشِّفَاءُ لَا كَاشِفَ لَهُ إِلَّا أَنتَ", transliteration: "Imsahil-ba'sa rabban-nasi, biyadikash-shifa'u, la kashifa lahu illa ant", translation: "Take away the pain, O Lord of mankind, in Your hand is healing, none can remove it except You", source: "Bukhari & Muslim", times: 1 },
  ],
  sleep: [
    { arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا", transliteration: "Bismika Allahumma amutu wa ahya", translation: "In Your name O Allah, I die and I live (when going to sleep)", source: "Bukhari", times: 1 },
    { arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ", transliteration: "Allahumma qini 'adhabaka yawma tab'athu 'ibadak", translation: "O Allah, protect me from Your punishment on the Day You resurrect Your servants", source: "Abu Dawud", times: 3 },
    { arabic: "اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ", transliteration: "Allahumma bismika ahya wa bismika amut", translation: "O Allah, in Your name I live and in Your name I die", source: "Bukhari", times: 1 },
    { arabic: "اللَّهُمَّ أَسْلَمْتُ نَفْسِي إِلَيْكَ وَفَوَّضْتُ أَمْرِي إِلَيْكَ وَأَلْجَأْتُ ظَهْرِي إِلَيْكَ رَغْبَةً وَرَهْبَةً إِلَيْكَ لَا مَلْجَأَ وَلَا مَنْجَا مِنْكَ إِلَّا إِلَيْكَ", transliteration: "Allahumma aslamtu nafsi ilayk, wa fawwadtu amri ilayk, wa alja'tu dhahri ilayk, raghbatan wa rahbatan ilayk, la malja'a wa la manja minka illa ilayk", translation: "O Allah, I submit my soul to You, I entrust my affairs to You, I turn and rely on You in hope and fear of You. There is no refuge and no salvation from You except with You", source: "Bukhari & Muslim", times: 1 },
    { arabic: "سُبْحَانَ اللَّهِ", transliteration: "SubhanAllah", translation: "Glory be to Allah (before sleep)", source: "Bukhari & Muslim", times: 33 },
    { arabic: "الْحَمْدُ لِلَّهِ", transliteration: "Alhamdulillah", translation: "All praise is for Allah (before sleep)", source: "Bukhari & Muslim", times: 33 },
    { arabic: "اللَّهُ أَكْبَرُ", transliteration: "Allahu Akbar", translation: "Allah is the Greatest (before sleep)", source: "Bukhari & Muslim", times: 34 },
    { arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ", transliteration: "Alhamdulillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur", translation: "Praise be to Allah Who gave us life after He had caused us to die, and to Him is the resurrection (upon waking)", source: "Bukhari", times: 1 },
    { arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", transliteration: "La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa 'ala kulli shay'in qadir, subhanallahi walhamdulillahi wa la ilaha illallahu wallahu akbar", translation: "None has the right to be worshipped except Allah, alone without partner... (recite upon waking at night — sins forgiven)", source: "Bukhari", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَابُوسِ وَمِنْ شَرِّ مَا رَأَيْتُ", transliteration: "Allahumma inni a'udhu bika minal-kabus wa min sharri ma ra'ayt", translation: "O Allah, I seek refuge in You from bad dreams and from the evil of what I have seen", source: "Hadith", times: 1 },
    { arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ", transliteration: "A'udhu bikalimatil-lahit-tammati min ghadabihi wa 'iqabihi wa sharri 'ibadihi wa min hamzatish-shayatini wa an yahdhurun", translation: "I seek refuge in the perfect words of Allah from His wrath and punishment, from the evil of His slaves and from the temptations of the devils and from their presence", source: "Abu Dawud & Tirmidhi", times: 1 },
  ],
  travel: [
    { arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", transliteration: "Bismillahi tawakkaltu 'alallahi la hawla wa la quwwata illa billah", translation: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah (when leaving home)", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ", transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin wa inna ila rabbina lamunqalibun", translation: "How perfect He is, the One Who has placed this at our service, and we ourselves would not have been capable of that, and to our Lord is our final destiny", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى", transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda", translation: "O Allah, we ask You on this journey of ours for righteousness and piety and for works that are pleasing to You", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ", transliteration: "Allahumma hawwin 'alayna safarana hadha watwy 'anna bu'dah", translation: "O Allah, make this journey of ours easy for us and make its distance short for us", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ أَنتَ الصَّاحِبُ فِي السَّفَرِ وَالْخَلِيفَةُ فِي الْأَهْلِ", transliteration: "Allahumma antas-sahibu fis-safari wal-khalifatu fil-ahl", translation: "O Allah, You are the Companion on the journey and the Guardian of the family (and property)", source: "Muslim", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ وَكَآبَةِ الْمُنْقَلَبِ وَسُوءِ الْمَنْظَرِ فِي الْأَهْلِ وَالْمَالِ وَالْوَلَدِ", transliteration: "Allahumma inni a'udhu bika min wa'tha'is-safari wa ka'abatil-munqalabi wa su'il-mandhari fil-ahli wal-mali wal-walad", translation: "O Allah, I seek refuge in You from the difficulties of travel, from grief upon returning, and from a distressing sight regarding family, wealth and children", source: "Muslim", times: 1 },
    { arabic: "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا", transliteration: "Allahu Akbar x3, SubhanAllahil-ladhi sakhkhara lana hadha (when mounting a vehicle)", translation: "Allah is the Greatest x3, then: How perfect He is, the One Who has placed this at our service", source: "Muslim", times: 1 },
  ],
  forgiveness: [
    { arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullaha wa atubu ilaih", translation: "I seek forgiveness from Allah and I repent to Him", source: "Bukhari & Muslim", times: 100 },
    { arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana abduka, wa ana ala ahdika wa wa'dika mastata't, a'udhu bika min sharri ma sana't, abu'u laka bini'matika 'alayya wa abu'u bidhanbi faghfir li fa innahu la yaghfirudh-dhunuba illa ant", translation: "The Master Supplication for Forgiveness (Sayyid Al-Istighfar) — whoever says this in the morning or evening with firm belief and dies that day enters Paradise", source: "Bukhari", times: 1 },
    { arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ", transliteration: "Astaghfirullahil-'adhimal-ladhi la ilaha illa huwal-hayyul-qayyumu wa atubu ilaih", translation: "I seek forgiveness from Allah the Magnificent, whom there is none worthy of worship except He, the Living, the Sustainer, and I repent to Him — sins forgiven even if fleeing from battle", source: "Abu Dawud & Tirmidhi", times: 1 },
    { arabic: "رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ", transliteration: "Rabbighfir li wa tub 'alayya innaka antat-tawwabur-rahim", translation: "My Lord, forgive me and accept my repentance. You are the Accepter of repentance, the Most Merciful — the Prophet said this 100 times in a single sitting", source: "Ibn Majah", times: 100 },
    { arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ", transliteration: "Subhanakallahumma wa bihamdika, ash-hadu an la ilaha illa anta, astaghfiruka wa atubu ilayk", translation: "How perfect You are O Allah and I praise You. I bear witness that none has the right to be worshipped except You. I seek Your forgiveness and I repent to You — expiation for gatherings", source: "An-Nasa'i & Tirmidhi", times: 1 },
    { arabic: "لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minadh-dhalimin", translation: "Dua of Prophet Yunus (Jonah) ﷺ — None has the right to be worshipped except You. How perfect You are. Verily I was among the wrongdoers. No Muslim calls with it except Allah responds", source: "Tirmidhi", times: 1 },
    { arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنتَ الْغَفُورُ الرَّحِيمُ", transliteration: "Allahumma inni dhalamtu nafsi dhulman kathiran wa la yaghfirudhdhunuba illa anta, faghfir li maghfiratan min 'indika warhamni innaka antal-ghafurur-rahim", translation: "O Allah! I have greatly wronged myself and no one forgives sins but You. So, grant me forgiveness and have mercy on me. Surely, You are the Forgiving, the Merciful — from Abu Bakr As-Siddiq", source: "Bukhari & Muslim", times: 1 },
  ],
  hajj: [
    { arabic: "لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ لَا شَرِيكَ لَكَ", transliteration: "Labbayk Allahumma labbayk, labbayk la sharika laka labbayk, innal-hamda wan-ni'mata laka wal-mulk, la sharika lak", translation: "Here I am O Allah, here I am. Here I am, You have no partner, here I am. Verily all praise and blessings are Yours, and all sovereignty. You have no partner (Talbiyah)", source: "Bukhari & Muslim", times: 1 },
    { arabic: "اللَّهُمَّ اجْعَلْ هَذَا حَجًّا مَبْرُورًا وَسَعْيًا مَشْكُورًا وَذَنْبًا مَغْفُورًا وَعَمَلًا صَالِحًا مَقْبُولًا", transliteration: "Allahumma-j'al hadha hajjan mabrura, wa sa'yan mashkura, wa dhanban maghfura, wa 'amalan salihan maqbula", translation: "O Allah make this an accepted Hajj, a commendable striving, forgiven sins and accepted righteous deeds", source: "Hadith", times: 1 },
    { arabic: "بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ", transliteration: "Bismillahi wallahu akbar, Allahumma imanan bika wa tasdiqan bikitabika wa wafa'an bi'ahdika wattiba'an lisunnati nabiyyika Muhammad", translation: "In the name of Allah, Allah is the Greatest, O Allah out of belief in You, confirming Your book, fulfilling Your covenant and following the Sunnah of Your Prophet Muhammad (when touching Black Stone)", source: "Ahmad", times: 1 },
    { arabic: "اللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ لَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ اللَّهُ أَكْبَرُ وَلِلَّهِ الْحَمْدُ", transliteration: "Allahu akbar, Allahu akbar, la ilaha illallah, wallahu akbar, Allahu akbar wa lillahil-hamd", translation: "Allah is the Greatest, Allah is the Greatest, there is no deity worthy of worship but Allah, Allah is the Greatest, Allah is the Greatest and to Allah belongs all praise (Takbir of Eid/Hajj)", source: "Hadith", times: 1 },
    { arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", transliteration: "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina 'adhaaban-nar", translation: "Our Lord! Grant us good in this world and good in the Hereafter and save us from the punishment of the Fire (between Yemeni corner and Black Stone)", source: "Abu Dawud", times: 1 },
    { arabic: "اللَّهُمَّ الْبَيْتَ بَيْتُكَ وَالْعَبْدَ عَبْدُكَ وَابْنُ عَبْدِكَ وَهَذَا مَقَامُ الْعَائِذِ بِكَ مِنَ النَّارِ", transliteration: "Allahummal-baytu baytuka wal-'abdu 'abduka wabnu 'abduka wa hadha maqamul-'a'idhi bika minan-nar", translation: "O Allah this House is Your house and the servant is Your servant, son of Your servant, and this is the station of one who seeks refuge with You from the Fire", source: "Hadith", times: 1 },
  ],
  quran: [
    { arabic: "رَبِّ زِدْنِي عِلْمًا", transliteration: "Rabbi zidni 'ilma", translation: "My Lord! Increase me in knowledge", source: "Ta-Ha 20:114", times: 1 },
    { arabic: "رَبِّ إِنِّي لِمَا أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ", transliteration: "Rabbi inni lima anzalta ilayya min khayrin faqir", translation: "My Lord, indeed I am, for whatever good You would send down to me, in need", source: "Al-Qasas 28:24", times: 1 },
    { arabic: "لَا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", transliteration: "La ilaha illa anta subhanaka inni kuntu minadh-dhalimin", translation: "None has the right to be worshipped except You. How perfect You are. Verily, I was among the wrongdoers (Dua of Yunus ﷺ)", source: "Al-Anbiya 21:87", times: 1 },
    { arabic: "رَّبِّ أَنزِلْنِي مُنزَلًا مُّبَارَكًا وَأَنتَ خَيْرُ الْمُنزِلِينَ", transliteration: "Rabbi anzilni munzalan mubarakan wa anta khayrul munzilin", translation: "My Lord, let me land at a blessed landing place, and You are the best to accommodate us", source: "Al-Mu'minun 23:29", times: 1 },
    { arabic: "رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ", transliteration: "Rabbi a'udhu bika min hamazatish-shayatini wa a'udhu bika rabbi an yahdhurun", translation: "My Lord, I seek refuge in You from the incitements of the devils, and I seek refuge in You, my Lord, lest they be present with me", source: "Al-Mu'minun 23:97-98", times: 1 },
    { arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ إِنَّ عَذَابَهَا كَانَ غَرَامًا", transliteration: "Rabbanas-rif 'anna 'adhaba jahannama inna 'adhabaha kana gharama", translation: "Our Lord, avert from us the punishment of Hell. Indeed, its punishment is ever adhering", source: "Al-Furqan 25:65", times: 1 },
    { arabic: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ", transliteration: "Rabbi awzi'ni an ashkura ni'matakal-lati an'amta 'alayya wa 'ala walidayya wa an a'mala salihan tardah", translation: "My Lord, enable me to be grateful for Your favour which You have bestowed upon me and upon my parents and to do righteousness of which You approve", source: "An-Naml 27:19", times: 1 },
    { arabic: "إِنِّي تَوَكَّلْتُ عَلَى اللَّهِ رَبِّي وَرَبِّكُم مَّا مِن دَابَّةٍ إِلَّا هُوَ آخِذٌ بِنَاصِيَتِهَا", transliteration: "Inni tawakkaltu 'alallahi rabbi wa rabbikum, ma min dabbatin illa huwa akhidhun binasiyatiha", translation: "Indeed, I have relied upon Allah, my Lord and your Lord. There is no creature but that He holds its forelock", source: "Hud 11:56", times: 1 },
    { arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ", transliteration: "Hasbiyallahu la ilaha illa huwa 'alayhi tawakkaltu wa huwa rabbul-arshil-azim", translation: "Sufficient for me is Allah; there is no deity except Him. On Him I have relied, and He is the Lord of the Great Throne", source: "At-Tawbah 9:129", times: 7 },
    { arabic: "آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ... رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا", transliteration: "Last two verses of Surah Al-Baqarah (2:285-286)", translation: "The Messenger has believed in what was revealed to him from his Lord, and so have the believers... Our Lord, do not impose blame upon us if we have forgotten or erred (whoever recites these two verses at night they will suffice him)", source: "Bukhari & Muslim", times: 1 },
  ],
  favorites: [],
};

// ─── DuaCard Component ─────────────────────────────────────────────────────────
const DuaCard: React.FC<{
  dua: DuaItem;
  index: number;
  onFavorite: () => void;
  isFav: boolean;
}> = ({ dua, index, onFavorite, isFav }) => {
  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n[${dua.source}]\n\nvia MyIslam App`
    );
    toast.success("Copied to clipboard 📋");
  };
  const handleShare = () => {
    navigator.share?.({
      title: "Dua from MyIslam",
      text: `${dua.arabic}\n\n${dua.transliteration}\n\n${dua.translation}\n\n[${dua.source}]\n\nShared via MyIslam App`,
    });
  };

  return (
    <div className="bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800">
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-black">{index}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 truncate">
            {dua.transliteration.split(" ").slice(0, 5).join(" ")}...
          </p>
        </div>
        {dua.times && (
          <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 border border-indigo-200 dark:border-indigo-700 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-300">{dua.times}×</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Arabic */}
        <p className="text-right text-xl leading-loose text-gray-900 dark:text-white mb-3" dir="rtl">
          {dua.arabic}
        </p>
        {/* Transliteration */}
        <p className="text-sm text-indigo-600 dark:text-indigo-300 italic mb-2 leading-relaxed">
          {dua.transliteration}
        </p>
        {/* Translation */}
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          {dua.translation}
        </p>
        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full">
            [{dua.source}]
          </span>
          <div className="flex items-center gap-1">
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
    try { return JSON.parse(localStorage.getItem("myislam_fav_duas") || "[]"); } catch { return []; }
  });

  const saveFavorites = (favs: DuaItem[]) => {
    setFavorites(favs);
    localStorage.setItem("myislam_fav_duas", JSON.stringify(favs));
  };

  const toggleFav = (dua: DuaItem) => {
    const exists = favorites.some(f => f.arabic === dua.arabic);
    if (exists) {
      saveFavorites(favorites.filter(f => f.arabic !== dua.arabic));
      toast.success("Removed from favorites");
    } else {
      saveFavorites([...favorites, dua]);
      addDua();
      toast.success("Added to favorites 🤲");
    }
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
        d.translation.toLowerCase().includes(search.toLowerCase()) ||
        d.arabic.includes(search)
      )
    : currentDuas;

  const currentCat = CATEGORIES.find(c => c.id === activeCategory);

  // ── Category detail view ──────────────────────────────────────────────────
  if (activeCategory) {
    return (
      <MobileLayout>
        <div className="p-4 space-y-4 pb-8">
          {/* Header */}
          <header className="flex items-center gap-3 py-3">
            <button
              onClick={() => { setActiveCategory(null); setSearch(""); }}
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800"
            >
              <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </button>
            <div className="flex-1">
              <h1 className="font-bold text-lg text-foreground">
                {currentCat?.icon} {currentCat?.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                {filtered.length} duas • {currentCat?.desc}
              </p>
            </div>
          </header>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search duas..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5 text-sm focus:outline-none focus:border-indigo-400 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Duas list */}
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🤲</p>
              <p className="text-sm text-muted-foreground">
                {activeCategory === "favorites"
                  ? "No favorites yet. Tap ❤️ on any dua to save it here."
                  : "No duas found for your search."}
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
                />
              ))}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  // ── Category grid (home) ──────────────────────────────────────────────────
  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button
            onClick={() => navigate("/")}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800"
          >
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-foreground" style={{ fontFamily: "Georgia, serif" }}>
              Dua and Adhkar
            </h1>
            <p className="text-xs text-muted-foreground">Daily supplications & remembrance</p>
          </div>
        </header>

        {/* Favorites banner if any saved */}
        {favorites.length > 0 && (
          <button
            onClick={() => setActiveCategory("favorites")}
            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200 dark:border-rose-800 active:scale-[0.98] transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-xl shadow-sm">
              ❤️
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-foreground">My Favorites</p>
              <p className="text-xs text-muted-foreground">{favorites.length} saved duas</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Category grid — FIRST THING USERS SEE */}
        <div className="grid grid-cols-3 gap-3">
          {CATEGORIES.filter(c => c.id !== "favorites").map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex flex-col items-center gap-2 p-3 bg-white dark:bg-white/5 rounded-2xl border border-indigo-100 dark:border-indigo-800 hover:border-indigo-300 shadow-sm active:scale-95 transition-all"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl shadow-md`}>
                {cat.icon}
              </div>
              <p className="text-[11px] font-bold text-foreground text-center leading-tight">{cat.name}</p>
            </button>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex gap-3">
          {[
            { label: "Categories", value: "11", color: "text-indigo-500" },
            { label: "Total Duas", value: `${Object.values(DUAS_DATA).reduce((a, b) => a + b.length, 0)}+`, color: "text-emerald-500" },
            { label: "Favorites", value: String(favorites.length), color: "text-rose-500" },
          ].map((s, i) => (
            <div key={i} className="flex-1 text-center bg-white/60 dark:bg-white/5 rounded-2xl p-3 border border-indigo-100 dark:border-indigo-800">
              <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Duas;
