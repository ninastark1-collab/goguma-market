"use client";
// 1:1 대화방 화면 (메시지 목록 + 입력칸)
// Supabase Realtime: DB에 새 메시지가 들어오면 서버가 바로 알려 줘서, 새로고침 없이 화면에 떠요.
// 내가 읽은 상대 메시지는 read_at을 채워서, 상대 화면에 '읽음'이 보이게 해요.

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/social";

// 서버(Vercel, 미국 시간대)와 브라우저(한국)의 시간이 달라도 같은 글자가 나오게 한국 시간으로 고정해요.
const timeFmt = new Intl.DateTimeFormat("ko-KR", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Seoul" });
const dayFmt = new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "short", timeZone: "Asia/Seoul" });

type Props = { roomId: number; myId: string; otherName: string; initialMessages: ChatMessage[] };

export default function ChatRoomView({ roomId, myId, otherName, initialMessages }: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient>>(null);

  // 메시지를 목록에 넣거나(새 것) 바꿔요(읽음 표시). 같은 메시지가 두 번 들어오지 않게 id로 확인해요.
  function upsert(msg: ChatMessage) {
    setMessages((prev) => {
      const i = prev.findIndex((m) => m.id === msg.id);
      if (i === -1) return [...prev, msg];
      const next = [...prev];
      next[i] = msg;
      return next;
    });
  }

  // 상대가 보낸 안 읽은 메시지를 '읽음'으로 표시
  async function markRead() {
    await supabaseRef.current
      ?.from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("room_id", roomId)
      .neq("sender_id", myId)
      .is("read_at", null);
  }

  // 방에 들어오면: 읽음 표시 + 실시간 구독 시작, 나가면 구독 끝
  useEffect(() => {
    const supabase = createClient();
    supabaseRef.current = supabase;
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let closed = false;

    (async () => {
      // 실시간 연결에도 로그인 정보를 실어야 RLS(방의 두 사람만)가 동작해요.
      const { data } = await supabase.auth.getSession();
      if (data.session) supabase.realtime.setAuth(data.session.access_token);
      if (closed) return;

      channel = supabase
        .channel(`room-${roomId}`)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "chat_messages", filter: `room_id=eq.${roomId}` },
          (payload) => {
            const msg = payload.new as ChatMessage;
            if (!msg?.id) return;
            upsert(msg);
            if (payload.eventType === "INSERT" && msg.sender_id !== myId) markRead();
          },
        )
        .subscribe();
      markRead();
    })();

    return () => {
      closed = true;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 방이 바뀔 때만 다시 연결해요
  }, [roomId, myId]);

  // 새 메시지가 생기면 맨 아래로 스크롤
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending || !supabaseRef.current) return;
    setSending(true);
    setError(undefined);
    const { data, error } = await supabaseRef.current
      .from("chat_messages")
      .insert({ room_id: roomId, sender_id: myId, body })
      .select()
      .single();
    setSending(false);
    if (error) {
      setError("메시지를 보내지 못했어요. 다시 시도해 주세요.");
      return;
    }
    upsert(data as ChatMessage);
    setText("");
  }

  return (
    <div className="flex flex-col">
      <div className="flex min-h-[50vh] flex-col gap-1.5 px-4 py-4">
        {messages.length === 0 && (
          <p className="my-auto text-center text-sm text-soil-soft">
            {otherName}님에게 첫 인사를 건네 보세요 🌱
          </p>
        )}
        {messages.map((m, i) => {
          const mine = m.sender_id === myId;
          const day = dayFmt.format(new Date(m.created_at));
          const showDay = i === 0 || dayFmt.format(new Date(messages[i - 1].created_at)) !== day;
          return (
            <div key={m.id}>
              {showDay && (
                <p className="my-3 text-center text-xs text-soil-soft">
                  <span className="rounded-full bg-hanji-deep px-3 py-1">{day}</span>
                </p>
              )}
              <div className={`flex items-end gap-1.5 ${mine ? "flex-row-reverse" : ""}`}>
                <p
                  className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl border-2 border-soil px-3.5 py-2 leading-relaxed ${
                    mine ? "rounded-br-sm bg-skin text-white" : "rounded-bl-sm bg-[#fffaf0]"
                  }`}
                >
                  {m.body}
                </p>
                <span className="shrink-0 pb-0.5 text-[10px] leading-tight text-soil-soft">
                  {/* 내가 보낸 메시지: 상대가 읽기 전엔 '읽지 않음', 읽으면 실시간으로 '읽음'으로 바뀌어요 */}
                  {mine && (
                    <span className={`block text-right ${m.read_at ? "text-soil-soft" : "font-bold text-flesh"}`}>
                      {m.read_at ? "읽음" : "읽지 않음"}
                    </span>
                  )}
                  {timeFmt.format(new Date(m.created_at))}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력칸: 휴대폰 아래 메뉴 위에 붙어 있어요 */}
      <form
        onSubmit={send}
        className="sticky bottom-[64px] flex items-end gap-2 border-t-2 border-soil bg-hanji px-3 py-3 md:bottom-0"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // Enter = 보내기, Shift+Enter = 줄바꿈 (한글 조합 중에는 보내지 않아요)
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="메시지 보내기"
          aria-label="메시지 입력"
          className="field max-h-32 min-h-11 flex-1 resize-none py-2.5"
        />
        <button type="submit" className="btn-goguma h-11 shrink-0 px-4! py-0! text-sm!" disabled={sending || !text.trim()}>
          {sending ? "…" : "보내기"}
        </button>
      </form>
      {error && <p className="px-4 pb-2 text-xs text-ember">{error}</p>}
    </div>
  );
}
