import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { ProfileForm } from "@/components/profile-form";

export default async function ProfilePage() {
  let profile: Record<string, unknown> = {};
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    const userId = claims?.claims?.sub;
    if (typeof userId === "string") {
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
      profile = data ?? {};
    }
  }
  return <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-300">Personal information</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">My profile</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">Maintain your core identity and professional summary. Review every detail before using it in an application.</p><div className="mt-8 max-w-3xl"><ProfileForm initialProfile={profile}/></div></div>;
}
