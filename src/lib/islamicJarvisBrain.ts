// ═══════════════════════════════════════════════════════════════════════════════
// MIA ISLAMIC JARVIS INTELLIGENCE ENGINE (Autonomous Islamic Companion Brain)
// ═══════════════════════════════════════════════════════════════════════════════
// Complete, offline-capable, authentic Islamic knowledge system grounded in:
// - The Holy Qur'an & Sahih Hadiths (Bukhari, Muslim, Tirmidhi, Abu Dawud, etc.)
// - The 4 Major Sunni Schools of Fiqh (Hanafi, Maliki, Shafi'i, Hanbali)
// - Dynamic app integration (Prayer times, Streak, Audio, Duas, Compass, Tasbih)
// ═══════════════════════════════════════════════════════════════════════════════

import { RABBANA_DUAS } from '@/data/rabbanaDuas';
import { ALL_DUAS_DATA } from '@/data/duasData';
import { searchEncyclopedia, ISLAMIC_ENCYCLOPEDIA } from '@/data/islamicEncyclopedia';

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

  // 4. 40 RABBANA DUAS & COMPREHENSIVE DUA SEARCH
  const rabbanaNumMatch = q.match(/\b(rabbana|dua)\s*#?\s*([0-9]{1,2})\b/i);
  if (rabbanaNumMatch) {
    const num = parseInt(rabbanaNumMatch[2], 10);
    if (num >= 1 && num <= 40) {
      const rd = RABBANA_DUAS[num - 1];
      if (rd) {
        return {
          text: `### 🤲 40 Rabbana Du'a #${num}
**${rd.context || rd.source}**

<div class="p-4 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">${rd.arabic}</p>
</div>

**Transliteration:**
*"${rd.transliteration}"*

**English Translation:**
*"${rd.translation}"*

**Spiritual Virtues & Benefit:**
${rd.benefit}

*(Source: ${rd.source})*`,
          action: { type: 'navigate', payload: '/duas?cat=rabbana', label: 'View All 40 Rabbana Duas' },
          spokenSummary: `Here is Rabbana dua number ${num} from ${rd.source}. ${rd.translation}`,
          suggestedFollowUps: [
            num < 40 ? `Show Rabbana #${num + 1}` : "Show Rabbana #1",
            "Browse all 40 Rabbana Duas",
            "Dua for forgiveness",
          ],
        };
      }
    }
  }

  if (/\b(40 rabbana|rabbana duas?|rabbana)\b/i.test(q)) {
    const r1 = RABBANA_DUAS[0];
    const r3 = RABBANA_DUAS[2];
    return {
      text: `### 📖 The 40 Rabbana Duas from the Holy Qur'an
These 40 sacred supplications each start with *"Rabbana"* (Our Lord) and were taught directly by Allah in the Qur'an or voiced by the Prophets.

#### Featured Supplications:
1. **Rabbana #1 (Deed Acceptance)** — *${r1.transliteration}*
   > *"${r1.translation}"* — ${r1.source}
   *${r1.benefit}*

2. **Rabbana #3 (World & Hereafter Good)** — *${r3.transliteration}*
   > *"${r3.translation}"* — ${r3.source}
   *${r3.benefit}*

You can ask me for any specific dua like *"Show Rabbana #5"*, *"Dua for parents"*, or explore the entire collection in the Duas section!`,
      action: { type: 'navigate', payload: '/duas?cat=rabbana', label: 'Open 40 Rabbana Library' },
      spokenSummary: `The Holy Quran contains 40 sacred Rabbana duas with immense spiritual virtues. Would you like me to open the 40 Rabbana library?`,
      suggestedFollowUps: ["Show Rabbana #1", "Show Rabbana #3", "Dua for anxiety", "Dua for parents"],
    };
  }

  // 4B. TOPIC DUA LOOKUPS (Parents, Children, Exams, Sickness, Forgiveness, Anxiety)
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

  // Parents dua
  if (/\b(parents?|mother|father|mom|dad)\b/i.test(q)) {
    return {
      text: `### 🤲 Prophetic & Quranic Du'a for Parents

Allah commands us in the Holy Qur'an to pray for our parents with utmost humility and love:

<div class="p-4 my-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا</p>
</div>

**Transliteration:**
*"Rabbi-rhamhuma kama rabbayani sagheera"*

**Translation:**
*"My Lord, have mercy upon them both as they brought me up when I was small."* — Surah Al-Isra 17:24

**Virtue & Benefit:**
Reciting this fulfills filial gratitude (Birr al-Walidayn), elevates your parents' status in Jannah, and brings perpetual barakah into your own life and household.`,
      action: { type: 'navigate', payload: '/duas?cat=family-marriage', label: 'Open Family Duas' },
      spokenSummary: `Here is the Quranic prayer for parents: Rabbi-rhamhuma kama rabbayani sagheera. My Lord, have mercy upon them as they brought me up when I was small.`,
      suggestedFollowUps: ["Dua for children & spouse", "Dua for forgiveness", "Show Rabbana #2"],
    };
  }

  // Ruqyah / Sickness
  if (/\b(sick|ill(ness)?|pain|headache|fever|disease|cure|shifa|heal(ing)?)\b/i.test(q)) {
    return {
      text: `### 🌿 Dua for Shifa (Healing & Cure from Sickness)

When visiting the sick or experiencing pain, the Prophet ﷺ would place his hand over the area of pain and say:

<div class="p-4 my-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">اللَّهُمَّ رَبَّ النَّاسِ أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا</p>
</div>

**Transliteration:**
*"Allahumma Rabban-nas, adh-hibil-ba's, ishfi Antash-Shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama"*

**Translation:**
*"O Allah, Lord of mankind, remove the disease and grant cure. You are the Healer, there is no healing except Your healing, a cure that leaves behind no illness."*

*(Source: Sahih al-Bukhari 5743, Sahih Muslim 2191)*

**Recommended Practice:**
Place your right hand where it hurts, recite **Bismillah 3 times**, then say 7 times: *"A'udhu bi-'izzatillahi wa qudratihi min sharri ma ajidu wa uhadhir"* *(Sahih Muslim)*.`,
      action: { type: 'navigate', payload: '/duas?cat=ruquiya', label: 'Open Healing & Ruqyah Duas' },
      spokenSummary: `Here is the authentic Prophetic prayer for healing and cure. Allahumma Rabban-nas adh-hibil-ba's, ishfi Antash-Shafi.`,
      suggestedFollowUps: ["Read Ayat al-Kursi", "Dua for anxiety", "Open Duas Library"],
    };
  }

  // Exams / Studies / Knowledge
  if (/\b(exam|study|studying|test|knowledge|memory|forget|interview)\b/i.test(q)) {
    return {
      text: `### 🎓 Du'a for Success in Studies, Exams & Knowledge

1. **Supplication for Ease & Eloquence (Du'a of Musa AS):**
<div class="p-4 my-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي</p>
</div>

**Transliteration:**
*"Rabbish-rah li sadri, wa yassir li amri, wahlul 'uqdatan min lisani, yafqahu qawli"*

**Translation:**
*"My Lord, expand for me my chest, and ease for me my task, and untie the knot from my tongue that they may understand my speech."* — Surah Taha 20:25-28

2. **Dua for Increase in Knowledge:**
> *"Rabbi zidni 'ilma"* (رَّبِّ زِدْنِي عِلْمًا) — *"My Lord, increase me in knowledge."* (Surah Taha 20:114)

**Prophetic Habit:**
Before writing your exam, say: *"Allahumma la sahla illa ma ja'altahu sahla, wa Anta taj'alul-hazna idha shi'ta sahla"* (O Allah, nothing is easy except what You make easy, and You make hardship easy if You will).`,
      action: { type: 'navigate', payload: '/duas?cat=knowledge-exams', label: 'Open Studies & Exams Duas' },
      spokenSummary: `Here is the famous dua of Prophet Musa for exams and memory: Rabbish-rah li sadri wa yassir li amri.`,
      suggestedFollowUps: ["Dua for peace of mind", "Dua of Prophet Yunus", "Open Duas Library"],
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

  // 10. DIGITAL TASBIH & DHIKR
  if (/\b(tasbih|tasbeeh|dhikr|subhanallah|alhamdulillah|allahu akbar|astaghfirullah|counter)\b/i.test(q)) {
    return {
      text: `### 📿 Digital Tasbih & Prophetic Adhkar

The Prophet Muhammad ﷺ said: *"Two words are light on the tongue, heavy in the Balance, and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-'Azim."* (Sahih al-Bukhari 6406)

#### Core Daily Dhikr Counts:
- **SubhanAllah (33x)**: Glory be to Allah
- **Alhamdulillah (33x)**: All praise is due to Allah
- **Allahu Akbar (33x)**: Allah is the Greatest
- **Seal with 100th**: *La ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa huwa 'ala kulli shay'in qadir* (All sins forgiven even if like the foam of the sea).

Launch our tactile Digital Tasbih with haptic feedback, sound chimes, and lap tracking!`,
      action: { type: 'navigate', payload: '/tasbih', label: 'Open Digital Tasbih' },
      spokenSummary: `Remembering Allah brings tranquility to hearts. Would you like me to open the Digital Tasbih counter for your dhikr session?`,
      suggestedFollowUps: ["Open Digital Tasbih", "Chief prayer for forgiveness", "Dua for after prayer"],
    };
  }

  // 11. PODCASTS, LECTURES & 24/7 ISLAMIC RADIO
  if (/\b(podcast|radio|listen|lecture|nasheed|audio|quran audio|makkah live|madinah live)\b/i.test(q)) {
    return {
      text: `### 🎙️ Podcasts & 24/7 Islamic Radio Streams

Immerse your day in sacred sounds and knowledge with our comprehensive audio hub:

#### 📻 Live Continuous Radio:
- **Holy Qur'an Radio (Cairo)** — Continuous 24/7 legendary recitations.
- **Makkah & Madinah Live Audio** — Live Taraweeh and daily prayers from the two holy Harams.
- **Islamic Knowledge Radio** — Uplifting lectures in English and Arabic.

#### 🎙️ Featured Islamic Podcasts:
- Comprehensive iTunes directory of top international Muslim scholars and Quran audio channels with playback speed control and lock-screen background playback.`,
      action: { type: 'navigate', payload: '/podcasts', label: 'Open Podcasts & Radio' },
      spokenSummary: `Our audio player features live 24/7 Quran radio from Cairo, Makkah, and top Islamic podcasts. Would you like me to open the audio hub?`,
      suggestedFollowUps: ["Open Podcasts & Radio", "Play Surah Al-Baqarah", "Read Quran"],
    };
  }

  // 12. MOSQUES NEAR ME & QIBLAH DIRECTION
  if (/\b(mosque|masjid|qibla|qiblah|kaaba direction|compass|where to pray)\b/i.test(q)) {
    return {
      text: `### 🧭 Mosques Near You & Qiblah Compass

Need to find a place for congregational prayer or align yourself with the Ka'bah?

- **Real-Time Qiblah Compass**: Live gyroscope sensor orientation with gold pointer pointing straight to Makkah.
- **Mosques Near Me**: Working Google Maps integration showing local masjids, driving and walking distances in minutes, and Jumu'ah availability.

${ctx.location ? `Currently tracking location: **${ctx.location.city}, ${ctx.location.country}**` : ''}`,
      action: { type: 'navigate', payload: '/qiblah', label: 'Open Qiblah & Mosques Map' },
      spokenSummary: `You can view live mosques near your location on Google Maps and find the precise Qiblah direction in the Qiblah section.`,
      suggestedFollowUps: ["Open Qiblah & Mosques", "When is next prayer?", "Rules of Jumu'ah"],
    };
  }

  // 14. EMBRACING ISLAM, NEW MUSLIM & SHAHADAH (Wanna-be Muslims & Reverts)
  if (/\b(convert|revert|become muslim|embrace islam|wanna be muslim|how to enter islam|take shahada|shahadah|new to islam)\b/i.test(q)) {
    return {
      text: `### 🕊️ Welcome Home to Islam: The Beginning of Your Eternal Journey to Jannah

If your heart is inclining toward Islam, know that **Allah chose you and called your heart back to Him**. You do not need to be perfect; you only need sincere desire to know your Creator.

The Prophet Muhammad ﷺ said: *"Islam wipes out whatever sins came before it."* (Sahih Muslim) — The moment you embrace Islam, your slate is washed completely clean, as pure as the day you were born!

#### The Testimony of Faith (Ash-Shahadah):
To enter Islam, sincerely declare with conviction:

<div class="p-4 my-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
  <p class="font-arabic text-2xl text-foreground leading-loose" dir="rtl">أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ ٱللَّٰهِ</p>
</div>

**Transliteration:**
*"Ash-hadu alla ilaha illallah, wa ash-hadu anna Muhammadan Rasulullah"*

**English Meaning:**
*"I bear witness that there is no god worthy of worship except Allah, and I bear witness that Muhammad is the Messenger of Allah."*

#### First Steps for You as a New Believer:
1. **Take it easy (At-Taysir)**: Learn prayer step-by-step. Allah looks at your heart and effort, not perfection.
2. **You are never alone**: Over 1.9 billion brothers and sisters around the world celebrate your return.
3. **MIA is here with you**: Ask me any question without fear or judgment.

Would you like me to walk you through how to pray Salah, or learn the foundational beliefs?`,
      action: { type: 'navigate', payload: '/prayer', label: 'Learn Prayer Step-by-Step' },
      spokenSummary: `Welcome with open arms. Islam wipes away all past mistakes and begins your journey to Jannah. You can take the Shahadah anytime with sincerity in your heart.`,
      suggestedFollowUps: [
        "How do I pray as a beginner?",
        "What are the 5 Pillars of Islam?",
        "Dua for guidance & peace",
        "Open Quran",
      ],
    };
  }

  // 15. JANNAH & ETERNAL BLISS (PUSHING THE SOUL TO PARADISE)
  if (/\b(jannah|paradise|heaven|eternal life|gardens of bliss|firdaus|push me to jannah|how to enter jannah|day of judgment)\b/i.test(q)) {
    return {
      text: `### 🌟 The Beauty of Jannah (جَنَّةُ الْفِرْدَوْس) — The Ultimate Goal

Allah describes the reward He has prepared for those who persevere with patience, faith, and good deeds:

> *"No soul knows what delight of the eyes has been reserved for them as a reward for what they used to do."* — Surah As-Sajdah 32:17

The Prophet Muhammad ﷺ said: *"In Jannah there is what no eye has ever seen, no ear has ever heard, and what has never crossed the human heart."* (Sahih al-Bukhari 3244)

#### What Jannah Truly Means:
- **No pain, no fatigue, no sorrow**: No depression, no anxiety, no aging, no illness.
- **Rivers of milk, honey, and pure water**: Palaces of pearls and gardens bathed in divine peace.
- **Reunited with loved ones**: With the Prophets, the truthful, and righteous family members.
- **The Greatest Prize of All**: Glimpsing the Face of Allah, the Most Beautiful, the Most Merciful!

#### 🚀 4 Daily Deeds Guaranteed to Secure Your High Place in Jannah:
1. **Protect your 5 Daily Prayers on time**: The first thing examined on the Day of Judgment.
2. **Recite Ayat al-Kursi after every obligatory prayer**: The Prophet ﷺ said nothing stands between you and Jannah except death!
3. **Noble Character & Kindness**: The heaviest thing on the Scale of good deeds.
4. **Make this Dua daily**: *"Allahumma inni as'alukal-Jannah, wa a'udhu bika minan-Nar"* (O Allah, I ask You for Paradise and seek refuge from the Fire).`,
      action: { type: 'navigate', payload: '/duas?cat=forgiveness', label: 'Dua for Jannah' },
      spokenSummary: `Jannah is the eternal home of peace where no eye has seen and no mind has conceived. Guard your prayers and ask Allah for Jannat al-Firdaus daily.`,
      suggestedFollowUps: [
        "Dua for Jannat al-Firdaus",
        "How to avoid Hellfire",
        "Check my daily prayer progress",
        "Read Ayat al-Kursi",
      ],
    };
  }

  // 16. GUILT, SINS, OVERCOMING PAST MISTAKES & TAWBAH (NEVER LOSE HOPE)
  if (/\b(guilt|guilty|i sinned|bad muslim|too late for me|will allah forgive|ashamed|forgive me|forgive my sins|lost my way|relapse)\b/i.test(q)) {
    return {
      text: `### 💜 Never Despair of Allah's Mercy — He Awaits Your Return

Listen closely to what Allah, the Lord of all creation, says directly to you right now:

> *"Say, 'O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful.'"* — Surah Az-Zumar 39:53

The Prophet Muhammad ﷺ said in a Sacred Hadith (Hadith Qudsi):
> *"Allah said: 'O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done, and I shall not mind. O son of Adam, were your sins to reach the clouds of the sky and were you then to ask forgiveness of Me, I would forgive you!'"* (Sunan at-Tirmidhi 3540)

#### 3 Simple Conditions of Sincere Repentance (Tawbah):
1. **Stop the sin immediately**.
2. **Feel sincere regret in your heart** (the regret itself is repentance).
3. **Resolve never to return to it**. (And if you stumble again, repent again — Allah never grows weary of forgiving!).

<div class="p-4 my-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-right">
  <p class="font-arabic text-xl text-foreground" dir="rtl">رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ</p>
</div>
*"Rabbana zalamna anfusana wa il-lam taghfir lana wa tarhamna lana-kunanna minal-khasirin"*

Wipe away your tears. Take a fresh wudu. Pray two rak'ahs of Tawbah. You are loved by the Most Merciful.`,
      action: { type: 'navigate', payload: '/duas?cat=forgiveness', label: 'Open Tawbah & Forgiveness Duas' },
      spokenSummary: `Never lose hope in Allah's mercy. Even if your sins reached the clouds of the sky, Allah forgives all who turn back to Him with a sincere heart.`,
      suggestedFollowUps: [
        "Chief prayer for forgiveness",
        "Dua of Prophet Yunus",
        "How to pray Salat al-Tawbah",
        "Show Rabbana #23",
      ],
    };
  }

  // 17. FEELING LONELY, ISOLATED, OR LIVING IN A NON-MUSLIM COUNTRY
  if (/\b(lonely|alone|isolated|no muslim friends|living in the west|hard to practice|stranger|ghuraba)\b/i.test(q)) {
    return {
      text: `### 🌍 To the Believer Feeling Alone in the World: Glad Tidings of Al-Ghuraba

If you feel like a stranger in your environment, school, or workplace, take comfort in the words of your Beloved Prophet ﷺ:

> *"Islam began as something strange, and it will return to being strange as it began, so glad tidings to the strangers (Tooba lil-Ghuraba)!"* — Sahih Muslim 145

#### Remember:
1. **You are connected to an Ummah of millions**: Right now, in every timezone, someone is prostrating and saying *"Rabbana"* just like you.
2. **Allah is your Companion (Al-Qarib)**: When you are in sujood, you are closer to the Creator of the galaxies than anything else in existence.
3. **Every struggle is counted**: Practicing Islam when it is difficult multiplies your reward manifold. The Prophet ﷺ mentioned a time when holding onto your deen is like holding onto hot burning coals — and the reward for doing so is extraordinary!

Keep going, my beloved brother/sister. Your perseverance is beautiful in the sight of Allah.`,
      action: { type: 'navigate', payload: '/podcasts', label: 'Listen to Uplifting Islamic Lectures' },
      spokenSummary: `Glad tidings to the strangers. You are never truly alone when Allah is with you, and every bit of patient perseverance is raising your ranks in Jannah.`,
      suggestedFollowUps: [
        "Dua for steadfastness (Thabat)",
        "Find nearest mosque & community",
        "Listen to uplifting podcasts",
        "Talk to MIA Heart-to-Heart",
      ],
    };
  }

  // 18. COMPREHENSIVE ISLAMIC ENCYCLOPEDIA QUERY RESOLVER
  const encyclopediaHits = searchEncyclopedia(query);
  if (encyclopediaHits.length > 0) {
    const entry = encyclopediaHits[0];
    const stepsMarkdown = entry.practicalSteps && entry.practicalSteps.length > 0
      ? `\n\n#### 💡 Practical Sunnah Action Steps:\n${entry.practicalSteps.map(s => `- ${s}`).join('\n')}`
      : '';
    const refsMarkdown = entry.references && entry.references.length > 0
      ? `\n\n*(Authentic Sources: ${entry.references.join(', ')})*`
      : '';

    return {
      text: `### 📚 ${entry.title}
${entry.arabic ? `<div class="p-3 my-2 rounded-xl bg-amber-500/10 text-right font-arabic text-xl" dir="rtl">${entry.arabic}</div>\n` : ''}${entry.transliteration ? `*${entry.transliteration}*\n\n` : ''}**Summary:**
${entry.summary}

#### In-Depth Knowledge:
${entry.details}${stepsMarkdown}${refsMarkdown}`,
      spokenSummary: `${entry.title}. ${entry.summary}`,
      suggestedFollowUps: [
        "Tell me more about this",
        "Show related Duas",
        "How do I apply this today?",
        "Ask another Islamic question"
      ],
    };
  }
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
