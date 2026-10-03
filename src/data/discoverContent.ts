// Hand-picked short Islamic videos (all under 20 minutes) and quick Q&As for Daily Discover.

export interface DiscoverVideo {
  id: string; // YouTube video id
  title: string;
  channel: string;
  duration: string;
  topic: string;
}

export interface DiscoverQA {
  question: string;
  answer: string;
  topic: string;
  reference?: string;
}

export const DISCOVER_VIDEOS: DiscoverVideo[] = [
  { id: "E2H_AY3Lw6Y", title: "If this can't keep you focused, what will?", channel: "Mufti Menk", duration: "1:35", topic: "Reminder" },
  { id: "AIyaa4fP0aI", title: "When you put your trust in Allah", channel: "Nouman Ali Khan", duration: "2:28", topic: "Tawakkul" },
  { id: "Oz4tmJqPokY", title: "Why am I being tested?", channel: "Dr. Omar Suleiman", duration: "1:18", topic: "Patience" },
  { id: "xxvN2MZ2CMg", title: "The benefit of reading Surah al-Kahf every Jumu'ah", channel: "Dr. Haifaa Younis", duration: "1:32", topic: "Jumu'ah" },
  { id: "4kslI583zyQ", title: "Time management for Muslims", channel: "Nouman Ali Khan", duration: "3:21", topic: "Productivity" },
  { id: "AmeIrsSRUwI", title: "Sayyidul Istighfar: the master of forgiveness", channel: "Dr. Omar Suleiman", duration: "1:16", topic: "Dua" },
  { id: "IoTxSaEXNpY", title: "The sweetness of Iman", channel: "Shaykh Dr. Yasir Qadhi", duration: "3:17", topic: "Iman" },
  { id: "9IAGgQi67K4", title: "Reciting Surah Kahf on Friday — when and is it authentic?", channel: "Assim al-Hakeem", duration: "1:03", topic: "Fiqh" },
  { id: "uDb3fpJyWXE", title: "Jealous? Here's one for you", channel: "Mufti Menk", duration: "1:24", topic: "Character" },
  { id: "PmZCl7cC4F0", title: "Importance of following the Sunnah", channel: "Shaykh Dr. Yasir Qadhi", duration: "3:25", topic: "Sunnah" },
  { id: "ZTpbY6YsZoQ", title: "Destroy overthinking — an Islamic reminder", channel: "Islam to Listen", duration: "1:30", topic: "Wellbeing" },
  { id: "a3eauV4nE9w", title: "Just 5 minutes for the Qur'an", channel: "Tarjuma Series", duration: "1:58", topic: "Qur'an" },
  { id: "KmcRdn1ye6I", title: "Salat series — Niyyah (intention)", channel: "MKA UK", duration: "1:46", topic: "Salah" },
  { id: "0mYvSGjsB8A", title: "Story of Prophet Yusuf", channel: "Deenee", duration: "1:46", topic: "Prophets" },
  { id: "dG2R6ImG9YI", title: "Honour your parents", channel: "Yasir Qadhi", duration: "2:35", topic: "Family" },
];

export const DISCOVER_QA: DiscoverQA[] = [
  { topic: "Salah", question: "What should I do if I miss a prayer?", answer: "Pray it as soon as you remember. The Prophet ﷺ said whoever forgets a prayer or sleeps through it should pray it when they remember; there is no other expiation.", reference: "Bukhari 597, Muslim 684" },
  { topic: "Wudu", question: "Does sleeping break wudu?", answer: "Deep sleep where you lose awareness breaks wudu according to most scholars. Light dozing while sitting firmly does not.", reference: "Abu Dawud 203" },
  { topic: "Fasting", question: "Which voluntary fasts are most rewarded?", answer: "Mondays and Thursdays, the White Days (13th–15th of each Hijri month), six days of Shawwal, the Day of Arafah and Ashura.", reference: "Muslim 1162, Tirmidhi 747" },
  { topic: "Qur'an", question: "Can I read the Qur'an on my phone without wudu?", answer: "Many scholars allow reading from a phone without wudu since it is not a physical mushaf, though being in wudu is better and more respectful." },
  { topic: "Dua", question: "When are duas most likely to be accepted?", answer: "In sujood, the last third of the night, between adhan and iqamah, the last hour of Friday afternoon, while fasting and when it rains.", reference: "Muslim 482, Bukhari 1145" },
  { topic: "Jumu'ah", question: "What are the Sunnahs of Friday?", answer: "Taking a bath (ghusl), wearing clean clothes and perfume, going early to the masjid, reading Surah al-Kahf and sending abundant salawat on the Prophet ﷺ.", reference: "Bukhari 883, Abu Dawud 1047" },
  { topic: "Character", question: "What is the heaviest thing on the scale?", answer: "Good character. The Prophet ﷺ said nothing will be heavier on the believer's scale on the Day of Judgement than good character.", reference: "Tirmidhi 2002" },
  { topic: "Zakat", question: "When does zakat become due?", answer: "When your savings reach the nisab (value of about 85g of gold) and a full lunar year passes; then 2.5% is due." },
  { topic: "Dhikr", question: "What are two light words heavy on the scale?", answer: "SubhanAllahi wa bihamdihi, SubhanAllahil 'Adheem — light on the tongue, heavy on the scale and beloved to the Most Merciful.", reference: "Bukhari 6406" },
  { topic: "Wellbeing", question: "What does Islam say about anxiety?", answer: "Allah says hearts find rest in His remembrance. The Prophet ﷺ taught the dua: Allahumma inni a'udhu bika minal-hammi wal-hazan — O Allah, I seek refuge in You from worry and grief.", reference: "Qur'an 13:28, Bukhari 6369" },
  { topic: "Salah", question: "Is it okay to pray sitting down?", answer: "Yes, if standing is difficult due to illness or weakness. The Prophet ﷺ said: pray standing; if you cannot, then sitting; if you cannot, then on your side.", reference: "Bukhari 1117" },
  { topic: "Family", question: "Which deed is most beloved to Allah?", answer: "Prayer on time, then kindness to parents, then striving in the path of Allah.", reference: "Bukhari 527" },
];
