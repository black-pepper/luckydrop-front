파일명:
- 02-dev-lint-use-index-any.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- `src/hooks/useIndex.ts`의 `any` 타입 사용을 제거한다.

배경:
- ESLint 규칙 `@typescript-eslint/no-explicit-any` 위반이 발생한다.
- 대상 위치:
  - `src/hooks/useIndex.ts:73`
  - `src/hooks/useIndex.ts:91`

포함 범위:
- `useIndex.ts`의 데이터 흐름과 호출부를 먼저 확인한다.
- 실제 값 구조에 맞는 타입을 정의하거나 기존 타입을 재사용한다.
- 타입 변경으로 호출부가 깨지지 않도록 필요한 최소 수정만 수행한다.

제외 범위:
- 훅의 동작 방식 변경은 제외한다.
- API 응답 구조를 임의로 바꾸지 않는다.
- 다른 파일의 `any` 제거는 제외한다.

제약:
- 기존 훅의 반환값과 사용 패턴을 유지한다.
- 타입을 과하게 넓히기보다 실제 사용 필드 중심으로 작성한다.
- 확신이 없는 외부 응답은 `unknown`에서 안전하게 좁히는 방식을 우선 고려한다.

명명 규칙:
- 새 타입이 필요하면 `Index...`, `...Response`, `...Item`처럼 역할이 드러나게 작성한다.
- 기존 타입이 있으면 새로 만들지 않고 재사용한다.

완료 조건:
- `useIndex.ts`의 명시적 `any`가 제거된다.
- 타입 검사와 lint에 악영향이 없다.
- 변경 내용과 검증 결과를 요약한다.
