"use client";

/**
 * components/SuggestInput.jsx
 * Text input with a suggestion list (Base UI Autocomplete).
 * The user can pick an existing value OR type a new one.
 * Replaces the browser's <datalist>, whose popup can't be styled
 * (width, radius, cursor) because the browser draws it.
 *
 * Props: id, value, onChange(value), suggestions (string[]), placeholder, aria-invalid
 */
import { Autocomplete } from "@base-ui/react/autocomplete";
import { Input } from "@/components/ui/input";

export default function SuggestInput({ id, value, onChange, suggestions = [], placeholder, "aria-invalid": ariaInvalid }) {
  return (
    <Autocomplete.Root items={suggestions} value={value} onValueChange={(v) => onChange(v)} openOnInputClick>
      {/* Renders our normal shadcn <Input>, so it looks exactly like the other fields */}
      <Autocomplete.Input id={id} placeholder={placeholder} aria-invalid={ariaInvalid} render={<Input />} />

      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4} className="z-50">
          {/* --anchor-width = the input's width, so the list lines up with it */}
          <Autocomplete.Popup className="max-h-60 w-(--anchor-width) overflow-y-auto rounded-md bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10 data-empty:hidden">
            <Autocomplete.List>
              {(item) => (
                <Autocomplete.Item
                  key={item}
                  value={item}
                  className="flex cursor-pointer items-center rounded-sm px-2 py-1.5 outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  {item}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
