/**
 * components/FilterSelect.jsx
 * Styled native <select>. Native selects are accessible by default and open
 * the phone's own picker on mobile.
 *
 * options: array of strings, or { value, label } objects
 */
import { cn } from "@/lib/utils";

export const selectClass =
  "h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

export default function FilterSelect({ value, onChange, options = [], placeholder, className, ...props }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, className)} {...props}>
      <option value="">{placeholder}</option>
      {options.map((option) => {
        const { value: v, label } = typeof option === "string" ? { value: option, label: option } : option;
        return (
          <option key={v} value={v}>
            {label}
          </option>
        );
      })}
    </select>
  );
}
