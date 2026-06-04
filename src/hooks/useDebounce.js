import { useState, useEffect } from 'react';

/**
 * Custom hook to debounce any value changes.
 * Used to limit database re-fetching while the user drags the slider.
 * 
 * @param {*} value The value to debounce.
 * @param {number} delay Delay in milliseconds (e.g., 300ms).
 * @returns {*} The debounced value.
 */
export default function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
