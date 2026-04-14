# Prompt Draft

## 1. Task Type
- Development

## 1-1. Prompt File Name
- 작업 번호: 07
- 단계: `draft`
- 유형: `dev`
- 작업 슬러그: manage-edit-delete-invitecode-api
- 최종 파일명: `07-draft-dev-manage-edit-delete-invitecode-api.md`

## 2. Goal
- `ManageContent.tsx`의 "코드" 탭에 추첨 코드(Invitation Code) 생성·수정·삭제 UI를 추가하여 API와 연동한다.

## 3. Background
- Task 06에서 `src/api/client.ts`와 `src/api/types.ts`에 추첨 코드 CRUD API 함수가 추가되었다.
- `ManageContent.tsx`의 "코드" 탭은 현재 `getManageInvitationCodesByContent`로 목록만 조회하는 읽기 전용 테이블이다.
- 보상(Rewards) 탭의 `RewardFormCard` + 인라인 폼 패턴을 동일하게 적용한다.

## 4. Scope
### Include
- `src/pages/manage/ManageContent.tsx`:
  - `InvitationCodeFormState` 로컬 타입 추가
  - `emptyCodeForm()`, `fromApiCode()` 헬퍼 추가
  - 추첨 코드 추가/수정/삭제 상태(state) 추가
  - `handleAddCode`, `handleUpdateCode`, `handleDeleteCode` 핸들러 추가
  - `createManageInvitationCode`, `updateManageInvitationCode`, `deleteManageInvitationCode` import 추가
  - "코드" 탭 UI 업데이트: CardHeader(추가 버튼), 추가 폼, 각 행에 수정·삭제 버튼

### Exclude
- `src/api/types.ts`, `src/api/client.ts` 수정 없음 (Task 06에서 완료)
- 결과(Results) 탭, 공유(Share) 탭, 보상(Rewards) 탭 변경 없음

## 5. Constraints
- 보상 탭의 `RewardFormCard` 및 상태 관리 패턴을 최대한 유지한다.
- 추첨 코드 폼은 별도 `InvitationCodeFormCard` 컴포넌트로 분리한다.
- 모든 파일은 UTF-8로 저장한다.
- 기존 동작(목록 조회)을 깨뜨리지 않는다.

## 6. Naming Plan
- 로컬 타입: `InvitationCodeFormState`
- 헬퍼: `emptyCodeForm()`, `fromApiCode(c: ManageInvitationCodeResponse)`
- 컴포넌트: `InvitationCodeFormCard`
- 상태: `showAddCodeForm`, `addCodeForm`, `addingCode`, `addCodeError`
- 상태: `editingCodeId`, `editCodeForm`, `editingCode`, `editCodeError`
- 핸들러: `handleAddCode`, `handleUpdateCode`, `handleDeleteCode`

## 7. Deliverables
- `src/pages/manage/ManageContent.tsx` 수정 사항

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
파일명: 07-run-dev-manage-edit-delete-invitecode-api.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- `ManageContent.tsx` "코드" 탭에 추첨 코드 생성·수정·삭제 UI 추가

배경:
- Task 06에서 추첨 코드 CRUD API 클라이언트가 완성되었다.
- "코드" 탭이 현재 읽기 전용 테이블이므로 보상 탭과 동일한 패턴으로 인라인 CRUD를 추가한다.

포함 범위:
- `src/pages/manage/ManageContent.tsx` 수정:
  1. import에 `createManageInvitationCode`, `updateManageInvitationCode`, `deleteManageInvitationCode` 추가
  2. `InvitationCodeFormState` 타입, `emptyCodeForm()`, `fromApiCode()` 헬퍼 추가
  3. `InvitationCodeFormCard` 컴포넌트 추가 (RewardFormCard 패턴 참고)
     - 필드: code, nickname, memo, maxDrawCount
  4. 추가/수정/삭제 상태 및 핸들러 추가
  5. "코드" 탭 UI 업데이트:
     - `<Card>` → `<Card><CardHeader>코드 목록 + 추가 버튼</CardHeader><CardContent>...</CardContent></Card>`
     - 추가 폼 (showAddCodeForm일 때)
     - 각 행에 수정(Pencil) · 삭제(Trash2) 버튼 추가
     - 수정 모드에서 인라인 폼으로 교체

제외 범위:
- `src/api/types.ts`, `src/api/client.ts`는 수정하지 않는다.

제약:
- 기존 목록 조회 동작 유지
- 보상 탭 패턴 최대한 재사용

완료 조건:
- "코드" 탭에서 추첨 코드 추가·수정·삭제가 동작함
- `tsc` 실행 시 타입 오류 없음
```
