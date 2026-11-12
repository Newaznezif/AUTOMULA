import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, FileCheck2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Suggestion = {
  id: string;
  answer: string | null;
  confidence: string;
  status: string;
  source_ids: string[];
  reasoning_summary: string | null;
  needs_review: boolean;
};
type Field = {
  id: string;
  question: string;
  field_type: string;
  required: boolean;
  existing_value_present: boolean;
  answer_suggestions: Suggestion[];
};

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  if (!isSupabaseConfigured()) redirect("/login");

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string") redirect("/login");

  const { data, error } = await supabase.from("form_sessions").select(
    "id,domain,page_url,form_title,status,detected_at,completed_at,form_fields(id,question,field_type,required,existing_value_present,answer_suggestions(id,answer,confidence,status,source_ids,reasoning_summary,needs_review))"
  ).eq("id", id).eq("user_id", userId).maybeSingle();
  if (error || !data) notFound();

  const fields = (data.form_fields ?? []) as unknown as Field[];
  return <div>
    <Link href="/dashboard/applications" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white"><ArrowLeft size={14}/> Back to applications</Link>
    <p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Application history</p>
    <h1 className="mt-2 text-3xl font-semibold tracking-tight">{data.form_title || data.domain}</h1>
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500"><span>{data.domain}</span><span>·</span><span>{new Date(data.detected_at).toLocaleString()}</span><span className="rounded-full bg-white/5 px-2.5 py-1 text-slate-300">{data.status}</span></div>
    {data.page_url && <a href={data.page_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-blue-300 hover:text-blue-200">Open original page <ExternalLink size={12}/></a>}
    <section className="mt-8 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
      <div className="flex items-center justify-between"><h2 className="font-semibold">Reviewed form fields</h2><span className="text-xs text-slate-500">{fields.length} fields</span></div>
      {fields.length===0?<div className="py-12 text-center"><FileCheck2 size={24} className="mx-auto text-slate-600"/><p className="mt-3 text-sm text-slate-400">No field records were saved for this session.</p></div>:<div className="mt-4 space-y-3">{fields.map((field,index)=>{
        const suggestion=field.answer_suggestions?.[0];
        const answer=typeof suggestion?.answer==="string"?suggestion.answer:"";
        return <article key={field.id} className="rounded-xl border border-white/5 bg-slate-950/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Field {index+1} · {field.field_type}{field.required?" · Required":""}</span><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-slate-300">{suggestion?.status || (field.existing_value_present?"Existing value":"Not answered")}</span></div>
          <h3 className="mt-2 text-sm font-medium">{field.question}</h3>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">{answer || "No answer was generated for this field."}</p>
          {suggestion && <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-slate-500"><span>Confidence: {suggestion.confidence}</span><span>·</span><span>{suggestion.source_ids?.length ?? 0} evidence source(s)</span>{suggestion.needs_review&&<span className="text-amber-300">Review pending</span>}</div>}
          {suggestion?.reasoning_summary&&<p className="mt-2 text-xs leading-5 text-slate-500">{suggestion.reasoning_summary}</p>}
        </article>;
      })}</div>}
    </section>
    <p className="mt-4 text-xs text-slate-600">History is read-only. Reopen the original form to create a new review session. AUTOMULA does not submit applications.</p>
  </div>;
}
