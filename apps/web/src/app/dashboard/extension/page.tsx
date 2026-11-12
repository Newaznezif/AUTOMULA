import { ExtensionConnectClient } from "./connect-client";
import { PageHeader } from "@/components/page-header";

export default function ExtensionPage() {
  return (
    <div>
      <PageHeader eyebrow="Browser integration" title="Connect your extension" description="Pair the Chrome side panel with your account so it can request evidence-grounded answer suggestions for the form you are viewing."/>
      <div className="mt-6 max-w-2xl"><ExtensionConnectClient /></div>
    </div>
  );
}
