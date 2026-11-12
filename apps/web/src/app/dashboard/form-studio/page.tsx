import { FormStudio } from "@/components/form-studio";

export default function FormStudioPage() {
  return <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">AI workspace</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Form Studio</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Test the answer engine with form questions. AUTOMULA retrieves your own records, proposes evidence-linked answers, and waits for your review.</p><div className="mt-8"><FormStudio/></div></div>;
}
