import { DocumentLibrary } from "@/components/document-library";

export default function DocumentsPage() {
  return <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Private library</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Documents</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Upload CVs, certificates, and supporting documents. Files are stored in a private bucket and are never made public.</p><div className="mt-8"><DocumentLibrary/></div></div>;
}
