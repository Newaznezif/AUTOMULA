"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Dashboard route error:", error); }, [error]);
  return <main className="app-content"><section className="workspace-state workspace-state-error mx-auto mt-10 max-w-xl" role="alert">
    <div className="flex items-center gap-2 text-rose-600"><AlertTriangle size={18}/><p className="workspace-state-title">This workspace page could not load</p></div>
    <p className="workspace-state-copy">Your data has not been changed. Try loading this page again. If the problem continues, return to the overview and try another section.</p>
    {error.digest && <p className="mt-3 text-[10px] text-slate-400">Reference: {error.digest}</p>}
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={reset} className="workspace-retry mt-0"><RefreshCw size={12} className="mr-2"/>Try again</button><Link href="/dashboard" className="workspace-retry mt-0">Back to overview</Link></div>
  </section></main>;
}
