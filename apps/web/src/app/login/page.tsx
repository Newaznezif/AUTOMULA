import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AuthForm } from "./auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const authErrors: Record<string, string> = {
  backend_not_configured: "AUTOMULA's authentication service is not configured. Please contact support.",
  confirmation_link_invalid: "This email link is expired, already used, or invalid. Sign in if your email is confirmed, or request a password reset.",
};

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="auth-page">
      <div className="auth-shell">
        <Link href="/" className="auth-back-link"><ArrowLeft size={14}/> Back to AUTOMULA</Link>
        <section className="auth-card">
          <Link href="/" className="auth-brand"><span className="auth-brand-mark">A</span><span><strong>AUTOMULA</strong><small>FormPilot AI</small></span></Link>
          <div className="auth-heading"><span className="marketing-section-kicker">YOUR PERSONAL WORKSPACE</span><h1>Good information starts here.</h1><p>Sign in to access your profile, knowledge base, documents, and reviewed application history.</p></div>
          {!configured ? (
            <div className="auth-notice" role="status">
              <strong>Backend connection required</strong>
              <p>Connect the dedicated Supabase project by setting NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the Vercel project environment.</p>
            </div>
          ) : <AuthForm initialMode={params.mode === "signup" ? "signup" : "login"} />}
          {params.error && <p role="alert" className="auth-error">{authErrors[params.error] ?? "Authentication could not be completed. Please try again."}</p>}
          <div className="auth-privacy-note"><ShieldCheck size={14}/> Your workspace is private to your account.</div>
        </section>
        <p className="auth-footer">AUTOMULA · FormPilot AI</p>
      </div>
    </main>
  );
}
