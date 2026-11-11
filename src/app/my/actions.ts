"use server";
// 내 정보 관리 Server Actions: 프로필 수정, 비밀번호 바꾸기/찾기, 회원 탈퇴, 알림 읽음
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { AVATARS, PHOTO_BUCKET } from "@/lib/market";

export type FormState = { error?: string; message?: string } | undefined;

// 닉네임·동네·프로필 이모지 저장 (고구마 온도는 DB 규칙상 고칠 수 없어요)
export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my/edit");

  const nickname = String(formData.get("nickname") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? "🍠");
  if (nickname.length < 2 || nickname.length > 12) return { error: "닉네임은 2~12자로 지어 주세요." };
  if (region.length > 30) return { error: "동네 이름이 너무 길어요." };
  if (!AVATARS.includes(avatar)) return { error: "프로필 그림을 다시 골라 주세요." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ nickname, region: region || null, avatar })
    .eq("id", user.id);
  if (error) return { error: "저장하지 못했어요: " + error.message };

  revalidatePath("/", "layout");
  redirect("/my?toast=profile");
}

// 로그인한 상태에서 비밀번호 바꾸기 (비밀번호 찾기 메일 링크로 들어와도 여기서 바꿔요)
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/my/password");

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");
  if (password.length < 6) return { error: "비밀번호는 6자 이상이어야 해요." };
  if (password !== confirm) return { error: "비밀번호가 서로 달라요." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "바꾸지 못했어요: " + error.message };
  redirect("/my?toast=password");
}

// 비밀번호 찾기: 메일로 재설정 링크를 보내요. 링크를 누르면 /auth/callback → /my/password 로 와요.
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "이메일 형식을 확인해 주세요." };

  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/my/password`,
  });
  // 가입 여부를 알려 주지 않으려고, 실패해도 같은 안내를 보여 줘요. (요청 한도 초과만 따로 알려요)
  if (error && error.message.toLowerCase().includes("rate limit"))
    return { error: "요청이 너무 많아요. 잠시 뒤에 다시 시도해 주세요." };
  return { message: `${email} 로 재설정 메일을 보냈어요. (가입된 이메일이면 곧 도착해요)` };
}

// 회원 탈퇴: 내가 올린 사진 파일을 지우고 → 계정을 지우면 글·댓글·채팅이 함께 지워져요.
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (String(formData.get("confirm") ?? "").trim() !== "탈퇴") return { error: "확인 칸에 ‘탈퇴’라고 적어 주세요." };

  const supabase = await createClient();
  // Storage 파일은 DB에서 함께 지워지지 않아서, 내 폴더의 사진을 먼저 지워요.
  const { data: files } = await supabase.storage.from(PHOTO_BUCKET).list(user.id, { limit: 1000 });
  if (files?.length) await supabase.storage.from(PHOTO_BUCKET).remove(files.map((f) => `${user.id}/${f.name}`));

  const { error } = await supabase.rpc("delete_my_goguma_account");
  if (error) return { error: "탈퇴하지 못했어요: " + error.message };

  await supabase.auth.signOut({ scope: "local" });
  revalidatePath("/", "layout");
  redirect("/?toast=goodbye");
}

// 알림을 모두 읽음으로
export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  if (!user) return;
  const supabase = await createClient();
  await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", user.id).is("read_at", null);
  revalidatePath("/", "layout");
}
