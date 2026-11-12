"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, LoaderCircle, CheckCircle2 } from "lucide-react";

type Field = { name: string; label: string; placeholder?: string; type?: "text" | "textarea" | "select" | "checkbox"; options?: string[]; required?: boolean };
type Resource = "knowledge" | "projects";

export function ResourceManager({ resource, title, fields }: { resource: Resource; title: string; fields: Field[] }) {
  const [records, setRecords] = useState<Record<string, unknown>[]>([]);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function refresh() {
    setLoading(true);
    try {
      const response = await fetch(`/api/workspace/${resource}`);
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not load records.");
      setRecords(payload.records ?? []);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load records."); }
    finally { setLoading(false); }
  }

  useEffect(() => { void refresh(); }, [resource]);

  async function createRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/workspace/${resource}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save this record.");
      setValues({}); setNotice("Saved to your private workspace."); await refresh();
    } catch (e) { setError(e instanceof Error ? e.message : "Could not save this record."); }
    finally { setSaving(false); }
  }

  async function removeRecord(id: string) {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setError(""); setNotice("");
    try {
      const response = await fetch(`/api/workspace/${resource}`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not delete this record.");
      setRecords(current => current.filter(record => record.id !== id));
      setNotice("Record deleted.");
    } catch (e) { setError(e instanceof Error ? e.message : "Could not delete this record."); }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between"><h2 className="font-semibold">{title}</h2><span className="text-xs text-slate-500">{records.length} records</span></div>
      {loading ? <div className="flex items-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle size={16} className="animate-spin"/>Loading your records…</div> : records.length === 0 ? <div className="py-12 text-center"><div className="mx-auto grid size-11 place-items-center rounded-xl bg-white/5"><Plus size={18} className="text-slate-500"/></div><p className="mt-4 text-sm font-medium">No records yet</p><p className="mt-1 text-xs text-slate-500">Add your first record using the form.</p></div> : <div className="mt-4 divide-y divide-white/5">{records.map(record => <article key={String(record.id)} className="flex items-start justify-between gap-4 py-4"><div className="min-w-0"><p className="text-sm font-medium">{String(record.name ?? record.key ?? "Untitled")}</p><p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-400">{String(record.description ?? record.value ?? "")}</p><div className="mt-2 flex flex-wrap gap-2">{record.category != null && <span className="rounded-full bg-blue-400/10 px-2 py-1 text-[10px] text-blue-200">{String(record.category)}</span>}{record.status != null && <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-400">{String(record.status)}</span>}</div></div><button onClick={() => void removeRecord(String(record.id))} aria-label="Delete record" className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15}/></button></article>)}</div>}
    </section>
    <section className="h-fit rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <div className="flex items-center gap-2"><Plus size={16} className="text-blue-300"/><h2 className="font-semibold">Add a record</h2></div>
      <form onSubmit={createRecord} className="mt-5 space-y-4">{fields.map(field => <label key={field.name} className="block text-xs font-medium text-slate-300">{field.label}{field.type === "checkbox" ? <input type="checkbox" checked={Boolean(values[field.name])} onChange={e => setValues(v => ({...v,[field.name]:e.target.checked}))} className="ml-2 size-4 accent-blue-500"/> : field.type === "textarea" ? <textarea required={field.required} value={String(values[field.name] ?? "")} onChange={e => setValues(v => ({...v,[field.name]:e.target.value}))} placeholder={field.placeholder} rows={4} className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm outline-none focus:border-blue-400"/> : field.type === "select" ? <select value={String(values[field.name] ?? field.options?.[0] ?? "")} onChange={e => setValues(v => ({...v,[field.name]:e.target.value}))} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm outline-none focus:border-blue-400">{field.options?.map(option => <option key={option} value={option}>{option}</option>)}</select> : <input required={field.required} value={String(values[field.name] ?? "")} onChange={e => setValues(v => ({...v,[field.name]:e.target.value}))} placeholder={field.placeholder} className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm outline-none focus:border-blue-400"/>}</label>)}
      {error && <p role="alert" className="text-xs leading-5 text-rose-300">{error}</p>}{notice && <p role="status" className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={14}/>{notice}</p>}
      <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{saving ? <LoaderCircle size={15} className="animate-spin"/> : <Plus size={15}/>}Save record</button></form>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">Only information you enter is stored. Mark facts as verified only after checking their source.</p>
    </section>
  </div>;
}
