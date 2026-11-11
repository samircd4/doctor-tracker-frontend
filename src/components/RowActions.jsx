/**
 * components/RowActions.jsx
 * Edit + Delete icon buttons for a table row or card.
 * `label` names the record for screen readers ("Edit Jane Doe").
 * Each button only renders when its handler is passed (e.g. admins only).
 */
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RowActions({ label, onEdit, onDelete }) {
  return (
    <div className="flex justify-end gap-1">
      {onEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Edit ${label}`}
          onClick={(e) => {
            e.stopPropagation(); // don't trigger a clickable row underneath
            onEdit();
          }}
        >
          <Pencil />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Delete ${label}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
