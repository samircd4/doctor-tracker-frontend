"use client";

/**
 * components/Sidebar.jsx
 * Main navigation. Used in the desktop sidebar and inside the mobile menu sheet.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: Users },
];

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 px-2 text-base font-semibold">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Stethoscope className="size-4" />
      </span>
      Doctor Tracker
    </Link>
  );
}

// `onNavigate` lets the mobile sheet close itself after a link is clicked
export function NavLinks({ onNavigate }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        // "/doctors/123" should still highlight "Doctors"
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

// Fixed sidebar for large screens (hidden on mobile, where the header menu is used)
export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-6 border-r bg-background p-4 lg:flex">
      <Logo />
      <NavLinks />
    </aside>
  );
}
