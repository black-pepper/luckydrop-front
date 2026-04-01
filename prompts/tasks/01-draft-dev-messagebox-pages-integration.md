# 파일명
- `01-draft-dev-messagebox-pages-integration.md`

# 따라야 할 공통 규칙
- `prompts/common-rules.md`
- `prompts/modes/development.md`

# 작업 목표
- 현재 `src` 프론트엔드에 없는 추가 UI 페이지를 실제 API 연동 가능한 화면으로 구현한다.
- UI 기준은 별도 저장소 성격의 `luckydrop-ui` 폴더를 그대로 참조하고, 기존 추첨 기능은 깨지지 않게 유지한다.

# 배경
- 현재 실제 프론트엔드 라우트는 `src/App.tsx` 기준으로 추첨 및 관리자 일부 화면만 있다.
- `luckydrop-ui/src/App.tsx`에는 아래 신규 화면이 추가되어 있다.
  - `/` 랜딩 페이지
  - `/draw`
  - `/messagebox`
  - `/messagebox/write`
  - `/messagebox/list`
  - `/messagebox/view/:id`
  - `/admin/messagebox/:id`
- 메시지함 화면들은 현재 전부 mock state와 `luckydrop-ui/src/data/messageBoxMockData.ts`에 의존하고 있다.
- 백엔드 API 구현 기준 문서는 `docs/messagebox-pages-api-spec.md`를 따른다.

# 포함 범위
- `src/App.tsx`에 신규 라우트 반영
- `src/pages`에 랜딩 페이지, 메시지함 페이지, 관리자 메시지함 관리 페이지 추가
- `src/api/types.ts`에 message box 관련 타입 추가
- `src/api/client.ts` 또는 적절한 별도 API 모듈에 message box API 함수 추가
- 참여자용 메시지함 소개, 작성, 목록, 상세 페이지를 실제 API 호출 기반으로 교체
- 관리자용 메시지함 관리 페이지를 실제 API 호출 기반으로 교체
- 기존 관리자 대시보드에서 `messagebox` 타입 클릭 시 `/admin/messagebox/:id`로 이동하도록 수정
- 필요 시 mock data 제거 또는 신규 페이지에서 더 이상 참조하지 않도록 정리

# 제외 범위
- 스프링 백엔드 구현
- 기존 추첨 도메인 API 명세 변경
- 퀴즈 기능 구현
- 디자인 리뉴얼

# 구현 제약
- 모든 파일은 UTF-8로 저장한다.
- UI/레이아웃은 `luckydrop-ui` 파일을 최대한 기준으로 삼고, 구조만 실제 데이터 연동에 맞게 바꾼다.
- 기존 추첨 플로우는 유지하되, 루트 경로는 랜딩으로 바꾸고 기존 추첨 페이지는 `/draw`로 이동한다.
- 메시지함 참여자 페이지는 `contentId`를 쿼리 파라미터로 받는다고 가정한다.
  - 예: `/messagebox?contentId=31`
  - `write`, `list`, `view` 화면도 동일하게 `contentId`를 유지한다.
- API 호출 실패, 비공개 목록, 종료된 콘텐츠 상태를 각각 분기 처리한다.
- 상대 시간 표시는 서버 문자열을 그대로 믿지 말고 `createdAt`으로부터 프론트에서 계산하거나, 우선 절대시간 표시로 구현한다.

# 참조 파일
- `luckydrop-ui/src/App.tsx`
- `luckydrop-ui/src/pages/Landing.tsx`
- `luckydrop-ui/src/pages/messagebox/MessageBoxIntro.tsx`
- `luckydrop-ui/src/pages/messagebox/MessageBoxWrite.tsx`
- `luckydrop-ui/src/pages/messagebox/MessageBoxList.tsx`
- `luckydrop-ui/src/pages/messagebox/MessageBoxView.tsx`
- `luckydrop-ui/src/pages/admin/ManageMessageBox.tsx`
- `src/App.tsx`
- `src/api/types.ts`
- `src/api/client.ts`
- `docs/messagebox-pages-api-spec.md`

# 권장 API 함수 예시
- `getPublicMessageBox(contentId)`
- `createMessageBoxMessage(contentId, payload)`
- `getPublicMessageBoxMessages(contentId, params)`
- `getPublicMessageBoxMessageDetail(contentId, messageId)`
- `getAdminMessageBox(contentId)`
- `getAdminMessageBoxMessages(contentId, params)`
- `getAdminMessageBoxMessageDetail(contentId, messageId)`
- `deleteAdminMessageBoxMessage(contentId, messageId)`
- `updateAdminMessageBoxSettings(contentId, payload)`

# 완료 조건
- 신규 페이지가 모두 `src` 기준으로 존재한다.
- 신규 페이지가 더 이상 mock data 없이 API 호출 기반으로 동작한다.
- 기존 추첨 페이지는 `/draw`에서 정상 접근된다.
- 관리자 대시보드에서 messagebox 콘텐츠를 관리자 메시지함 관리 페이지로 진입할 수 있다.
- 메시지함 공개/비공개, 빈 목록, 제출 성공, 삭제 성공, API 오류 상태를 최소한 UI에서 처리한다.
