import Link from "next/link";

const capabilities = [
  { number: "01", title: "Understand the form", description: "Detect visible questions, field types, required states, and available options." },
  { number: "02", title: "Ground every answer", description: "Match questions to your verified profile, projects, and documents." },
  { number: "03", title: "Review before filling", description: "Edit and approve suggestions. AUTOMULA fills approved fields and verifies the result." }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-black text-white">A</span>
          <span><strong className="block tracking-tight">AUTOMULA</strong><span className="text-xs text-slate-400">FormPilot AI</span></span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/login" className="rounded-xl px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5">Sign in</Link>
          <Link href="/login?mode=signup" className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400">Get started</Link>
        </nav>
      </header>
      <section className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-28">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-200"><span className="size-1.5 rounded-full bg-blue-300" /> AI-assisted browser form automation</div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">Forms handled.<span className="block text-blue-300">Facts preserved.</span></h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400">Your information, organized once. Your application answers, prepared with evidence. Your final submission, always under your control.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/login?mode=signup" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-400">Create your workspace</Link>
            <a href="https://github.com/NewazNezif/AUTOMULA" target="_blank" rel="noreferrer" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5">Explore the source</a>
          </div>
          <p className="mt-5 text-xs text-slate-500">Human approval before filling. No automatic form submissions.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-blue-950/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-sm font-semibold">Answer workspace</p><p className="mt-1 text-xs text-slate-500">Illustrative preview</p></div><span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200">Review required</span></div>
          <div className="space-y-5 py-5">
            <div><p className="text-[10px] font-semibold tracking-widest text-slate-500">QUESTION 01</p><p className="mt-2 text-sm font-medium">Describe your professional experience.</p><div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 text-sm leading-6 text-emerald-100">A suggested answer grounded in selected experience records.</div><p className="mt-2 text-xs text-emerald-300">2 sources linked · High confidence</p></div>
            <div><p className="text-[10px] font-semibold tracking-widest text-slate-500">QUESTION 02</p><p className="mt-2 text-sm font-medium">What problem does your project solve?</p><div className="mt-3 rounded-xl border border-white/10 bg-slate-950/70 p-4 text-sm text-slate-400">Draft generated from your project knowledge…</div><p className="mt-2 text-xs text-amber-200">Check details before approval</p></div>
          </div>
          <div className="flex gap-2 border-t border-white/10 pt-4"><span className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-xs text-slate-300">Edit response</span><span className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-center text-xs font-semibold text-white">Approve answer</span></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl border-t border-white/10 px-6 py-14 lg:px-10">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-blue-300">How it works</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{capabilities.map(item => <article key={item.number} className="rounded-2xl border border-white/10 bg-white/[.025] p-5"><p className="text-xs text-blue-300">{item.number}</p><h2 className="mt-4 text-lg font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p></article>)}</div>
      </section>
      <footer className="mx-auto flex max-w-7xl flex-col gap-2 border-t border-white/10 px-6 py-6 text-xs text-slate-500 sm:flex-row sm:justify-between lg:px-10"><span>© {new Date().getFullYear()} AUTOMULA · FormPilot AI</span><span>Built around accuracy, privacy, and user control.</span></footer>
    </main>
  );
}
