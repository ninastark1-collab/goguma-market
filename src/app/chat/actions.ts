"use server";
// '채팅하기' 버튼 Server Action
// 이 글로 나와 판매자 사이에 이미 방이 있으면 그 방으로, 없으면 새로 만들어서 들어가요.
// (메시지 보내기는 대화방 화면에서 브라우저가 직접 DB에 넣어요. RLS가 '방의 두 사람만' 검사해요)

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

export async function startChat(itemId: number) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/items/${itemId}`);

  const supabase = await createClient();
  const { data: item } = await supabase.from("items").select("id, seller_id").eq("id", itemId).maybeSingle();
  if (!item) redirect("/");
  // 내 글이면 구매자 채팅방을 만들 수 없으니, 내 채팅 목록으로 보내요.
  if (item.seller_id === user.id) redirect("/chat");

  const findRoom = () =>
    supabase.from("chat_rooms").select("id").eq("item_id", itemId).eq("buyer_id", user.id).maybeSingle();

  let { data: room } = await findRoom();
  if (!room) {
    const { data: created, error } = await supabase
      .from("chat_rooms")
      .insert({ item_id: itemId, seller_id: item.seller_id, buyer_id: user.id })
      .select("id")
      .single();
    // 23505 = 이미 있는 방(같은 순간 두 번 누름) → 있는 방을 다시 찾아요.
    if (error && error.code !== "23505") throw new Error("채팅방을 만들지 못했어요: " + error.message);
    room = created ?? (await findRoom()).data;
  }
  if (!room) throw new Error("채팅방을 찾지 못했어요.");

  revalidatePath("/", "layout");
  redirect(`/chat/${room.id}`);
}
