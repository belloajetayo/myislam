import React, { useState, useRef, useEffect } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Headphones, Play, Pause, SkipForward, SkipBack, Volume2, BookOpen, Star, Heart } from "lucide-react";

const EPISODES = [
  {
    id: 1,
    title: "The Importance of Prayer",
    category: "Salat",
    duration: "3 min",
    color: "from-indigo-500 to-blue-600",
    icon: Star,
    content: `Bismillah Ar-Rahman Ar-Raheem. Assalamu Alaikum wa Rahmatullahi wa Barakatuh.

Welcome to MyIslam Daily Reminders.

Today we reflect on the importance of Salat — the second pillar of Islam.

The Prophet Muhammad, peace be upon him, said: "The first matter that the servant will be brought to account for on the Day of Judgment is the prayer. If it is sound, then the rest of his deeds will be sound. And if it is incomplete, then the rest of his deeds will be incomplete." — Tabarani.

Prayer is not merely a ritual. It is a direct connection between you and Allah. Five times a day, you are invited to stand before your Creator and speak to Him.

The Prophet said: "When any one of you stands to pray, he is communicating with his Lord." — Bukhari.

So when you hear the Adhan, respond with eagerness. Leave whatever you are doing and turn to Allah. 

For the one who guards their prayers, Allah has promised ease in this life and success in the hereafter.

May Allah make us among those who establish the prayer and find peace in it. Ameen.

JazakAllahu Khayran for listening. Until next time, Assalamu Alaikum.`
  },
  {
    id: 2,
    title: "Hadith of the Day — Best Manners",
    category: "Hadith",
    duration: "2 min",
    color: "from-amber-500 to-orange-600",
    icon: BookOpen,
    content: `Bismillah Ar-Rahman Ar-Raheem.

Today's Hadith comes from Sahih Al-Bukhari and At-Tirmidhi.

The Messenger of Allah, peace and blessings be upon him, said:

"The best among you are those who have the best manners and character."

Let us reflect on this beautiful teaching. Islam places tremendous emphasis on character. Before we are judged by our worship, we will be judged by how we treated others.

Good manners includes speaking gently, smiling at your brother, forgiving those who wrong you, being patient in difficulty, and showing kindness to all of Allah's creation.

The Prophet himself was described in the Quran as being of an exalted standard of character.

Today, let us make one intention — to improve one aspect of our character. Perhaps it is controlling our anger. Perhaps it is speaking more kindly to our family. Perhaps it is being more patient.

Small consistent actions transform our character over time.

May Allah beautify our character as He has beautified our creation. Ameen.`
  },
  {
    id: 3,
    title: "Surah Al-Fatiha — Reflection",
    category: "Quran",
    duration: "4 min",
    color: "from-emerald-500 to-teal-600",
    icon: BookOpen,
    content: `Bismillah Ar-Rahman Ar-Raheem.

Today we reflect on Surah Al-Fatiha — the Opening — the greatest chapter of the Quran.

The Prophet Muhammad, peace be upon him, called it Umm Al-Kitab — the Mother of the Book. It is the only surah we recite in every single rakah of every prayer.

Let us understand what we say.

Alhamdulillahi Rabbil Aalameen — All praise is due to Allah, Lord of all the worlds. We begin with gratitude. Every breath, every heartbeat, every blessing — all from Allah.

Ar-Rahman Ar-Raheem — The Most Gracious, the Most Merciful. Allah's mercy encompasses all things. Even in our sins, His mercy is greater.

Maliki Yawmid-Deen — Master of the Day of Judgment. A reminder that we will all return to Him and be accountable for our deeds.

Iyyaka nabudu wa iyyaka nastaeen — You alone we worship and You alone we ask for help. This is our covenant with Allah — renewed seventeen times a day.

Ihdinas Siraatal Mustaqeem — Guide us to the straight path. The most important dua we make. We ask Allah for guidance, not because we have it perfectly, but because we need it constantly.

May Allah make Al-Fatiha a living reality in our hearts and not just words on our tongues. Ameen.`
  },
  {
    id: 4,
    title: "Patience in Difficulty",
    category: "Reminder",
    duration: "3 min",
    color: "from-purple-500 to-violet-600",
    icon: Heart,
    content: `Bismillah Ar-Rahman Ar-Raheem. Assalamu Alaikum.

Today's reminder is about Sabr — patience.

Allah says in the Quran: "Indeed, Allah is with the patient." — Surah Al-Baqarah.

Whatever you are going through right now — whether it is financial difficulty, health challenges, heartbreak, or uncertainty about the future — know that Allah sees you.

The Prophet Muhammad, peace be upon him, said: "How wonderful is the affair of the believer, for his affairs are all good. If something good happens to him, he is thankful for it and that is good for him. If something bad happens to him, he bears it with patience and that is also good for him."

This is the unique position of the Muslim. Every situation becomes an opportunity for reward.

Patience does not mean you do not feel pain. Patience means you feel the pain but you choose to trust Allah through it.

Umar ibn Al-Khattab said: "I have never faced a calamity except that Allah gave me four gifts with it — it was not in my religion, it was not greater than it could have been, I was given the ability to say Inna lillahi wa inna ilayhi rajioon, and I was given hope in its reward."

So whatever you face today — breathe. Say Alhamdulillah. Trust Allah. He never wastes the patience of His servants.

May Allah grant us beautiful patience. Ameen.`
  },
  {
    id: 5,
    title: "Morning Adhkar",
    category: "Dhikr",
    duration: "2 min",
    color: "from-sky-500 to-blue-600",
    icon: Star,
    content: `Bismillah Ar-Rahman Ar-Raheem.

Morning Adhkar — remembrance of Allah in the morning — is a powerful shield for your day.

The Prophet, peace be upon him, taught us specific words to say in the morning to protect ourselves and attract blessings.

Let us recite some together.

Ayatul Kursi — recited once in the morning, protects you until evening.

"Subhanallahi wa bihamdihi" — Glory be to Allah and all praise is His — repeated 100 times, your sins are forgiven even if they were like the foam of the sea.

"La ilaha illallah wahdahu la sharika lah, lahul mulku wa lahul hamdu wa huwa ala kulli shayyin qadeer" — repeated 10 times in the morning — this equals freeing ten slaves, a hundred good deeds are recorded, a hundred sins erased, and you are protected from Shaytaan.

Astaghfirullah — said 100 times — keeps your heart clean and soft.

These small acts, done consistently, transform your day and your life.

The Prophet said: "The best remembrance is La ilaha illallah."

Start your morning with Allah and watch how your entire day changes.

May Allah make us among those who remember Him often. Ameen.`
  },
  {
    id: 6,
    title: "The Power of Dua",
    category: "Dua",
    duration: "3 min",
    color: "from-rose-500 to-pink-600",
    icon: Heart,
    content: `Bismillah Ar-Rahman Ar-Raheem.

Today we talk about Dua — supplication — the most powerful tool the believer has.

The Prophet Muhammad, peace be upon him, said: "Dua is worship." — Abu Dawud.

When you make dua, you are acknowledging that Allah is the All-Powerful and that you are in need of Him. This is the essence of worship.

Allah says in the Quran: "Call upon Me; I will respond to you." — Surah Ghafir.

This is a divine promise. Allah does not break His promises.

But how do we make dua properly?

Begin with the praise of Allah and send blessings upon the Prophet.

Be sincere. Dua from a heedless heart is not accepted.

Be persistent. The Prophet said Allah loves the one who is persistent in asking.

Choose the best times — the last third of the night, between adhan and iqamah, on Fridays, when prostrating in salah, and when it is raining.

Do not be hasty. The Prophet warned against saying "I made dua but it was not answered."

Know that Allah answers in one of three ways — He gives you what you asked for, He removes a harm from you, or He saves the reward for the hereafter.

No dua is ever wasted.

So raise your hands today. Ask Allah for what you need. He is As-Sami — the All-Hearing.

May Allah accept all our duas. Ameen.`
  },
];

