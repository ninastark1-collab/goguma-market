// 이메일 인증 링크를 누르면 이 주소로 돌아옵니다.
// URL의 code를 세션(로그인 상태)으로 바꿔 쿠키에 저장합니다.
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}/?welcome=1`);
  }

  return NextResponse.redirect(`${origin}/login?error=confirm`);
}
