// ═══════════════════════════════════════════════════════════════════════════════
// COMPREHENSIVE ISLAMIC ENCYCLOPEDIA DATABASE
// ═══════════════════════════════════════════════════════════════════════════════
// Grounded in the Holy Qur'an, Sahih collections, and the 4 Sunni Schools of Fiqh.
// ═══════════════════════════════════════════════════════════════════════════════

export interface EncyclopediaEntry {
  id: string;
  category: 'pillar' | 'prophet' | 'companion' | 'fiqh' | 'concept' | 'quran' | 'hereafter';
  title: string;
  arabic?: string;
  transliteration?: string;
  summary: string;
  details: string;
  references: string[];
  keywords: string[];
  practicalSteps?: string[];
}

export const ISLAMIC_ENCYCLOPEDIA: EncyclopediaEntry[] = [
  // ── 1. THE 5 PILLARS OF ISLAM ───────────────────────────────────────────────
  {
    id: 'shahadah',
    category: 'pillar',
    title: 'Ash-Shahadah (The Testimony of Faith)',
    arabic: 'الشَّهَادَةُ',
    transliteration: 'Ash-hadu alla ilaha illallah, wa ash-hadu anna Muhammadan Rasulullah',
    summary: 'The first and most foundational pillar of Islam: bearing witness to the oneness of Allah and the messengerhood of Muhammad ﷺ.',
    details: 'The Shahadah is the gateway to Islam. It consists of two essential declarations: (1) La ilaha illallah — Negation of all false deities and affirmation that none has the right to be worshipped except Allah alone (Tawhid). (2) Muhammadur Rasulullah — Affirmation that Muhammad ﷺ is the final Prophet sent as a mercy to all creation. Sincere recitation with firm conviction in the heart cleanses a person of all prior sins and guarantees ultimate entry into Paradise.',
    references: ['Surah Muhammad 47:19', 'Sahih al-Bukhari 8', 'Sahih Muslim 16'],
    keywords: ['shahada', 'shahadah', 'testimony', 'faith', 'first pillar', 'convert', 'revert', 'creed', 'tawhid', 'la ilaha illallah'],
    practicalSteps: [
      'Utter with sincerity and understanding of its conditions (knowledge, certainty, acceptance, submission, truthfulness, sincerity, love).',
      'Renew your faith daily by saying "La ilaha illallah" with presence of heart.',
      'Reflect on how Tawhid frees the human soul from dependence on creation.'
    ]
  },
  {
    id: 'salah',
    category: 'pillar',
    title: 'Salah (The 5 Daily Obligatory Prayers)',
    arabic: 'الصَّلَاةُ',
    transliteration: 'As-Salah',
    summary: 'The second pillar of Islam and the direct spiritual ascension (Mi\'raj) of the believer five times daily.',
    details: 'Salah was gifted to the Prophet Muhammad ﷺ directly in the heavens during Isra and Mi\'raj. It establishes the spiritual anchor of the day across 5 prayers: Fajr (Dawn), Dhuhr (Noon), Asr (Afternoon), Maghrib (Sunset), and Isha (Night). Salah cleanses sins like a river washing over a person five times daily. It is the very first deed examined on the Day of Judgment; if sound, all other deeds will be sound.',
    references: ['Surah Al-Ankabut 29:45', 'Surah An-Nisa 4:103', 'Sahih al-Bukhari 528', 'Sahih Muslim 667'],
    keywords: ['salah', 'prayer', 'namaz', 'salat', 'second pillar', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'mi\'raj', 'sujood', 'prostration'],
    practicalSteps: [
      'Perform thorough wudu with contemplation and bismillah.',
      'Pray each prayer on its appointed time without procrastination.',
      'Seek Khushu (tranquility and mindful focus) by knowing what you recite in Arabic.',
      'Conclude with the sunnah post-prayer remembrances and Ayat al-Kursi.'
    ]
  },
  {
    id: 'zakat',
    category: 'pillar',
    title: 'Zakat (Obligatory Annual Almsgiving)',
    arabic: 'الزَّكَاةُ',
    transliteration: 'Az-Zakat',
    summary: 'The third pillar of Islam: 2.5% annual wealth redistribution to purify possessions and protect the vulnerable.',
    details: 'The root meaning of Zakat is "purification" and "growth". Far from diminishing wealth, Zakat protects it, blesses it, and redistributes economic vitality across society. Due upon holding wealth above the Nisab threshold (85 grams of pure gold or 595 grams of silver) for one full lunar year (Hawl). The 8 categories of eligible recipients are specified directly in Surah At-Tawbah 9:60.',
    references: ['Surah At-Tawbah 9:60, 103', 'Surah Al-Baqarah 2:43', 'Sahih al-Bukhari 1395'],
    keywords: ['zakat', 'zakah', 'charity', 'nisab', 'hawl', 'third pillar', 'wealth purification', 'alms', 'gold', 'silver'],
    practicalSteps: [
      'Audit your qualifying liquid assets annually on a set lunar date.',
      'Deduct short-term personal debts.',
      'Calculate 2.5% and distribute directly or through trusted charitable organizations to the needy.'
    ]
  },
  {
    id: 'sawm',
    category: 'pillar',
    title: 'Sawm (Fasting the Month of Ramadan)',
    arabic: 'الصَّوْمُ / الصِّيَامُ',
    transliteration: 'As-Sawm',
    summary: 'The fourth pillar of Islam: refraining from food, drink, and desires from dawn to sunset to attain Taqwa (God-consciousness).',
    details: 'Prescribed in the second year of Hijrah. Ramadan is the month in which the Holy Qur\'an was first revealed to humanity. Beyond physical abstinence, authentic fasting entails fasting of the tongue (no backbiting or lying), the eyes (lowering the gaze), and the heart (banishing rancor and arrogance). Allah declares in Hadith Qudsi: "Fasting is for Me, and I shall reward for it."',
    references: ['Surah Al-Baqarah 2:183-185', 'Sahih al-Bukhari 1904', 'Sahih Muslim 1151'],
    keywords: ['fasting', 'sawm', 'siyam', 'ramadan', 'suhoor', 'iftar', 'fourth pillar', 'taqwa', 'tarawih', 'laylatul qadr'],
    practicalSteps: [
      'Take the blessed meal of Suhoor before dawn, even with a sip of water.',
      'Guard speech strictly against gossip and anger.',
      'Hasten to break the fast at Maghrib with dates and water while making personal dua.'
    ]
  },
  {
    id: 'hajj',
    category: 'pillar',
    title: 'Hajj (The Pilgrimage to Makkah)',
    arabic: 'الحَجُّ',
    transliteration: 'Al-Hajj',
    summary: 'The fifth pillar of Islam: an obligatory once-in-a-lifetime pilgrimage for every Muslim with physical and financial ability.',
    details: 'Hajj commemorates the monotheistic legacy of Prophet Ibrahim (AS), Hajar, and Ismail (AS). Millions of Muslims from every continent gather dressed in simple unstitched white cloth (Ihram), stripping away all worldly divisions of status, race, and wealth. The core day of Hajj is the Day of Arafah. An accepted Hajj (Hajj Mabrur) earns no reward except Paradise and returns the pilgrim sinless as the day they were born.',
    references: ['Surah Ali \'Imran 3:97', 'Surah Al-Hajj 22:27', 'Sahih al-Bukhari 1521'],
    keywords: ['hajj', 'pilgrimage', 'makkah', 'mecca', 'kaaba', 'ihram', 'tawaf', 'arafah', 'mina', 'muzdalifah', 'fifth pillar', 'umrah'],
    practicalSteps: [
      'Make sincere intention early in life and establish a halal savings fund.',
      'Seek forgiveness and settle debts with all people before departing.',
      'Learn the rites and spiritual meanings of each station.'
    ]
  },

  // ── 2. THE 6 ARTICLES OF IMAN (FAITH) ───────────────────────────────────────
  {
    id: 'iman-allah',
    category: 'concept',
    title: 'Belief in Allah & Divine Unity (Tawhid)',
    arabic: 'التَّوْحِيدُ',
    transliteration: 'Tawhid',
    summary: 'The supreme foundation of Islam: belief in Allah\'s absolute oneness in Lordship (Rububiyyah), Worship (Uluhiyyah), and Divine Names & Attributes (Asma wa Sifat).',
    details: 'Tawhid is the purest monotheism in human existence. It establishes that Allah has no partners, no parents, no children, and no equals (Surah Al-Ikhlas 112). Understanding Tawhid frees humanity from superstition, fatalism, and subservience to tyrants, rooting dignity exclusively in devotion to the One Creator.',
    references: ['Surah Al-Ikhlas 112:1-4', 'Surah Al-Baqarah 2:255', 'Sahih Muslim 8 (Hadith Jibril)'],
    keywords: ['tawhid', 'iman', 'belief in allah', 'monotheism', 'rububiyyah', 'uluhiyyah', 'asma wa sifat', 'articles of faith'],
  },
  {
    id: 'iman-angels',
    category: 'concept',
    title: 'Belief in the Angels (Al-Mala\'ikah)',
    arabic: 'المَلَائِكَةُ',
    transliteration: 'Al-Mala\'ikah',
    summary: 'Noble, sinless beings created by Allah from pure light who ceaselessly carry out divine commands.',
    details: 'Angels possess neither gender nor desire, never disobey Allah, and praise Him day and night. Key Archangels include Jibril (Gabriel — bearer of Revelation), Mika\'il (Michael — in charge of rain and sustenance), Israfil (blower of the Trumpet), and Malak al-Mawt (Angel of Death). Every person is accompanied by Kiraman Katibin who record deeds.',
    references: ['Surah At-Tahrim 66:6', 'Surah Fatir 35:1', 'Sahih Muslim 2996'],
    keywords: ['angels', 'malaikah', 'jibril', 'gabriel', 'mikail', 'israfil', 'kiraman katibin', 'articles of faith'],
  },
  {
    id: 'iman-books',
    category: 'concept',
    title: 'Belief in the Divine Books (Al-Kutub)',
    arabic: 'الكُتُبُ السَّمَاوِيَّةُ',
    transliteration: 'Al-Kutub as-Samawiyyah',
    summary: 'Scriptures revealed by Allah to His Messengers for human guidance across history.',
    details: 'Muslims believe in all authentic original divine revelations: the Scrolls of Ibrahim (Suhuf), the Tawrat (Torah) to Musa, the Zabur (Psalms) to Dawud, the Injeel (Gospel) to Isa, and the Holy Qur\'an to Muhammad ﷺ as the final, uncorrupted, and preserved criterion (Furqan) for all humanity until the end of time.',
    references: ['Surah Al-Baqarah 2:285', 'Surah Al-Hijr 15:9', 'Surah Al-Ma\'idah 5:48'],
    keywords: ['holy books', 'scriptures', 'kutub', 'quran', 'torah', 'tawrat', 'injeel', 'gospel', 'zabur', 'psalms'],
  },
  {
    id: 'iman-messengers',
    category: 'concept',
    title: 'Belief in the Prophets & Messengers (Ar-Rusul)',
    arabic: 'الأَنْبِيَاءُ وَالرُّسُلُ',
    transliteration: 'Al-Anbiya war-Rusul',
    summary: 'The chain of chosen righteous men sent to invite every nation to worship Allah alone and establish justice.',
    details: 'From Adam (AS) to Muhammad ﷺ, 124,000 prophets were sent throughout human history, including Noah (Nuh), Abraham (Ibrahim), Moses (Musa), and Jesus (Isa) — peace be upon them all. Muslims honor and love all Prophets without discrimination, taking Prophet Muhammad ﷺ as the Khatam an-Nabiyyin (Seal of the Prophets).',
    references: ['Surah Al-Baqarah 2:136', 'Surah Al-Ahzab 33:40', 'Surah An-Nahl 16:36'],
    keywords: ['prophets', 'messengers', 'anbiya', 'rusul', 'seal of prophets', 'adam', 'ibrahim', 'musa', 'isa', 'muhammad'],
  },
  {
    id: 'iman-hereafter',
    category: 'hereafter',
    title: 'Belief in the Day of Judgment (Yawm al-Qiyamah)',
    arabic: 'يَوْمُ القِيَامَةِ',
    transliteration: 'Yawm al-Qiyamah / Al-Akhirah',
    summary: 'The Day of Resurrection, Divine Accounting (Hisab), and eternal justice in Paradise (Jannah) or Hellfire (Jahannam).',
    details: 'Human life on earth is a temporary examination. When the Trumpet is blown, all creation will be resurrected before their Lord. Every atom\'s weight of good and evil will be witnessed on the divine scales (Mizan). Believers who lived with faith and righteousness will receive their records in their right hands and enter Jannah through Allah\'s boundless mercy.',
    references: ['Surah Al-Zalzalah 99:1-8', 'Surah Al-Qari\'ah 101:1-11', 'Sahih al-Bukhari 6526'],
    keywords: ['day of judgment', 'qiyamah', 'hereafter', 'akhirah', 'mizan', 'resurrection', 'hisab', 'jannah', 'jahannam'],
  },
  {
    id: 'iman-qadar',
    category: 'concept',
    title: 'Belief in Divine Decree & Predestination (Al-Qadar)',
    arabic: 'القَدَرُ',
    transliteration: 'Al-Qadr / Al-Qada wal-Qadar',
    summary: 'Belief that Allah encompasses all things in His eternal Knowledge, has written all decrees, wills all that occurs, and creates all existence.',
    details: 'The 4 pillars of Qadar: (1) Knowledge (Ilm), (2) Writing in the Preserved Tablet (Kitabah), (3) Divine Will (Mashee\'ah), and (4) Creation (Khalq). Qadar does not negate human free will or responsibility; humans make moral choices, but nothing occurs outside Allah\'s sovereignty. Belief in Qadar instills unshakeable peace in trials and prevents arrogance in success.',
    references: ['Surah Al-Qamar 54:49', 'Surah Al-Hadid 57:22-23', 'Sahih Muslim 2653'],
    keywords: ['qadr', 'qadar', 'destiny', 'fate', 'predestination', 'decree', 'tawakkul', 'al-lawh al-mahfuz'],
  },

  // ── 3. MAJOR PROPHETS IN ISLAM ──────────────────────────────────────────────
  {
    id: 'prophet-muhammad',
    category: 'prophet',
    title: 'Prophet Muhammad ﷺ (The Seal of the Prophets)',
    arabic: 'مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ',
    transliteration: 'Muhammad ﷺ (570 – 632 CE)',
    summary: 'The final messenger of Allah, sent as a mercy to all the worlds (Rahmatan lil-Alamin), teacher of the Qur\'an and exemplar of noble character.',
    details: 'Born in Makkah into the Banu Hashim clan of Quraysh. Known before revelation as As-Sadiq (The Truthful) and Al-Amin (The Trustworthy). At age 40, in the Cave of Hira, received the first revelation (Surah Al-Alaq 96:1). Endured 13 years of persecution in Makkah before making Hijrah to Madinah in 622 CE, establishing the first constitution and brotherhood of believers. Cleansed the Ka\'bah of idols during the peaceful Conquest of Makkah (Fath Makkah) and delivered the historic Farewell Sermon (Khutbat al-Wada).',
    references: ['Surah Al-Anbiya 21:107', 'Surah Al-Ahzab 33:21', 'Surah Al-Qalam 68:4'],
    keywords: ['muhammad', 'prophet muhammad', 'pbuh', 'messenger', 'seal', 'hira', 'hijrah', 'madinah', 'sunnah', 'seerah'],
  },
  {
    id: 'prophet-ibrahim',
    category: 'prophet',
    title: 'Prophet Ibrahim / Abraham (Khalilullah — Friend of Allah)',
    arabic: 'إِبْرَاهِيمُ عَلَيْهِ السَّلَامُ',
    transliteration: 'Ibrahim (AS)',
    summary: 'The patriarch of monotheism, father of prophets, who rejected idol worship and built the Ka\'bah with his son Ismail.',
    details: 'Tested with fire by King Nimrod, from which Allah saved him cool and peaceful. Commanded to leave his wife Hajar and infant son Ismail in the barren desert of Makkah, leading to the miraculous gushing of the Zamzam well and the establishment of Hajj rituals. Passed the ultimate test of sacrifice, establishing Eid al-Adha. Honored in every Muslim prayer with the As-Salat al-Ibrahimiyyah.',
    references: ['Surah Al-Baqarah 2:124-128', 'Surah As-Saffat 37:100-111', 'Surah Maryam 19:41-50'],
    keywords: ['ibrahim', 'abraham', 'khalilullah', 'hajar', 'ismail', 'kaaba', 'zamzam', 'eid al adha', 'qurban'],
  },
  {
    id: 'prophet-musa',
    category: 'prophet',
    title: 'Prophet Musa / Moses (Kalimullah — The One Spoken to by Allah)',
    arabic: 'مُوسَىٰ عَلَيْهِ السَّلَامُ',
    transliteration: 'Musa (AS)',
    summary: 'The most frequently mentioned prophet in the Holy Qur\'an (136 times); liberated the Children of Israel from Pharaoh.',
    details: 'Spoken to directly by Allah at Mount Sinai (Tur). Granted mighty miracles including the staff that turned into a serpent and the parting of the Red Sea. Received the Tawrat (Torah). Symbolizes unflinching courage against tyranny and complete reliance on Allah: when trapped between the ocean and Pharaoh\'s army, he declared: "Never! Indeed, with me is my Lord; He will guide me!" (26:62).',
    references: ['Surah Ta-Ha 20:9-98', 'Surah Al-Qasas 28:3-44', 'Surah Ash-Shu\'ara 26:61-68'],
    keywords: ['musa', 'moses', 'kalimullah', 'pharaoh', 'fir\'awn', 'red sea', 'mount sinai', 'tawrat', 'bani israel'],
  },
  {
    id: 'prophet-isa',
    category: 'prophet',
    title: 'Prophet Isa / Jesus (Ruhullah wa Kalimatuh)',
    arabic: 'عِيسَى ابْنُ مَرْيَمَ عَلَيْهِ السَّلَامُ',
    transliteration: 'Isa ibn Maryam (AS)',
    summary: 'Mighty messenger born of the Virgin Maryam (Mary), honored spirit and Word from Allah; will return before the Day of Judgment.',
    details: 'Born miraculously without a human father. Spoke from the cradle as an infant defending his mother\'s chastity. Given miracles by Allah\'s permission: healing the leper, opening blind eyes, and raising the dead. Islam teaches that he was neither crucified nor killed, but raised alive to heaven by Allah (4:157-158), and will descend to establish peace and justice before the end of the world.',
    references: ['Surah Maryam 19:16-36', 'Surah An-Nisa 4:156-159', 'Surah Al-Ma\'idah 5:110-118'],
    keywords: ['isa', 'jesus', 'maryam', 'mary', 'virgin birth', 'messiah', 'second coming', 'injiil', 'prophet jesus'],
  },
  {
    id: 'prophet-yusuf',
    category: 'prophet',
    title: 'Prophet Yusuf / Joseph (The Best of Stories)',
    arabic: 'يُوسُفُ عَلَيْهِ السَّلَامُ',
    transliteration: 'Yusuf (AS)',
    summary: 'The prophet of unparalleled beauty, patience, and chastity; transformed from an abandoned well to governor of Egypt.',
    details: 'His story, detailed in Surah Yusuf (Ahsan al-Qasas), teaches masterclasses in overcoming family betrayal, resisting illicit temptation, enduring wrongful imprisonment with dignity, and granting generous forgiveness to those who harmed you ("No blame will there be upon you today. May Allah forgive you").',
    references: ['Surah Yusuf 12:1-111'],
    keywords: ['yusuf', 'joseph', 'patience', 'surah yusuf', 'chastity', 'forgiveness', 'dreams', 'egypt'],
  },
  {
    id: 'prophet-yunus',
    category: 'prophet',
    title: 'Prophet Yunus / Jonah (Dhun-Nun)',
    arabic: 'يُونُسُ عَلَيْهِ السَّلَامُ (ذُو النُّونِ)',
    transliteration: 'Yunus (AS)',
    summary: 'Swallowed by the whale after leaving his people in frustration; rescued through the supreme prayer of repentance.',
    details: 'Crying out from the triple darkness (darkness of the whale, darkness of the ocean depth, darkness of the night): "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin" (There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers). The Prophet ﷺ taught that no Muslim ever invokes Allah with this prayer in distress except that Allah relieves them.',
    references: ['Surah Al-Anbiya 21:87-88', 'Surah As-Saffat 37:139-148', 'Sunan at-Tirmidhi 3505'],
    keywords: ['yunus', 'jonah', 'whale', 'dhun nun', 'distress', 'repentance', 'anbiya'],
  },

  // ── 4. THE FOUR RIGHTLY GUIDED CALIPHS (AL-KHULAFA AR-RASHIDUN) ─────────────
  {
    id: 'caliph-abu-bakr',
    category: 'companion',
    title: 'Abu Bakr As-Siddiq (The Truthful)',
    arabic: 'أَبُو بَكْرٍ الصِّدِّيقُ رَضِيَ اللَّهُ عَنْهُ',
    transliteration: 'Abu Bakr As-Siddiq (RA)',
    summary: 'First male convert, closest companion, and first Caliph of Islam; unified the Ummah after the Prophet\'s passing.',
    details: 'Accompanied the Prophet ﷺ during the historic cave hiding during the Hijrah. Gave away his entire wealth for the Expedition of Tabuk ("I left for them Allah and His Messenger"). Compiled the Holy Qur\'an into a unified written manuscript during his caliphate. The Prophet ﷺ said: "If I were to take a Khalil other than my Lord, I would have taken Abu Bakr."',
    references: ['Surah At-Tawbah 9:40', 'Sahih al-Bukhari 3656', 'Sahih Muslim 2382'],
    keywords: ['abu bakr', 'siddiq', 'first caliph', 'companion', 'sahaba', 'khulafa', 'hijrah cave'],
  },
  {
    id: 'caliph-umar',
    category: 'companion',
    title: 'Umar ibn Al-Khattab (Al-Faruq — The Criterion)',
    arabic: 'عُمَرُ بْنُ الخَطَّابِ رَضِيَ اللَّهُ عَنْهُ',
    transliteration: 'Umar Al-Faruq (RA)',
    summary: 'The second Caliph; established Islamic governance, legal justice, the Hijri calendar, and peaceful entry into Jerusalem.',
    details: 'Whose conversion brought strength to the Muslims in Makkah. Known for absolute justice and humility, sleeping under trees without guards while leading a state spanning Persia to North Africa. Established public welfare treasuries, night patrols, and standard prayers of Tarawih. The Prophet ﷺ said: "If there were to be a prophet after me, it would be Umar."',
    references: ['Sahih al-Bukhari 3683', 'Sahih Muslim 2398', 'Sunan at-Tirmidhi 3686'],
    keywords: ['umar', 'faruq', 'second caliph', 'justice', 'sahaba', 'hijri calendar', 'jerusalem'],
  },
  {
    id: 'caliph-uthman',
    category: 'companion',
    title: 'Uthman ibn Affan (Dhun-Nurayn — Possessor of the Two Lights)',
    arabic: 'عُثْمَانُ بْنُ عَفَّانَ رَضِيَ اللَّهُ عَنْهُ',
    transliteration: 'Uthman Dhun-Nurayn (RA)',
    summary: 'The third Caliph; married two daughters of the Prophet ﷺ; standardized and distributed the Qur\'anic Mushaf across the world.',
    details: 'Known for sublime modesty, generosity, and gentleness. Purchased the well of Rumah for the public in Madinah and financed the Army of Hardship. During his caliphate, he commissioned the standardized Madani copies of the Qur\'an based on the dialect of Quraysh to preserve pronunciation for all generations. Died as a martyr holding the Mushaf in his lap.',
    references: ['Sahih al-Bukhari 4987', 'Sahih Muslim 2401'],
    keywords: ['uthman', 'dhun nurayn', 'third caliph', 'quran compilation', 'mushaf', 'modesty', 'sahaba'],
  },
  {
    id: 'caliph-ali',
    category: 'companion',
    title: 'Ali ibn Abi Talib (Asadullah — Lion of Allah)',
    arabic: 'عَلِيُّ بْنُ أَبِي طَالِبٍ رَضِيَ اللَّهُ عَنْهُ',
    transliteration: 'Ali ibn Abi Talib (RA)',
    summary: 'Cousin and son-in-law of the Prophet ﷺ, husband of Fatimah (RA), fourth Caliph; legendary hero of knowledge and valor.',
    details: 'First youth to embrace Islam. Risked his life sleeping in the Prophet\'s bed on the night of the Hijrah migration to return trusts to the Makkan people. Bearer of the banner at the Battle of Khaybar. Renowned as the fountainhead of wisdom, Arabic rhetoric, and Islamic jurisprudence. The Prophet ﷺ declared: "I am the city of knowledge and Ali is its gate."',
    references: ['Sahih al-Bukhari 3706', 'Sahih Muslim 2404', 'Sunan at-Tirmidhi 3723'],
    keywords: ['ali', 'ali ibn abi talib', 'fourth caliph', 'khaybar', 'fatimah', 'knowledge', 'courage', 'sahaba'],
  },

  // ── 5. THE FOUR MAJOR SUNNI SCHOOLS OF FIQH (MADH\'HABS) ─────────────────────
  {
    id: 'fiqh-hanafi',
    category: 'fiqh',
    title: 'The Hanafi School of Jurisprudence',
    arabic: 'المَذْهَبُ الحَنَفِيُّ',
    transliteration: 'Madh-hab al-Hanafi',
    summary: 'Founded by Imam Abu Hanifah (Nu\'man ibn Thabit, 80–150 AH). Emphasizes rational deduction (Qiyas) and public interest (Istihsan).',
    details: 'The earliest of the four Sunni schools, originating in Kufa, Iraq. Characterized by robust collaborative legal debates, emphasis on human welfare, and precision in contractual transactions. Most widely practiced across South Asia, Turkey, Central Asia, the Balkans, and parts of the Levant and Egypt.',
    references: ['Al-Hidayah by Al-Marghinani', 'Radd al-Muhtar by Ibn Abidin'],
    keywords: ['hanafi', 'abu hanifah', 'madhab', 'fiqh', 'qiyas', 'sunni schools', 'jurisprudence'],
  },
  {
    id: 'fiqh-maliki',
    category: 'fiqh',
    title: 'The Maliki School of Jurisprudence',
    arabic: 'المَذْهَبُ المَالِكِيُّ',
    transliteration: 'Madh-hab al-Maliki',
    summary: 'Founded by Imam Malik ibn Anas (93–179 AH). Grounded in the living tradition and practice of the people of Madinah (\'Amal Ahl al-Madinah).',
    details: 'Based in the Prophet\'s City of Madinah. Imam Malik authored Al-Muwatta, the earliest major codified Hadith-Fiqh compendium. The school holds the continuous living practice of the community of Madinah as a primary legal proof, as thousands witnessed the Prophet\'s daily lifestyle. Predominant across North Africa, West Africa, and parts of the Arabian Gulf.',
    references: ['Al-Muwatta by Imam Malik', 'Al-Mudawwanah by Sahnun'],
    keywords: ['maliki', 'malik ibn anas', 'muwatta', 'madinah', 'amal ahl al madinah', 'madhab', 'fiqh'],
  },
  {
    id: 'fiqh-shafii',
    category: 'fiqh',
    title: 'The Shafi\'i School of Jurisprudence',
    arabic: 'المَذْهَبُ الشَّافِعِيُّ',
    transliteration: 'Madh-hab ash-Shafi\'i',
    summary: 'Founded by Imam Muhammad ibn Idris ash-Shafi\'i (150–204 AH). The architect of Usul al-Fiqh (Principles of Islamic Jurisprudence).',
    details: 'Imam Shafi\'i studied under Imam Malik in Madinah and students of Abu Hanifah in Iraq, synthesizing text-based traditionalism with systematic legal methodology. Authored Ar-Risalah (the foundational treatise on legal theory) and Kitab al-Umm. Predominant in Southeast Asia (Indonesia, Malaysia), East Africa, Yemen, Egypt, and Kurdistan.',
    references: ['Ar-Risalah by Imam Shafi\'i', 'Al-Majmu\' by Imam an-Nawawi'],
    keywords: ['shafii', 'imam shafii', 'usul al fiqh', 'risalah', 'nawawi', 'madhab', 'fiqh'],
  },
  {
    id: 'fiqh-hanbali',
    category: 'fiqh',
    title: 'The Hanbali School of Jurisprudence',
    arabic: 'المَذْهَبُ الحَنْبَلِيُّ',
    transliteration: 'Madh-hab al-Hanbali',
    summary: 'Founded by Imam Ahmad ibn Hanbal (164–241 AH). Prioritizes direct reliance on authentic Hadith and Athar of the Companions.',
    details: 'Imam Ahmad was an unyielding defender of Orthodox Islamic creed during the trial of the Creation of the Qur\'an (Mihna), author of Al-Musnad (over 27,000 hadiths). The Hanbali school is known for flexibility in contractual conditions and deep adherence to the textual sunnah. Predominant in Saudi Arabia, Qatar, the UAE, and parts of Palestine and Syria.',
    references: ['Al-Mughni by Ibn Qudamah', 'Musnad Ahmad'],
    keywords: ['hanbali', 'ahmad ibn hanbal', 'musnad', 'ibn qudamah', 'mughni', 'madhab', 'fiqh'],
  },

  // ── 6. VITAL EVERYDAY FIQH & LIFESTYLE QUESTIONS ───────────────────────────
  {
    id: 'wudu-steps',
    category: 'fiqh',
    title: 'How to Perform Wudu (Ablution) Correctly',
    arabic: 'الوُضُوءُ',
    transliteration: 'Al-Wudu',
    summary: 'The prerequisite ritual washing for prayer, cleansing spiritual and physical impurities.',
    details: 'Order of Wudu according to the Sunnah: (1) Niyyah (intention in heart) and say Bismillah. (2) Wash hands up to wrists 3x. (3) Rinse mouth 3x (Madmadah). (4) Sniff water into nostrils and blow out 3x (Istinshaq). (5) Wash entire face from hairline to chin and ear to ear 3x. (6) Wash right arm then left arm including elbows 3x. (7) Wipe wet hands over hair from front to back and wipe ears once (Mas-h). (8) Wash right foot then left foot up to ankles 3x. Conclude with the Shahadah for the promise of the 8 gates of Paradise opening!',
    references: ['Surah Al-Ma\'idah 5:6', 'Sahih al-Bukhari 159', 'Sahih Muslim 234'],
    keywords: ['wudu', 'ablution', 'how to make wudu', 'cleanliness', 'taharah', 'wash', 'steps of wudu'],
    practicalSteps: [
      'Avoid wasting water even at a flowing river.',
      'Ensure water touches all required skin without nail polish or barrier.',
      'Recite the post-wudu dua: "Ash-hadu alla ilaha illallah wahdahu la sharika lah..."'
    ]
  },
  {
    id: 'tahajjud-prayer',
    category: 'fiqh',
    title: 'Salat al-Tahajjud (The Night Vigil Prayer)',
    arabic: 'صَلَاةُ التَّهَجُّدِ',
    transliteration: 'Salat al-Tahajjud / Qiyam al-Layl',
    summary: 'The most rewarding voluntary prayer, prayed in the last third of the night after sleeping.',
    details: 'Allah praises those who abandon their beds to call upon their Lord in hope and fear. In the last third of the night, Allah descends to the lowest heaven in a manner befitting His Majesty and asks: "Who is calling upon Me, that I may answer? Who is seeking My forgiveness, that I may forgive him?" Prayed in units of 2 rak\'ahs, concluded with 1 or 3 rak\'ahs of Witr.',
    references: ['Surah Al-Isra 17:79', 'Surah As-Sajdah 32:16-17', 'Sahih al-Bukhari 1145'],
    keywords: ['tahajjud', 'night prayer', 'qiyam', 'witr', 'last third of night', 'dua acceptance'],
    practicalSteps: [
      'Sleep early with wudu and make intention for Tahajjud.',
      'Wake up 30-45 minutes before Fajr.',
      'Pray 2 to 8 calm rak\'ahs with heartfelt recitation, and pour out your heart in Sujood.'
    ]
  },
  {
    id: 'istikhara-prayer',
    category: 'fiqh',
    title: 'Salat al-Istikhara (Seeking Allah\'s Counsel in Decisions)',
    arabic: 'صَلَاةُ الِاسْتِخَارَةِ',
    transliteration: 'Salat al-Istikhara',
    summary: 'The Prophetic prayer for guidance when making life choices (marriage, career, travel, purchases).',
    details: 'The Prophet ﷺ taught Istikhara as he taught a Surah of the Qur\'an. Consists of praying 2 voluntary rak\'ahs, followed by the specific authentic supplication consulting Allah\'s infinite knowledge and decree. Istikhara does not require seeing a dream; rather, Allah makes the blessed path easy and closes doors to what is harmful.',
    references: ['Sahih al-Bukhari 1166', 'Sunan at-Tirmidhi 480'],
    keywords: ['istikhara', 'decision', 'guidance', 'marriage decision', 'job decision', 'career', 'dua istikhara'],
    practicalSteps: [
      'Research and consult wise advisors (Istisharah).',
      'Pray 2 voluntary rak\'ahs outside prohibited times.',
      'Recite the Istikhara dua with complete surrender to Allah\'s choice, then take decisive action.'
    ]
  },
  {
    id: 'halal-haram-food',
    category: 'fiqh',
    title: 'Halal vs. Haram Nutrition & Consumption',
    arabic: 'الحَلَالُ وَالحَرَامُ',
    transliteration: 'Al-Halal wal-Haram',
    summary: 'The Islamic framework for pure (Tayyib) food and permissible lifestyle choices.',
    details: 'General rule in food: everything is permissible (Halal) except what is explicitly prohibited (Haram) by divine text: pork, intoxicants/alcohol, blood, animals dead before slaughter, and meat not slaughtered in the name of Allah. Halal consumption is directly linked to the acceptance of prayers and spiritual vitality.',
    references: ['Surah Al-Baqarah 2:168, 172-173', 'Surah Al-Ma\'idah 5:3-4', 'Sahih Muslim 1015'],
    keywords: ['halal', 'haram', 'tayyib', 'food', 'pork', 'alcohol', 'diet', 'slaughter', 'zabiha'],
  },
  {
    id: 'riba-usury',
    category: 'fiqh',
    title: 'Riba (Interest & Usury) and Islamic Finance',
    arabic: 'الرِّبَا',
    transliteration: 'Ar-Riba',
    summary: 'The severe prohibition of interest-based exploitation and the promotion of ethical, asset-backed commerce.',
    details: 'Riba is strictly forbidden in the Qur\'an as an unjust mechanism that concentrates wealth and exploits hardship. In contrast, Islam champions trade (Bay\'), risk-sharing partnerships (Musharakah/Mudarabah), and charitable interest-free loans (Qard Hasan) where capital serves real human productivity.',
    references: ['Surah Al-Baqarah 2:275-279', 'Surah Ali \'Imran 3:130', 'Sahih Muslim 1598'],
    keywords: ['riba', 'interest', 'usury', 'islamic banking', 'finance', 'debt', 'halal investment', 'mortgage'],
  },
];

// Helper search function to query encyclopedia entries
export function searchEncyclopedia(query: string): EncyclopediaEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return ISLAMIC_ENCYCLOPEDIA.filter((item) => {
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.details.toLowerCase().includes(q) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(q) || q.includes(kw.toLowerCase()))
    );
  });
}
