"use server";
// 판매글 만들기(Create) / 수정(Update) / 삭제(Delete)를 처리하는 Server Actions
// Server Action: <form action={...}>에서 바로 부르는, 서버에서만 실행되는 함수예요.
// 본인 글인지는 DB의 RLS 정책이 한 번 더 검사하므로, 남의 글은 절대 바뀌지 않아요.
// 사진 파일은 브라우저가 Storage에 먼저 올리고, 여기에는 '사진 경로'만 넘어와요.

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { getCategory, MAX_PHOTOS, PHOTO_BUCKET, STATUSES, type ItemStatus } from "@/lib/market";

export type ItemFormState = {
  error?: string;
  fields?: Record<string, string>;
} | undefined;

// 폼에 적힌 값을 꺼내고 검사해요. 문제가 있으면 error를 돌려줘요.
// userId: 사진 경로가 정말 '내 폴더' 안의 사진인지 확인하는 데 써요.
function readForm(formData: FormData, userId: string) {
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const priceText = String(formData.get("price") ?? "").replace(/[,\s원]/g, "");
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "판매중");
  const photos = formData.getAll("photos").map(String);
  const fields = { title, category, price: priceText, description, status };

  if (title.length < 2 || title.length > 40) return { fields, error: "제목은 2~40자로 적어 주세요." };
  if (!getCategory(category)) return { fields, error: "카테고리를 골라 주세요." };
  if (!/^\d+$/.test(priceText)) return { fields, error: "가격은 숫자로만 적어 주세요. 나눔이면 0을 적어요." };
  const price = Number(priceText);
  if (price > 100_000_000) return { fields, error: "가격은 1억 원까지 적을 수 있어요." };
  if (description.length > 2000) return { fields, error: "설명은 2000자까지 적을 수 있어요." };
  if (!STATUSES.includes(status as ItemStatus)) return { fields, error: "판매 상태를 다시 골라 주세요." };
  if (photos.length > MAX_PHOTOS) return { fields, error: `사진은 ${MAX_PHOTOS}장까지 올릴 수 있어요.` };
  // 사진 경로는 "내아이디/무작위이름.jpg" 모양이어야 해요. (남의 사진을 끌어다 쓰지 못하게)
  const photoPattern = new RegExp(`^${userId}/[0-9a-f-]{36}\\.jpg$`);
  if (!photos.every((p) => photoPattern.test(p))) return { fields, error: "사진 정보가 이상해요. 다시 올려 주세요." };

  return { fields, values: { title, category, price, description, status: status as ItemStatus, photos } };
}

// Storage에서 사진 파일을 지워요. (실패해도 글 작업은 이미 끝났으니 조용히 넘어가요)
async function removePhotos(paths: string[]) {
  if (paths.length === 0) return;
  const supabase = await createClient();
  await supabase.storage.from(PHOTO_BUCKET).remove(paths);
}

// C: 새 판매글 올리기
export async function createItem(_prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/write");

  const form = readForm(formData, user.id);
  if (!form.values) return { error: form.error, fields: form.fields };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .insert({ ...form.values, status: "판매중", seller_id: user.id, region: user.region })
    .select("id")
    .single();

  if (error) return { error: "글을 올리지 못했어요: " + error.message, fields: form.fields };

  revalidatePath("/", "layout");
  redirect(`/items/${data.id}`);
}

// U: 판매글 고치기 (bind로 글 번호를 미리 넣어서 써요)
export async function updateItem(id: number, _prev: ItemFormState, formData: FormData): Promise<ItemFormState> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/items/${id}/edit`);

  const form = readForm(formData, user.id);
  if (!form.values) return { error: form.error, fields: form.fields };

  const supabase = await createClient();
  // 고치기 전 사진 목록 (빠진 사진을 Storage에서 지우려고)
  const { data: before } = await supabase.from("items").select("photos").eq("id", id).eq("seller_id", user.id).maybeSingle();
  if (!before) return { error: "내 글만 고칠 수 있어요.", fields: form.fields };

  // seller_id 조건을 함께 걸어서 본인 글만 고쳐요. (RLS도 같은 검사를 해요)
  const { data, error } = await supabase
    .from("items")
    .update(form.values)
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("id");

  if (error) return { error: "글을 고치지 못했어요: " + error.message, fields: form.fields };
  if (!data?.length) return { error: "내 글만 고칠 수 있어요.", fields: form.fields };

  // 이번에 뺀 사진은 저장 공간에서도 지워요.
  const kept = new Set(form.values.photos);
  await removePhotos((before.photos as string[]).filter((p) => !kept.has(p)));

  revalidatePath("/", "layout");
  redirect(`/items/${id}`);
}

// D: 판매글 지우기 (사진 파일도 함께 지워요)
export async function deleteItem(id: number) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("items")
    .delete()
    .eq("id", id)
    .eq("seller_id", user.id)
    .select("photos");
  if (error) throw new Error("글을 지우지 못했어요: " + error.message);

  await removePhotos(data.flatMap((row) => row.photos as string[]));

  revalidatePath("/", "layout");
  redirect("/");
}
