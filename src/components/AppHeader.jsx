"use client";

/**
 * components/AppHeader.jsx
 * Top bar: mobile menu button, current user and logout.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu } from "lucide-react";
import { api } from "@/lib/api";
import { initials } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Logo, NavLinks } from "@/components/Sidebar";

export default function AppHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);

  // Logged-in user (cached for 5 minutes, shared with any other component)
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me").then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  async function handleLogout() {
    await api("/auth/logout", { method: "POST" });
    queryClient.clear(); // forget all cached data from this session
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      {/* Mobile: menu button + slide-in navigation */}
      <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
        <Menu />
      </Button>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="w-64 gap-6 p-4">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <Logo />
          <NavLinks onNavigate={() => setMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 lg:hidden">
        <Logo />
      </div>

      {/* Right side: user + logout */}
      <div className="ml-auto flex items-center gap-3">
        {user && (
          <div className="hidden items-center gap-2 sm:flex">
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold">
              {initials(user.name)}
            </span>
            <div className="leading-tight">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
