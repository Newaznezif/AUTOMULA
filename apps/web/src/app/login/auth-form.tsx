"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ initialMode }: { initialMode: "login" | "signup" }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [messageKind, setMessageKind] = useState<"error" | "success">("error");
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;

        setMessageKind("success");
        setMessage(data.session
          ? "Account created. Opening your workspace…"
          : "If this address is eligible for registration, a confirmation email will arrive. Check your inbox and spam folder.");

        if (data.session) {
          // A single navigation is important: router.refresh() immediately
          // after router.replace() can issue a second concurrent SSR request.
          router.replace("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password
        });
        if (error) {
          if (error.message.toLowerCase().includes("invalid login credentials")) {
            throw new Error("The email or password is incorrect. If you don't remember the password, use Forgot password below.");
          }
          if (error.message.toLowerCase().includes("email not confirmed")) {
            throw new Error("This email is not confirmed yet. Open the latest confirmation email before signing in.");
          }
          throw error;
        }

        // signInWithPassword already persists the returned session through the
        // browser client. Do not call setSession() again: it is redundant and
        // can trigger another refresh-token operation during SSR navigation.
        const { data: stored, error: storageError } = await supabase.auth.getSession();
        if (storageError) {
          throw new Error(
            "Supabase accepted the sign-in, but AUTOMULA could not read the browser session. Reload the page and retry. If this continues, inspect browser cookie storage."
          );
        }

        const session = data.session ?? stored.session;
        if (!session) {
          throw new Error(
            "Supabase accepted the password sign-in but returned no browser session. Check the Supabase Auth response and session configuration."
          );
        }
        if (typeof session.access_token !== "string" || session.access_token.length < 20) {
          throw new Error(
            "Supabase returned a session without a valid access token. The account was not redirected to the workspace."
          );
        }
        if (typeof session.refresh_token !== "string" || session.refresh_token.length < 20) {
          throw new Error(
            "Supabase returned a session without a valid refresh token. The password sign-in succeeded, but the session cannot be safely renewed. Check the Supabase Auth response and browser session storage."
          );
        }

        router.replace("/dashboard");
      }
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Authentication failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <label className="auth-field">Email address
        <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="you@example.com" />
      </label>
      <label className="auth-field">Password
        <input type="password" required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="At least 8 characters" />
      </label>
      {mode === "login" && <div className="auth-forgot"><Link href="/forgot-password">Forgot password?</Link></div>}
      <button disabled={busy} className="auth-submit">{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</button>
      {message && <p role={messageKind === "error" ? "alert" : "status"} aria-live="polite" className={`auth-message ${messageKind === "success" ? "is-success" : "is-error"}`}>{message}</p>}
      <p className="auth-mode-switch">{mode === "signup" ? "Already registered?" : "New to AUTOMULA?"} <button type="button" onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }} className="auth-mode-button">{mode === "signup" ? "Sign in" : "Create an account"}</button></p>
    </form>
  );
}
