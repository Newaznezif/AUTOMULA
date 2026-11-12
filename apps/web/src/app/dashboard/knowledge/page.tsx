import { ResourceManager } from "@/components/resource-manager";
import { PageHeader } from "@/components/page-header";

export default function KnowledgePage() {
  return <div><PageHeader eyebrow="Knowledge base" title="Your verified facts" description="Store reusable information about your background. AUTOMULA uses these records as evidence when preparing application answers."/><div className="mt-6"><ResourceManager resource="knowledge" title="Knowledge records" fields={[{name:"key",label:"Fact title",placeholder:"e.g. Bachelor of Information Systems",required:true},{name:"value",label:"Details",placeholder:"Write the accurate information…",type:"textarea",required:true},{name:"category",label:"Category",type:"select",options:["personal","education","experience","skills","certification","project","achievement","preference","other"]},{name:"source_reference",label:"Source or reference (optional)",placeholder:"CV, certificate, official URL…"},{name:"verified",label:"I have checked this fact against its source",type:"checkbox"}]}/></div></div>;
}
