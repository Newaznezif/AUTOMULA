import { NextResponse } from "next/server";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { embedMany } from "ai";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";
export const maxDuration = 60;
const BUCKET = "private-documents";
const MAX_BYTES = 10 * 1024 * 1024;
const MAX_TEXT_CHARS = 240_000;
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

function chunkText(input: string, size = 1400, overlap = 180) {
  const text = input.replace(/\r/g,"").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length && chunks.length < 160) {
    let end = Math.min(start + size, text.length);
    if (end < text.length) {
      const boundary = text.lastIndexOf("\n",end);
      if (boundary > start + Math.floor(size * 0.55)) end = boundary;
    }
    const chunk = text.slice(start,end).trim();
    if (chunk.length >= 80) chunks.push(chunk);
    if (end >= text.length) break;
    start = Math.max(start + 1,end - overlap);
  }
  return chunks;
}

async function extractText(file: File, bytes: Uint8Array) {
  if (file.type === "text/plain") return new TextDecoder("utf-8",{fatal:false}).decode(bytes);
  if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
    return result.value;
  }
  if (file.type === "application/pdf") {
    const pdf = await getDocument({ data: bytes, useSystemFonts: true, disableFontFace: true }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => "str" in item ? item.str : "").filter(Boolean).join(" ");
      if (pageText.trim()) pages.push(pageText);
    }
    await pdf.destroy();
    return pages.join("\n\n");
  }
  throw new Error("Unsupported document type.");
}

async function processDocument(supabase: SupabaseClient, userId: string, documentId: string, file: File) {
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    return { processing_status: "pending", processing_message: "Uploaded securely. Connect AI Gateway to extract and index this file." };
  }
  try {
    await supabase.from("documents").update({ processing_status:"processing" }).eq("id",documentId).eq("user_id",userId);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const extracted = (await extractText(file,bytes)).slice(0,MAX_TEXT_CHARS);
    if (extracted.trim().length < 40) throw new Error("No readable text was found. Scanned image-only PDFs need OCR and are not supported yet.");
    const chunks = chunkText(extracted);
    if (!chunks.length) throw new Error("The document did not contain enough readable text to index.");
    const { embeddings } = await embedMany({
      model: process.env.AI_GATEWAY_EMBEDDING_MODEL || "openai/text-embedding-3-small",
      values: chunks,
      maxParallelCalls: 2,
      maxRetries: 1
    });
    const rows = chunks.map((content,index) => ({
      document_id:documentId,user_id:userId,chunk_index:index,content,
      embedding:embeddings[index],
      metadata:{ character_count:content.length, extraction:"text-layer", truncated:extracted.length>=MAX_TEXT_CHARS }
    }));
    const { error: insertError } = await supabase.from("document_chunks").insert(rows);
    if (insertError) throw new Error("Document text was extracted but indexing failed. Check the database migration and vector permissions.");
    await supabase.from("documents").update({ processing_status:"ready" }).eq("id",documentId).eq("user_id",userId);
    return { processing_status:"ready", indexed_chunks:chunks.length };
  } catch (error) {
    await supabase.from("documents").update({ processing_status:"failed" }).eq("id",documentId).eq("user_id",userId);
    return { processing_status:"failed", processing_message:error instanceof Error ? error.message : "Document processing failed." };
  }
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
  const processing = await processDocument(ctx.supabase,ctx.userId,data.id,file);
  return NextResponse.json({ document:{...data,...processing} }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
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
