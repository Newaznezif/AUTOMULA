import { FormStudio } from "@/components/form-studio";
import { PageHeader } from "@/components/page-header";

export default function FormStudioPage() {
  return <div><PageHeader eyebrow="Answer workspace" title="Form Studio" description="Test the answer engine with form questions. AUTOMULA retrieves your own records, proposes evidence-linked answers, and waits for your review."/><div className="mt-6"><FormStudio/></div></div>;
}
