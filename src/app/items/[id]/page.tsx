import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteItemButton from "@/components/DeleteItemButton";
import PhotoGallery from "@/components/PhotoGallery";
import { getCurrentUser } from "@/lib/auth";
import { getItem, getRequestTime } from "@/lib/items";
import { formatPrice, getCategory, photoUrl, timeAgo } from "@/lib/market";

export const metadata: Metadata = { title: "판매글 · 고구마마켓" };

// 판매글 상세 화면. 주소의 글 번호(params)는 요청 때 알 수 있으니 Suspense 안에서 읽어요.
export default function ItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/" className="text-sm text-soil-soft hover:text-skin">← 목록으로</Link>
      <Suspense fallback={<p className="py-20 text-center text-soil-soft">고구마 캐는 중…</p>}>
        <ItemDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ItemDetail({ params }: { params: PageProps<"/items/[id]">["params"] }) {
  const { id } = await params;
  const [item, user, now] = await Promise.all([getItem(id), getCurrentUser(), getRequestTime()]);
  if (!item) notFound();

  const category = getCategory(item.category);
  const isMine = user?.id === item.seller_id;
  const done = item.status === "거래완료";
  const edited = item.updated_at !== item.created_at;

  return (
    <article className="card-sack mt-3 overflow-hidden">
      {/* 사진 (여러 장이면 옆으로 넘겨 봐요). 사진이 없으면 카테고리 그림 */}
      {item.photos.length > 0 ? (
        <PhotoGallery urls={item.photos.map(photoUrl)} alt={item.title} dim={done} />
      ) : (
        <div className="grid aspect-[16/9] place-items-center border-b-2 border-soil" style={{ background: category?.tint }}>
          <span className={`text-8xl ${done ? "opacity-40" : ""}`}>{category?.emoji ?? "📦"}</span>
        </div>
      )}

      {/* 판매자 */}
      <div className="flex items-center gap-3 border-b-2 border-dashed border-straw px-5 py-4 sm:px-8">
        <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-soil bg-flesh-soft text-xl">🍠</span>
        <div>
          <p className="font-display">{item.seller?.nickname ?? "알 수 없음"}</p>
          <p className="text-xs text-soil-soft">📍 {item.region ?? "동네 미설정"}</p>
        </div>
      </div>

      <div className="px-5 py-6 sm:px-8">
        <h1 className="flex flex-wrap items-center gap-2 font-display text-2xl">
          {item.status !== "판매중" && (
            <span className={`rounded-md px-2 py-0.5 text-sm text-white ${done ? "bg-soil-soft" : "bg-leaf"}`}>{item.status}</span>
          )}
          {item.title}
        </h1>
        <p className="mt-1 text-xs text-soil-soft">
          <Link href={`/category/${item.category}`} className="underline underline-offset-2 hover:text-skin">
            {category?.name ?? "기타"}
          </Link>
          {" · "}
          {timeAgo(item.created_at, now)}
          {edited && " · 수정됨"}
        </p>
        <p className="mt-4 font-display text-2xl text-skin">{formatPrice(item.price)}</p>
        <p className="mt-5 whitespace-pre-wrap leading-relaxed">
          {item.description || <span className="text-soil-soft">설명이 없어요.</span>}
        </p>

        {/* 내 글이면 고치기 / 지우기 버튼 */}
        {isMine && (
          <div className="mt-8 flex gap-2 border-t-2 border-dashed border-straw pt-5">
            <Link href={`/items/${item.id}/edit`} className="btn-goguma flex-1 px-3! py-2! text-sm!">
              ✏️ 수정
            </Link>
            <DeleteItemButton id={item.id} />
          </div>
        )}
      </div>
    </article>
  );
}
