"use client";

/**
 * components/FilterSelect.jsx
 * Dropdown used for filters and form fields (built on the shadcn/Base UI Select,
 * so the option list is our own HTML: styled, keyboard friendly, pointer cursor).
 *
 * Props:
 *  value / onChange  — selected value as a string ("" = nothing selected)
 *  options           — array of strings, or { value, label } objects
 *  placeholder       — text shown when nothing is selected
 *  allowEmpty        — adds the placeholder as the first item so the user can
 *                      clear the choice (on for filters, off for required form fields)
 *  id / aria-label   — for <Label htmlFor> and screen readers
 */
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function FilterSelect({
  value,
  onChange,
  options = [],
  placeholder,
  allowEmpty = true,
  id,
  className,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}) {
  // Normalise to { value, label } so strings and objects both work
  const items = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  // Base UI uses null for "nothing selected"; the "All …" item maps back to ""
  const allItems = allowEmpty ? [{ value: null, label: placeholder }, ...items] : items;

  return (
    <Select items={allItems} value={value || null} onValueChange={(v) => onChange(v ?? "")}>
      <SelectTrigger id={id} aria-label={ariaLabel} aria-invalid={ariaInvalid} className={cn("h-9 w-full min-w-0 bg-background", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {allItems.map((item) => (
          <SelectItem key={item.value ?? "__all"} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
