import { formatPrice, type Item } from "@/lib/market";

// 매물 한 개 (목록에서 쓰는 카드)
export default function ItemCard({ item }: { item: Item }) {
  const done = item.status === "거래완료";

  return (
    <li className="group flex gap-4 border-b-2 border-dashed border-straw py-4 last:border-b-0 sm:flex-col sm:gap-0 sm:border-b-0 sm:py-0">
      <div
        className="relative grid aspect-square w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 border-soil sm:w-full"
        style={{ background: item.tint }}
      >
        <span className={`text-5xl transition-transform group-hover:scale-110 sm:text-6xl ${done ? "opacity-40" : ""}`}>
          {item.emoji}
        </span>
        <span className="absolute left-2 top-2 rounded-full border border-soil/40 bg-hanji/90 px-2 py-0.5 text-[10px] text-soil-soft">
          예시
        </span>
      </div>

      <div className="min-w-0 flex-1 sm:mt-3">
        <h3 className="line-clamp-2 leading-snug text-soil group-hover:text-skin">{item.title}</h3>
        <p className="mt-1 text-xs text-soil-soft">
          {item.region} · {item.ago}
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-display text-lg">
          {item.status && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-xs text-white ${
                done ? "bg-soil-soft" : "bg-leaf"
              }`}
            >
              {item.status}
            </span>
          )}
          {formatPrice(item.price)}
        </p>
        <p className="mt-1 flex gap-3 text-xs text-soil-soft sm:justify-end">
          {item.chats > 0 && <span>💬 {item.chats}</span>}
          {item.likes > 0 && <span>♡ {item.likes}</span>}
        </p>
      </div>
    </li>
  );
}
