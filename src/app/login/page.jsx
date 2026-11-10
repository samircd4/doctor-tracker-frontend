"use client";

/**
 * app/login/page.jsx
 * Login screen. On success the server sets an httpOnly cookie and we
 * send the user to the page they originally wanted (or the dashboard).
 *
 * Layout: brand panel on the left (large screens only), sign-in form on the right.
 */
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Demo account created by the seed script (shown so reviewers can sign in quickly)
const DEMO = { email: "admin@test.com", password: "Admin@123" };

const FEATURES = [
  { icon: Stethoscope, title: "Doctor management", text: "Add doctors and see each doctor's patient list." },
  { icon: Users, title: "Patient records", text: "Search, filter and update patients in seconds." },
  { icon: BarChart3, title: "Live analytics", text: "Track admissions, conditions and workload trends." },
];

// Logo mark on a white rounded tile (so the navy logo is visible on dark backgrounds too)
function LogoMark({ size = 40 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-black/5"
      style={{ width: size, height: size }}
    >
      <Image src="/images/logo-mark.png" alt="" width={size - 10} height={size - 10} />
    </span>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api("/auth/login", { method: "POST", body: form });
      // Read ?next= directly from the URL (avoids needing a Suspense boundary)
      const next = new URLSearchParams(window.location.search).get("next");
      router.replace(next || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    // grid-cols-1 keeps the single mobile column at screen width (no sideways scroll)
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[1.1fr_1fr]">
      {/* ---------- Left: brand panel (large screens only) ---------- */}
      <section className="relative hidden overflow-hidden bg-primary lg:block">
        {/* Photo blended into the brand color, kept subtle.
            No `priority`: this panel is hidden on phones, so it shouldn't be preloaded there. */}
        <Image
          src="/images/login-doctor.jpg"
          alt=""
          fill
          sizes="55vw"
          className="object-cover opacity-25 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/80 to-primary" />

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <LogoMark />
            <div className="leading-tight">
              <p className="text-lg font-semibold">Doctor Tracker</p>
              <p className="text-xs text-white/60">Admin Portal</p>
            </div>
          </div>

          {/* Headline + features */}
          <div className="max-w-lg space-y-10">
            <div className="space-y-4">
              <h1 className="text-4xl leading-tight font-semibold tracking-tight xl:text-5xl">
                Doctors, patients and insights in one secure place.
              </h1>
              <p className="text-base text-white/70">
                A simple admin workspace for managing your medical team and the patients in their care.
              </p>
            </div>

            <ul className="space-y-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                    <Icon className="size-5 text-white" />
                  </span>
                  <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm text-white/60">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-white/50">© {new Date().getFullYear()} Doctor Tracker. All rights reserved.</p>
        </div>
      </section>

      {/* ---------- Right: sign-in form ---------- */}
      <section className="flex flex-col px-6 py-10 sm:px-10">
        {/* Brand on small screens (the left panel is hidden there) */}
        <div className="flex items-center gap-3 lg:hidden">
          <LogoMark size={36} />
          <p className="font-semibold">Doctor Tracker</p>
        </div>

        <div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-center py-10">
          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
            <p className="text-sm text-muted-foreground">Enter your admin credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={form.email}
                  onChange={updateField}
                  placeholder="you@hospital.com"
                  className="h-11 pl-10"
                />
              </div>
            </div>

            {/* Password with show/hide toggle */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={updateField}
                  placeholder="Enter your password"
                  className="h-11 pr-11 pl-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Error message from the API */}
            {error && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="h-11 w-full text-sm" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          {/* Demo account box: fills the form with one click */}
          <div className="mt-8 rounded-xl border bg-muted/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 text-sm">
                <p className="font-medium">Demo account</p>
                <p className="text-muted-foreground">{DEMO.email}</p>
                <p className="text-muted-foreground">{DEMO.password}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={() => setForm(DEMO)}>
                Use demo
              </Button>
            </div>
          </div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Secure admin area. Your session is protected.
        </p>
      </section>
    </main>
  );
}
