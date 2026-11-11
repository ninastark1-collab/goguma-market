// DB(items 테이블)에서 판매글을 읽어 오는 함수들 — CRUD 중 R(Read, 읽기)
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, type Item } from "@/lib/market";

// 판매자 닉네임을 profiles 테이블에서 함께 가져와 seller 라는 이름으로 붙여요.
// !items_seller_id_fkey: 좋아요·채팅 표가 생겨서 items↔profiles 연결이 여러 개라, "판매자 연결"이라고 콕 집어 줘요.
const ITEM_COLUMNS = "*, seller:profiles!items_seller_id_fkey(nickname)";

// 목록: 최신순. category를 주면 그 카테고리만.
export async function getItems({ category }: { category?: string } = {}) {
  // 요청이 들어온 뒤에만 실행(항상 최신 글을 보여 주기 위해)
  await connection();
  const supabase = await createClient();

  let query = supabase.from("items").select(ITEM_COLUMNS).order("created_at", { ascending: false }).limit(60);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw new Error("판매글을 불러오지 못했어요: " + error.message);
  return (data ?? []) as Item[];
}

// 검색: 제목에 검색어가 있거나, 카테고리 이름에 검색어가 있으면 보여 줘요.
export async function searchItems(keyword: string) {
  await connection();
  const supabase = await createClient();

  // ilike의 특수문자(%, _)를 글자 그대로 찾도록 앞에 \ 를 붙여요.
  const pattern = `%${keyword.replace(/[\\%_]/g, (c) => "\\" + c)}%`;
  const slugs = CATEGORIES.filter((c) => c.name.includes(keyword)).map((c) => c.slug);

  const [byTitle, byCategory] = await Promise.all([
    supabase.from("items").select(ITEM_COLUMNS).ilike("title", pattern).order("created_at", { ascending: false }).limit(60),
    slugs.length
      ? supabase.from("items").select(ITEM_COLUMNS).in("category", slugs).order("created_at", { ascending: false }).limit(60)
      : Promise.resolve({ data: [], error: null }),
  ]);
  if (byTitle.error) throw new Error("검색하지 못했어요: " + byTitle.error.message);
  if (byCategory.error) throw new Error("검색하지 못했어요: " + byCategory.error.message);

  // 두 결과를 합치고, 겹친 글은 한 번만, 최신순으로 정렬해요.
  const map = new Map<number, Item>();
  for (const it of [...(byTitle.data ?? []), ...(byCategory.data ?? [])] as Item[]) map.set(it.id, it);
  return [...map.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// 글 하나 (상세 화면, 수정 화면용). 없으면 null.
export async function getItem(id: string) {
  if (!/^\d+$/.test(id)) return null; // 주소에 숫자가 아닌 값이 오면 바로 '없음'
  await connection();
  const supabase = await createClient();

  const { data, error } = await supabase.from("items").select(ITEM_COLUMNS).eq("id", Number(id)).maybeSingle();
  if (error) throw new Error("판매글을 불러오지 못했어요: " + error.message);
  return data as Item | null;
}

// "몇 분 전" 계산에 쓸 지금 시각. 화면 그리는 도중 Date.now()를 직접 부르지 않으려고 따로 둬요.
export async function getRequestTime() {
  await connection(); // 요청이 들어온 뒤의 시각이어야 하니까요
  return Date.now();
}
