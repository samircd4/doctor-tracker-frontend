/**
 * components/ListStates.jsx
 * Loading, empty and error states shared by every list page.
 */
import { AlertCircle, SearchX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

// Grey placeholder rows shown while the first page loads
export function LoadingRows({ rows = 6 }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

// Shown when a list has no results
export function EmptyState({ title = "Nothing here yet", description, action }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-12 text-center">
      <SearchX className="size-8 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

// Shown when a request fails, with a retry button
export function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <AlertCircle className="size-8 text-destructive" />
      <p className="font-medium">Something went wrong</p>
      <p className="text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
