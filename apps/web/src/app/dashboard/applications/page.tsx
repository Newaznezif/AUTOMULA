import Link from "next/link";
import { Clock3, ExternalLink, FileCheck2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function ApplicationsPage() {
  let sessions: Record<string, unknown>[] = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId === "string") {
      const { data } = await supabase.from("form_sessions").select("id,domain,page_url,form_title,status,detected_at,completed_at").eq("user_id",userId).order("detected_at",{ascending:false}).limit(100);
      sessions = data ?? [];
    }
  }
  return <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">History</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Applications</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Review previous form sessions, generated suggestions, and fill outcomes. AUTOMULA never submits an application for you.</p><section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Recent form sessions</h2><span className="text-xs text-slate-500">{sessions.length} sessions</span></div>{sessions.length===0?<div className="py-14 text-center"><FileCheck2 size={25} className="mx-auto text-slate-600"/><p className="mt-3 text-sm font-medium">No application history yet</p><p className="mt-1 text-xs text-slate-500">Your reviewed form sessions will appear here after browser integration is enabled.</p><Link href="/dashboard" className="mt-4 inline-flex text-xs text-blue-300 hover:text-blue-200">Return to overview <ExternalLink size={12} className="ml-1"/></Link></div>:<div className="mt-4 divide-y divide-white/5">{sessions.map(session=><article key={String(session.id)} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium">{String(session.form_title||session.domain)}</p><p className="mt-1 text-xs text-slate-500">{String(session.domain)} · {new Date(String(session.detected_at)).toLocaleString()}</p></div><span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">{String(session.status)}</span></article>)}</div>}</section><p className="mt-4 flex items-center gap-2 text-xs text-slate-600"><Clock3 size={13}/> Session history is private to your account.</p></div>;
}
