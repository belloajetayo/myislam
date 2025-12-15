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
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  ayahs: Ayah[];
  translation: { number: number; text: string; numberInSurah: number }[];
}

export const useQuranData = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        } else {
          setError('Failed to fetch Quran data');
        }
      } catch (err) {
        setError('Error loading Quran data');
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  const fetchSurahDetail = async (surahNumber: number): Promise<SurahDetail | null> => {
    try {
      const [arabicRes, translationRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`)
      ]);
      
      const [arabicData, translationData] = await Promise.all([
        arabicRes.json(),
        translationRes.json()
      ]);

      if (arabicData.code === 200 && translationData.code === 200) {
        return {
          ...arabicData.data,
          translation: translationData.data.ayahs
        };
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  return { surahs, loading, error, fetchSurahDetail };
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
        arabic: 'سُبْحَانَ اللهِ',
        translation: 'How perfect Allah is.',
        reference: 'Al-Bukhari, Muslim',
        times: 33
      },
      {
        arabic: 'الْحَمْدُ لِلَّهِ',
        translation: 'All praise is for Allah.',
        reference: 'Al-Bukhari, Muslim',
        times: 33
      },
      {
        arabic: 'اللهُ أَكْبَرُ',
        translation: 'Allah is the greatest.',
        reference: 'Al-Bukhari, Muslim',
        times: 34
      }
    ]
  },
  {
    id: 4,
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
    id: 5,
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
      }
    ]
  },
  {
    id: 6,
    category: 'Protection',
    categoryArabic: 'الحماية',
    duas: [
      {
        arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
        translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Seeing, The All-Knowing.',
        reference: 'Abu Dawud 4:323, At-Tirmidhi 5:465',
        times: 3
      },
      {
        arabic: 'أَعُوذُ بِكَلِمَاتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        translation: 'I take refuge in the perfect words of Allah from the evil of what He has created.',
        reference: 'Muslim 4:2081',
        times: 3
      }
    ]
  }
];
