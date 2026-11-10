/**
 * lib/constants.js
 * Fixed values shared across pages (must match the backend Patient model).
 */

// Patient conditions: label, badge classes, and the matching chart color
export const CONDITIONS = [
  { value: "stable", label: "Stable", className: "bg-emerald-100 text-emerald-700", color: "#10b981" },
  { value: "recovering", label: "Recovering", className: "bg-sky-100 text-sky-700", color: "#0ea5e9" },
  { value: "under-observation", label: "Under observation", className: "bg-amber-100 text-amber-700", color: "#f59e0b" },
  { value: "critical", label: "Critical", className: "bg-red-100 text-red-700", color: "#ef4444" },
  { value: "discharged", label: "Discharged", className: "bg-slate-100 text-slate-600", color: "#94a3b8" },
];

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const PAGE_SIZE = 10;

// Brand navy from the logo (same as --primary in globals.css). Charts need a
// real color value because SVG attributes can't read CSS variables reliably.
export const BRAND_COLOR = "#0f184d";
