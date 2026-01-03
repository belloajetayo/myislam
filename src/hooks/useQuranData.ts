import { useState, useEffect } from 'react';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  audio?: string;
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
  translation: { number: number; text: string; numberInSurah: number }[];
  transliteration: { number: number; text: string; numberInSurah: number }[];
}

export interface AudioEdition {
  identifier: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

const CACHE_PREFIX = 'quran_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache read error:', e);
  }
  return null;
};

const setCachedData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (e) {
    console.error('Cache write error:', e);
  }
};

export const useQuranData = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioEditions, setAudioEditions] = useState<AudioEdition[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Try cache first
      const cachedSurahs = getCachedData<Surah[]>('surahs');
      const cachedAudioEditions = getCachedData<AudioEdition[]>('audioEditions');

      if (cachedSurahs) {
        setSurahs(cachedSurahs);
        if (cachedAudioEditions) setAudioEditions(cachedAudioEditions);
        setLoading(false);
        
        // If online, refresh in background
        if (!isOffline) {
          try {
            const [surahsRes, audioRes] = await Promise.all([
              fetch('https://api.alquran.cloud/v1/surah'),
              fetch('https://api.alquran.cloud/v1/edition?format=audio')
            ]);
            const [surahsData, audioData] = await Promise.all([
              surahsRes.json(),
              audioRes.json()
            ]);
            if (surahsData.code === 200) {
              setSurahs(surahsData.data);
              setCachedData('surahs', surahsData.data);
            }
            if (audioData.code === 200) {
              setAudioEditions(audioData.data);
              setCachedData('audioEditions', audioData.data);
            }
          } catch (err) {
            // Silently fail, we have cache
          }
        }
        return;
      }

      if (isOffline) {
        setError('You are offline and no cached data is available');
        setLoading(false);
        return;
      }

      try {
        const [surahsRes, audioRes] = await Promise.all([
          fetch('https://api.alquran.cloud/v1/surah'),
          fetch('https://api.alquran.cloud/v1/edition?format=audio')
        ]);
        
        const [surahsData, audioData] = await Promise.all([
          surahsRes.json(),
          audioRes.json()
        ]);
        
        if (surahsData.code === 200) {
          setSurahs(surahsData.data);
          setCachedData('surahs', surahsData.data);
        } else {
          setError('Failed to fetch Quran data');
        }
        
        if (audioData.code === 200) {
          setAudioEditions(audioData.data);
          setCachedData('audioEditions', audioData.data);
        }
      } catch (err) {
        setError('Error loading Quran data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOffline]);

  const fetchSurahDetail = async (surahNumber: number, audioEdition: string = 'ar.alafasy'): Promise<SurahDetail | null> => {
    const cacheKey = `surah_${surahNumber}_${audioEdition}`;
    const cached = getCachedData<SurahDetail>(cacheKey);
    
    if (cached) {
      // If online, refresh in background
      if (!isOffline) {
        fetchAndCacheSurahDetail(surahNumber, audioEdition, cacheKey);
      }
      return cached;
    }

    if (isOffline) {
      return null;
    }

    return fetchAndCacheSurahDetail(surahNumber, audioEdition, cacheKey);
  };

  const fetchAndCacheSurahDetail = async (surahNumber: number, audioEdition: string, cacheKey: string): Promise<SurahDetail | null> => {
    try {
      const [arabicRes, translationRes, transliterationRes, audioRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.transliteration`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${audioEdition}`)
      ]);
      
      const [arabicData, translationData, transliterationData, audioData] = await Promise.all([
        arabicRes.json(),
        translationRes.json(),
        transliterationRes.json(),
        audioRes.json()
      ]);

      if (arabicData.code === 200 && translationData.code === 200) {
        const ayahsWithAudio = arabicData.data.ayahs.map((ayah: Ayah, index: number) => ({
          ...ayah,
          audio: audioData.code === 200 ? audioData.data.ayahs[index]?.audio : undefined
        }));

        const surahDetail: SurahDetail = {
          ...arabicData.data,
          ayahs: ayahsWithAudio,
          translation: translationData.data.ayahs,
          transliteration: transliterationData.code === 200 ? transliterationData.data.ayahs : []
        };

        setCachedData(cacheKey, surahDetail);
        return surahDetail;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const fetchSurahAudio = async (surahNumber: number, edition: string = 'ar.alafasy') => {
    const cacheKey = `audio_${surahNumber}_${edition}`;
    const cached = getCachedData<{ number: number; audio: string }[]>(cacheKey);
    
    if (cached) return cached;
    if (isOffline) return null;

    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${edition}`);
      const data = await response.json();
      if (data.code === 200) {
        const audioData = data.data.ayahs.map((ayah: any) => ({
          number: ayah.numberInSurah,
          audio: ayah.audio
        }));
        setCachedData(cacheKey, audioData);
        return audioData;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const getCachedSurahCount = (): number => {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_PREFIX + 'surah_')) {
        count++;
      }
    }
    return count;
  };

  return { surahs, loading, error, fetchSurahDetail, audioEditions, fetchSurahAudio, isOffline, getCachedSurahCount };
};

// Comprehensive Duas collection
export const duasCollection = [
  {
    id: 1,
    category: 'Morning Adhkar',
    categoryArabic: 'أذكار الصباح',
    duas: [
      {
        arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise and He is over all things omnipotent.',
        reference: 'Abu Dawud 4:317',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        translation: 'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
        reference: 'At-Tirmidhi 5:466',
        times: 1
      },
      {
        arabic: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ',
        translation: 'How perfect Allah is and I praise Him.',
        reference: 'Muslim 4:2071',
        times: 100
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ',
        translation: 'O Allah, I ask You for pardon and well-being in this life and the next.',
        reference: 'Ibn Majah 2:332',
        times: 1
      }
    ]
  },
  {
    id: 2,
    category: 'Evening Adhkar',
    categoryArabic: 'أذكار المساء',
    duas: [
      {
        arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without partner.',
        reference: 'Abu Dawud 4:317',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        translation: 'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.',
        reference: 'At-Tirmidhi 5:466',
        times: 1
      },
      {
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translation: 'I take refuge in the perfect words of Allah from the evil of what He has created.',
        reference: 'Muslim 4:2081',
        times: 3
      }
    ]
  },
  {
    id: 3,
    category: 'Before Sleep',
    categoryArabic: 'قبل النوم',
    duas: [
      {
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        translation: 'In Your name O Allah, I die and I live.',
        reference: 'Al-Bukhari 11:113',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        translation: 'O Allah, protect me from Your punishment on the day Your servants are resurrected.',
        reference: 'Abu Dawud 4:311',
        times: 3
      },
      {
        arabic: 'اللَّهُمَّ بِاسْمِكَ أَحْيَا وَأَمُوتُ',
        translation: 'O Allah, in Your name I live and die.',
        reference: 'Al-Bukhari',
        times: 1
      }
    ]
  },
  {
    id: 4,
    category: 'Waking Up',
    categoryArabic: 'عند الاستيقاظ',
    duas: [
      {
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
        reference: 'Al-Bukhari 11:113',
        times: 1
      },
      {
        arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise, and He is over all things omnipotent.',
        reference: 'Al-Bukhari, Muslim',
        times: 1
      }
    ]
  },
  {
    id: 5,
    category: 'After Prayer',
    categoryArabic: 'بعد الصلاة',
    duas: [
      {
        arabic: 'أَسْتَغْفِرُ اللهَ',
        translation: 'I ask Allah for forgiveness.',
        reference: 'Muslim 1:414',
        times: 3
      },
      {
        arabic: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        translation: 'O Allah, You are Peace and from You is peace. Blessed are You, O Owner of majesty and honor.',
        reference: 'Muslim 1:414',
        times: 1
      },
      {
        arabic: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
        translation: 'None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.',
        reference: 'Al-Bukhari 1:255, Muslim 1:414',
        times: 1
      }
    ]
  },
  {
    id: 6,
    category: 'Entering Mosque',
    categoryArabic: 'دخول المسجد',
    duas: [
      {
        arabic: 'أَعُوذُ بِاللهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ',
        translation: 'I take refuge with Allah, The Supreme and with His Noble Face, and His eternal authority from the accursed devil.',
        reference: 'Abu Dawud',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        translation: 'O Allah, open the gates of Your mercy for me.',
        reference: 'Muslim 1:494',
        times: 1
      },
      {
        arabic: 'بِسْمِ اللهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللهِ',
        translation: 'In the name of Allah, and prayers and peace be upon the Messenger of Allah.',
        reference: 'Abu Dawud',
        times: 1
      }
    ]
  },
  {
    id: 7,
    category: 'Leaving Mosque',
    categoryArabic: 'الخروج من المسجد',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        translation: 'In the name of Allah, and prayers and peace be upon the Messenger of Allah. O Allah, I ask You from Your favour.',
        reference: 'Muslim 1:494',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ',
        translation: 'O Allah, protect me from the accursed devil.',
        reference: 'Ibn Majah',
        times: 1
      }
    ]
  },
  {
    id: 8,
    category: 'Traveling',
    categoryArabic: 'السفر',
    duas: [
      {
        arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
        translation: 'How perfect He is, the One Who has placed this (transport) at our service, and we ourselves would not have been capable of that, and to our Lord is our final destiny.',
        reference: 'Quran 43:13-14',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى',
        translation: 'O Allah, we ask You on this our journey for goodness and piety, and for works that are pleasing to You.',
        reference: 'Muslim 2:978',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ',
        translation: 'O Allah, make this journey easy for us, and make its distance short for us.',
        reference: 'Muslim 2:978',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ',
        translation: 'O Allah, You are our Companion on the road and the One in Whose care we leave our family.',
        reference: 'Muslim 2:978',
        times: 1
      }
    ]
  },
  {
    id: 9,
    category: 'Returning from Travel',
    categoryArabic: 'الرجوع من السفر',
    duas: [
      {
        arabic: 'آيِبُونَ، تَائِبُونَ، عَابِدُونَ، لِرَبِّنَا حَامِدُونَ',
        translation: 'We return, repent, worship and praise our Lord.',
        reference: 'Al-Bukhari',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ',
        translation: 'O Allah, I ask You for the best entry and the best exit.',
        reference: 'Abu Dawud',
        times: 1
      }
    ]
  },
  {
    id: 10,
    category: 'Breaking Fast',
    categoryArabic: 'عند الإفطار',
    duas: [
      {
        arabic: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللهُ',
        translation: 'The thirst has gone and the veins are quenched, and reward is confirmed, if Allah wills.',
        reference: 'Abu Dawud 2:306',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
        translation: 'O Allah, for You I have fasted and upon Your provision I have broken my fast.',
        reference: 'Abu Dawud',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ أَنْ تَغْفِرَ لِي',
        translation: 'O Allah, I ask You by Your mercy which envelops all things, that You forgive me.',
        reference: 'Ibn Majah',
        times: 1
      }
    ]
  },
  {
    id: 11,
    category: 'Before Eating',
    categoryArabic: 'قبل الطعام',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ',
        translation: 'In the name of Allah.',
        reference: 'At-Tirmidhi, Abu Dawud',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
        translation: 'O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire.',
        reference: 'Ibn As-Sunni',
        times: 1
      }
    ]
  },
  {
    id: 12,
    category: 'After Eating',
    categoryArabic: 'بعد الطعام',
    duas: [
      {
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
        translation: 'All praise is for Allah who fed us and gave us drink, and made us Muslims.',
        reference: 'Abu Dawud, At-Tirmidhi',
        times: 1
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        translation: 'All praise is for Allah who has fed me this and provided it for me without any might or power from myself.',
        reference: 'Abu Dawud, At-Tirmidhi',
        times: 1
      }
    ]
  },
  {
    id: 13,
    category: 'Forgiveness',
    categoryArabic: 'الاستغفار',
    duas: [
      {
        arabic: 'أَسْتَغْفِرُ اللهَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
        translation: 'I ask forgiveness of Allah, besides whom there is none worthy of worship, the Ever-Living, the Self-Subsisting, and I turn to Him in repentance.',
        reference: 'Abu Dawud 2:85, At-Tirmidhi 5:569',
        times: 3
      },
      {
        arabic: 'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
        translation: 'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
        reference: 'Quran 7:23',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ',
        translation: 'O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant.',
        reference: 'Al-Bukhari 7:150 (Sayyidul Istighfar)',
        times: 1
      }
    ]
  },
  {
    id: 14,
    category: 'Protection',
    categoryArabic: 'الحماية',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.',
        reference: 'Abu Dawud 4:323, At-Tirmidhi 5:465',
        times: 3
      },
      {
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translation: 'I take refuge in the perfect words of Allah from the evil of what He has created.',
        reference: 'Muslim 4:2081',
        times: 3
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',
        translation: 'O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness.',
        reference: 'Al-Bukhari 7:158',
        times: 1
      }
    ]
  },
  {
    id: 15,
    category: 'Entering Home',
    categoryArabic: 'دخول المنزل',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ وَلَجْنَا، وَبِسْمِ اللهِ خَرَجْنَا، وَعَلَى اللهِ رَبِّنَا تَوَكَّلْنَا',
        translation: 'In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.',
        reference: 'Abu Dawud 4:325',
        times: 1
      }
    ]
  },
  {
    id: 16,
    category: 'Leaving Home',
    categoryArabic: 'الخروج من المنزل',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ، تَوَكَّلْتُ عَلَى اللهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
        translation: 'In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah.',
        reference: 'Abu Dawud 4:325, At-Tirmidhi 5:490',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ',
        translation: 'O Allah, I take refuge with You lest I should stray or be led astray, or slip or be tripped.',
        reference: 'Abu Dawud, At-Tirmidhi, An-Nasai',
        times: 1
      }
    ]
  },
  {
    id: 17,
    category: 'During Rain',
    categoryArabic: 'عند نزول المطر',
    duas: [
      {
        arabic: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
        translation: 'O Allah, may it be a beneficial rain.',
        reference: 'Al-Bukhari',
        times: 1
      },
      {
        arabic: 'مُطِرْنَا بِفَضْلِ اللهِ وَرَحْمَتِهِ',
        translation: 'We have been given rain by the grace and mercy of Allah.',
        reference: 'Al-Bukhari, Muslim',
        times: 1
      }
    ]
  },
  {
    id: 18,
    category: 'For Parents',
    categoryArabic: 'للوالدين',
    duas: [
      {
        arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
        translation: 'Our Lord, forgive me and my parents and the believers the Day the account is established.',
        reference: 'Quran 14:41',
        times: 1
      },
      {
        arabic: 'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
        translation: 'My Lord, have mercy upon them as they brought me up when I was small.',
        reference: 'Quran 17:24',
        times: 1
      }
    ]
  },
  {
    id: 19,
    category: 'For Guidance',
    categoryArabic: 'للهداية',
    duas: [
      {
        arabic: 'اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي',
        translation: 'O Allah, guide me and keep me on the right path.',
        reference: 'Muslim 4:2090',
        times: 1
      },
      {
        arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً',
        translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy.',
        reference: 'Quran 3:8',
        times: 1
      }
    ]
  },
  {
    id: 20,
    category: 'For Knowledge',
    categoryArabic: 'للعلم',
    duas: [
      {
        arabic: 'رَبِّ زِدْنِي عِلْمًا',
        translation: 'My Lord, increase me in knowledge.',
        reference: 'Quran 20:114',
        times: 1
      },
      {
        arabic: 'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي، وَعَلِّمْنِي مَا يَنْفَعُنِي، وَزِدْنِي عِلْمًا',
        translation: 'O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.',
        reference: 'At-Tirmidhi, Ibn Majah',
        times: 1
      }
    ]
  }
];
