import { ResourceManager } from "@/components/resource-manager";

export default function ProjectsPage() {
  return <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Portfolio</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Projects and work</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Keep project scope, your role, outcomes, and public links accurate. AI answers can reference these records when relevant.</p><div className="mt-8"><ResourceManager resource="projects" title="Your projects" fields={[{name:"name",label:"Project name",required:true},{name:"description",label:"Description",type:"textarea",required:true},{name:"role",label:"Your role"},{name:"status",label:"Status",type:"select",options:["idea","prototype","MVP","live","paused","completed"]},{name:"website_url",label:"Website URL"},{name:"repository_url",label:"Repository URL"}]}/></div></div>;
}
