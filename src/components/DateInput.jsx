"use client";

/**
 * components/DateInput.jsx
 * Date input that opens the calendar on ANY click: on the box or on the icon.
 *
 * The browser's own calendar icon is hidden (globals.css) and replaced by our
 * icon button, because the built-in icon behaves differently per browser
 * (its cursor can't always be styled and its click can clash with ours).
 *
 * `className` sizes the wrapper (e.g. "flex-1"), `inputClassName` styles the
 * input itself (e.g. "h-9"); all other props go to the <input>.
 */
import { useRef } from "react";
import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function DateInput({ className, inputClassName, ...props }) {
  const inputRef = useRef(null);

  function openCalendar() {
    const input = inputRef.current;
    if (!input) return;
    input.focus();
    // showPicker() works in all modern browsers; it can throw in rare cases
    // (e.g. inside a cross-origin iframe), so fail quietly
    try {
      input.showPicker?.();
    } catch {
      /* the user can still type the date */
    }
  }

  return (
    <div className={cn("relative w-full min-w-0", className)}>
      <Input ref={inputRef} type="date" onClick={openCalendar} className={cn("w-full pr-9", inputClassName)} {...props} />
      {/* Our calendar icon (tabIndex -1: keyboard users already have the input itself) */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        onClick={openCalendar}
        className="absolute top-1/2 right-1 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <CalendarDays className="size-4" />
      </button>
    </div>
  );
}
