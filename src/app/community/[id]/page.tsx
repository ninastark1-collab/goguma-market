import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { DeletePostButton, DeletePostCommentButton, PostCommentForm } from "@/components/CommunityForms";
import { ReportButton } from "@/components/SafetyButtons";
import { DetailSkeleton } from "@/components/Skeletons";
import { getCurrentUser } from "@/lib/auth";
import { getPost, getPostComments, topicEmoji } from "@/lib/community";
import { getBlockedIds, getRequestTime } from "@/lib/items";
import { timeAgo } from "@/lib/market";

// 링크 공유 미리보기: 동네생활 글의 주제와 첫 문장
export async function generateMetadata({ params }: PageProps<"/community/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) return { title: "동네생활 · 고구마마켓" };
  const title = `[${post.topic}] ${post.body.slice(0, 30)}${post.body.length > 30 ? "…" : ""}`;
  const description = `${post.region ?? "우리 동네"} 이웃의 이야기 · ${post.body.slice(0, 80)}`;
  return { title: `${title} · 고구마마켓 동네생활`, description, openGraph: { title, description, siteName: "고구마마켓", type: "article" } };
}

export default function PostPage({ params }: PageProps<"/community/[id]">) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/community" className="text-sm text-soil-soft hover:text-skin">← 동네생활</Link>
      <Suspense fallback={<DetailSkeleton />}>
        <PostDetail params={params} />
      </Suspense>
    </div>
  );
}

async function PostDetail({ params }: { params: PageProps<"/community/[id]">["params"] }) {
  const { id } = await params;
  const [post, user, now] = await Promise.all([getPost(id), getCurrentUser(), getRequestTime()]);
  if (!post) notFound();

  const [comments, blocked] = await Promise.all([getPostComments(post.id), getBlockedIds(user?.id)]);
  const visible = comments.filter((c) => !blocked.includes(c.author_id));
  const isMine = user?.id === post.author_id;
  const back = `/community/${post.id}`;

  return (
    <>
      <article className="card-sack mt-3 px-5 py-6 sm:px-8">
        <span className="inline-block rounded-md bg-hanji-deep px-2 py-0.5 text-xs">{topicEmoji(post.topic)} {post.topic}</span>
        <div className="mt-3 flex items-center gap-2">
          <Avatar emoji={post.author?.avatar} size={36} />
          <div className="min-w-0 flex-1">
            <Link href={`/users/${post.author_id}`} className="font-display hover:text-skin">{post.author?.nickname ?? "알 수 없음"}</Link>
            <p className="text-xs text-soil-soft">{post.region ?? "동네 미설정"} · {timeAgo(post.created_at, now)}</p>
          </div>
          {isMine ? (
            <DeletePostButton postId={post.id} />
          ) : user ? (
            <ReportButton targetType="post" targetId={post.id} back={back} />
          ) : null}
        </div>
        <p className="mt-5 whitespace-pre-wrap break-words leading-relaxed">{post.body}</p>
      </article>

      <section className="card-sack mt-6 px-5 py-5 sm:px-8" aria-label="댓글">
        <h2 className="font-display text-xl">댓글 <span className="text-skin">{visible.length}</span></h2>
        {visible.length === 0 ? (
          <p className="mt-3 text-sm text-soil-soft">첫 댓글로 이웃에게 답해 주세요 🌱</p>
        ) : (
          <ul className="mt-3 divide-y-2 divide-dashed divide-straw">
            {visible.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center gap-1.5 text-sm">
                  <Avatar emoji={c.author?.avatar} size={24} />
                  <Link href={`/users/${c.author_id}`} className="font-display hover:text-skin">{c.author?.nickname ?? "알 수 없음"}</Link>
                  {c.author_id === post.author_id && <span className="rounded-md bg-leaf px-1.5 py-0.5 text-[10px] text-white">글쓴이</span>}
                  <span className="text-xs text-soil-soft">· {timeAgo(c.created_at, now)}</span>
                  <span className="ml-auto flex items-center gap-3">
                    {user && user.id !== c.author_id && <ReportButton targetType="comment" targetId={`post-${c.id}`} back={back} label="신고" />}
                    {user && (user.id === c.author_id || isMine) && <DeletePostCommentButton commentId={c.id} postId={post.id} />}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap break-words pl-[30px] leading-relaxed">{c.body}</p>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 border-t-2 border-dashed border-straw pt-4">
          {user ? (
            <PostCommentForm postId={post.id} />
          ) : (
            <Link href={`/login?next=${back}`} className="btn-straw block text-center text-sm">로그인하고 댓글 남기기</Link>
          )}
        </div>
      </section>
    </>
  );
}
