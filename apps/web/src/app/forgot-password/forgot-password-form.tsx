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
    <form onSubmit={submit} className="auth-form">
      <label className="auth-field">Email address
        <input type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} className="auth-input" placeholder="you@example.com" />
      </label>
      <button disabled={busy} className="auth-submit">{busy ? "Sending…" : "Send reset link"}</button>
      {message && <p role="status" aria-live="polite" className={`auth-message ${failed ? "is-error" : "is-success"}`}>{message}</p>}
    </form>
  );
}
