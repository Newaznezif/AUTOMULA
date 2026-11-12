import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
const BUCKET = "private-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const allowed = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain"
]);

async function context() {
  if (!isSupabaseConfigured()) return { error: "Supabase backend is not connected.", status: 503 as const };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") return { error: "Authentication required.", status: 401 as const };
  return { supabase, userId };
}

export async function GET() {
  const ctx = await context();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { data, error } = await ctx.supabase.from("documents").select("id,filename,mime_type,file_size,processing_status,created_at").eq("user_id", ctx.userId).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Could not load documents." }, { status: 500 });
  return NextResponse.json({ documents: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Choose a document to upload." }, { status: 400 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "File must be between 1 byte and 10 MB." }, { status: 413 });
  if (!allowed.has(file.type)) return NextResponse.json({ error: "Only PDF, DOCX, and plain text files are supported." }, { status: 415 });
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 140);
  const path = `${ctx.userId}/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await ctx.supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return NextResponse.json({ error: "Private upload failed. Check storage setup." }, { status: 500 });
  const { data, error } = await ctx.supabase.from("documents").insert({
    user_id: ctx.userId, filename: safeName, storage_path: path, mime_type: file.type, file_size: file.size, processing_status: "pending"
  }).select("id,filename,mime_type,file_size,processing_status,created_at").single();
  if (error) {
    await ctx.supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: "File uploaded but its record could not be saved." }, { status: 500 });
  }
  return NextResponse.json({ document: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: Request) {
  const ctx = await context();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const parsed = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A valid document ID is required." }, { status: 400 });
  const { data, error } = await ctx.supabase.from("documents").select("storage_path").eq("id", parsed.data.id).eq("user_id", ctx.userId).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Document not found." }, { status: 404 });
  const { error: removeError } = await ctx.supabase.storage.from(BUCKET).remove([data.storage_path]);
  if (removeError) return NextResponse.json({ error: "Stored file could not be deleted." }, { status: 500 });
  const { error: deleteError } = await ctx.supabase.from("documents").delete().eq("id", parsed.data.id).eq("user_id", ctx.userId);
  if (deleteError) return NextResponse.json({ error: "Document metadata could not be deleted." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
