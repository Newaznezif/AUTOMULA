import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, BriefcaseBusiness, FileText, FolderKanban, LayoutDashboard, Settings, UserRound, BookOpen, Sparkles, WandSparkles, Puzzle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "My profile", icon: UserRound },
  { href: "/dashboard/knowledge", label: "Knowledge base", icon: BookOpen },
  { href: "/dashboard/documents", label: "Documents", icon: FileText },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/form-studio", label: "Form studio", icon: WandSparkles },
  { href: "/dashboard/extension", label: "Connect extension", icon: Puzzle },
  { href: "/dashboard/applications", label: "Applications", icon: BriefcaseBusiness },
  { href: "/dashboard/settings", label: "Settings", icon: Settings }
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let email = "Workspace preview";
  const connected = isSupabaseConfigured();

  if (connected) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const claimEmail = data?.claims?.email;
    if (!claimEmail) redirect("/login");
    email = String(claimEmail);
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="border-b border-white/10 bg-slate-950/80 px-5 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
        <Link href="/" className="flex items-center gap-3 px-2">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 font-black text-white">A</span>
          <span><strong className="block tracking-tight">AUTOMULA</strong><span className="text-xs text-slate-500">FormPilot AI</span></span>
        </Link>
        <div className="mt-9 hidden text-[10px] font-semibold uppercase tracking-[.2em] text-slate-600 lg:block">Workspace</div>
        <nav className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-4 lg:grid-cols-1">
          {nav.map(item => {
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"><Icon size={17}/>{item.label}</Link>;
          })}
        </nav>
        <div className="mt-8 hidden rounded-2xl border border-blue-400/15 bg-blue-400/5 p-4 lg:block">
          <Sparkles size={17} className="text-blue-300"/>
          <p className="mt-3 text-sm font-medium">FormPilot AI</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Build your verified knowledge base before automating applications.</p>
        </div>
        <div className="mt-8 hidden border-t border-white/10 pt-4 lg:block"><p className="truncate text-xs text-slate-500">{email}</p><p className="mt-1 text-[10px] text-slate-600">{connected ? "Authenticated session" : "Backend not connected"}</p></div>
      </aside>
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
          <div><p className="text-xs text-slate-500">Personal workspace</p><p className="mt-1 text-sm font-medium">Your automation hub</p></div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-xs text-slate-400"><Activity size={14} className={connected ? "text-emerald-400" : "text-amber-300"}/>{connected ? "Backend connected" : "Preview mode"}</div>
        </header>
        {!connected && <div className="border-b border-amber-300/15 bg-amber-300/5 px-5 py-3 text-xs leading-5 text-amber-100/80 sm:px-8">Preview mode: connect the dedicated Supabase project to enable accounts, storage, and persistent data. No sample records are presented as real user data.</div>}
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}