const CATEGORIES = ["All", "Salat", "Hadith", "Quran", "Reminder", "Dhikr", "Dua"];

const Podcasts: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [playing, setPlaying] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<typeof EPISODES[0] | null>(null);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const filtered = activeCategory === "All" ? EPISODES : EPISODES.filter(e => e.category === activeCategory);

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPlaying(false);
  };

  const startEpisode = (episode: typeof EPISODES[0]) => {
    stopSpeech();
    setCurrentEpisode(episode);
    setProgress(0);

    const utterance = new SpeechSynthesisUtterance(episode.content);
    utterance.rate = speed;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === "en-GB" || v.name.includes("Daniel") || v.name.includes("Google UK"));
    if (preferred) utterance.voice = preferred;

    utterance.onend = () => {
      setPlaying(false);
      setProgress(100);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);

    // Simulate progress
    let p = 0;
    const durationMs = episode.content.length * 55 / speed;
    intervalRef.current = setInterval(() => {
      p += (100 / (durationMs / 500));
      if (p >= 100) { p = 100; if (intervalRef.current) clearInterval(intervalRef.current); }
      setProgress(p);
    }, 500);
  };

  const togglePlay = () => {
    if (!currentEpisode) return;
    if (playing) {
      window.speechSynthesis.pause();
      setPlaying(false);
    } else {
      window.speechSynthesis.resume();
      setPlaying(true);
    }
  };

  const nextEpisode = () => {
    if (!currentEpisode) return;
    const idx = EPISODES.findIndex(e => e.id === currentEpisode.id);
    const next = EPISODES[(idx + 1) % EPISODES.length];
    startEpisode(next);
  };

  const prevEpisode = () => {
    if (!currentEpisode) return;
    const idx = EPISODES.findIndex(e => e.id === currentEpisode.id);
    const prev = EPISODES[(idx - 1 + EPISODES.length) % EPISODES.length];
    startEpisode(prev);
  };

  useEffect(() => {
    return () => stopSpeech();
  }, []);

  return (
    <MobileLayout>
      <div className="p-4 space-y-5 pb-8">
        {/* Header */}
        <header className="flex items-center gap-3 py-3">
          <button onClick={() => { stopSpeech(); navigate("/"); }} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/60 dark:bg-white/5 border border-indigo-100 dark:border-indigo-800">
            <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
          </button>
          <div>
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              <Headphones className="w-5 h-5 text-indigo-500" />
              Islamic Audio
            </h1>
            <p className="text-xs text-muted-foreground">Daily reminders & reflections</p>
          </div>
        </header>

        {/* Now Playing */}
        {currentEpisode && (
          <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1e3a5f 100%)" }}>
            <div className="p-4">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${currentEpisode.color} flex items-center justify-center mb-3 shadow-lg mx-auto`}>
                <Headphones className="w-8 h-8 text-white" />
              </div>
              <p className="text-white font-bold text-center text-base">{currentEpisode.title}</p>
              <p className="text-indigo-300 text-xs text-center mt-0.5">{currentEpisode.category} • {currentEpisode.duration}</p>

              {/* Progress bar */}
              <div className="mt-3 w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mt-4">
                <button onClick={prevEpisode} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-90"
                >
                  {playing
                    ? <Pause className="w-6 h-6 text-indigo-600" />
                    : <Play className="w-6 h-6 text-indigo-600 ml-0.5" />
                  }
                </button>
                <button onClick={nextEpisode} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Speed */}
              <div className="flex items-center justify-center gap-2 mt-3">
                <Volume2 className="w-3 h-3 text-indigo-300" />
                {[0.75, 1, 1.25, 1.5].map(s => (
                  <button
                    key={s}
                    onClick={() => { setSpeed(s); if (utteranceRef.current) utteranceRef.current.rate = s; }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${speed === s ? "bg-white text-indigo-600" : "bg-white/10 text-white"}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? "bg-indigo-500 text-white shadow-sm"
                  : "bg-white/60 dark:bg-white/5 text-gray-600 dark:text-gray-300 border border-indigo-100 dark:border-indigo-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Episode list */}
        <div className="space-y-3">
          {filtered.map((episode) => (
            <div
              key={episode.id}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer active:scale-[0.98] ${
                currentEpisode?.id === episode.id
                  ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"
                  : "border-indigo-100 dark:border-indigo-800 bg-white/60 dark:bg-white/5"
              }`}
              onClick={() => startEpisode(episode)}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${episode.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                <episode.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground line-clamp-1">{episode.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{episode.category} • {episode.duration}</p>
              </div>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                currentEpisode?.id === episode.id && playing
                  ? "bg-indigo-500"
                  : "bg-indigo-50 dark:bg-indigo-900/30"
              }`}>
                {currentEpisode?.id === episode.id && playing
                  ? <Pause className="w-4 h-4 text-white" />
                  : <Play className="w-4 h-4 text-indigo-500 ml-0.5" />
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </MobileLayout>
  );
};

export default Podcasts;
