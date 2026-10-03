// ═══════════════════════════════════════════════════════════════════════════════
// MIA ISLAMIC JARVIS INTELLIGENCE ENGINE (Autonomous Islamic Companion Brain)
// ═══════════════════════════════════════════════════════════════════════════════
// Complete, offline-capable, authentic Islamic knowledge system grounded in:
// - The Holy Qur'an & Sahih Hadiths (Bukhari, Muslim, Tirmidhi, Abu Dawud, etc.)
// - The 4 Major Sunni Schools of Fiqh (Hanafi, Maliki, Shafi'i, Hanbali)
// - Dynamic app integration (Prayer times, Streak, Audio, Duas, Compass, Tasbih)
// ═══════════════════════════════════════════════════════════════════════════════

export interface IslamicBrainContext {
  userName?: string | null;
  streakDays?: number;
  prayersCompletedToday?: string[];
  quranPagesToday?: number;
  duasToday?: number;
  prayerTimes?: Record<string, string>;
  hijriDate?: { day: number; month: { en: string; ar: string }; year: number };
  location?: { city: string; country: string } | null;
  localTime?: string;
  weekday?: string;
}

export interface JarvisAction {
  type: 'navigate' | 'log_prayer' | 'play_audio' | 'calculate_zakat' | 'log_dua' | 'none';
  payload?: any;
  label?: string;
}

export interface JarvisBrainOutput {
  text: string;
  action?: JarvisAction;
  suggestedFollowUps?: string[];
  spokenSummary?: string;
}

// ── Authenticated Knowledge Base & Islamic Modules ─────────────────────────────

const AUTHENTIC_DUAS: Record<string, { arabic: string; transliteration: string; translation: string; benefit: string; source: string }> = {
  anxiety: {
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ",
    transliteration: "Allahumma inni a'udhu bika min al-hammi wal-hazan, wal-'ajzi wal-kasal, wal-bukhli wal-jubn, wa dala'id-dayn, wa ghalabatir-rijal",
    translation: "O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from miserliness and cowardice, from being overcome by debt and overpowered by people.",
    benefit: "The Prophet ﷺ recited this daily for profound relief from anxiety, despair, and crushing stress.",
    source: "Sahih al-Bukhari 2893",
  },
  distress: {
    arabic: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa Anta subhanaka inni kuntu minaz-zalimin",
    translation: "There is no deity worthy of worship except You; exalted are You. Indeed, I have been of the wrongdoers.",
    benefit: "The supplication of Prophet Yunus (Jonah). The Prophet ﷺ said no Muslim ever calls upon Allah with these words but Allah answers him.",
    source: "Surah Al-Anbiya 21:87, Sunan at-Tirmidhi 3505",
  },
  forgiveness: {
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ",
    transliteration: "Allahumma Anta Rabbi la ilaha illa Anta, khalaqtani wa ana 'abduka, wa ana 'ala 'ahdika wa wa'dika ma stata'tu, a'udhu bika min sharri ma sana'tu, abu'u laka bi ni'matika 'alayya, wa abu'u bi dhanbi faghfir li, fa innahu la yaghfirudh-dhunuba illa Anta",
    translation: "O Allah, You are my Lord, there is no deity except You. You created me and I am Your servant, and I abide by Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favor upon me, and I acknowledge my sin, so forgive me, for none forgives sins except You.",
    benefit: "Sayyid al-Istighfar (Chief of Prayers for Forgiveness). Whoever says it with certainty in the morning/evening and dies that day enters Paradise.",
    source: "Sahih al-Bukhari 6306",
  },
  guidance: {
    arabic: "اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ",
    transliteration: "Allahumma inni astakhiruka bi'ilmika, wa astaqdiruka bi-qudratika, wa as'aluka min fadlikal-'azim",
    translation: "O Allah, I consult You through Your knowledge, and I seek strength through Your power, and I ask You for Your great bounty.",
    benefit: "Du'a al-Istikhara. Pray 2 rak'ahs then recite this whenever deciding on a marriage, job, travel, or any significant life matter.",
    source: "Sahih al-Bukhari 1166",
  },
  morning: {
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliteration: "Asbahna wa asbahal-mulku lillah, wal-hamdu lillah, la ilaha illallahu wahdahu la sharika lah",
    translation: "We have reached the morning and the dominion belongs to Allah; all praise is due to Allah. None has the right to be worshipped except Allah alone, without partner.",
    benefit: "Guarantees divine protection and gratitude at the start of your day.",
    source: "Sahih Muslim 2723",
  },
  sleeping: {
    arabic: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، إِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    transliteration: "Bismika Rabbi wada'tu janbi wa bika arfa'uh, in amsakta nafsi farhamha, wa in arsaltaha fahfazha bima tahfazu bihi 'ibadakas-salihin",
    translation: "In Your name, my Lord, I lay down my side and in Your name I raise it. If You hold my soul, have mercy on it; and if You send it back, protect it as You protect Your righteous servants.",
    benefit: "Shields your soul throughout sleep under Allah's loving guardianship.",
    source: "Sahih al-Bukhari 6320, Sahih Muslim 2714",
  },
  protection: {
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahilladhi la yadurru ma'as-mihi shay'un fil-ardi wa la fis-sama'i wa huwas-Sami'ul-'Alim",
    translation: "In the name of Allah, with whose name nothing on earth or in heaven can cause harm, and He is the All-Hearing, the All-Knowing.",
    benefit: "Recited 3 times in morning and evening — no sudden harm or poison can afflict the reciter.",
    source: "Abu Dawud 5088, At-Tirmidhi 3388 (Sahih)",
  },
};

