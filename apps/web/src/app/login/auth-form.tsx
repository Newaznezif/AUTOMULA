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
          router.replace("/dashboard");
          router.refresh();
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

        // Explicitly persist the complete session returned by the password
        // grant, then read it back. This catches browser-cookie persistence
        // problems at login instead of discovering them later during pairing.
        const loginSession = data.session;
        if (
          !loginSession?.access_token ||
          typeof loginSession.refresh_token !== "string" ||
          loginSession.refresh_token.length < 20
        ) {
          throw new Error(
            "Supabase authenticated this account but did not return a complete browser session (refresh token missing). Check the Supabase Auth response and project configuration."
          );
        }

        const { error: persistError } = await supabase.auth.setSession({
          access_token: loginSession.access_token,
          refresh_token: loginSession.refresh_token
        });
        if (persistError) {
          throw new Error(
            "Sign-in succeeded, but AUTOMULA could not persist the Supabase browser session. Check browser cookie settings and Supabase SSR configuration."
          );
        }

        const { data: persisted, error: readError } = await supabase.auth.getSession();
        if (
          readError ||
          !persisted.session?.access_token ||
          typeof persisted.session.refresh_token !== "string" ||
          persisted.session.refresh_token.length < 20
        ) {
          throw new Error(
            "Sign-in succeeded, but the browser could not read back the complete Supabase session. Check cookie storage and the Supabase SSR client configuration."
          );
        }

        router.replace("/dashboard");
        router.refresh();
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
