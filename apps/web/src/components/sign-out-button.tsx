"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();
  async function signOut(){
    setBusy(true);setError("");
    try{const supabase=createClient();const {error}=await supabase.auth.signOut();if(error)throw error;router.push("/login");router.refresh();}
    catch(e){setError(e instanceof Error?e.message:"Could not sign out.");}
    finally{setBusy(false);}
  }
  return <div><button onClick={()=>void signOut()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"><LogOut size={14}/>{busy?"Signing out…":"Sign out"}</button>{error&&<p role="alert" className="mt-2 text-xs text-rose-300">{error}</p>}</div>;
}
