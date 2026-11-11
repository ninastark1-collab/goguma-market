import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar, TempBadge } from "@/components/Avatar";
import CommentForm from "@/components/CommentForm";
import DeleteCommentButton from "@/components/DeleteCommentButton";
import DeleteItemButton from "@/components/DeleteItemButton";
import LikeButton from "@/components/LikeButton";
import PhotoGallery from "@/components/PhotoGallery";
import { BlockButton, ReportButton } from "@/components/SafetyButtons";
import { DetailSkeleton } from "@/components/Skeletons";
import { BumpButton, ReviewForm } from "@/components/TradeForms";
import { startChat } from "@/app/chat/actions";
import { markSold } from "@/app/items/trade-actions";
import { getCurrentUser } from "@/lib/auth";
import { getBlockedIds, getItem, getRequestTime } from "@/lib/items";
import { formatPrice, getCategory, photoUrl, timeAgo } from "@/lib/market";
import { getComments, hasLiked } from "@/lib/social";
import { getChatPartnersForItem, getProfile, hasReviewed, isBlockedByMe } from "@/lib/trust";

// 카톡·SNS에 링크를 보내면 보이는 미리보기 (제목·설명·대표 사진)
// 이 화면은 원래 요청 때 그려지는 부분이 있어서, 메타데이터도 요청 때 만들어도 돼요.
export async function generateMetadata({ params }: PageProps<"/items/[id]">): Promise<Metadata> {
  const { id } = await params;
  const item = await getItem(id);
  if (!item) return { title: "판매글 · 고구마마켓" };
  const description = `${formatPrice(item.price)} · ${item.region ?? "우리 동네"} · ${item.description.slice(0, 80)}`;
  const images = item.photos[0] ? [{ url: photoUrl(item.photos[0]) }] : undefined;
  return {
    title: `${item.title} · 고구마마켓`,
    description,
    openGraph: { title: item.title, description, images, siteName: "고구마마켓", type: "website" },
  };
}

// 판매글 상세 화면. 주소의 글 번호(params)는 요청 때 알 수 있으니 Suspense 안에서 읽어요.
export default function ItemPage({ params }: PageProps<"/items/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:max-w-5xl">
      <Link href="/" className="text-sm text-soil-soft hover:text-skin">← 목록으로</Link>
      <Suspense fallback={<DetailSkeleton />}>
        <ItemDetail params={params} />
      </Suspense>
    </div>
  );
}

// 끌어올리기까지 남은 시간 (24시간에 한 번)
function bumpWait(bumpedAt: string, now: number) {
  const left = new Date(bumpedAt).getTime() + 24 * 3600_000 - now;
  if (left <= 0) return undefined;
  const h = Math.floor(left / 3600_000);
  return h >= 1 ? `${h}시간 뒤 가능` : `${Math.ceil(left / 60_000)}분 뒤 가능`;
}

