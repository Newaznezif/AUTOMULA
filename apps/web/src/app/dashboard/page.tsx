import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { ArrowUpRight, BookOpen, FileText, FolderKanban, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export default async function DashboardPage() {
  let profileName = "Your workspace";
  let knowledgeCount = 0;
  let projectCount = 0;
  let documentCount = 0;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId === "string") {
      const [profile, knowledge, projects, documents] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
        supabase.from("knowledge_items").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", userId),
        supabase.from("documents").select("id", { count: "exact", head: true }).eq("user_id", userId)
      ]);
      profileName = profile.data?.full_name || String(claims?.claims?.email ?? "Your workspace");
      knowledgeCount = knowledge.count ?? 0;
      projectCount = projects.count ?? 0;
      documentCount = documents.count ?? 0;
    }
  }

  const stats = [
    { label: "Knowledge records", value: knowledgeCount, icon: BookOpen, href: "/dashboard/knowledge" },
    { label: "Documents", value: documentCount, icon: FileText, href: "/dashboard/documents" },
    { label: "Projects", value: projectCount, icon: FolderKanban, href: "/dashboard/projects" }
  ];

  return <div>
    <PageHeader eyebrow="Overview" title={`Welcome, ${profileName.split("@")[0]}`} description="Your verified information becomes the foundation for every application." actions={<Link href="/dashboard/knowledge" className="primary-action">Add knowledge <ArrowUpRight size={15}/></Link>} />
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{stats.map(item => { const Icon=item.icon; return <Link key={item.label} href={item.href} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5 transition hover:border-blue-300/30"><div className="flex items-center justify-between"><Icon size={18} className="text-blue-300"/><ArrowUpRight size={15} className="text-slate-600"/></div><p className="mt-5 text-3xl font-semibold tabular-nums">{item.value}</p><p className="mt-1 text-xs text-slate-500">{item.label}</p></Link>; })}</div>
    <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6"><div className="flex items-center gap-2"><Sparkles size={17} className="text-blue-300"/><h2 className="font-semibold">Build your knowledge base</h2></div><p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">Add accurate facts about your education, work, skills, projects, and achievements. The AI will use only relevant records and show where each suggestion came from.</p><div className="mt-5 flex flex-wrap gap-2"><Link href="/dashboard/profile" className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Complete profile</Link><Link href="/dashboard/projects" className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Add projects</Link><Link href="/dashboard/documents" className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5">Upload documents</Link></div></section>
      <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6"><p className="text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Next step</p><h2 className="mt-3 text-lg font-semibold">Connect your browser</h2><p className="mt-2 text-sm leading-6 text-slate-400">The extension will detect form questions and prepare suggested answers for your approval.</p><Link href="/dashboard/extension" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-blue-300 hover:text-blue-200">Connect your Chrome extension <ArrowUpRight size={13}/></Link></section>
    </div>
  </div>;
}
