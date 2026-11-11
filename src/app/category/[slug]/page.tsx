import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import { CATEGORIES, getCategory, SAMPLE_ITEMS } from "@/lib/market";

// 카테고리 페이지는 빌드할 때 미리 만들어 둡니다.
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: `${getCategory(slug)?.name ?? "카테고리"} · 고구마마켓` };
}

export default async function CategoryPage({ params }: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const items = SAMPLE_ITEMS.filter((i) => i.category === slug);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link href="/" className="text-sm text-soil-soft hover:text-skin">← 홈으로</Link>
      <h1 className="mt-3 flex items-center gap-3 font-display text-3xl">
        <span className="text-4xl">{category.emoji}</span>
        {category.name}
      </h1>

      {/* 다른 카테고리로 빠르게 이동 */}
      <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/category/${c.slug}`}
            className={`shrink-0 rounded-full border-2 px-3 py-1 text-sm ${
              c.slug === slug ? "border-soil bg-skin text-white" : "border-soil/30 bg-[#fffaf0] hover:border-skin"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {items.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-8 lg:grid-cols-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ul>
      ) : (
        <div className="stitch mt-8 flex flex-col items-center gap-2 px-6 py-14 text-center">
          <span className="text-5xl">🌱</span>
          <p className="font-display text-xl">아직 이 밭엔 물건이 없어요</p>
          <p className="text-sm text-soil-soft">첫 번째로 물건을 올려 보세요!</p>
          <Link href="/write" className="btn-goguma mt-3 px-4! py-2! text-sm!">+ 내 물건 팔기</Link>
        </div>
      )}
    </div>
  );
}
