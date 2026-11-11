"use client";
// 내 정보 화면의 폼들: 프로필 수정, 비밀번호 바꾸기, 비밀번호 찾기, 회원 탈퇴
import { useActionState } from "react";
import FormMessage from "@/components/FormMessage";
import { changePassword, deleteAccount, requestPasswordReset, updateProfile } from "@/app/my/actions";
import { AVATARS, REGION_SUGGESTIONS } from "@/lib/market";

export function ProfileForm({ nickname, region, avatar }: { nickname: string; region: string | null; avatar: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  return (
    <form action={action} className="flex flex-col gap-4">
      <fieldset>
        <legend className="mb-2 font-display">프로필 그림</legend>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <label key={a}>
              <input type="radio" name="avatar" value={a} defaultChecked={a === avatar} className="peer sr-only" />
              <span className="grid aspect-square cursor-pointer place-items-center rounded-full border-2 border-soil/30 bg-[#fffaf0] text-2xl peer-checked:border-soil peer-checked:bg-flesh-soft peer-focus-visible:ring-4 peer-focus-visible:ring-flesh/40">
                {a}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-1.5">
        <span className="font-display">닉네임</span>
        <input name="nickname" defaultValue={nickname} minLength={2} maxLength={12} required className="field" />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-display">내 동네</span>
        {/* datalist: 예시 동네를 골라 쓰거나 직접 적을 수 있는 입력칸 */}
        <input name="region" defaultValue={region ?? ""} list="region-list" maxLength={30} placeholder="예) 여주시 가남읍" className="field" />
        <datalist id="region-list">
          {REGION_SUGGESTIONS.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        <span className="text-xs text-soil-soft">홈의 ‘📍 내 동네’ 탭과 새로 올리는 글에 이 동네가 쓰여요.</span>
      </label>
      <FormMessage error={state?.error} />
      <button type="submit" className="btn-goguma" disabled={pending}>{pending ? "저장 중…" : "저장하기"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, undefined);
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="password" name="password" autoComplete="new-password" minLength={6} required placeholder="새 비밀번호 (6자 이상)" className="field" />
      <input type="password" name="passwordConfirm" autoComplete="new-password" minLength={6} required placeholder="새 비밀번호 확인" className="field" />
      <FormMessage error={state?.error} />
      <button type="submit" className="btn-goguma" disabled={pending}>{pending ? "바꾸는 중…" : "비밀번호 바꾸기"}</button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);
  if (state?.message) return <FormMessage message={state.message} />;
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="email" name="email" autoComplete="email" required placeholder="가입한 이메일" className="field" />
      <FormMessage error={state?.error} />
      <button type="submit" className="btn-goguma" disabled={pending}>{pending ? "보내는 중…" : "재설정 메일 받기"}</button>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action, pending] = useActionState(deleteAccount, undefined);
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("정말 탈퇴할까요? 올린 글·사진·댓글·채팅이 모두 지워지고 되돌릴 수 없어요.")) e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <p className="text-sm text-soil-soft">
        탈퇴하면 올린 글·사진·댓글·채팅·후기가 <b className="text-ember">모두 지워지고 되돌릴 수 없어요.</b> 계속하려면 아래 칸에 <b>탈퇴</b>라고 적어 주세요.
      </p>
      <input name="confirm" placeholder="탈퇴" className="field" autoComplete="off" />
      <FormMessage error={state?.error} />
      <button type="submit" className="btn-straw text-sm hover:bg-[#fbe4dc]!" disabled={pending}>{pending ? "처리 중…" : "회원 탈퇴"}</button>
    </form>
  );
}
