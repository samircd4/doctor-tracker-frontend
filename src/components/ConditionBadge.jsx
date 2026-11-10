/**
 * components/ConditionBadge.jsx
 * Colored pill for a patient's condition (colors defined in lib/constants.js).
 */
import { CONDITIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function ConditionBadge({ condition }) {
  const info = CONDITIONS.find((c) => c.value === condition);
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", info?.className)}>
      {info?.label ?? condition}
    </span>
  );
}
