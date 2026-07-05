// MIA proactive nudge engine.
// Reads cached prayer times + Hijri date + progress from localStorage and
// returns the single most relevant contextual message right now, if any.

export type ProactiveActionKey = "prayer" | "quran" | "dua" | "qiblah" | "fasting";

export type ProactiveMessage = {
  id: string;              // stable per-day id so we don't re-notify
  kind:
    | "greeting"
    | "prayer-now"
    | "post-prayer"
    | "white-days"
    | "jumuah"
    | "ramadan"
    | "wellbeing"
    | "night-prayer";
  title: string;
  body: string;            // markdown body used as an assistant message
  actions?: ProactiveActionKey[];
};

type PrayerCache = {
  prayerTimes?: Record<string, string>;
  hijriDate?: { day?: number; month?: number; monthName?: string };
  location?: { city?: string; country?: string };
};

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
type PrayerName = (typeof PRAYER_ORDER)[number];

function readPrayerCache(): PrayerCache | null {
  try {
    const raw = localStorage.getItem("prayer_times_cache_v1");
    return raw ? (JSON.parse(raw) as PrayerCache) : null;
  } catch {
    return null;
  }
}

function readHijriTomorrow(): { day: number; monthName: string } | null {
  try {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
    });
    const parts = fmt.formatToParts(t);
    const day = Number(parts.find((p) => p.type === "day")?.value ?? 0);
    const monthName = parts.find((p) => p.type === "month")?.value ?? "";
    return day ? { day, monthName } : null;
  } catch {
    return null;
  }
}

