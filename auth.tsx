import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { STORE } from "@/lib/format";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Owner access — ${STORE.name}` },
      { name: "description", content: "Private sign-in for the store owner." },
      { property: "og:title", content: `Owner access — ${STORE.name}` },
      { property: "og:description", content: "Private store management sign-in." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }

      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.success("Account created. Please check your email, then sign in.");
        setMode("signin");
        return;
      }

      await supabase.rpc("claim_admin");
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: session.session.user.id,
        _role: "admin",
      });

      if (!isAdmin) {
        await supabase.auth.signOut();
        toast.error("This account is not authorised to manage the store.");
        return;
      }

      toast.success("Welcome back");
      void navigate({ to: "/admin" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-16">
      <div className="surface-card p-6">
        <div className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground">
          <ShieldCheck className="size-5" />
        </div>
        <h1 className="mt-4 font-display text-2xl">Owner access</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Private dashboard for managing products, stock and orders. Customers never need an account.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Email
            </Label>
            <Input
              type="email"
              required
              autoComplete="email"
              className="h-12 rounded-xl"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Password
            </Label>
            <Input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              className="h-12 rounded-xl"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-full">
            {busy && <Loader2 className="mr-2 size-4 animate-spin" />}
            {mode === "signup" ? "Create owner account" : "Sign in"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-gold"
        >
          {mode === "signin"
            ? "First time here? Create the owner account"
            : "Already have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}
