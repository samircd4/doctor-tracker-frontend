"use client";

/**
 * app/login/page.jsx
 * Login screen. On success the server sets an httpOnly cookie and we
 * send the user to the page they originally wanted (or the dashboard).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Loader2 } from "lucide-react";
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
      {/* Left: brand panel (desktop only) */}
      <section className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Stethoscope className="size-6" /> Doctor Tracker
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold tracking-tight">Doctors, patients and insights in one place.</h2>
          <p className="text-primary-foreground/70">
            Manage doctors, track patients and follow trends from a single dashboard.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Doctor Tracker</p>
      </section>

      {/* Right: login form */}
      <section className="flex items-center justify-center p-4 sm:p-8">
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
