const capabilities = [
  {
    number: "01",
    title: "Understand the form",
    description: "Detect visible questions, field types, required states, and available options.",
  },
  {
    number: "02",
    title: "Ground every answer",
    description: "Match questions to your own verified profile, projects, and documents.",
  },
  {
    number: "03",
    title: "Review before filling",
    description: "Edit and approve suggestions. AUTOMULA fills approved fields and verifies the result.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 md:px-10">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <a href="/" className="flex items-center gap-3" aria-label="AUTOMULA home">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-500 text-lg font-black text-white">A</span>
          <span>
            <span className="block text-lg font-semibold tracking-tight">AUTOMULA</span>
            <span className="block text-xs text-slate-400">FormPilot AI</span>
          </span>
        </a>
        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-slate-300">
          Early development · v0.1
        </span>
      </header>

      <section className="grid flex-1 items-center gap-14 py-20 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs text-blue-200">
            <span className="size-1.5 rounded-full bg-blue-300" />
            AI-assisted browser form automation
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.08] tracking-tight md:text-7xl">
            Forms handled.
            <span className="block text-blue-300">Facts preserved.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-400">
            AUTOMULA helps you understand online forms, prepare answers from your own knowledge, and fill supported fields after your approval.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#how-it-works" className="rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">
              Explore the workflow
            </a>
            <a href="https://github.com/NewazNezif/AUTOMULA" className="rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
              View source
            </a>
          </div>
          <p className="mt-5 text-xs text-slate-500">
            No automatic submissions. You remain in control of every answer.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl shadow-blue-950/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm font-semibold">Form review</p>
              <p className="mt-1 text-xs text-slate-500">Illustrative interface preview</p>
            </div>
            <span className="rounded-full bg-amber-400/10 px-2.5 py-1 text-xs text-amber-200">Needs review</span>
          </div>
          <div className="space-y-5 py-5">
            <div>
              <p className="text-xs text-slate-400">QUESTION 01</p>
              <p className="mt-2 text-sm font-medium">What is your project name?</p>
              <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-100">
                Suggested answer · Your verified knowledge
              </div>
              <p className="mt-2 text-xs text-emerald-300">Source available · High confidence</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">QUESTION 02</p>
              <p className="mt-2 text-sm font-medium">Describe the solution.</p>
              <div className="mt-3 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-slate-400">
                AI-generated draft based on selected project records…
              </div>
              <p className="mt-2 text-xs text-amber-200">Review required · Supporting sources</p>
            </div>
          </div>
          <div className="flex gap-2 border-t border-white/10 pt-4">
            <span className="flex-1 rounded-lg border border-white/10 px-3 py-2 text-center text-xs text-slate-300">Edit answers</span>
            <span className="flex-1 rounded-lg bg-blue-500 px-3 py-2 text-center text-xs font-semibold text-white">Approve selected</span>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-white/10 py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">The workflow</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {capabilities.map((item) => (
            <article key={item.number} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs text-blue-300">{item.number}</p>
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} AUTOMULA · FormPilot AI</span>
        <span>Human-approved browser automation</span>
      </footer>
    </main>
  );
}