async function ItemDetail({ params }: { params: PageProps<"/items/[id]">["params"] }) {
  const { id } = await params;
  const [item, user, now] = await Promise.all([getItem(id), getCurrentUser(), getRequestTime()]);
  if (!item) notFound();

  const category = getCategory(item.category);
  const isMine = user?.id === item.seller_id;
  const isBuyer = !!user && user.id === item.buyer_id;
  const done = item.status === "거래완료";
  const edited = item.updated_at !== item.created_at;
  const bumped = new Date(item.bumped_at).getTime() - new Date(item.created_at).getTime() > 60_000;

  const [liked, comments, blockedIds, blockedSeller, partners, reviewed, buyer] = await Promise.all([
    hasLiked(item.id, user?.id),
    getComments(item.id),
    getBlockedIds(user?.id),
    isBlockedByMe(user?.id, item.seller_id),
    isMine ? getChatPartnersForItem(item.id) : Promise.resolve([]),
    done && (isMine || isBuyer) ? hasReviewed(item.id, user?.id) : Promise.resolve(true),
    done && item.buyer_id && (isMine || isBuyer) ? getProfile(item.buyer_id) : Promise.resolve(null),
  ]);
  // 내가 차단한 사람의 댓글은 안 보여요.
  const visibleComments = comments.filter((c) => !blockedIds.includes(c.author_id));
  const back = `/items/${item.id}`;

  return (
    <>
      <article className="card-sack mt-3 overflow-hidden lg:grid lg:grid-cols-2">
        {/* 왼쪽(PC) / 위(휴대폰): 사진. 사진이 없으면 카테고리 그림 */}
        <div className="lg:border-r-2 lg:border-soil">
          {item.photos.length > 0 ? (
            <PhotoGallery urls={item.photos.map(photoUrl)} alt={item.title} dim={done} />
          ) : (
            <div
              className="flex aspect-[16/9] flex-col items-center justify-center gap-2 border-b-2 border-soil lg:aspect-square lg:border-b-0"
              style={{ background: category?.tint }}
            >
              <span className={`text-8xl ${done ? "opacity-40" : ""}`}>{category?.emoji ?? "📦"}</span>
              <span className="rounded-full bg-hanji/80 px-3 py-0.5 text-xs text-soil-soft">사진이 없는 글이에요</span>
            </div>
          )}
        </div>

        {/* 오른쪽(PC) / 아래(휴대폰): 정보 */}
        <div className="flex flex-col">
          {/* 판매자: 누르면 프로필로 */}
          <Link
            href={`/users/${item.seller_id}`}
            className="flex items-center gap-3 border-b-2 border-dashed border-straw px-5 py-4 hover:bg-flesh-soft/30 sm:px-8"
          >
            <Avatar emoji={item.seller?.avatar} size={44} />
            <span className="min-w-0 flex-1">
              <span className="block font-display">{item.seller?.nickname ?? "알 수 없음"}</span>
              <span className="block text-xs text-soil-soft">📍 {item.region ?? "동네 미설정"}</span>
            </span>
            {/* 좁은 칸이라 숫자형(compact)으로: 36.5℃ 🌱 */}
            <span className="flex shrink-0 flex-col items-end">
              <TempBadge temp={Number(item.seller?.manner_temp ?? 36.5)} compact />
              <span className="text-[10px] text-soil-soft">고구마 온도</span>
            </span>
          </Link>

          <div className="flex-1 px-5 py-6 sm:px-8">
            {blockedSeller && (
              <p className="mb-4 rounded-xl bg-hanji-deep px-3 py-2 text-sm text-soil-soft">🚫 내가 차단한 사용자의 글이에요.</p>
            )}
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
              {bumped ? `끌올 ${timeAgo(item.bumped_at, now)}` : timeAgo(item.created_at, now)}
              {edited && " · 수정됨"}
            </p>
            <p className="mt-1 text-xs text-soil-soft">
              ♡ 관심 {item.like_count} · 💬 채팅 {item.chat_count} · 댓글 {visibleComments.length}
            </p>
            {item.accept_offers && !done && (
              <p className="mt-3 inline-block rounded-full border-2 border-flesh bg-flesh-soft px-3 py-0.5 text-xs">
                💰 가격 제안 받아요 — 채팅에서 원하는 가격을 제안해 보세요
              </p>
            )}
            <p className="mt-5 whitespace-pre-wrap leading-relaxed">
              {item.description || <span className="text-soil-soft">설명이 없어요.</span>}
            </p>

            {/* 내 글이면: 수정·삭제 / 끌어올리기 / 거래완료(구매자 고르기) */}
            {isMine && (
              <div className="mt-8 flex flex-col gap-3 border-t-2 border-dashed border-straw pt-5">
                <div className="flex gap-2">
                  <Link href={`/items/${item.id}/edit`} className="btn-goguma flex-1 px-3! py-2! text-sm!">✏️ 수정</Link>
                  <DeleteItemButton id={item.id} />
                </div>
                {!done && <BumpButton itemId={item.id} waitText={bumpWait(item.bumped_at, now)} />}

                {(!done || !item.buyer_id) && (
                  <details className="stitch bg-[#fffaf0]/70 px-4 py-3" open={done && !item.buyer_id}>
                    <summary className="cursor-pointer font-display text-sm">🤝 거래완료로 바꾸기 (구매자 고르기)</summary>
                    {partners.length === 0 ? (
                      <p className="mt-2 text-xs text-soil-soft">
                        이 글로 채팅한 사람이 아직 없어요. 구매자와 채팅으로 거래한 뒤 여기서 고를 수 있어요.
                        (채팅 없이 팔았다면 ‘수정’에서 상태만 거래완료로 바꿔도 돼요)
                      </p>
                    ) : (
                      <ul className="mt-2 flex flex-col gap-1.5">
                        {partners.map((p) => (
                          <li key={p.id}>
                            {/* bind: 어떤 글을, 누구에게 팔았는지 미리 넣은 액션 */}
                            <form action={markSold.bind(null, item.id, p.buyer_id, back)}>
                              <button type="submit" className="flex w-full items-center gap-2 rounded-xl border-2 border-soil/30 bg-hanji px-3 py-2 text-left text-sm hover:border-skin">
                                <Avatar emoji={p.buyer?.avatar} size={28} />
                                <span className="flex-1">{p.buyer?.nickname ?? "알 수 없음"}님에게 팔았어요</span>
                                <span className="text-soil-soft">›</span>
                              </button>
                            </form>
                          </li>
                        ))}
                      </ul>
                    )}
                  </details>
                )}
              </div>
            )}

            {/* 거래가 끝났으면: 판매자↔구매자 서로 후기 */}
            {done && item.buyer_id && (isMine || isBuyer) && (
              <div className="mt-6 rounded-2xl border-2 border-dashed border-straw bg-[#fffaf0]/70 px-4 py-4">
                {reviewed ? (
                  <p className="text-sm text-soil-soft">💌 이 거래의 후기를 보냈어요. 고마워요!</p>
                ) : isMine ? (
                  <ReviewForm itemId={item.id} revieweeId={item.buyer_id} revieweeName={buyer?.nickname ?? "구매자"} />
                ) : (
                  <ReviewForm itemId={item.id} revieweeId={item.seller_id} revieweeName={item.seller?.nickname ?? "판매자"} />
                )}
              </div>
            )}

            {/* 남의 글이면: 신고·차단 */}
            {user && !isMine && (
              <div className="mt-6 flex justify-end gap-4">
                <ReportButton targetType="item" targetId={item.id} back={back} label="🚨 이 글 신고" />
                <BlockButton otherId={item.seller_id} nickname={item.seller?.nickname ?? "판매자"} back={back} blocked={blockedSeller} />
              </div>
            )}
          </div>

          {/* 아래 거래 막대: ♡ 좋아요 | 가격 | 채팅하기 */}
          <div className="flex items-center gap-3 border-t-2 border-soil bg-hanji-deep/60 px-5 py-3 sm:px-8">
            <LikeButton itemId={item.id} liked={liked} count={item.like_count} loggedIn={!!user} disabled={isMine} />
            <span className="h-10 w-0.5 bg-straw" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-xl text-skin">{formatPrice(item.price)}</span>
              {item.accept_offers && !done && <span className="block text-[11px] text-soil-soft">가격 제안 가능</span>}
            </span>
            {isMine ? (
              <Link href="/chat" className="btn-straw shrink-0 text-sm">💬 대화 중인 채팅 {item.chat_count}</Link>
            ) : (
              // bind: 어떤 글로 채팅할지(id)를 미리 넣은 액션. 로그인 안 했으면 로그인 화면으로 가요.
              <form action={startChat.bind(null, item.id)}>
                <button type="submit" className="btn-goguma shrink-0 px-5! py-2.5! text-sm!" disabled={done || blockedSeller}>
                  {done ? "거래완료" : blockedSeller ? "차단한 사용자" : "채팅하기"}
                </button>
              </form>
            )}
          </div>
        </div>
      </article>

      {/* 댓글: 누구나 보고, 로그인한 사람만 써요 */}
      <section className="card-sack mt-6 px-5 py-5 sm:px-8" aria-label="댓글">
        <h2 className="font-display text-xl">
          댓글 <span className="text-skin">{visibleComments.length}</span>
        </h2>

        {visibleComments.length === 0 ? (
          <p className="mt-3 text-sm text-soil-soft">아직 댓글이 없어요. 첫 댓글을 남겨 보세요 🌱</p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-dashed divide-straw">
            {visibleComments.map((c) => {
              const bySeller = c.author_id === item.seller_id;
              // 지우기: 댓글 쓴 사람이거나, 이 글의 판매자일 때
              const canDelete = !!user && (user.id === c.author_id || isMine);
              return (
                <li key={c.id} className="py-3">
                  {/* div: 안에 삭제 버튼(form)이 들어가서 <p>를 쓰면 안 돼요 (HTML 규칙) */}
                  <div className="flex items-center gap-1.5 text-sm">
                    <Avatar emoji={c.author?.avatar} size={24} />
                    <Link href={`/users/${c.author_id}`} className="font-display hover:text-skin">{c.author?.nickname ?? "알 수 없음"}</Link>
                    {bySeller && <span className="rounded-md bg-skin px-1.5 py-0.5 text-[10px] text-white">판매자</span>}
                    <span className="text-xs text-soil-soft">· {timeAgo(c.created_at, now)}</span>
                    <span className="ml-auto flex items-center gap-3">
                      {user && user.id !== c.author_id && (
                        <ReportButton targetType="comment" targetId={c.id} back={back} label="신고" />
                      )}
                      {canDelete && <DeleteCommentButton commentId={c.id} itemId={item.id} />}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap break-words pl-[30px] leading-relaxed">{c.body}</p>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-4 border-t-2 border-dashed border-straw pt-4">
          {user ? (
            <CommentForm itemId={item.id} />
          ) : (
            <Link href={`/login?next=/items/${item.id}`} className="btn-straw block text-center text-sm">
              로그인하고 댓글 남기기
            </Link>
          )}
        </div>
      </section>
    </>
  );
}
