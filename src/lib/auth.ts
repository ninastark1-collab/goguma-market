// 지금 로그인한 사용자와 프로필(닉네임)을 가져오는 함수
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  // "이 함수는 요청이 들어온 뒤에만 실행된다"고 Next.js에 알려 줍니다.
  // (Supabase가 내부에서 Date.now()를 쓰기 때문에, 미리 렌더링(prerender) 대상에서 빼야 해요.)
  await connection();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, region, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    nickname: profile?.nickname ?? user.user_metadata?.nickname ?? "고구마",
    region: profile?.region ?? null,
    createdAt: profile?.created_at ?? user.created_at,
  };
}
