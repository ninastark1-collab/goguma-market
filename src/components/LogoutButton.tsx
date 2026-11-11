"use client";
// 로그아웃 버튼: 누르는 즉시 "나가는 중…"으로 바뀌어 반응을 보여 줍니다.
import { useFormStatus } from "react-dom";
import { logout } from "@/app/auth/actions";

function SubmitButton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? "나가는 중…" : "로그아웃"}
    </button>
  );
}

export default function LogoutButton({ className = "btn-straw text-sm" }: { className?: string }) {
  return (
    <form action={logout}>
      <SubmitButton className={className} />
    </form>
  );
}
