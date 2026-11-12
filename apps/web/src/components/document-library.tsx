"use client";

import { useEffect, useState } from "react";
import { FileText, LoaderCircle, Trash2, UploadCloud } from "lucide-react";

type Doc = { id: string; filename: string; mime_type: string | null; file_size: number | null; processing_status: string; created_at: string };

export function DocumentLibrary() {
  const [documents,setDocuments] = useState<Doc[]>([]);
  const [busy,setBusy] = useState(false);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [notice,setNotice] = useState("");

  async function refresh() {
    setLoading(true);
    try { const r=await fetch("/api/documents"); const d=await r.json(); if(!r.ok) throw new Error(d.error||"Could not load documents."); setDocuments(d.documents??[]); }
    catch(e){setError(e instanceof Error?e.message:"Could not load documents.");}
    finally{setLoading(false);}
  }
  useEffect(()=>{void refresh();},[]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form=event.currentTarget; const input=form.elements.namedItem("file") as HTMLInputElement; const file=input.files?.[0]; if(!file)return;
    setBusy(true);setError("");setNotice("");
    try { const data=new FormData();data.set("file",file);const r=await fetch("/api/documents",{method:"POST",body:data});const d=await r.json();if(!r.ok)throw new Error(d.error||"Upload failed.");setNotice("Document uploaded to your private library.");form.reset();await refresh(); }
    catch(e){setError(e instanceof Error?e.message:"Upload failed.");}
    finally{setBusy(false);}
  }

  async function remove(id:string){
    if(!window.confirm("Permanently delete this document?"))return;
    setError("");setNotice("");
    try{const r=await fetch("/api/documents",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Delete failed.");setDocuments(list=>list.filter(x=>x.id!==id));setNotice("Document deleted.");}
    catch(e){setError(e instanceof Error?e.message:"Delete failed.");}
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Your files</h2><span className="text-xs text-slate-500">{documents.length} files</span></div>
      {loading?<div className="py-12 text-sm text-slate-500">Loading private files…</div>:documents.length===0?<div className="py-12 text-center"><FileText size={24} className="mx-auto text-slate-600"/><p className="mt-3 text-sm font-medium">No documents uploaded</p><p className="mt-1 text-xs text-slate-500">Add a CV or supporting document to get started.</p></div>:<div className="mt-4 divide-y divide-white/5">{documents.map(doc=><div key={doc.id} className="flex items-center justify-between gap-3 py-4"><div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-400/10"><FileText size={17} className="text-blue-300"/></div><div className="min-w-0"><p className="truncate text-sm font-medium">{doc.filename}</p><p className="mt-1 text-xs text-slate-500">{doc.processing_status} · {doc.file_size?Math.ceil(doc.file_size/1024)+" KB":"Size unknown"}</p></div></div><button onClick={()=>void remove(doc.id)} aria-label="Delete document" className="rounded-lg p-2 text-slate-500 hover:bg-rose-400/10 hover:text-rose-300"><Trash2 size={15}/></button></div>)}</div>}
    </section>
    <section className="h-fit rounded-2xl border border-white/10 bg-slate-900/40 p-5"><UploadCloud size={20} className="text-blue-300"/><h2 className="mt-3 font-semibold">Upload a document</h2><p className="mt-1 text-xs leading-5 text-slate-500">PDF, DOCX, or TXT. Maximum 10 MB per file.</p><form onSubmit={upload} className="mt-5 space-y-4"><input required name="file" type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="block w-full text-xs text-slate-400 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-200"/><button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50">{busy?<LoaderCircle size={15} className="animate-spin"/>:<UploadCloud size={15}/>}Upload securely</button></form>{error&&<p role="alert" className="mt-4 text-xs text-rose-300">{error}</p>}{notice&&<p role="status" className="mt-4 text-xs text-emerald-300">{notice}</p>}<p className="mt-5 text-[11px] leading-5 text-slate-600">Private storage only. Text extraction and AI indexing will be activated after the processing pipeline is connected.</p></section>
  </div>;
}
