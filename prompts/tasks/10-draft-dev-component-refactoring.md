## 1. Task Type
- Development (Refactoring)

## 1-1. Prompt File Name
- 작업 번호: 10
- 단계: `draft`
- 유형: `dev`
- 작업 슬러그: component-refactoring
- 최종 파일명: `10-draft-dev-component-refactoring.md`

## 2. Goal
- 복잡도가 높은 컴포넌트(`src/pages/Index.tsx` 등)를 분석하고, 관심사 분리(SoC) 원칙에 따라 커스텀 훅과 서브 컴포넌트로 리팩토링하여 유지보수성과 가독성을 향상시킨다.

## 3. Background
- 현재 `Index.tsx`와 같은 주요 페이지 컴포넌트에 UI 로직, 상태 관리, API 호출, 사이드 이펙트가 혼재되어 있어 코드 파악 및 테스트가 어렵다.
- 기존 코드는 Claude 스타일로 작성되어 있으며, 이 스타일의 일관성을 유지하면서 구조만 개선할 필요가 있다.

## 4. Scope
### Include
- **대상 파일 분석 및 수정**:
  - `src/pages/Index.tsx`: 메인 페이지 리팩토링 및 로직 분리
  - `src/pages/manage/ManageDashboard.tsx`: 관리자 대시보드 리스트 최적화
  - `src/pages/manage/CreateContent.tsx`: 복잡한 폼 상태 관리 및 보상 설정 로직 분리
  - `src/pages/manage/ManageContent.tsx`: 탭 기반 상세 페이지의 책임 분리
- **신규 파일 생성**:
  - `src/hooks/useIndex.ts`, `src/hooks/useContentForm.ts`, `src/hooks/useManageDashboard.ts`
  - `src/pages/manage/components/`: 상세 페이지용 서브 컴포넌트들
  - `src/pages/Index.types.ts`, `src/pages/manage/Manage.types.ts`
- 기존 동작(Behavior) 100% 유지 및 검증

### Exclude
- `src/api/client.ts` 내부의 통신 원형 로직 수정
- 글로벌 스타일 및 `src/components/ui/` 공통 컴포넌트의 파괴적 수정

## 5. Constraints
- 모든 파일은 UTF-8로 저장
- 기존 프로젝트의 네이밍 컨벤션 및 폴더 구조(`src/components/draw`, `src/components/manage`) 준수
- **하위 호환성 보장**: 상위 라우터나 부모 컴포넌트에서의 import 경로 및 Props 명세 유지

## 6. Naming Plan
- 커스텀 훅: `use[ComponentName].ts`
- 서브 컴포넌트: `[ComponentName]SubSection.tsx` 또는 도메인 맥락이 드러나는 이름
- 타입 파일: `[ComponentName].types.ts`
- 테스트 파일: `[ComponentName].test.ts` (필요 시)

## 7. Deliverables
- 분석 보고서 (문제점, 리팩토링 방향, 단계별 계획)
- 리팩토링된 코드 (컴포넌트, 훅, 타입 등 분리된 파일들)
- 기존 동작 유지 확인 결과

## 8. Checks Before Execution
- 목표가 충분히 구체적인가: Yes
- 제외 범위가 명확한가: Yes
- 위험한 변경 여부가 드러나는가: Yes (동작 유지 강조)
- 성공 기준이 명확한가: Yes
- 이름이 기존 프로젝트 규칙과 충돌하지 않는가: Yes

## 9. Final Prompt Draft

```md
파일명:
- 10-draft-dev-component-refactoring.md

다음 공통 규칙을 따른다.
- `prompts/common-rules.md`
- `prompts/modes/development.md`

작업 목표:
- 주요 컴포넌트(예: `src/pages/Index.tsx`)를 분석하고, Single Responsibility Principle(SRP)을 준수하도록 리팩토링을 수행한다.

배경:
- 현재 주요 페이지 컴포넌트가 UI 표현과 복잡한 상태 로직을 모두 포함하고 있어 유지보수 비용이 증가하고 있다.
- 기존 작성 스타일(Claude 기반)을 유지하면서도 더 깔끔한 구조로의 전환이 필요하다.

### 분석 요구사항:
1. **현재 문제점 분석**
   - **대상 파일**: `src/pages/Index.tsx`, `src/pages/manage/ManageDashboard.tsx`, `src/pages/manage/CreateContent.tsx`, `src/pages/manage/ManageContent.tsx`
   - **비대해진 상태 관리**: `Index.tsx` 및 `CreateContent.tsx`에서 10개 이상의 `useState`가 파편화되어 사용되는 지점 확인
   - **폼 로직의 복잡도**: `CreateContent.tsx` 내의 보상(Reward) 동적 추가/삭제 로직 및 유효성 검사 로직의 UI 결합도
   - **API 로직의 파편화**: `useEffect` 내 직접 작성된 API 호출 및 만료 판별 등 도메인 로직 혼재도
   - **기존 스타일 파악**: Claude 특유의 `try-catch-finally`, `useCallback` 패턴 유지

2. **리팩토링 방향 제안 (Target Structure)**
   - **신규 훅 생성**: `src/hooks/useIndex.ts`, `src/hooks/useContentForm.ts` (폼 로직 전용), `src/hooks/useManageDashboard.ts`
   - **신규 타입 생성**: `src/pages/Index.types.ts`, `src/pages/manage/Manage.types.ts`
   - **서브 컴포넌트**: `src/components/draw/` 및 `src/pages/manage/components/` 내에 명확한 책임 단위로 추출 (특히 ManageContent의 탭별 섹션)
   - **State Consolidation**: 파편화된 상태를 의미 있는 단위의 객체(예: `formData`)나 `useReducer`로 통합

3. **단계별 실행 계획**
   - **Phase 1: Logic Extraction**: `Index.tsx`의 상태와 API 호출부를 `useIndex` 훅으로 먼저 이전 (기존 Props/Interface 유지)
   - **Phase 2: Interface Modeling**: 도메인 로직(기간 만료 체크 등)을 순수 함수 유틸리티로 추출
   - **Phase 3: Component Splitting**: JSX 내의 `AppState`별 렌더링 블록을 독립된 서브 컴포넌트로 분리
   - **Phase 4: Cleanup & Optimization**: 불필요한 리렌더링 방지를 위한 `memo` 적용 및 타입 정의 정리

4. **추가 고려사항**
   - **Backward Compatibility**: `Index.tsx`를 사용하는 상위 경로(Router 등)에서의 변경이 없도록 외부 인터페이스 유지
   - **Naming Convention**: `handle[Event]`, `is[Condition]`, `render[Section]` 등 기존에 사용된 명명 규칙 엄수
   - **Error Handling**: 기존의 `error` 상태와 토스트 메시지 출력 로직이 누락되지 않도록 주의

완료 조건:
- 분석 보고서 제출 및 사용자 승인 후 리팩토링 실행
- **정적 검증**: `tsc --noEmit` 빌드 오류 없음
- **수동 테스트**: 아래 시나리오 전체 정상 동작 확인
  1. 유효한 초대 코드 입력 → 사용자 이름 마스킹 표시
  2. 추첨 실행 → 결과 화면 전환
  3. 기간 만료 컨텐츠 진입 → 만료 안내 표시
  4. 히스토리 탭 이동 → 참여 이력 목록 표시
- **구조 검증**: `Index.tsx` 내 `useState` 수가 리팩토링 전보다 유의미하게 감소
- 코드가 SRP를 준수하고 가독성이 확연히 개선됨
```
