import { ShieldCheck, Database, KeyRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SignOutButton } from "@/components/sign-out-button";

export default function SettingsPage() {
  const connected = isSupabaseConfigured();
  return <div><PageHeader eyebrow="Preferences" title="Settings" description="Manage your account connections and privacy controls."/><div className="mt-6 grid max-w-3xl gap-4">
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"><div className="flex items-center gap-3"><Database size={18} className="text-blue-300"/><div><h2 className="text-sm font-semibold">Data connection</h2><p className="mt-1 text-xs text-slate-500">Supabase authentication, database, and private file storage.</p></div></div><p className={`mt-4 text-xs ${connected?"text-emerald-300":"text-amber-200"}`}>{connected?"Environment variables detected.":"Supabase project connection required."}</p></section>
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"><div className="flex items-center gap-3"><ShieldCheck size={18} className="text-blue-300"/><div><h2 className="text-sm font-semibold">Privacy baseline</h2><p className="mt-1 text-xs leading-5 text-slate-500">Your workspace data is scoped to your authenticated account. Documents use private storage. AI suggestions require user review before browser filling.</p></div></div></section>
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"><div className="flex items-center gap-3"><KeyRound size={18} className="text-blue-300"/><div><h2 className="text-sm font-semibold">Session</h2><p className="mt-1 text-xs text-slate-500">Sign out of this browser session.</p></div></div><div className="mt-4"><SignOutButton/></div></section>
  </div></div>;
}
