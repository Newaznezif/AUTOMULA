import { ExtensionConnectClient } from "./connect-client";

export default function ExtensionPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Browser integration</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Connect your extension</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Pair the Chrome side panel with your account so it can request evidence-grounded answer suggestions for the form you are viewing.</p>
      <div className="mt-8 max-w-2xl"><ExtensionConnectClient /></div>
    </div>
  );
}
