파일명:
- 03-dev-lint-create-content-any.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- `CreateContent.tsx`의 `any` 타입 사용을 제거한다.

배경:
- ESLint 규칙 `@typescript-eslint/no-explicit-any` 위반이 발생한다.
- 대상 위치:
  - `src/pages/manage/CreateContent.tsx:291`

포함 범위:
- 해당 `any`가 이벤트, API 응답, 폼 값, 외부 라이브러리 타입 중 무엇인지 확인한다.
- 기존 타입 또는 라이브러리 제공 타입을 우선 사용한다.
- 필요한 경우 좁은 범위의 타입/interface를 추가한다.

제외 범위:
- Create Content 화면의 기능 변경은 하지 않는다.
- 폼 구조나 API 요청/응답 형식은 임의로 변경하지 않는다.
- 다른 파일의 lint 오류는 제외한다.

제약:
- 기존 UI 동작과 저장 흐름을 유지한다.
- 타입 추가는 해당 파일 또는 기존 타입 위치 중 더 자연스러운 곳에 최소로 반영한다.

명명 규칙:
- 새 타입이 필요하면 `CreateContent...` 또는 기존 도메인 용어를 따른다.
- 동일 개념에 여러 이름을 만들지 않는다.

완료 조건:
- `CreateContent.tsx`의 명시적 `any`가 제거된다.
- 관련 기능의 타입 안정성이 유지된다.
- 실행 가능하면 lint 결과를 보고한다.
