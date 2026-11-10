/**
 * lib/format.js
 * Small display helpers.
 */
import { format } from "date-fns";

// "12 Nov 2026" (or "—" when there is no date)
export function formatDate(value) {
  return value ? format(new Date(value), "d MMM yyyy") : "—";
}

// "John Smith" -> "JS" (used for avatar circles)
export function initials(name = "") {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}
