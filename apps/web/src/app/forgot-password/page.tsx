import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ForgotPasswordForm } from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 font-black text-white">A</span>
          <span><strong className="block">AUTOMULA</strong><span className="text-xs text-slate-400">FormPilot AI</span></span>
        </Link>
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl shadow-blue-950/20">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Account recovery</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Enter the email address on your AUTOMULA account. We'll send a one-time password reset link if the account can receive email.</p>
          {isSupabaseConfigured()
            ? <ForgotPasswordForm />
            : <p className="mt-6 text-sm text-rose-300">Authentication is not configured.</p>}
        </section>
        <p className="mt-6 text-center text-xs text-slate-500"><Link href="/login" className="hover:text-white">Back to sign in</Link></p>
      </div>
    </main>
  );
}
