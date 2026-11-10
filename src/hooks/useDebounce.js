/**
 * hooks/useDebounce.js
 * Returns `value` only after it has stopped changing for `delay` ms.
 * Used so the search box doesn't call the API on every keystroke.
 */
import { useEffect, useState } from "react";

export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // restart the timer if value changes again
  }, [value, delay]);

  return debounced;
}
