import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\\\")) {
    return "/dashboard";
  }
  return value;
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);

  if (!isSupabaseConfigured()) {
    loginUrl.searchParams.set("error", "backend_not_configured");
    return NextResponse.redirect(loginUrl);
  }

  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const nextPath = safeNextPath(searchParams.get("next"));
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(nextPath, request.url));
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType
    });
    if (!error) return NextResponse.redirect(new URL(nextPath, request.url));
  }

  // A confirmation/recovery link is single-use. Do not expose its token or
  // Supabase's internal error details in the browser URL.
  loginUrl.searchParams.set("error", "confirmation_link_invalid");
  return NextResponse.redirect(loginUrl);
}
