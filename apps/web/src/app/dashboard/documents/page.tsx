import { DocumentLibrary } from "@/components/document-library";
import { PageHeader } from "@/components/page-header";

export default function DocumentsPage() {
  return <div><PageHeader eyebrow="Private library" title="Documents" description="Upload CVs, certificates, and supporting documents. Files are stored in a private bucket and are never made public."/><div className="mt-6"><DocumentLibrary/></div></div>;
}
