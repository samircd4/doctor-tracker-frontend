/**
 * components/DateFilter.jsx
 * "From" and "To" date inputs for date-range filtering.
 */
import { Input } from "@/components/ui/input";

export default function DateFilter({ from, to, onChange, label = "Date" }) {
  return (
    // min-w-0 + flex-1 let the date inputs shrink on narrow phones instead of overflowing
    <div className="flex w-full min-w-0 items-center gap-2">
      <Input
        type="date"
        value={from}
        max={to || undefined} // can't pick a start after the end
        onChange={(e) => onChange({ from: e.target.value, to })}
        aria-label={`${label} from`}
        className="h-9 min-w-0 flex-1"
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        value={to}
        min={from || undefined}
        onChange={(e) => onChange({ from, to: e.target.value })}
        aria-label={`${label} to`}
        className="h-9 min-w-0 flex-1"
      />
    </div>
  );
}
