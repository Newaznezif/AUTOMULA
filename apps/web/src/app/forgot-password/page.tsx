import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return <main className="auth-page"><div className="auth-shell">
    <Link href="/login" className="auth-back-link"><ArrowLeft size={14}/> Back to sign in</Link>
    <section className="auth-card">
      <Link href="/" className="auth-brand"><span className="auth-brand-mark">A</span><span><strong>AUTOMULA</strong><small>FormPilot AI</small></span></Link>
      <div className="auth-heading"><span className="marketing-section-kicker">ACCOUNT RECOVERY</span><h1>Reset your password</h1><p>Enter the email address on your AUTOMULA account. We’ll send a one-time reset link if the account can receive email.</p></div>
      {isSupabaseConfigured() ? <ForgotPasswordForm/> : <div className="auth-notice" role="status"><strong>Authentication is not configured</strong><p>Connect the dedicated Supabase project before using account recovery.</p></div>}
      <div className="auth-privacy-note"><ShieldCheck size={14}/> Password recovery is protected by Supabase authentication.</div>
    </section><p className="auth-footer">AUTOMULA · FormPilot AI</p>
  </div></main>;
}
