# 🍠 고구마마켓

흙 털고 건네는 우리 동네 중고거래. Next.js + Supabase 로 단계별로 만들어 가는 공부용 프로젝트입니다.

## 실행

```bash
npm install
npm run dev     # http://localhost:3000
```

`.env.local` 에 Supabase 주소와 publishable 키가 들어 있습니다. (`.env.example` 참고)
가계부 앱과 **같은 Supabase 프로젝트**를 씁니다. 가계부 테이블(`transactions`, `budgets`)은 건드리지 않습니다.

## 1단계: 회원가입 / 로그인 / 로그아웃 ✅

| 파일 | 하는 일 |
| --- | --- |
| `src/lib/supabase/client.ts` | 브라우저용 Supabase 클라이언트 |
| `src/lib/supabase/server.ts` | 서버용 클라이언트 (쿠키로 세션 읽기) |
| `src/lib/supabase/proxy.ts` + `src/proxy.ts` | 요청마다 세션 갱신, `/my` 보호, 로그인한 사람은 `/login`·`/signup` 접근 시 홈으로 |
| `src/app/auth/actions.ts` | `signup`, `login`, `logout` Server Actions |
| `src/app/auth/callback/route.ts` | 이메일 인증 링크를 눌렀을 때 세션으로 바꿔 주는 곳 |
| `src/lib/auth.ts` | 현재 사용자 + 프로필(닉네임, 동네) 가져오기 |
| `src/app/(auth)/login`, `signup` | 로그인 / 회원가입 화면 |
| `src/app/my` | 로그인한 사람만 보는 내 정보 |
| `supabase/migrations/001_goguma_profiles.sql` | `profiles` 테이블 + 가입 시 자동 생성 트리거 + RLS |

### 흐름
1. 회원가입 폼 → `signup` 액션 → `supabase.auth.signUp({ options: { data: { nickname, region } } })`
2. DB 트리거 `on_auth_user_created` 가 `auth.users` 에 들어온 메타데이터로 `profiles` 행을 만듭니다.
3. 세션은 쿠키에 저장되고, `proxy.ts` 가 요청마다 토큰을 갱신합니다.
4. 로그아웃은 `<form action={logout}>` 버튼 하나로 처리됩니다.

> 현재 Supabase 프로젝트는 **이메일 인증이 꺼져 있어서** 가입 즉시 로그인됩니다.
> 대시보드 → Authentication → Sign In / Providers 에서 "Confirm email"을 켜면, 인증 메일 안내 화면과 `/auth/callback` 이 동작합니다.

### Next.js 16 메모
- `middleware.ts` 대신 `proxy.ts` 를 씁니다.
- Cache Components 가 켜져 있어서, 쿠키(로그인 정보)를 읽는 컴포넌트는 `<Suspense>` 안에 둬야 합니다.

## 디자인 테마 — 구황작물 / 향토
한지 배경, 흙색 글자, 고구마 껍질 자주색 버튼, 군고구마 속살 노란색 강조.
색상과 버튼 스타일은 `src/app/globals.css` 의 `@theme` 과 `@utility` 에 모여 있습니다.

## 다음 단계 (예정)
- [ ] 물건 올리기 (사진 업로드: Supabase Storage)
- [ ] 동네 물건 목록 / 상세
- [ ] 찜하기, 채팅
- [ ] 배포 (가계부와 다른 주소로)
