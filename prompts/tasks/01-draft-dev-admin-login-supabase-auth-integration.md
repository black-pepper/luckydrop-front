# 파일명
- `02-draft-dev-admin-login-supabase-auth-integration.md`

# 따라야 할 공통 규칙
- `prompts/common-rules.md`
- `prompts/modes/development.md`

# 작업 목표
- 관리자 로그인 화면에서 Supabase Auth를 사용해 로그인하고 액세스 토큰을 획득하는 흐름을 구현한다.
- 획득한 토큰을 백엔드로 전달해 서버 세션 또는 서버 검증 흐름으로 이어질 수 있도록 프런트엔드 로그인 연동을 완성한다.

# 배경
- 현재 관리자 로그인 라우트는 `src/App.tsx`에 `/admin/login`으로 등록되어 있다.
- 현재 로그인 페이지 구현 위치는 `src/pages/admin/AdminLogin.tsx`이다.
- 현재 로그인 페이지는 Google 로그인 버튼 UI만 존재하고, 실제 인증 처리나 백엔드 연동은 구현되어 있지 않다.
- 이번 작업은 Supabase에서 제공하는 Auth 기능을 사용해 토큰을 얻고, 그 토큰을 백엔드 API로 전달하는 방식으로 로그인 흐름을 구성하는 것이 목적이다.

# 포함 범위
- `src/pages/admin/AdminLogin.tsx` 또는 관련 로그인 화면 컴포넌트에 실제 로그인 동작 연결
- Supabase 클라이언트 초기화가 없다면 프로젝트 구조에 맞는 위치에 설정 추가
- 로그인 성공 후 Supabase 세션 또는 사용자 정보에서 액세스 토큰을 안전하게 획득하는 로직 추가
- 획득한 토큰을 백엔드 로그인/검증 API로 전달하는 API 호출 로직 추가
- 로그인 진행 중, 성공, 실패 상태를 UI에서 최소한으로 처리
- 필요 시 인증 관련 타입, API 함수, 유틸 함수, 환경 변수 사용 지점 추가
- 라우팅 또는 후속 화면 이동이 이미 정해져 있다면 그 흐름까지 연결

# 제외 범위
- 백엔드 API 자체 구현 또는 서버 배포 작업
- Supabase 프로젝트 생성, 콘솔 설정 변경, OAuth provider 설정 대행
- 관리자 권한 정책 자체 설계 변경
- 로그인 이후 전체 관리자 인증 가드 체계 전면 개편
- 디자인 전면 리뉴얼

# 구현 제약
- 모든 파일은 UTF-8로 저장한다.
- 기존 프로젝트 구조와 네이밍 규칙을 최대한 유지한다.
- 변경 범위는 로그인 기능 구현에 필요한 최소 범위로 제한한다.
- 이미 존재하는 관리자 로그인 화면 UI를 우선 활용하고, 필요한 범위에서만 수정한다.
- 토큰 저장 방식이 필요하면 현재 프로젝트 구조에 맞는 최소한의 방법을 선택하고, 보안상 주의가 필요한 지점은 명시한다.
- 환경 변수 키, API 엔드포인트 이름, 응답 스키마는 실제 프로젝트 코드와 문서를 먼저 확인한 뒤 기존 규칙에 맞춘다.
- 테스트 또는 검증 코드가 필요한 구조라면 가능한 범위에서 함께 반영한다.

# 네이밍 계획
- 작업 문서 파일명: `02-draft-dev-admin-login-supabase-auth-integration.md`
- 후보 유틸/설정 파일명:
  - `src/lib/supabase.ts`
  - `src/api/auth.ts`
- 후보 함수명:
  - `signInWithGoogle`
  - `exchangeSupabaseToken`
  - `getAccessTokenFromSession`
- 용어 통일 기준:
  - Supabase 인증 결과에서 얻는 값은 `accessToken`
  - 백엔드로 전달하는 동작은 `exchange` 또는 `login` 중 기존 API 네이밍에 맞춰 통일
  - 화면 명칭은 `AdminLogin`을 유지

# 참고 파일
- `src/App.tsx`
- `src/pages/admin/AdminLogin.tsx`
- `prompts/common-rules.md`
- `prompts/templates/prompt-draft-template.md`
- `prompts/modes/development.md`

# 완료 조건
- `/admin/login` 화면에서 실제 Supabase Auth 로그인 흐름을 시작할 수 있다.
- 로그인 성공 시 Supabase에서 토큰을 얻어 백엔드로 전달하는 프런트엔드 로직이 연결되어 있다.
- 성공/실패/로딩 상태가 최소한의 UI로 구분된다.
- 필요한 환경 변수, API 호출부, 인증 유틸이 프로젝트 규칙에 맞게 정리되어 있다.
- 변경 사항과 영향 범위, 남아 있는 확인 사항이 결과에 함께 정리되어 있다.
