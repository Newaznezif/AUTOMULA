"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    setFailed(false);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`
      });
      if (error) throw error;
      setMessage("If this account can receive email, a password reset link has been sent. Check your inbox and spam folder.");
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error ? error.message : "Could not request a password reset. Please try again later.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-7 space-y-4">
      <label className="block text-sm text-slate-300">Email address
        <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="you@example.com" />
      </label>
      <button disabled={busy} className="w-full rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{busy ? "Sending…" : "Send reset link"}</button>
      {message && <p role="status" aria-live="polite" className={`text-sm leading-6 ${failed ? "text-rose-300" : "text-emerald-300"}`}>{message}</p>}
    </form>
  );
}
