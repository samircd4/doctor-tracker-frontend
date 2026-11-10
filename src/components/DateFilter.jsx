/**
 * components/DateFilter.jsx
 * "From" and "To" date inputs for date-range filtering.
 * Clicking either box opens the calendar (see DateInput).
 */
import DateInput from "@/components/DateInput";

export default function DateFilter({ from, to, onChange, label = "Date" }) {
  return (
    // min-w-0 + flex-1 let the date inputs shrink on narrow phones instead of overflowing
    <div className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2">
      <DateInput
        value={from}
        max={to || undefined} // can't pick a start after the end
        onChange={(e) => onChange({ from: e.target.value, to })}
        aria-label={`${label} from`}
        className="flex-1"
        inputClassName="h-9"
      />
      {/* "to" on wider screens, a short dash on phones to leave room for the dates */}
      <span className="text-sm text-muted-foreground">
        <span className="hidden sm:inline">to</span>
        <span className="sm:hidden">–</span>
      </span>
      <DateInput
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        aria-label={`${label} to`}
        className="flex-1"
        inputClassName="h-9"
      />
    </div>
  );
}
