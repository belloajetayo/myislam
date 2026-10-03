// MIA "Jarvis" layer: voice in/out, spoken greeting and instant app commands.

const VOICE_KEY = "mia_voice_enabled";
const GREET_KEY = "mia_last_greet";

export const isVoiceEnabled = () => localStorage.getItem(VOICE_KEY) !== "0";
export const setVoiceEnabled = (on: boolean) => localStorage.setItem(VOICE_KEY, on ? "1" : "0");

export function cleanForSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#*_>`~\[\]]/g, "")
    .replace(/\(https?:[^)]+\)/g, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
    .replace(/[\u0600-\u06FF]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

export function speak(text: string, onEnd?: () => void) {
  if (!("speechSynthesis" in window)) return onEnd?.();
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
  const voices = synth.getVoices();
  const pick =
    voices.find((v) => /en-GB/i.test(v.lang) && /female|Samantha|Serena|Google UK English Female/i.test(v.name)) ||
    voices.find((v) => /^en/i.test(v.lang));
  if (pick) u.voice = pick;
  u.rate = 1.02;
  u.pitch = 1;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  synth.speak(u);
}

export const stopSpeaking = () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
};

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

export function createRecognizer(): Rec | null {
  const w = window as unknown as Record<string, new () => Rec>;
  const Ctor = w["SpeechRecognition"] || w["webkitSpeechRecognition"];
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = "en-US";
  r.interimResults = true;
  r.continuous = false;
  return r;
}

// ---------- Commands ----------
export type MiaCommand = { route: string; label: string };

const COMMANDS: { match: RegExp; route: string; label: string }[] = [
  { match: /\b(home|main screen|dashboard)\b/i, route: "/", label: "Home" },
  { match: /\b(prayer times?|salah times?|when is (fajr|dhuhr|asr|maghrib|isha)|next prayer|adhan)\b/i, route: "/prayer", label: "Prayer Times" },
  { match: /\b(qibla|qiblah|kaaba|direction)\b/i, route: "/qiblah", label: "Qiblah" },
  { match: /\b(mosques?|masjid)\b/i, route: "/qiblah", label: "Mosques near you" },
  { match: /\b(hadith)\b/i, route: "/quran?tab=hadith", label: "Hadith" },
  { match: /\b(prophets?|stories)\b/i, route: "/quran?tab=prophets", label: "Prophet Stories" },
  { match: /\b(qur'?an|surah|mushaf|recite|kahf)\b/i, route: "/quran", label: "Qur'an" },
  { match: /\b(du'?as?|adhkar|azkar|supplication)\b/i, route: "/duas", label: "Duas" },
  { match: /\b(tasbih|tasbeeh|counter|dhikr)\b/i, route: "/tasbih", label: "Tasbih" },
  { match: /\b(fast(ing)?|sawm|suhoor|iftar)\b/i, route: "/fasting", label: "Fasting" },
  { match: /\b(zakat|zakah)\b/i, route: "/zakat", label: "Zakat Calculator" },
  { match: /\b(hajj|umrah)\b/i, route: "/hajj", label: "Hajj & Umrah" },
  { match: /\b(calendar|hijri)\b/i, route: "/calendar", label: "Islamic Calendar" },
  { match: /\b(podcasts?|radio|nasheed|lectures?)\b/i, route: "/podcasts", label: "Podcasts & Radio" },
  { match: /\b(progress|streak|tracker)\b/i, route: "/progress", label: "Progress" },
  { match: /\b(donat(e|ion)|sadaqah|charity)\b/i, route: "/donation", label: "Donate" },
  { match: /\b(profile|account|settings)\b/i, route: "/profile", label: "Profile" },
];

const VERB = /^\s*(hey mia,?\s*|mia,?\s*)?(please\s+)?(open|go to|take me to|show( me)?|launch|navigate to|start|play)\b/i;

/** Returns a command only when the user clearly asks to open/go somewhere. */
export function parseCommand(text: string): MiaCommand | null {
  if (!VERB.test(text) || text.length > 80) return null;
  const hit = COMMANDS.find((c) => c.match.test(text));
  return hit ? { route: hit.route, label: hit.label } : null;
}

// ---------- Greeting ----------
function nextPrayer(): { name: string; time: string } | null {
  try {
    const raw = localStorage.getItem("prayer_times_cache_v1");
    const times: Record<string, string> | undefined = raw ? JSON.parse(raw)?.prayerTimes : undefined;
    if (!times) return null;
    const now = new Date().getHours() * 60 + new Date().getMinutes();
    for (const n of ["fajr", "dhuhr", "asr", "maghrib", "isha"]) {
      const m = (times[n] || times[n[0].toUpperCase() + n.slice(1)] || "").match(/(\d{1,2}):(\d{2})/);
      if (m && Number(m[1]) * 60 + Number(m[2]) > now) return { name: n[0].toUpperCase() + n.slice(1), time: `${m[1]}:${m[2]}` };
    }
  } catch { /* ignore */ }
  return null;
}

export function buildGreeting(name?: string | null): string {
  const d = new Date();
  const h = d.getHours();
  const part = h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  let hijri = "";
  try {
    hijri = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", { day: "numeric", month: "long", year: "numeric" }).format(d);
  } catch { /* ignore */ }
  const np = nextPrayer();
  return [
    `Assalamu alaikum${name ? `, ${name}` : ""}. Good ${part}.`,
    `It's ${time}${hijri ? `, ${hijri}` : ""}.`,
    np ? `Your next prayer is ${np.name} at ${np.time}.` : "",
    "How can I help you today?",
  ].filter(Boolean).join(" ");
}

/** Speak the greeting at most once every 3 hours. */
export function shouldGreet(): boolean {
  const last = Number(localStorage.getItem(GREET_KEY) || 0);
  if (Date.now() - last < 3 * 3600_000) return false;
  localStorage.setItem(GREET_KEY, String(Date.now()));
  return true;
}
