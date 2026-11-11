import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ChatRoomView from "@/components/ChatRoomView";
import ItemThumb from "@/components/ItemThumb";
import { getCurrentUser } from "@/lib/auth";
import { getChatRoom } from "@/lib/social";
import { formatPrice } from "@/lib/market";

export const metadata: Metadata = { title: "대화방 · 고구마마켓" };

// 1:1 대화방. 주소의 방 번호는 요청 때 알 수 있어서 Suspense 안에서 읽어요.
export default function ChatRoomPage({ params }: PageProps<"/chat/[roomId]">) {
  return (
    <div className="mx-auto max-w-2xl">
      <Suspense fallback={<p className="py-20 text-center text-soil-soft">대화방 여는 중…</p>}>
        <Room params={params} />
      </Suspense>
    </div>
  );
}

async function Room({ params }: { params: PageProps<"/chat/[roomId]">["params"] }) {
  const { roomId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/chat/${roomId}`);

  // 방의 두 사람이 아니면 RLS 때문에 방이 안 보여요 → '없는 페이지'
  const data = await getChatRoom(roomId);
  if (!data) notFound();
  const { room, messages } = data;

  const iAmSeller = room.seller_id === user.id;
  const other = (iAmSeller ? room.buyer : room.seller)?.nickname ?? "알 수 없음";

  return (
    <div className="border-x-0 border-soil sm:border-x-2">
      {/* 위쪽: 상대 이름 + 어떤 물건 이야기인지 */}
      <div className="sticky top-[66px] z-10 border-b-2 border-soil bg-hanji/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 pt-3">
          <Link href="/chat" className="text-soil-soft hover:text-skin" aria-label="채팅 목록으로">←</Link>
          <p className="font-display text-lg">{other}</p>
          <span className="text-xs text-soil-soft">{iAmSeller ? "구매 문의" : "판매자"}</span>
        </div>
        {room.item ? (
          <Link href={`/items/${room.item.id}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-flesh-soft/40">
            <ItemThumb item={room.item} size={44} />
            <span className="min-w-0">
              <span className="block truncate text-sm">
                {room.item.status !== "판매중" && <b className="mr-1 text-leaf">{room.item.status}</b>}
                {room.item.title}
              </span>
              <span className="font-display">{formatPrice(room.item.price)}</span>
            </span>
          </Link>
        ) : (
          <p className="px-4 py-2.5 text-sm text-soil-soft">삭제된 판매글이에요.</p>
        )}
      </div>

      <ChatRoomView roomId={room.id} myId={user.id} otherName={other} initialMessages={messages} />
    </div>
  );
}
