"use client";

/**
 * components/DateInput.jsx
 * Date input that opens the calendar when you click anywhere in the box
 * (by default browsers only open it from the small calendar icon).
 */
import { Input } from "@/components/ui/input";

export default function DateInput(props) {
  function openCalendar(e) {
    // showPicker() is supported in all modern browsers; it can throw in rare
    // cases (e.g. inside a cross-origin iframe), so fail quietly
    try {
      e.currentTarget.showPicker?.();
    } catch {
      /* the user can still type the date or use the icon */
    }
  }

  return <Input type="date" onClick={openCalendar} {...props} />;
}
