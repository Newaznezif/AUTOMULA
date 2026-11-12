"use client";

import { useState } from "react";
import { CheckCircle2, CircleAlert, LoaderCircle, Sparkles } from "lucide-react";

type Suggestion = {
  fieldId:string; suggestionId:string|null; answer:string|null;
  confidence:"high"|"medium"|"low"|"unsupported"; sourceIds:string[];
  reasoningSummary:string; needsReview:boolean; approved?:boolean;
};
type Source = {id:string;type:string;label:string;verified:boolean};

export function FormStudio() {
  const [title,setTitle]=useState("");
  const [pageUrl,setPageUrl]=useState("");
  const [questions,setQuestions]=useState("");
  const [answers,setAnswers]=useState<Suggestion[]>([]);
  const [sources,setSources]=useState<Source[]>([]);
  const [sessionId,setSessionId]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [notice,setNotice]=useState("");
  const [savingId,setSavingId]=useState("");

  async function analyze(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setBusy(true);setError("");setNotice("");setAnswers([]);setSources([]);setSessionId("");
    const list=questions.split("\n").map(x=>x.trim()).filter(Boolean);
    if(!list.length){setError("Enter at least one form question.");setBusy(false);return;}
    try{
      const response=await fetch("/api/forms/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        title:title||"Manual form analysis",pageUrl,fields:list.map((question,index)=>({fieldId:`manual-${index+1}`,question,fieldType:"text",required:false,options:[],hasExistingValue:false}))
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Analysis failed.");
      setAnswers(data.answers??[]);setSources(data.sources??[]);setSessionId(data.sessionId??"");setNotice("Suggestions generated and saved to your application history. Review every answer before using it.");
    }catch(e){setError(e instanceof Error?e.message:"Analysis failed.");}
    finally{setBusy(false);}
  }

  async function saveEdit(item:Suggestion,index:number){
    if(!item.suggestionId)return;
    setSavingId(item.suggestionId);setError("");setNotice("");
    try{
      const response=await fetch(`/api/forms/answers/${item.suggestionId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({answer:item.answer??""})});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not save edit.");
      setNotice(`Answer ${index+1} saved. It still requires approval.`);
    }catch(e){setError(e instanceof Error?e.message:"Could not save edit.");}
    finally{setSavingId("");}
  }

  async function approve(item:Suggestion,index:number){
    if(!item.suggestionId||!item.answer?.trim())return;
    setSavingId(item.suggestionId);setError("");setNotice("");
    try{
      const response=await fetch(`/api/forms/answers/${item.suggestionId}/approve`,{method:"POST"});
      const data=await response.json();if(!response.ok)throw new Error(data.error||"Could not approve answer.");
      setAnswers(current=>current.map(row=>row.suggestionId===item.suggestionId?{...row,approved:true}:row));
      setNotice(`Answer ${index+1} approved. The browser extension will be able to fill it after integration is completed.`);
    }catch(e){setError(e instanceof Error?e.message:"Could not approve answer.");}
    finally{setSavingId("");}
  }

  const sourceMap=new Map(sources.map(source=>[source.id,source]));
  const colors={high:"text-emerald-300",medium:"text-blue-300",low:"text-amber-200",unsupported:"text-rose-300"};

  return <div className="space-y-6">
    <section className="surface-card p-5 sm:p-6">
      <div className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-blue-400/10"><Sparkles size={16} className="text-blue-300"/></span><div><p className="section-label">Manual analysis</p><h2 className="surface-heading mt-0.5">Analyze a form</h2></div></div>
      <p className="mt-2 text-xs leading-5 text-slate-500">Paste questions one per line. The page URL is recorded without query parameters. Do not paste passwords, payment data, or authentication codes.</p>
      <form onSubmit={analyze} className="mt-5 grid gap-4">
        <label className="text-xs font-medium text-slate-300">Form title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Fellowship application" className="mt-2 w-full form-control"/></label>
        <label className="text-xs font-medium text-slate-300">Form page URL<input type="url" required value={pageUrl} onChange={e=>setPageUrl(e.target.value)} placeholder="https://example.org/application" className="mt-2 w-full form-control"/></label>
        <label className="text-xs font-medium text-slate-300">Questions<textarea required rows={6} value={questions} onChange={e=>setQuestions(e.target.value)} placeholder={"Tell us about your professional experience.\nDescribe a project you have built.\nWhy are you applying?"} className="mt-2 w-full resize-y form-control"/></label>
        <button disabled={busy} className="inline-flex w-fit items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{busy?<LoaderCircle size={15} className="animate-spin"/>:<Sparkles size={15}/>}Generate grounded suggestions</button>
      </form>
      {error&&<p role="alert" className="mt-4 flex items-start gap-2 text-xs leading-5 text-rose-300"><CircleAlert size={14} className="mt-0.5 shrink-0"/>{error}</p>}
      {notice&&<p role="status" className="mt-4 flex items-start gap-2 text-xs leading-5 text-emerald-300"><CheckCircle2 size={14} className="mt-0.5 shrink-0"/>{notice}</p>}
      {sessionId&&<p className="mt-2 break-all text-[10px] text-slate-600">Session ID: {sessionId}</p>}
    </section>

    {answers.length>0&&<section className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="section-label">Review queue</p><h2 className="mt-1 text-base font-semibold text-slate-800">Suggested answers</h2><p className="mt-1 text-xs text-slate-500">Check the evidence, edit the wording, then approve each answer individually.</p></div><span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">{answers.filter(x=>x.approved).length} of {answers.length} approved</span></div>
      {answers.map((item,index)=><article key={item.fieldId} className="surface-card p-5"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-slate-500">QUESTION {String(index+1).padStart(2,"0")}</p><span className={`text-[11px] font-semibold uppercase ${colors[item.confidence]}`}>{item.confidence} confidence</span></div><textarea value={item.answer??""} disabled={item.confidence==="unsupported"} onChange={e=>setAnswers(current=>current.map(row=>row.fieldId===item.fieldId?{...row,answer:e.target.value}:row))} placeholder="No supported answer. Add evidence to your knowledge base or leave unanswered." rows={4} className="mt-3 w-full resize-y form-control disabled:opacity-60"/><p className="mt-2 text-xs leading-5 text-slate-500">{item.reasoningSummary}</p><div className="mt-3 flex flex-wrap gap-2">{item.sourceIds.map(id=>{const source=sourceMap.get(id);return source?<span key={id} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400">{source.label}{source.verified?" · verified":""}</span>:null;})}</div><div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4"><button onClick={()=>void saveEdit(item,index)} disabled={!item.suggestionId||savingId===item.suggestionId||!item.answer?.trim()||item.approved} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 disabled:opacity-40">{savingId===item.suggestionId?"Saving…":"Save edits"}</button><button onClick={()=>void approve(item,index)} disabled={!item.suggestionId||savingId===item.suggestionId||!item.answer?.trim()||item.approved} className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/25 disabled:opacity-40">{item.approved?<><CheckCircle2 size={13}/>Approved</>:"Approve answer"}</button></div></article>)}
    </section>}
  </div>;
}
