import Link from "next/link";
import { AuthForm } from "./auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 font-black text-white">A</span>
          <span><strong className="block">AUTOMULA</strong><span className="text-xs text-slate-400">FormPilot AI</span></span>
        </Link>
        <section className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 shadow-2xl shadow-blue-950/20">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Your workspace</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">Sign in or create an account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">Your profile, documents, and application knowledge stay private to your account.</p>
          {!configured ? (
            <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-6 text-amber-100">
              <strong>Backend connection required.</strong>
              <p className="mt-1 text-amber-100/75">Connect a dedicated Supabase project by setting NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the Vercel project environment.</p>
            </div>
          ) : <AuthForm initialMode={params.mode === "signup" ? "signup" : "login"} />}
          {params.error && <p className="mt-4 text-sm text-rose-300">{params.error}</p>}
        </section>
        <p className="mt-6 text-center text-xs text-slate-500"><Link href="/" className="hover:text-white">Back to AUTOMULA</Link></p>
      </div>
    </main>
  );
}
