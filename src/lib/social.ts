// 좋아요·채팅 데이터를 DB에서 읽어 오는 함수들 (서버 전용)
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Item } from "@/lib/market";

// 내가 이 글에 좋아요를 눌렀는지
export async function hasLiked(itemId: number, userId: string | undefined) {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("item_likes")
    .select("item_id")
    .eq("item_id", itemId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

// 관심목록: 내가 좋아요 누른 글 (최근에 누른 순)
export async function getLikedItems(userId: string) {
  await connection();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("item_likes")
    .select("created_at, item:items(*, seller:profiles!items_seller_id_fkey(nickname))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error("관심목록을 불러오지 못했어요: " + error.message);
  return (data ?? []).map((row) => row.item as unknown as Item).filter(Boolean);
}

// ── 채팅 ──────────────────────────────────────────

export type ChatMessage = {
  id: number;
  room_id: number;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type ChatRoom = {
  id: number;
  item_id: number;
  seller_id: string;
  buyer_id: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  item: Pick<Item, "id" | "title" | "price" | "status" | "category" | "photos"> | null;
  seller: { nickname: string } | null;
  buyer: { nickname: string } | null;
};

// 채팅방 + 판매글 요약 + 두 사람 닉네임
// (profiles를 두 번 가리켜서, 어느 연결인지 이름(…_fkey)으로 짚어 줘요)
const ROOM_COLUMNS =
  "*, item:items(id, title, price, status, category, photos), seller:profiles!chat_rooms_seller_id_fkey(nickname), buyer:profiles!chat_rooms_buyer_id_fkey(nickname)";

// 내 채팅 목록 (최근 대화 순) + 방마다 안 읽은 메시지 수
export async function getMyChatRooms(userId: string) {
  await connection();
  const supabase = await createClient();
  const [rooms, unread] = await Promise.all([
    supabase
      .from("chat_rooms")
      .select(ROOM_COLUMNS)
      .or(`seller_id.eq.${userId},buyer_id.eq.${userId}`)
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false }),
    // RLS 덕분에 내가 들어 있는 방의 메시지만 보여요.
    supabase.from("chat_messages").select("room_id").is("read_at", null).neq("sender_id", userId),
  ]);
  if (rooms.error) throw new Error("채팅 목록을 불러오지 못했어요: " + rooms.error.message);

  const unreadByRoom = new Map<number, number>();
  for (const m of unread.data ?? []) unreadByRoom.set(m.room_id, (unreadByRoom.get(m.room_id) ?? 0) + 1);

  return ((rooms.data ?? []) as ChatRoom[]).map((room) => ({ ...room, unread: unreadByRoom.get(room.id) ?? 0 }));
}

// 채팅방 하나 + 최근 메시지 (방의 두 사람이 아니면 null)
export async function getChatRoom(roomId: string) {
  if (!/^\d+$/.test(roomId)) return null;
  await connection();
  const supabase = await createClient();
  const { data: room } = await supabase.from("chat_rooms").select(ROOM_COLUMNS).eq("id", Number(roomId)).maybeSingle();
  if (!room) return null;

  // 최근 200개만 (오래된 것부터 보여 주려고 뒤집어요)
  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("room_id", room.id)
    .order("created_at", { ascending: false })
    .limit(200);

  return { room: room as ChatRoom, messages: ((messages ?? []) as ChatMessage[]).reverse() };
}
