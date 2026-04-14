# Prompt Draft

## 1. Task Type
- Development

## 1-1. Prompt File Name
- 작업 번호: 06
- 단계: `draft`
- 유형: `dev`
- 작업 슬러그: admin-invitation-code-api-integration
- 최종 파일명: `06-draft-dev-admin-invitation-code-api-integration.md`

## 2. Goal
- 주최자(Admin)가 추첨 코드(Invitation Code)를 관리할 수 있도록 CRUD API 연동을 추가한다.

## 3. Background
- `src/api/client.ts`와 `src/api/types.ts`에 이미 관리자용 콘텐츠 및 보상 관련 API가 구현되어 있다.
- 모든 `/api/manage/**` 경로는 `authRequest`를 사용하여 Supabase 인증 토큰을 포함해야 한다.
- 제공된 OpenAPI 스펙의 `admin-invitation-code-controller` 태그에 해당하는 엔드포인트들을 구현한다.

## 4. Scope
### Include
- `src/api/types.ts`: `ManageInvitationCodeResponse`, `InvitationCodeCreateRequest`, `InvitationCodeUpdateRequest` 타입 추가
- `src/api/client.ts`: 추첨 코드 목록 조회, 상세 조회, 생성, 수정, 삭제 함수 추가

### Exclude
- UI 컴포넌트(페이지)에서의 실제 API 호출 로직은 이번 작업 범위에서 제외하며, API 클라이언트 정의에 집중한다.

## 5. Constraints
- 모든 파일은 UTF-8로 저장한다.
- 기존 `src/api/client.ts`의 `authRequest` 패턴을 유지한다.
- `InvitationCodeResponse`는 기존 관례에 따라 `ManageInvitationCodeResponse`로 명명한다.
- API 함수명은 기존 `Manage Reward API` 섹션의 명명 규칙(예: `getManageRewardsByContent`)을 따른다.

## 6. Naming Plan
- `src/api/types.ts`:
  - `ManageInvitationCodeResponse`
  - `InvitationCodeCreateRequest`
  - `InvitationCodeUpdateRequest`
- `src/api/client.ts`:
  - `getManageInvitationCodesByContent(contentCode: string)`
  - `getManageInvitationCode(invitationCodeId: number)`
  - `createManageInvitationCode(payload: InvitationCodeCreateRequest)`
  - `updateManageInvitationCode(invitationCodeId: number, payload: InvitationCodeUpdateRequest)`
  - `deleteManageInvitationCode(invitationCodeId: number)`
- 용어 통일 기준:
  - "Invitation Code" -> "추첨 코드" (주석/문서용)

## 7. Deliverables
- `src/api/types.ts` 수정 사항
- `src/api/client.ts` 수정 사항

## 8. Checks Before Execution
- [x] 목표가 충분히 구체적인가
- [x] 제외 범위가 명확한가
- [x] 위험한 변경 여부가 드러나는가
- [x] 성공 기준이 명확한가
- [x] 이름이 기존 프로젝트 규칙과 충돌하지 않는가
- [x] 같은 개념에 다른 용어를 섞어 쓰지 않는가
- [x] 파일명만 보고도 순서, 단계, 목적, 작업 내용이 보이는가

## 9. Final Prompt Draft

```md
파일명: 06-run-dev-admin-invitation-code-api-integration.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- 주최자용 추첨 코드(invitation-codes) CRUD API 연동 추가

배경:
- 관리자 페이지에서 특정 콘텐츠에 귀속된 추첨 코드를 생성하고 관리하는 기능이 필요하다.
- OpenAPI 스펙의 `admin-invitation-code-controller` 섹션을 기반으로 구현한다.

포함 범위:
1. `src/api/types.ts` 수정:
   - `ManageInvitationCodeResponse` (OpenAPI: `InvitationCodeResponse`)
   - `InvitationCodeCreateRequest` (OpenAPI: `InvitationCodeCreateRequest`)
   - `InvitationCodeUpdateRequest` (OpenAPI: `InvitationCodeUpdateRequest`)
2. `src/api/client.ts` 수정:
   - `getManageInvitationCodesByContent(contentCode: string): Promise<ManageInvitationCodeResponse[]>`
   - `getManageInvitationCode(invitationCodeId: number): Promise<ManageInvitationCodeResponse>`
   - `createManageInvitationCode(payload: InvitationCodeCreateRequest): Promise<ManageInvitationCodeResponse>`
   - `updateManageInvitationCode(invitationCodeId: number, payload: InvitationCodeUpdateRequest): Promise<ManageInvitationCodeResponse>`
   - `deleteManageInvitationCode(invitationCodeId: number): Promise<void>`

제외 범위:
- UI 구현 및 페이지 연동

제약:
- 모든 `/api/manage/**` 요청은 `authRequest`를 사용해야 함
- 기존 명명 규칙 및 파일 구조 엄수

명명 규칙:
- DTO: `ManageInvitationCodeResponse`, `InvitationCodeCreateRequest`, `InvitationCodeUpdateRequest`
- 함수: `getManageInvitationCodesByContent`, `getManageInvitationCode`, `createManageInvitationCode`, `updateManageInvitationCode`, `deleteManageInvitationCode`

완료 조건:
- `src/api/types.ts`에 정의된 타입이 OpenAPI 스펙과 일치함
- `src/api/client.ts`의 모든 함수가 올바른 엔드포인트와 HTTP 메서드를 호출함
- `tsc` 실행 시 타입 오류가 발생하지 않음
```