function parseHHMM(s?: string): number | null {
  if (!s) return null;
  const m = s.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function getPrayerNudge(cache: PrayerCache | null): ProactiveMessage | null {
  const times = cache?.prayerTimes;
  if (!times) return null;
  const now = nowMinutes();

  let currentPrayer: PrayerName | null = null;
  let nextPrayer: PrayerName | null = null;
  let currentAt = -Infinity;
  let nextAt = Infinity;

  for (const name of PRAYER_ORDER) {
    const t = parseHHMM(times[name]);
    if (t == null) continue;
    if (t <= now && t > currentAt) {
      currentAt = t;
      currentPrayer = name;
    }
    if (t > now && t < nextAt) {
      nextAt = t;
      nextPrayer = name;
    }
  }

  // Post-prayer window: within 25 minutes after a prayer time — check-in.
  if (currentPrayer && now - currentAt <= 25) {
    return {
      id: `${todayKey()}-post-${currentPrayer}`,
      kind: "post-prayer",
      title: `Have you prayed ${capitalize(currentPrayer)}?`,
      body: `The time for **${capitalize(currentPrayer)}** just entered. Have you prayed yet?\n\nAfter your fard, don't rush — sit for a moment of dhikr:\n\n- **SubhanAllah** ×33\n- **Alhamdulillah** ×33\n- **Allahu Akbar** ×34\n- **Ayat al-Kursi** — protects until the next prayer.\n\nSay: *"Astaghfirullah"* three times.`,
      actions: ["dua", "prayer"],
    };
  }

  // Upcoming prayer within 20 min — nudge to prepare.
  if (nextPrayer && nextAt - now <= 20 && nextAt - now >= 0) {
    const mins = nextAt - now;
    return {
      id: `${todayKey()}-soon-${nextPrayer}`,
      kind: "prayer-now",
      title: `${capitalize(nextPrayer)} in ~${mins} min`,
      body: `**${capitalize(nextPrayer)}** is in about **${mins} minutes**. Make wudu, face the Qiblah, and be ready.\n\n> "Verily, prayer has been decreed upon the believers at specified times." — Qur'an 4:103`,
      actions: ["prayer", "qiblah"],
    };
  }

  return null;
}

function getFridayNudge(): ProactiveMessage | null {
  const d = new Date();
  if (d.getDay() !== 5) return null; // Friday
  return {
    id: `${todayKey()}-jumuah`,
    kind: "jumuah",
    title: "Jumu'ah Mubarak",
    body: `**Jumu'ah Mubarak** 🕌\n\nDon't forget to recite **Surat al-Kahf** today.\n\n> "Whoever recites Surat al-Kahf on Friday, a light will shine for him between the two Fridays." — Al-Hakim, sahih.\n\nAlso: send abundant **salawat** on the Prophet ﷺ — it is presented to him today.`,
    actions: ["quran", "dua"],
  };
}

function getWhiteDaysNudge(): ProactiveMessage | null {
  const tomorrow = readHijriTomorrow();
  if (!tomorrow) return null;
  if (![13, 14, 15].includes(tomorrow.day)) return null;
  return {
    id: `${todayKey()}-whiteday-${tomorrow.day}`,
    kind: "white-days",
    title: "White Days fast tomorrow",
    body: `Tomorrow is **${tomorrow.day} ${tomorrow.monthName}** — one of the **Ayyām al-Bīḍ (White Days)**.\n\nThe Prophet ﷺ said: *"Fasting three days of every month is like fasting for a lifetime."* — Bukhari & Muslim.\n\n**Benefits:**\n- Reward of fasting the whole month.\n- Purifies the body and heart.\n- Follows the Sunnah of the Prophet ﷺ.\n\nMake the intention tonight and prepare for **suhoor** before Fajr.`,
    actions: ["fasting"],
  };
}

function getRamadanNudge(cache: PrayerCache | null): ProactiveMessage | null {
  const monthName = cache?.hijriDate?.monthName?.toLowerCase() ?? "";
  if (!monthName.includes("ramad")) return null;
  const day = cache?.hijriDate?.day ?? 0;
  if (day >= 21 && day % 2 === 1) {
    return {
      id: `${todayKey()}-laylatulqadr-${day}`,
      kind: "ramadan",
      title: "Laylat al-Qadr window",
      body: `Tonight (**${day} Ramadan**) is one of the odd nights in the last ten — a possible **Laylat al-Qadr** 🌙\n\n> "The Night of Decree is better than a thousand months." — Qur'an 97:3\n\nRecite often:\n**"Allahumma innaka 'Afuwwun tuhibbul 'afwa fa'fu 'anni."**\n(O Allah, You are Pardoning and love pardon, so pardon me.)`,
      actions: ["dua", "quran"],
    };
  }
  return {
    id: `${todayKey()}-ramadan`,
    kind: "ramadan",
    title: "Ramadan reminder",
    body: `It's **Ramadan** 🌙 — make every hour count. Aim for at least **one juz** of Qur'an today and keep your tongue moist with dhikr while fasting.`,
    actions: ["quran", "fasting"],
  };
}

function getNightNudge(): ProactiveMessage | null {
  const h = new Date().getHours();
  if (h < 2 || h > 4) return null;
  return {
    id: `${todayKey()}-tahajjud`,
    kind: "night-prayer",
    title: "The last third of the night",
    body: `We're in the **last third of the night** — Allah descends to the lowest heaven and says: *"Who is calling upon Me, that I may answer him?"* (Bukhari)\n\nEven 2 rak'ah of **Tahajjud** with a sincere du'a can change everything.`,
    actions: ["prayer", "dua"],
  };
}

function getWellbeingNudge(): ProactiveMessage | null {
  const h = new Date().getHours();
  // Once/day check-in mid-day; id per day makes it "seen" after acknowledged.
  if (h < 14 || h > 17) return null;
  return {
    id: `${todayKey()}-wellbeing`,
    kind: "wellbeing",
    title: "How is your heart today?",
    body: `Just checking in — **how is your heart today?** 💜\n\n> "Verily, in the remembrance of Allah do hearts find rest." — Qur'an 13:28\n\nIf you're feeling low, try this:\n1. Take a slow breath and say **"Hasbunallahu wa ni'mal wakeel."**\n2. Make wudu — it lifts anxiety.\n3. Talk to Allah in your own words. He is closer than your jugular vein.\n\nIf you want, tell me what's on your mind and I'll share what Islam teaches about it.`,
    actions: ["dua"],
  };
}

/**
 * Return the highest-priority pending proactive message right now, or null.
 * Priority: prayer time > Jumu'ah > white days > Ramadan > night > wellbeing.
 */
export function computeProactive(): ProactiveMessage | null {
  const cache = readPrayerCache();
  return (
    getPrayerNudge(cache) ??
    getFridayNudge() ??
    getWhiteDaysNudge() ??
    getRamadanNudge(cache) ??
    getNightNudge() ??
    getWellbeingNudge()
  );
}

// ── Seen-tracking (per-message id, persisted) ────────────────────────────────

const SEEN_KEY = "mia_proactive_seen_v1";

function readSeen(): string[] {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    // Prune anything older than 3 days by date prefix.
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 3);
    const cutoffKey = cutoff.toISOString().slice(0, 10);
    return arr.filter((id) => id.slice(0, 10) >= cutoffKey);
  } catch {
    return [];
  }
}

