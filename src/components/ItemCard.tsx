import Link from "next/link";
import { formatPrice, getCategory, timeAgo, type Item } from "@/lib/market";

// 매물 한 개 (목록에서 쓰는 카드). 누르면 상세 화면으로 가요.
// now: 몇 분 전인지 계산할 기준 시각 (목록 전체가 같은 기준을 쓰도록 밖에서 받아요)
export default function ItemCard({ item, now }: { item: Item; now: number }) {
  const done = item.status === "거래완료";
  const category = getCategory(item.category);

  return (
    <li className="border-b-2 border-dashed border-straw last:border-b-0 sm:border-b-0">
      <Link href={`/items/${item.id}`} className="group flex gap-4 py-4 sm:flex-col sm:gap-0 sm:py-0">
        {/* 사진 자리: 사진 기능 전까지 카테고리 그림을 보여 줘요 */}
        <div
          className="relative grid aspect-square w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-soil sm:w-full"
          style={{ background: category?.tint }}
        >
          <span className={`text-5xl transition-transform group-hover:scale-110 sm:text-6xl ${done ? "opacity-40" : ""}`}>
            {category?.emoji ?? "📦"}
          </span>
        </div>

        <div className="min-w-0 flex-1 sm:mt-3">
          <h3 className="line-clamp-2 leading-snug text-soil group-hover:text-skin">{item.title}</h3>
          <p className="mt-1 text-xs text-soil-soft">
            {item.region ?? "동네 미설정"} · {timeAgo(item.created_at, now)}
          </p>
          <p className="mt-1 flex items-center gap-1.5 font-display text-lg">
            {item.status !== "판매중" && (
              <span className={`rounded-md px-1.5 py-0.5 text-xs text-white ${done ? "bg-soil-soft" : "bg-leaf"}`}>
                {item.status}
              </span>
            )}
            {formatPrice(item.price)}
          </p>
        </div>
      </Link>
    </li>
  );
}
