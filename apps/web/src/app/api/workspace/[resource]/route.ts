import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const resourceSchema = z.enum(["knowledge", "projects"]);
const knowledgeSchema = z.object({
  key: z.string().trim().min(1).max(160),
  value: z.string().trim().min(1).max(12000),
  category: z.enum(["personal","education","experience","skills","certification","project","achievement","preference","other"]).default("other"),
  source_reference: z.string().trim().max(1000).optional().nullable(),
  verified: z.boolean().default(false)
});
const projectSchema = z.object({
  name: z.string().trim().min(1).max(180),
  description: z.string().trim().max(12000).optional().nullable(),
  role: z.string().trim().max(160).optional().nullable(),
  status: z.string().trim().max(60).optional().nullable(),
  website_url: z.string().url().max(1000).optional().or(z.literal("")).nullable(),
  repository_url: z.string().url().max(1000).optional().or(z.literal("")).nullable()
});
const knowledgeUpdateSchema = z.object({
  id: z.string().uuid(),
  key: z.string().trim().min(1).max(160).optional(),
  value: z.string().trim().min(1).max(12000).optional(),
  category: z.enum(["personal","education","experience","skills","certification","project","achievement","preference","other"]).optional(),
  source_reference: z.string().trim().max(1000).optional().nullable(),
  verified: z.boolean().optional()
}).refine(({ id, ...data }) => Object.keys(data).length > 0);
const projectUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(180).optional(),
  description: z.string().trim().max(12000).optional().nullable(),
  role: z.string().trim().max(160).optional().nullable(),
  status: z.string().trim().max(60).optional().nullable(),
  website_url: z.string().url().max(1000).optional().or(z.literal("")).nullable(),
  repository_url: z.string().url().max(1000).optional().or(z.literal("")).nullable()
}).refine(({ id, ...data }) => Object.keys(data).length > 0);

async function getContext() {
  if (!isSupabaseConfigured()) return { error: "Supabase backend is not connected.", status: 503 as const };
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (typeof userId !== "string") return { error: "Authentication required.", status: 401 as const };
  return { supabase, userId };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: raw } = await params;
  const parsed = resourceSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  const context = await getContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const table = parsed.data === "knowledge" ? "knowledge_items" : "projects";
  const { data, error } = await context.supabase.from(table).select("*").eq("user_id", context.userId).order("created_at", { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: "Could not load records." }, { status: 500 });
  return NextResponse.json({ records: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: raw } = await params;
  const parsedResource = resourceSchema.safeParse(raw);
  if (!parsedResource.success) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  const context = await getContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const body = await request.json().catch(() => null);
  const parsed = parsedResource.data === "knowledge" ? knowledgeSchema.safeParse(body) : projectSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Check the fields and try again.", details: parsed.error.flatten() }, { status: 400 });
  const table = parsedResource.data === "knowledge" ? "knowledge_items" : "projects";
  const { data, error } = await context.supabase.from(table).insert({ ...parsed.data, user_id: context.userId }).select("*").single();
  if (error) return NextResponse.json({ error: "Could not save this record." }, { status: 500 });
  return NextResponse.json({ record: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: raw } = await params;
  const parsedResource = resourceSchema.safeParse(raw);
  if (!parsedResource.success) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  const context = await getContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const body = z.object({ id: z.string().uuid() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "A valid record ID is required." }, { status: 400 });
  const table = parsedResource.data === "knowledge" ? "knowledge_items" : "projects";
  const { error } = await context.supabase.from(table).delete().eq("id", body.data.id).eq("user_id", context.userId);
  if (error) return NextResponse.json({ error: "Could not delete this record." }, { status: 500 });
  return NextResponse.json({ ok: true });
}


export async function PATCH(request: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource: raw } = await params;
  const parsedResource = resourceSchema.safeParse(raw);
  if (!parsedResource.success) return NextResponse.json({ error: "Unknown resource." }, { status: 404 });
  const context = await getContext();
  if ("error" in context) return NextResponse.json({ error: context.error }, { status: context.status });
  const rawBody = await request.json().catch(() => null);
  const parsed = parsedResource.data === "knowledge"
    ? knowledgeUpdateSchema.safeParse(rawBody)
    : projectUpdateSchema.safeParse(rawBody);
  if (!parsed.success) return NextResponse.json({ error: "Check the fields and try again.", details: parsed.error.flatten() }, { status: 400 });
  const { id, ...changes } = parsed.data;
  const table = parsedResource.data === "knowledge" ? "knowledge_items" : "projects";
  const { data, error } = await context.supabase.from(table).update(changes).eq("id", id).eq("user_id", context.userId).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Record not found or could not be updated." }, { status: 404 });
  return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "private, no-store" } });
}