export function isSeen(id: string): boolean {
  return readSeen().includes(id);
}

export function markSeen(id: string): void {
  try {
    const seen = new Set(readSeen());
    seen.add(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    /* quota */
  }
}

// ── User name (works without login) ──────────────────────────────────────────

const NAME_KEY = "mia_user_name";

export function getUserName(): string | null {
  try {
    return localStorage.getItem(NAME_KEY);
  } catch {
    return null;
  }
}

export function setUserName(name: string): void {
  try {
    localStorage.setItem(NAME_KEY, name.trim().slice(0, 40));
  } catch {
    /* quota */
  }
}

// ── "Have you prayed?" check (per prayer, per day) ───────────────────────────

const PRAYER_ANSWERED_KEY = "mia_prayer_answered_v1";
type AnsweredMap = Record<string, "yes" | "no">;

function readAnswered(): AnsweredMap {
  try {
    const raw = localStorage.getItem(PRAYER_ANSWERED_KEY);
    const map = raw ? (JSON.parse(raw) as AnsweredMap) : {};
    const today = todayKey();
    const filtered: AnsweredMap = {};
    for (const k of Object.keys(map)) if (k.startsWith(today)) filtered[k] = map[k];
    return filtered;
  } catch {
    return {};
  }
}

export function isPrayerAnswered(prayer: string): boolean {
  return !!readAnswered()[`${todayKey()}-${prayer}`];
}

export function markPrayerAnswered(prayer: string, answer: "yes" | "no"): void {
  try {
    const map = readAnswered();
    map[`${todayKey()}-${prayer}`] = answer;
    localStorage.setItem(PRAYER_ANSWERED_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

/**
 * Returns the current prayer if its time entered within the last 90 min
 * and the user hasn't been asked about it today. Drives the auto "have
 * you prayed X?" check that fires when the app opens.
 */
export function getCurrentPrayerCheck(): { name: PrayerName } | null {
  const cache = readPrayerCache();
  const times = cache?.prayerTimes;
  if (!times) return null;
  const now = nowMinutes();

  let currentPrayer: PrayerName | null = null;
  let currentAt = -Infinity;
  for (const name of PRAYER_ORDER) {
    const t = parseHHMM(times[name]);
    if (t == null) continue;
    if (t <= now && t > currentAt) {
      currentAt = t;
      currentPrayer = name;
    }
  }
  if (!currentPrayer) return null;
  if (now - currentAt > 90) return null;
  if (isPrayerAnswered(currentPrayer)) return null;
  return { name: currentPrayer };
}

export function capitalizePrayer(s: string): string {
  return capitalize(s);
}

export function postSalahDuas(prayer: string): string {
  return `MashaAllah 🌿 — may Allah accept your **${capitalize(prayer)}**.\n\nBefore you leave your spot, keep these on your tongue:\n\n- **Astaghfirullah** ×3\n- **Allahumma antas-salām wa minkas-salām, tabārakta yā dhal-jalāli wal-ikrām**\n- **SubhanAllah** ×33, **Alhamdulillah** ×33, **Allahu Akbar** ×34\n- **Ayat al-Kursi** — protects you until the next prayer.\n- **Surat al-Ikhlas, al-Falaq, an-Nās** — once after Dhuhr/Asr, three times after Fajr & Maghrib.\n\nThen make a short personal du'a — Allah is closest to you in this moment. 💜`;
}

export function gentleGoPrayNudge(prayer: string, userName?: string | null): string {
  const who = userName ? `${userName}, ` : "";
  return `No worries ${who}— the time for **${capitalize(prayer)}** is still open. Make wudu, face the Qiblah, and give Allah just a few minutes. I'll be here when you're back. 💜\n\n> "Indeed, prayer prohibits immorality and wrongdoing." — Qur'an 29:45`;
}

export function consultationOpener(userName?: string | null): string {
  const who = userName ? `${userName}` : "friend";
  return `I'm here for you, **${who}** 💜\n\nThis is a safe space — nothing you say leaves this chat. Take your breath and tell me what's weighing on your heart. It can be anxiety, loneliness, family, work, guilt, faith struggles… anything.\n\nI'll listen first, then share what Islam teaches about it and practical steps you can take today.\n\n> "Verily, in the remembrance of Allah do hearts find rest." — Qur'an 13:28\n\nWhenever you're ready — go ahead.`;
}
