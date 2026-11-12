import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

const schema = z.object({ refreshToken: z.string().min(20).max(4096) });

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) return NextResponse.json({ error: "Authentication is unavailable." }, { status: 503 });
  const body = schema.safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "A valid extension session is required." }, { status: 400 });

  const supabase = await createClient();
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: body.data.refreshToken });
  if (error || !data.session) return NextResponse.json({ error: "Extension session expired. Reconnect AUTOMULA from your dashboard." }, { status: 401 });

  return NextResponse.json({
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    expiresAt: data.session.expires_at ?? Math.floor(Date.now() / 1000) + data.session.expires_in
  }, { headers: { "Cache-Control": "no-store" } });
}
