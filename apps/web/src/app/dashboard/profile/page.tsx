import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
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
  return <div><PageHeader eyebrow="Personal information" title="My profile" description="Maintain your core identity and professional summary. Review every detail before using it in an application."/><div className="mt-6 max-w-3xl"><ProfileForm initialProfile={profile}/></div></div>;
}
