import { ResourceManager } from "@/components/resource-manager";
import { PageHeader } from "@/components/page-header";

export default function ProjectsPage() {
  return <div><PageHeader eyebrow="Portfolio" title="Projects and work" description="Keep project scope, your role, outcomes, and public links accurate. AI answers can reference these records when relevant."/><div className="mt-6"><ResourceManager resource="projects" title="Your projects" fields={[{name:"name",label:"Project name",required:true},{name:"description",label:"Description",type:"textarea",required:true},{name:"role",label:"Your role"},{name:"status",label:"Status",type:"select",options:["idea","prototype","MVP","live","paused","completed"]},{name:"website_url",label:"Website URL"},{name:"repository_url",label:"Repository URL"}]}/></div></div>;
}
