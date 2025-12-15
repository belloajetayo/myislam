import { useState, useEffect } from 'react';

export interface HijriDate {
  day: number;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: number;
  designation: {
    abbreviated: string;
    expanded: string;
  };
  holidays: string[];
}

export interface GregorianDate {
  day: number;
  month: {
    number: number;
    en: string;
  };
  year: number;
  weekday: {
    en: string;
  };
}

export interface DateInfo {
  hijri: HijriDate;
  gregorian: GregorianDate;
}

export const useHijriDate = () => {
  const [dateInfo, setDateInfo] = useState<DateInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDateInfo = async (date?: Date) => {
    try {
      const targetDate = date || new Date();
      const day = String(targetDate.getDate()).padStart(2, '0');
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const year = targetDate.getFullYear();
      
      const response = await fetch(
        `https://api.aladhan.com/v1/gpiToH/${day}-${month}-${year}`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setDateInfo(data.data);
        return data.data;
      } else {
        setError('Failed to fetch Hijri date');
        return null;
      }
    } catch (err) {
      setError('Error loading Hijri date');
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDateInfo();
  }, []);

  return { dateInfo, loading, error, fetchDateInfo };
};

// Islamic months in Arabic and English
export const islamicMonths = [
  { number: 1, en: 'Muharram', ar: 'محرم' },
  { number: 2, en: 'Safar', ar: 'صفر' },
  { number: 3, en: 'Rabi al-Awwal', ar: 'ربيع الأول' },
  { number: 4, en: 'Rabi al-Thani', ar: 'ربيع الثاني' },
  { number: 5, en: 'Jumada al-Awwal', ar: 'جمادى الأولى' },
  { number: 6, en: 'Jumada al-Thani', ar: 'جمادى الثانية' },
  { number: 7, en: 'Rajab', ar: 'رجب' },
  { number: 8, en: 'Shaban', ar: 'شعبان' },
  { number: 9, en: 'Ramadan', ar: 'رمضان' },
  { number: 10, en: 'Shawwal', ar: 'شوال' },
  { number: 11, en: 'Dhul Qadah', ar: 'ذو القعدة' },
  { number: 12, en: 'Dhul Hijjah', ar: 'ذو الحجة' },
];
