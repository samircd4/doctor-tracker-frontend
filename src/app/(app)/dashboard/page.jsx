"use client";

/**
 * app/(app)/dashboard/page.jsx
 * TEMPORARY placeholder to confirm login works.
 * Replaced by the real dashboard (KPIs + charts) in Step 7.
 */
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const router = useRouter();

  // Who is logged in? (also proves the cookie reaches the API)
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me").then((res) => res.data),
  });

  async function handleLogout() {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto w-full max-w-3xl space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-muted-foreground">
        {isLoading ? "Loading..." : `Logged in as ${user?.name} (${user?.email})`}
      </p>
      <Button variant="outline" onClick={handleLogout}>
        Log out
      </Button>
    </main>
  );
}
