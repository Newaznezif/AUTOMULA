"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
        if (error) throw error;
        setMessage(data.session ? "Account created. Opening your workspace…" : "Account created. Check your email to confirm your address.");
        if (data.session) router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block text-sm text-slate-300">Email address
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="you@example.com" />
      </label>
      <label className="block text-sm text-slate-300">Password
        <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="At least 8 characters" />
      </label>
      <button disabled={busy} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      {message && <p role="status" className="text-sm leading-6 text-slate-300">{message}</p>}
      <p className="text-center text-sm text-slate-500">{mode === "signup" ? "Already registered?" : "New to AUTOMULA?"} <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }} className="font-medium text-blue-300 hover:text-blue-200">{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
    </form>
  );
}
