import { useState, useEffect } from 'react';

/**
 * Custom hook for debouncing input values (e.g. search queries)
 * @param {any} value - The input value to debounce
 * @param {number} delay - Delay in milliseconds (default 350ms)
 * @returns {any} The debounced value
 */
export const useDebounce = (value, delay = 350) => {
  // useState hook: manage the debounced state
  const [debouncedValue, setDebouncedValue] = useState(value);

  // useEffect hook: set a timeout to update debouncedValue after the specified delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup timeout if value or delay changes before delay has elapsed
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
