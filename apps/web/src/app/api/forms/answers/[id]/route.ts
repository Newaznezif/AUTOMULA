import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/supabase/request";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const editSchema = z.object({ answer: z.string().trim().max(20000) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not connected." }, { status: 503 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid suggestion ID." }, { status: 400 });
  const body = editSchema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Answer must be valid text." }, { status: 400 });
  const auth = await getRequestContext(request);
  if (!auth) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { supabase } = auth;
  const { data, error } = await supabase.from("answer_suggestions").update({
    answer: body.data.answer, status: "draft", needs_review: true
  }).eq("id", id).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Suggestion not found or could not be updated." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
