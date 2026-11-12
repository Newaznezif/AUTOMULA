"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setFailed(false);
    if (password !== confirmPassword) {
      setFailed(true);
      setMessage("The passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setMessage("Password updated. Opening your workspace…");
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setFailed(true);
      setMessage(error instanceof Error
        ? error.message
        : "The reset link may have expired. Request a new one and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label className="auth-field">New password
        <input type="password" required minLength={8} autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} className="auth-input" placeholder="At least 8 characters" />
      </label>
      <label className="block text-sm text-slate-300">Confirm new password
        <input type="password" required minLength={8} autoComplete="new-password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm outline-none focus:border-blue-400" placeholder="Enter the password again" />
      </label>
      <button disabled={busy} className="auth-submit">{busy ? "Updating…" : "Update password"}</button>
      {message && <p role="status" aria-live="polite" className={`auth-message ${failed ? "is-error" : "is-success"}`}>{message}</p>}
    </form>
  );
}
