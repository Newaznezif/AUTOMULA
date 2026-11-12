import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const profileSchema = z.object({
  full_name: z.string().trim().max(180).optional(),
  email: z.string().trim().email().max(254).or(z.literal("")).optional(),
  phone: z.string().trim().max(60).optional(),
  location: z.string().trim().max(180).optional(),
  professional_summary: z.string().trim().max(3000).optional()
});

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase backend is not connected." }, { status: 503 });
  const body = profileSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Check your profile fields." }, { status: 400 });
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (typeof userId !== "string") return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { error } = await supabase.from("profiles").upsert({ ...body.data, id: userId }, { onConflict: "id" });
  if (error) return NextResponse.json({ error: "Profile could not be saved." }, { status: 500 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
