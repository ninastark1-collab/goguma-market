"use client";
// 판매글 쓰기 / 고치기에 같이 쓰는 입력 폼
// (사진 올리기는 아직 없어요. 다음 단계에서 추가할 예정)

import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import { CATEGORIES, STATUSES, type Item } from "@/lib/market";
import type { ItemFormState } from "@/app/items/actions";

type Props = {
  action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
  item?: Item; // 있으면 '고치기' 화면
};

export default function ItemForm({ action, item }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // 검사에 걸려 되돌아오면 방금 적은 값, 아니면 원래 글의 값을 보여 줘요.
  const v = state?.fields ?? {
    title: item?.title ?? "",
    category: item?.category ?? "",
    price: item ? String(item.price) : "",
    description: item?.description ?? "",
    status: item?.status ?? "판매중",
  };

  return (
    // key: 되돌아온 값이 바뀌면 입력칸을 새 값으로 다시 채우게 해요.
    <form key={JSON.stringify(v)} action={formAction} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="font-display">제목</span>
        <input className="field" name="title" placeholder="예) 호박고구마 10kg 한 박스" minLength={2} maxLength={40} defaultValue={v.title} required />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-display">카테고리</span>
        <select className="field" name="category" defaultValue={v.category} required>
          <option value="" disabled>어떤 물건인가요?</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-display">가격</span>
        <div className="relative">
          <input className="field w-full pr-10" name="price" inputMode="numeric" placeholder="0" defaultValue={v.price} required />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-soil-soft">원</span>
        </div>
        <span className="text-xs text-soil-soft">0원으로 적으면 &lsquo;나눔 🧡&rsquo;으로 올라가요.</span>
      </label>

      {/* 판매 상태는 글을 올린 뒤 '고치기'에서만 바꿀 수 있어요 */}
      {item && (
        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1.5 font-display">판매 상태</legend>
          <div className="flex gap-2">
            {STATUSES.map((s) => (
              <label key={s} className="flex-1">
                <input type="radio" name="status" value={s} defaultChecked={v.status === s} className="peer sr-only" />
                <span className="block cursor-pointer rounded-xl border-2 border-soil/40 bg-[#fffaf0] py-2 text-center text-sm peer-checked:border-soil peer-checked:bg-skin peer-checked:text-white peer-focus-visible:ring-4 peer-focus-visible:ring-flesh/40">
                  {s}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="font-display">자세한 설명</span>
        <textarea
          className="field min-h-40 resize-y"
          name="description"
          maxLength={2000}
          placeholder="물건 상태, 산 시기, 거래 장소 등을 적어 주세요."
          defaultValue={v.description}
        />
      </label>

      <FormMessage error={state?.error} />

      <button type="submit" className="btn-goguma w-full" disabled={pending}>
        {pending ? "밭에 심는 중…" : item ? "고친 내용 저장하기" : "동네에 올리기"}
      </button>
    </form>
  );
}
