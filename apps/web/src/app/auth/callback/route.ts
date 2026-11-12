import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) return NextResponse.redirect(new URL("/login?error=Supabase+is+not+configured",request.url));
  const code=request.nextUrl.searchParams.get("code");
  if(code){
    const supabase=await createClient();
    const {error}=await supabase.auth.exchangeCodeForSession(code);
    if(!error) return NextResponse.redirect(new URL("/dashboard",request.url));
  }
  return NextResponse.redirect(new URL("/login?error=Email+confirmation+could+not+be+completed",request.url));
}
