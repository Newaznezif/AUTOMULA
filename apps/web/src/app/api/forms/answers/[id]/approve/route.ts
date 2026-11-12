import { NextResponse } from "next/server";
import { z } from "zod";
import { getRequestContext } from "@/lib/supabase/request";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Supabase is not connected." }, { status: 503 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid suggestion ID." }, { status: 400 });
  const auth = await getRequestContext(request);
  if (!auth) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { supabase } = auth;
  const { data: suggestion, error: readError } = await supabase.from("answer_suggestions").select("answer").eq("id",id).maybeSingle();
  if (readError || !suggestion) return NextResponse.json({ error: "Suggestion not found." }, { status: 404 });
  if (typeof suggestion.answer !== "string" || !suggestion.answer.trim()) {
    return NextResponse.json({ error: "Empty or unsupported answers cannot be approved. Add verified knowledge or edit the answer first." }, { status: 422 });
  }
  const { error } = await supabase.from("answer_suggestions").update({ status:"approved", needs_review:false }).eq("id",id);
  if (error) return NextResponse.json({ error: "Could not approve this answer." }, { status: 500 });
  return NextResponse.json({ ok:true });
}
