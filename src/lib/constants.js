/**
 * lib/constants.js
 * Fixed values shared across pages (must match the backend Patient model).
 */

// Patient conditions, with a label and badge colors for each
export const CONDITIONS = [
  { value: "stable", label: "Stable", className: "bg-emerald-100 text-emerald-700" },
  { value: "recovering", label: "Recovering", className: "bg-sky-100 text-sky-700" },
  { value: "under-observation", label: "Under observation", className: "bg-amber-100 text-amber-700" },
  { value: "critical", label: "Critical", className: "bg-red-100 text-red-700" },
  { value: "discharged", label: "Discharged", className: "bg-slate-100 text-slate-600" },
];

export const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const PAGE_SIZE = 10;
