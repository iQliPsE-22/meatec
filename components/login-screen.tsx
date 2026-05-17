"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { useAppState } from "@/lib/app-state";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LoginScreen() {
  const router = useRouter();
  const { state, login, setTheme, clearError } = useAppState();
  const [username, setUsername] = useState<string>(DEMO_CREDENTIALS.username);
  const [password, setPassword] = useState<string>(DEMO_CREDENTIALS.password);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (state.session) {
      router.replace("/dashboard");
    }
  }, [router, state.session]);

  const isDark = state.theme === "dark";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearError();

    const didLogin = await login({ username, password });
    if (didLogin) {
      router.push("/dashboard");
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border bg-card text-card-foreground shadow-lg lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative overflow-hidden px-6 py-8 sm:px-10 sm:py-12 lg:px-14">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task Manager
              </p>
              <h1 className="mt-4 max-w-xl text-3xl font-semibold leading-tight text-balance sm:text-4xl">
                Organize your work and stay on top of your priorities.
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? "Light" : "Dark"} mode
            </Button>
          </div>

          <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground [text-wrap:pretty]">
            A clean, responsive task management dashboard with mocked authentication and persisted state for local development and testing.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              ["Secure Auth", "Mocked JWT and protected routes."],
              ["Task Management", "Create, edit, and organize your tasks easily."],
              ["Persistent Storage", "Your data stays intact across reloads."],
            ].map(([title, description]) => (
              <Card key={title} className="bg-muted/50 border-none shadow-none">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm uppercase tracking-wide">{title}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border bg-muted/30 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Demo Access
                </p>
                <p className="mt-1 text-base font-medium">Use the test credentials</p>
              </div>
              <div className="rounded-xl bg-background px-4 py-3 text-sm font-medium border">
                <p>
                  Username: <span className="font-mono text-primary">{DEMO_CREDENTIALS.username}</span>
                </p>
                <p className="mt-1">
                  Password: <span className="font-mono text-primary">{DEMO_CREDENTIALS.password}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center border-t bg-muted/10 px-6 py-8 sm:px-10 sm:py-12 lg:border-t-0 lg:border-l">
          <div className="mx-auto w-full max-w-md">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight">Sign In</h2>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to access your dashboard.
              </p>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter username"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="h-12"
                />
              </div>

              {state.error ? (
                <Alert variant="destructive">
                  <AlertDescription>{state.error}</AlertDescription>
                </Alert>
              ) : null}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={state.authStatus === "loading"}
              >
                {state.authStatus === "loading" ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
