/**
 * components/StatCard.jsx
 * One KPI on the dashboard: label, big number, icon, and an optional hint line.
 */
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function StatCard({ label, value, icon: Icon, hint, loading }) {
  return (
    <Card className="gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>

      {loading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">{value}</p>
      )}

      {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
