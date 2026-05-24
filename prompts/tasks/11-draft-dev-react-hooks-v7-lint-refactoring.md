## 1. Task Type
- Development (Refactoring)

## 1-1. Prompt File Name
- 작업 번호: 11
- 단계: `draft`
- 유형: `dev`
- 작업 슬러그: react-hooks-v7-lint-refactoring
- 최종 파일명: `11-draft-dev-react-hooks-v7-lint-refactoring.md`

## 2. Goal
- `eslint-plugin-react-hooks@7` 업그레이드 후 임시로 비활성화한 `react-hooks/set-state-in-effect` 규칙을 다시 켤 수 있도록 관련 컴포넌트와 훅의 상태 관리 패턴을 점진적으로 리팩토링한다.
- 리팩토링 후 `npm run lint`, `npm run build`, `npm run test`가 모두 통과하도록 한다.

## 3. Background
- dependency update 작업에서 `eslint-plugin-react-hooks`가 `7.1.1`로 올라가며 `react-hooks/set-state-in-effect` 규칙이 기존 코드의 fetch/loading/error 패턴을 에러로 잡기 시작했다.
- 해당 규칙은 effect 내부에서 동기적으로 `setState`를 호출해 추가 렌더링이 발생하는 패턴을 줄이기 위한 규칙이다.
- 현재 dependency update 범위에서는 대규모 상태 관리 리팩토링을 피하기 위해 `eslint.config.js`에서 아래 규칙을 임시로 비활성화했다.

```js
"react-hooks/set-state-in-effect": "off",
```

- 이 설정은 장기 유지 정책이 아니라 별도 리팩토링 작업을 위한 임시 완충 장치로 본다.

## 4. Scope
### Include
- `eslint.config.js`에서 `react-hooks/set-state-in-effect`를 다시 활성화할 수 있는지 확인한다.
- 아래 파일을 우선 분석하고 필요한 범위에서 리팩토링한다.
  - `src/pages/Policy.tsx`
  - `src/hooks/use-mobile.tsx`
  - `src/components/ui/carousel.tsx`
  - `src/pages/manage/ManageDashboard.tsx`
  - `src/pages/manage/ManageContent.tsx`
  - `src/pages/manage/ManageLogin.tsx`
  - `src/pages/manage/ManageSettings.tsx`
- URL 파라미터, 브라우저 이벤트, 외부 라이브러리 이벤트, API fetch 상태를 각각 다른 성격의 상태 동기화 문제로 보고 개별적으로 접근한다.
- 간단한 파생 상태는 state로 복제하지 않고 props, search params, memoized value 등에서 직접 계산하는 방향을 우선 검토한다.
- fetch 상태는 loading/error/data를 한 단위로 다루거나, 기존 UI 동작을 유지하면서 effect 시작 시 동기 setState가 필요 없는 구조를 검토한다.
- 수정 후 `react-hooks/set-state-in-effect` 규칙을 다시 켜고 lint 결과를 확인한다.

### Exclude
- dependency version을 추가로 올리거나 내리지 않는다.
- UI 디자인, 문구, 라우팅 구조를 변경하지 않는다.
- API 응답 타입이나 `src/api/client.ts`의 통신 계약을 변경하지 않는다.
- TanStack Query 같은 새 상태 관리/데이터 fetching 라이브러리를 도입하지 않는다.
- 경고 제거만을 위해 동작을 바꾸거나 loading/error 표시를 제거하지 않는다.

## 5. Constraints
- 모든 파일은 UTF-8로 저장한다.
- 기존 프로젝트 구조와 네이밍을 유지한다.
- 변경은 페이지 또는 훅 단위로 작게 나누어 진행한다.
- `ManageContent.tsx`는 상태와 API 호출이 많으므로 가장 마지막에 다룬다.
- effect dependency를 수정할 때 무한 렌더링 가능성을 반드시 확인한다.
- ESLint 규칙을 다시 끄는 방식으로 완료 처리하지 않는다. 단, 특정 파일에서 규칙 준수가 과도하게 위험하면 이유와 대안을 문서화한다.

