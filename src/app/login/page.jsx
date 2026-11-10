"use client";

/**
 * app/login/page.jsx
 * Login screen. On success the server sets an httpOnly cookie and we
 * send the user to the page they originally wanted (or the dashboard).
 */
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Stethoscope, Loader2, ShieldCheck, Users, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left: photo + brand panel (desktop only) */}
      <section className="relative hidden overflow-hidden lg:block">
        {/* Background photo (local file in /public, optimized by next/image) */}
        <Image
          src="/images/login-doctor.jpg"
          alt="Doctor with a stethoscope using a phone"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        {/* Dark gradient on top of the photo so the white text stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/60 to-slate-900/30" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 text-white">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="flex size-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
              <Stethoscope className="size-5" />
            </span>
            Doctor Tracker
          </div>

          <div className="max-w-md space-y-6">
            <div className="space-y-3">
              <h2 className="text-4xl font-semibold leading-tight tracking-tight">
                Doctors, patients and insights in one place.
              </h2>
              <p className="text-white/75">
                Manage doctors, track patients and follow trends from a single dashboard.
              </p>
            </div>

            {/* Short feature list */}
            <ul className="space-y-3 text-sm text-white/85">
              <li className="flex items-center gap-3">
                <Users className="size-4 text-sky-300" /> Doctor &amp; patient management
              </li>
              <li className="flex items-center gap-3">
                <BarChart3 className="size-4 text-sky-300" /> Live analytics dashboard
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="size-4 text-sky-300" /> Secure, cookie-based login
              </li>
            </ul>
          </div>

          <p className="text-sm text-white/50">© {new Date().getFullYear()} Doctor Tracker</p>
        </div>
      </section>

      {/* Right: login form */}
      <section className="flex flex-col items-center justify-center gap-6 p-4 sm:p-8">
        {/* Mobile/tablet only: smaller photo banner (the big panel is hidden below lg) */}
        <div className="relative h-44 w-full max-w-sm overflow-hidden rounded-2xl lg:hidden">
          <Image
            src="/images/login-doctor.jpg"
            alt="Doctor with a stethoscope using a phone"
            fill
            priority
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-lg font-semibold leading-snug text-white">
            Doctors, patients and insights in one place.
          </p>
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="mb-2 flex items-center gap-2 font-semibold lg:hidden">
              <Stethoscope className="size-5" /> Doctor Tracker
            </div>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <CardDescription>Sign in to the admin portal</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={form.email}
                  onChange={updateField}
                  placeholder="admin@test.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={updateField}
                />
              </div>

              {error && (
                <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <Button type="submit" className="h-10 w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {loading ? "Signing in..." : "Sign in"}
              </Button>

              {/* Demo credentials hint, only shown in development */}
              {process.env.NODE_ENV !== "production" && (
                <p className="text-center text-xs text-muted-foreground">Demo: admin@test.com / Admin@123</p>
              )}
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
