"use client";
// 댓글 입력칸. 남기기에 성공하면 입력칸을 비워요.
import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import { addComment, type CommentState } from "@/app/items/comment-actions";

export default function CommentForm({ itemId }: { itemId: number }) {
  const [state, action, pending] = useActionState<CommentState, FormData>(addComment.bind(null, itemId), undefined);

  return (
    // key: 성공할 때마다(ok 값이 바뀔 때) 폼을 새로 그려서 입력칸을 비워요.
    <form key={state?.ok ?? "form"} action={action} className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <textarea
          name="body"
          rows={2}
          maxLength={500}
          required
          placeholder="궁금한 점을 댓글로 물어보세요. (모두에게 보여요)"
          aria-label="댓글 입력"
          className="field min-h-16 flex-1 resize-y py-2.5"
        />
        <button type="submit" className="btn-goguma h-11 shrink-0 px-4! py-0! text-sm!" disabled={pending}>
          {pending ? "…" : "등록"}
        </button>
      </div>
      <FormMessage error={state?.error} />
    </form>
  );
}