## 6. Naming Plan
- 새 훅이 필요하면 기존 네이밍 패턴에 맞춰 `use[Domain]` 형식으로 작성한다.
- fetch 상태 타입이 필요하면 대상 도메인이 드러나는 이름을 사용한다.
- 유틸 함수가 필요하면 `get`, `to`, `create`, `derive` 등 역할이 드러나는 동사를 사용한다.
- 동일한 개념에는 `loading`, `error`, `data` 용어를 일관되게 사용한다.

## 7. Deliverables
- `react-hooks/set-state-in-effect` 규칙을 다시 활성화한 ESLint 설정
- 대상 파일의 상태 관리 리팩토링 코드
- 필요한 경우 작은 단위의 헬퍼 함수 또는 커스텀 훅
- 검증 결과 보고
  - `npm run lint`
  - `npm run build`
  - `npm run test`
- 리팩토링하지 못한 항목이 있다면 이유와 남은 리스크 정리

## 8. Checks Before Execution
- 목표가 충분히 구체적인가: Yes
- 제외 범위가 명확한가: Yes
- 위험한 변경 여부가 드러나는가: Yes (fetch/loading/error 상태 관리 변경)
- 성공 기준이 명확한가: Yes
- 이름이 기존 프로젝트 규칙과 충돌하지 않는가: Yes
- 같은 개념에 다른 용어를 섞어 쓰지 않는가: Yes
- 파일명만 보고도 순서, 상태, 목적, 작업 내용을 이해할 수 있는가: Yes

## 9. Final Prompt Draft

```md
파일명:
- 11-draft-dev-react-hooks-v7-lint-refactoring.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- `eslint-plugin-react-hooks@7` 업그레이드 후 임시 비활성화한 `react-hooks/set-state-in-effect` 규칙을 다시 켤 수 있도록 상태 관리 패턴을 리팩토링한다.
- 최종적으로 `npm run lint`, `npm run build`, `npm run test`가 모두 통과해야 한다.

배경:
- dependency update 과정에서 `react-hooks/set-state-in-effect`가 기존 fetch/loading/error 패턴을 대량으로 에러 처리했다.
- 당시에는 dependency update 범위를 유지하기 위해 `eslint.config.js`에서 해당 규칙을 임시로 껐다.
- 이번 작업에서는 해당 규칙을 다시 켜는 것을 목표로 코드 구조를 정리한다.

포함 범위:
- `src/pages/Policy.tsx`
- `src/hooks/use-mobile.tsx`
- `src/components/ui/carousel.tsx`
- `src/pages/manage/ManageDashboard.tsx`
- `src/pages/manage/ManageContent.tsx`
- `src/pages/manage/ManageLogin.tsx`
- `src/pages/manage/ManageSettings.tsx`
- `eslint.config.js`의 `react-hooks/set-state-in-effect` 설정 재활성화

제외 범위:
- dependency 추가 변경
- UI 디자인 변경
- API 계약 변경
- 새 데이터 fetching 라이브러리 도입
- 단순 lint 회피를 위한 동작 삭제

제약:
- 기존 동작을 유지한다.
- 변경은 파일별로 작게 나누어 진행한다.
- `ManageContent.tsx`는 영향 범위가 크므로 마지막에 다룬다.
- effect dependency 변경 시 무한 렌더링 가능성을 확인한다.
- 규칙을 다시 끄는 방식으로 완료하지 않는다.

완료 조건:
- `react-hooks/set-state-in-effect` 규칙이 활성화되어 있다.
- `npm run lint` 통과
- `npm run build` 통과
- `npm run test` 통과
- 남은 리스크 또는 제외한 항목이 있으면 이유를 보고한다.
```