// ── Instant Natural Intent Resolver ──────────────────────────────────────────

export function resolveIslamicIntent(query: string, ctx: IslamicBrainContext): JarvisBrainOutput {
  const q = query.trim().toLowerCase();
  const userName = ctx.userName ? ctx.userName : "";
  const greetingName = userName ? `, ${userName}` : "";

  // 1. GREETING & STATUS CHECK-IN
  if (/^(as-?salaamu?|salaam|peace be upon you|hello|hi mia|hey mia|hey|good morning|good evening)/i.test(q)) {
    const nextP = getNextPrayerInfo(ctx);
    const streak = ctx.streakDays ?? 0;
    const streakMsg = streak > 0 ? ` MashaAllah on your **${streak}-day streak**!` : "";

    return {
      text: `Wa Alaykum As-Salaam wa Rahmatullah wa Barakatuh${greetingName}! 🌙

I am **MIA**, your personal Islamic assistant. How may I serve your deen today?

${nextP ? `• **Next Prayer**: ${nextP.name} at ${nextP.time} (${nextP.countdown})\n` : ""}• **Spiritual Streak**: ${streak} active days${streakMsg}
• **Today**: ${ctx.weekday || 'Today'}, ${ctx.hijriDate ? `${ctx.hijriDate.day} ${ctx.hijriDate.month.en} ${ctx.hijriDate.year} AH` : 'Blessed day'}

What would you like to explore? You can ask me about **prayer times**, **Qur'an ayahs**, **duas for distress**, **fiqh rulings**, or tell me to log your salah.`,
      spokenSummary: `Wa Alaykum As-Salaam${greetingName}. I am MIA, your Islamic assistant. ${nextP ? `Next prayer is ${nextP.name} in ${nextP.countdown}.` : ''} How may I assist you today?`,
      suggestedFollowUps: [
        "What should I do right now?",
        "When is the next prayer?",
        "Suggest a dua for today",
        "Check my streak",
      ],
    };
  }

  // 2. LOGGING PRAYER / "I JUST PRAYED" / STREAK UPDATE
  const prayerLoggedMatch = q.match(/\b(i (just )?(prayed|completed|finished)|log (my )?prayer|mark|checked off)\s*(fajr|dhuhr|zuhr|asr|maghrib|isha)?/i);
  if (prayerLoggedMatch) {
    const prayerNameRaw = prayerLoggedMatch[4] || detectCurrentOrRecentPrayer(ctx);
    const pName = capitalize(prayerNameRaw || 'Salah');

    // Automatically record in localStorage
    try {
      const progRaw = localStorage.getItem("mia_user_progress");
      const prog = progRaw ? JSON.parse(progRaw) : { streak: 1, prayersCompleted: [] };
      if (!prog.prayersCompleted.includes(pName)) {
        prog.prayersCompleted.push(pName);
        if (prog.streak === 0) prog.streak = 1;
        prog.lastActiveDate = new Date().toISOString().split("T")[0];
        localStorage.setItem("mia_user_progress", JSON.stringify(prog));
        window.dispatchEvent(new Event("storage"));
      }
    } catch { /* ignore */ }

    return {
      text: `### 🕌 Taqabbal Allahu Minna wa Minkum! (تقبل الله منا ومنكم)

Alhamdulillah${greetingName}! I have recorded your **${pName} prayer** as completed for today.

> *"Verily, the prayer is prescribed for the believers at fixed times."* — Surah An-Nisa 4:103

**Today's Spiritual Progress:**
- **Prayers Completed**: ${(ctx.prayersCompletedToday?.length || 0) + 1} / 5
- **Consecutive Streak**: ${Math.max(1, ctx.streakDays || 1)} days

Would you like to recite the **Post-Prayer Adhkar** (Ayat al-Kursi, SubhanAllah 33x, Alhamdulillah 33x, Allahu Akbar 33x)?`,
      action: {
        type: 'log_prayer',
        payload: { prayer: pName },
        label: `Logged ${pName}`,
      },
      spokenSummary: `Alhamdulillah${greetingName}. I have logged your ${pName} prayer. May Allah accept it from you.`,
      suggestedFollowUps: [
        "Show post-prayer adhkar",
        "When is the next prayer?",
        "Open Duas Library",
      ],
    };
  }

  // 3. PRAYER TIMES / "WHEN IS [PRAYER]" / COUNTDOWN
  if (/\b(when is|time for|prayer time|salah time|fajr|dhuhr|zuhr|asr|maghrib|isha|sunrise|next prayer|adhan)\b/i.test(q)) {
    const pt = ctx.prayerTimes;
    const requestedPrayer = q.match(/\b(fajr|sunrise|dhuhr|zuhr|asr|maghrib|isha)\b/i)?.[1];

    if (pt) {
      if (requestedPrayer) {
        const key = requestedPrayer.toLowerCase() === 'zuhr' ? 'Dhuhr' : capitalize(requestedPrayer);
        const time = pt[key] || "Calculated";
        return {
          text: `### ⏱️ ${key} Prayer Time

${key} prayer today in **${ctx.location?.city || 'your location'}** is at **${time}**.

${key === 'Fajr' ? '• *Remember*: Fajr ends at Sunrise (' + (pt['Sunrise'] || 'N/A') + ').' : ''}
${key === 'Dhuhr' ? '• *Tip*: It is Sunnah to pray 4 rak\'ah before and 2 after Dhuhr.' : ''}
${key === 'Asr' ? '• *Notice*: The Middle Prayer (Salat al-Wusta) holds immense virtue.' : ''}
${key === 'Maghrib' ? '• *Iftar*: Fasting concludes at Maghrib adhan.' : ''}
${key === 'Isha' ? '• *Sunnah*: Follow Isha with the Witr prayer before sleeping.' : ''}

Would you like directions to the nearest mosque or to check the Qiblah?`,
          action: { type: 'navigate', payload: '/prayer', label: 'View All Prayer Times' },
          spokenSummary: `${key} prayer in ${ctx.location?.city || 'your area'} is at ${time}.`,
          suggestedFollowUps: ["Where is the nearest mosque?", "Show Qiblah direction", "When is next prayer?"],
        };
      }

      // Show full schedule
      const nextP = getNextPrayerInfo(ctx);
      return {
        text: `### 🕌 Prayer Times Schedule for ${ctx.location?.city || 'Your Area'}

| Prayer | Time | Status |
| :--- | :--- | :--- |
| **Fajr** | \`${pt.Fajr}\` | Dawn |
| **Sunrise** | \`${pt.Sunrise}\` | Shuruq |
| **Dhuhr** | \`${pt.Dhuhr}\` | Midday |
| **Asr** | \`${pt.Asr}\` | Afternoon |
| **Maghrib** | \`${pt.Maghrib}\` | Sunset |
| **Isha** | \`${pt.Isha}\` | Night |

${nextP ? `🔔 **Next Congregation**: **${nextP.name}** in **${nextP.countdown}** (${nextP.time})` : ''}

Would you like to find a nearby mosque to pray in congregation?`,
        action: { type: 'navigate', payload: '/prayer', label: 'Open Prayer Schedule' },
        spokenSummary: nextP ? `Next prayer is ${nextP.name} at ${nextP.time}, in ${nextP.countdown}.` : 'Here is your prayer schedule for today.',
        suggestedFollowUps: ["Find nearest mosque", "Where is the Qiblah?", "Dua for after prayer"],
      };
    }
  }

  // 4. DUAS FOR ANXIETY, STRESS, SICKNESS, SLEEP, MORNING
  if (/\b(anxiety|stress|sad|depress|worr|fear|overwhelm|hardship|panic)\b/i.test(q)) {
    const d = AUTHENTIC_DUAS.anxiety;
    return {
      text: `### 🤲 Prophetic Dua for Relief from Anxiety & Grief

Whenever our Beloved Prophet Muhammad ﷺ experienced distress or overwhelming anxiety, he sought refuge in Allah with these exact words:

<div class="p-4 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">${d.arabic}</p>
</div>

**Transliteration:**
*"${d.transliteration}"*

**English Translation:**
*"${d.translation}"*

**Virtue & Authentic Source:**
${d.benefit} *(Source: ${d.source})*

> *"Verily, in the remembrance of Allah do hearts find rest."* — Surah Ar-Ra'd 13:28

Take a slow breath. Allah is closer to you than your jugular vein. You are never alone.`,
      action: { type: 'navigate', payload: '/duas', label: 'Open Duas Library' },
      spokenSummary: `Here is the Prophet's authentic supplication for anxiety. Allahumma inni a'udhu bika min al-hammi wal-hazan. Verily in the remembrance of Allah do hearts find rest.`,
      suggestedFollowUps: ["Dua of Prophet Yunus", "Dua for forgiveness", "Open Tasbih to do Dhikr"],
    };
  }

  // 5. ZAKAT CALCULATION INQUIRY ("CALCULATE ZAKAT ON $10,000")
  const zakatMatch = q.match(/\b(zakat|zakah)\b.*?(\$|usd|£|eur|ngn|rs|inr|aed|sar)?\s*([0-9,]+(\.[0-9]+)?)/i);
  if (zakatMatch || /\b(calculate zakat|how much is zakat|zakat rate|nisab)\b/i.test(q)) {
    let amountStr = zakatMatch?.[3]?.replace(/,/g, '');
    let amount = amountStr ? parseFloat(amountStr) : null;

    if (amount && !isNaN(amount)) {
      const zakatPayable = amount * 0.025;
      return {
        text: `### 🪙 Zakat Calculation Breakdown

For an eligible wealth amount of **${formatCurrency(amount)}**:

- **Zakat Rate**: **2.5%** (1/40th of annual qualifying wealth)
- **Zakat Due**: **${formatCurrency(zakatPayable)}**

#### 📋 3 Conditions for Zakat:
1. **Nisab Threshold**: Wealth must exceed the value of **85g of pure Gold** (approx. \$6,500 – \$7,000 USD) or **595g of Silver**.
2. **Hawl (One Lunar Year)**: You must have owned this wealth for one full Hijri year above the Nisab.
3. **Surplus Wealth**: Must be free of immediate basic debts and living expenses.

> *"Take from their wealth a charity by which you purify them and cause them increase."* — Surah At-Tawbah 9:103`,
        action: { type: 'navigate', payload: '/zakat', label: 'Open Full Zakat Calculator' },
        spokenSummary: `Your Zakat on ${amount} is 2.5%, which equals ${zakatPayable}.`,
        suggestedFollowUps: ["What is the Nisab today?", "Who is eligible to receive Zakat?", "Open Zakat Calculator"],
      };
    }

    return {
      text: `### 🪙 How to Calculate Your Zakat

Zakat is the **Third Pillar of Islam**, mandatory on all qualifying wealth held for one lunar year (Hawl) above the threshold (Nisab).

1. **Calculate qualifying assets**: Cash, bank balances, gold, silver, investments, stock inventory, trade goods.
2. **Deduct immediate short-term debts** due right now.
3. **Compare with Nisab**: (85 grams of gold ≈ \$6,500 – \$7,000 USD).
4. **Multiply net assets by 2.5%** (\`Total × 0.025\`).

You can tell me an amount like *"Calculate Zakat on \$15,000"* or launch our full interactive calculator.`,
      action: { type: 'navigate', payload: '/zakat', label: 'Open Zakat Calculator' },
      suggestedFollowUps: ["Calculate Zakat on $10,000", "What items are exempt from Zakat?", "Zakat on gold"],
    };
  }

  // 6. FRIDAY / JUMU'AH GUIDANCE
  if (/\b(jumu'?ah|friday|friday prayer|kahf|salawat)\b/i.test(q)) {
    return {
      text: `### 🕌 The Blessed Sunnahs of Friday (Jumu'ah)

The Prophet Muhammad ﷺ said: *"The best day on which the sun has risen is Friday."* (Sahih Muslim)

#### Recommended Acts of Worship on Friday:
1. **Ghusl (Full ritual bath)** before going to the mosque.
2. **Wear clean clothes & apply perfume/Attar** (for men).
3. **Arrive early at the Masjid** before the Imam ascends the Minbar for the Khutbah.
4. **Recite Surah Al-Kahf**: Illuminates a divine light for you from this Friday to the next *(Al-Hakim, Sahih)*.
5. **Abundant Salawat upon the Prophet ﷺ**:
   <div class="p-3 my-2 rounded-xl bg-emerald-500/10 text-right font-arabic text-lg" dir="rtl">اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ</div>
6. **Seek the Hour of Acceptance (Sa'at al-Ijabah)**: The final hour between Asr and Maghrib where no dua is rejected.`,
      action: { type: 'navigate', payload: '/quran?surah=18', label: 'Read Surah Al-Kahf' },
      spokenSummary: `Friday is the most blessed day of the week. Remember to perform Ghusl, recite Surah Al-Kahf, and send abundant blessings upon the Prophet Muhammad.`,
      suggestedFollowUps: ["Open Surah Al-Kahf", "Find nearest mosque for Jumu'ah", "Dua for Friday"],
    };
  }

  // 7. QUR'AN SURAH GUIDANCE ("READ SURAH AL-MULK", "YASIN", "BAQARAH")
  const surahMatch = q.match(/\b(surah|read|play|recite)\s+(al-?)?([a-z\-]+)/i);
  if (surahMatch || /\b(qur'?an|ayah|surah|mushaf|tajweed)\b/i.test(q)) {
    return {
      text: `### 📖 The Noble Qur'an (كتاب الله)

> *"Indeed, this Qur'an guides to that which is most suitable and gives good tidings to the believers who do righteous deeds that they will have a great reward."* — Surah Al-Isra 17:9

#### Recommended Daily Surahs:
- **Surah Al-Mulk (67)**: Intercedes for its reciter until they are forgiven and protects from the punishment of the grave.
- **Surah Al-Kahf (18)**: Protection from the trials of Dajjal and light for Friday.
- **Surah Yasin (36)**: Heart of the Qur'an.
- **Ayat al-Kursi (2:255)**: The greatest single verse in the Qur'an; protects against Shaytan until morning when recited before sleep.

Would you like to open our **Color-Coded Tajweed Mushaf** with full audio recitation?`,
      action: { type: 'navigate', payload: '/quran?view=mushaf', label: 'Open Tajweed Mushaf' },
      spokenSummary: `The Quran is the healing and guidance for all believers. Would you like me to open the Tajweed Mushaf for you?`,
      suggestedFollowUps: ["Open Surah Al-Mulk", "Open Surah Al-Kahf", "Read Ayat al-Kursi"],
    };
  }

  // 8. FASTING & RAMADAN
  if (/\b(fast(ing)?|sawm|suhoor|iftar|ramadan|white days|monday|thursday)\b/i.test(q)) {
    return {
      text: `### 🌙 Fasting (Sawm) — Fourth Pillar of Islam

Fasting is a sacred shield of piety (Taqwa) ordained by Allah:

> *"O you who have believed, decreed upon you is fasting as it was decreed upon those before you that you may become righteous."* — Surah Al-Baqarah 2:183

#### Sunnah Voluntary Fasting Days:
- **Mondays & Thursdays**: Days when deeds are presented to Allah.
- **Ayyam al-Beed (The 3 White Days)**: 13th, 14th, and 15th of every Hijri month.
- **Day of Arafah (9th Dhul Hijjah)**: Expiates sins of the preceding year and coming year for non-pilgrims.
- **Day of Ashura (10th Muharram)**: Expiates sins of the past year.

#### What Invalidates the Fast:
Eating, drinking, or marital relations from true dawn (Fajr) to sunset (Maghrib) with conscious intention. (Involuntary eating does not break the fast — complete it as Allah has fed you).`,
      action: { type: 'navigate', payload: '/fasting', label: 'Open Fasting Tracker' },
      spokenSummary: `Fasting teaches piety and self-restraint. The Sunnah days for voluntary fasting are Mondays, Thursdays, and the three White Days of each lunar month.`,
      suggestedFollowUps: ["When is Suhoor and Iftar today?", "Rules of fasting", "Dua for breaking the fast"],
    };
  }

  // 9. HAJJ & UMRAH
  if (/\b(hajj|umrah|ihram|tawaf|sa'i|makkah|kaaba)\b/i.test(q)) {
    return {
      text: `### 🕋 Hajj & Umrah Pilgrimage Guide

Hajj is the **Fifth Pillar of Islam**, obligatory once in a lifetime for every Muslim who is physically and financially able.

#### 4 Core Pillars of Umrah:
1. **Ihram**: Entering the sacred state from the Miqat with Niyyah (Talbiyah: *Labbayk Allahumma Labbayk*).
2. **Tawaf**: Circling the Ka'bah 7 times counter-clockwise, beginning and ending at the Black Stone (Hajar al-Aswad).
3. **Sa'i**: Walking 7 circuits between the hills of Safa and Marwah.
4. **Tahallul**: Shaving (Halq) or trimming (Taqseer) the hair to exit Ihram.

Explore our interactive 3D visual guide with full checkpoint checklists and authentic supplications.`,
      action: { type: 'navigate', payload: '/hajj', label: 'Open Hajj & Umrah Guide' },
      suggestedFollowUps: ["Talbiyah prayer", "What violates Ihram?", "Open Hajj Guide"],
    };
  }

  // 10. DEFAULT / DEEP COMPANION FALLBACK
  return {
    text: `### 🌿 Bismillah ar-Rahman ar-Rahim

Thank you for your question${greetingName}.

Islam is a complete way of life centered on **sincere devotion to Allah (Ikhlas)**, **following the Sunnah of the Prophet Muhammad ﷺ**, and **serving humanity with noble character (Husn al-Khuluq)**.

> *"And whoever fears Allah — He will make for him a way out, and will provide for him from where he does not expect."* — Surah At-Talaq 65:2-3

#### How can I assist you right now?
- **Prayer & Qiblah**: Get exact times, Adhan, and mosque navigation.
- **Qur'an & Tajweed**: Read or listen to all 114 Surahs with translation.
- **Duas & Adhkar**: Find authentic supplications for any emotional or spiritual state.
- **Islamic Rulings**: Discover fiqh guidance across the major schools of thought.`,
    spokenSummary: `I am here to support your daily Islamic journey. You can ask me about prayer times, Quran verses, authentic duas, or app navigation.`,
    suggestedFollowUps: [
      "When is the next prayer?",
      "Dua for peace of mind",
      "Read Surah Al-Mulk",
      "Check my streak",
    ],
  };
}

// ── Helper Utilities ─────────────────────────────────────────────────────────

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function getNextPrayerInfo(ctx: IslamicBrainContext): { name: string; time: string; countdown: string } | null {
  if (!ctx.prayerTimes) return null;
  const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  for (const p of prayers) {
    const rawTime = ctx.prayerTimes[p];
    if (!rawTime) continue;
    const clean = rawTime.split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    const pMinutes = h * 60 + m;

    if (pMinutes > currentMinutes) {
      const diff = pMinutes - currentMinutes;
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      const countdown = hours > 0 ? `${hours}h ${mins}m` : `${mins} mins`;
      return { name: p, time: rawTime, countdown };
    }
  }

  // If past Isha, next is tomorrow's Fajr
  return { name: 'Fajr', time: ctx.prayerTimes['Fajr'] || 'Dawn', countdown: 'tomorrow morning' };
}

function detectCurrentOrRecentPrayer(ctx: IslamicBrainContext): string {
  const now = new Date();
  const h = now.getHours();
  if (h >= 4 && h < 7) return 'Fajr';
  if (h >= 12 && h < 15) return 'Dhuhr';
  if (h >= 15 && h < 18) return 'Asr';
  if (h >= 18 && h < 20) return 'Maghrib';
  return 'Isha';
}
