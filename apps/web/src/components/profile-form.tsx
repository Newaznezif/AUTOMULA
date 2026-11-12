"use client";

import { useState } from "react";
import { CheckCircle2, LoaderCircle, Save } from "lucide-react";

const fields = [
  { name: "full_name", label: "Full name", placeholder: "Your legal or preferred full name" },
  { name: "email", label: "Contact email", placeholder: "you@example.com", type: "email" },
  { name: "phone", label: "Phone number", placeholder: "+251…" },
  { name: "location", label: "Location", placeholder: "City, country" }
];

export function ProfileForm({ initialProfile }: { initialProfile: Record<string, unknown> }) {
  const [values, setValues] = useState<Record<string, string>>({
    full_name: String(initialProfile.full_name ?? ""),
    email: String(initialProfile.email ?? ""),
    phone: String(initialProfile.phone ?? ""),
    location: String(initialProfile.location ?? ""),
    professional_summary: String(initialProfile.professional_summary ?? "")
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Profile could not be saved.");
      setNotice("Profile saved.");
    } catch (e) { setError(e instanceof Error ? e.message : "Profile could not be saved."); }
    finally { setBusy(false); }
  }

  return <form onSubmit={save} className="surface-card p-6">
    <div className="grid gap-5 sm:grid-cols-2">{fields.map(field => <label key={field.name} className="field-label">{field.label}<input type={field.type ?? "text"} value={values[field.name]} onChange={e => setValues(v => ({...v,[field.name]:e.target.value}))} placeholder={field.placeholder} className="mt-2 w-full form-control"/></label>)}</div>
    <label className="field-label mt-5">Professional summary<textarea rows={5} maxLength={3000} value={values.professional_summary} onChange={e => setValues(v => ({...v,professional_summary:e.target.value}))} placeholder="A concise summary grounded in your real experience…" className="mt-2 w-full resize-y form-control"/></label>
    <div className="mt-6 flex flex-wrap items-center gap-4"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{busy ? <LoaderCircle size={15} className="animate-spin"/> : <Save size={15}/>}Save profile</button>{error && <p role="alert" className="text-xs text-rose-300">{error}</p>}{notice && <p role="status" className="flex items-center gap-2 text-xs text-emerald-300"><CheckCircle2 size={14}/>{notice}</p>}</div>
  </form>;
}
