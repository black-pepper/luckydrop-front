- - # 파일명
    - `03-draft-dev-luckydrop-api-integration-expansion.md`

    # 따라야 할 공통 규칙
    - `prompts/common-rules.md`
    - `prompts/modes/development.md`

    # 작업 목표
    - 현재 프론트엔드에 일부만 연결되어 있는 LuckyDrop API 연동 상태를 점검하고, 기존 API는 유지 또는 정리하고, 새로 추가된 API는 반영하고, 아직 연결되지 않은 API는 필요한 화면과 함께 추가한다.
    - OpenAPI 문서를 기준으로 `src/api` 계층과 관련 페이지를 정리해, 참가자용 draw 흐름과 관리자용 content 관리 흐름이 실제 API 기반으로 동작하도록 맞춘다.

    # 배경
    - 현재 프로젝트에는 draw 관련 일부 API만 `src/api/client.ts`, `src/api/types.ts`에 연결되어 있다.
    - 현재 연결된 API는 주로 참가자 draw 흐름 중심이다.
      - `GET /api/draw/verify`
      - `POST /api/draw/execute`
      - `GET /api/draw/rewards`
      - `GET /api/draw/results`
    - OpenAPI 기준으로 이번에 함께 고려해야 할 API는 다음과 같다.
      - 기존에 이미 일부 연결된 API
        - `GET /api/draw/verify`
        - `POST /api/draw/execute`
        - `GET /api/draw/rewards`
        - `GET /api/draw/results`
      - 새롭게 추가되었거나 프론트에서 아직 반영되지 않은 API
        - `GET /api/draw/contents/{contentCode}`
        - `GET /api/admin/contents`
        - `POST /api/admin/contents`
        - `GET /api/admin/contents/{contentCode}`
        - `PUT /api/admin/contents/{contentCode}`
        - `DELETE /api/admin/contents/{contentCode}`
        - `GET /user`
    - 현재 관리자 화면은 mock 데이터 기반 코드가 남아 있고, draw 진입 화면도 콘텐츠 상세 API를 아직 직접 사용하지 않을 수 있다.
    - 이번 작업은 OpenAPI 스펙을 기준으로 프론트의 API 타입, 요청 함수, 관련 화면 연동 범위를 재정리하는 목적이다.
  
    # 포함 범위
    - `src/api/types.ts`에 OpenAPI 기준 응답/요청 타입을 추가하거나 기존 타입을 정리
    - `src/api/client.ts` 또는 역할별 별도 API 모듈에 LuckyDrop API 함수 추가
    - 기존 draw API 함수와 타입이 OpenAPI 문서와 어긋나는 부분이 있으면 최소 범위로 정리
    - 참가자용 콘텐츠 상세 조회 API `GET /api/draw/contents/{contentCode}` 연동
    - 관리자용 contents 목록/생성/상세/수정/삭제 API 연동
    - `/user` API가 필요한 인증/관리자 진입 흐름에 실제로 필요하다면 최소 범위로 반영
    - 현재 mock 기반 관리자 페이지 중 이번 API와 직접 관련된 화면을 실제 API 호출 기반으로 교체
    - 로딩, 실패, 빈 상태를 최소한의 UI로 처리
    - bearerAuth가 필요한 관리자 API는 현재 프로젝트 인증 구조를 먼저 확인한 뒤, 기존 방식과 충돌하지 않게 최소 범위로 연결
    - 기존에 이미 붙어 있는 draw API는 회귀 없이 유지되도록 점검

    # 제외 범위
    - 백엔드 API 자체 수정
    - OpenAPI 문서 자체 수정
    - 관리자 인증 체계 전면 개편
    - draw 외 신규 콘텐츠 타입 전체 구현
    - 디자인 리뉴얼이나 대규모 UI 재구성
    - 명세에 없는 추가 기능 추측 구현
  
    # 구현 제약
    - 모든 파일은 UTF-8로 저장한다.
    - 먼저 현재 `src/api`, `src/pages`, `src/components`, `src/data` 구조를 확인한 뒤 작업한다.
    - 기존 프로젝트 네이밍과 파일 구조를 최대한 유지한다.
    - 변경 범위는 최소화하되, mock 데이터에 의존하는 부분이 이번 API 연동을 막는다면 필요한 범위에서만 제거 또는 대체한다.
    - 기존 draw 흐름은 회귀되지 않도록 유지한다.
    - 관리자 API의 인증 헤더 처리 방식은 현재 코드베이스의 인증 처리 흐름을 우선 따른다.
    - API 응답은 OpenAPI의 `ApiResponse<T>` 래퍼 구조를 기준으로 처리한다.
    - 타입 이름, 함수 이름, 화면 이름은 기존 용어와 충돌하지 않게 맞춘다.
    - 필요한 경우 테스트 또는 최소 검증 절차를 포함한다.
  
    # 명명 계획
    - 우선 검토할 파일
      - `src/api/types.ts`
      - `src/api/client.ts`
      - `src/pages/Index.tsx`
      - `src/pages/admin/AdminDashboard.tsx`
      - `src/pages/admin/CreateContent.tsx`
      - `src/pages/admin/ManageContent.tsx`
      - `src/data/adminMockData.ts`
      - `src/pages/admin/AdminLogin.tsx`
    - 권장 API 함수 예시
      - `getParticipantContentDetail(contentCode)`
      - `getAdminContents()`
      - `createAdminContent(payload)`
      - `getAdminContentDetail(contentCode)`
      - `updateAdminContent(contentCode, payload)`
      - `deleteAdminContent(contentCode)`
      - `getCurrentUser()`
    - 기존 함수 유지 검토 대상
      - `verifyCode`
      - `executeDraw`
      - `getRewards`
      - `getResults`
    - 용어 통일 기준
      - 경로 파라미터는 `contentCode`
      - 참가자 식별 입력은 `invitationCode`
      - 관리자 콘텐츠 응답은 `AdminContentResponse`, `AdminContentDetailResponse`, `AdminContentDeleteResponse`
      - 참가자 콘텐츠 응답은 `ParticipantContentDetailResponse`
  
    # 참고 문서
    - `prompts/common-rules.md`
    - `prompts/templates/prompt-draft-template.md`
    - `prompts/modes/development.md`
  
    # 참고 스펙
    - 이번 작업은 아래 OpenAPI 스펙을 기준으로 한다.
    - 기존 연동 여부와 상관없이 아래 명세를 우선 기준으로 삼되, 현재 코드에 이미 반영된 부분은 재사용 가능한지 먼저 검토한다.
    - 특히 다음 API들의 사용처를 분류해서 작업한다.
      - 이미 존재하는 연동
        - draw verify
        - draw execute
        - draw rewards
        - draw results
      - 새로 추가되었거나 미연동 상태인 API
        - participant content detail
        - admin contents CRUD
        - current user
  
    # 완료 조건
    - `src/api` 계층에서 OpenAPI 기준 타입과 요청 함수가 정리되어 있다.
    - 기존 draw API는 계속 동작하며, 타입 또는 응답 처리 불일치가 있으면 정리되어 있다.
    - 참가자용 콘텐츠 상세 조회가 실제 API 기반으로 연결되어 있다.
    - 관리자용 contents 목록/생성/상세/수정/삭제 중 현재 화면 구조에서 필요한 범위가 실제 API 기반으로 연결되어 있다.
    - 관련 mock 의존성이 이번 작업 범위 내에서 제거 또는 축소되어 있다.
    - 인증이 필요한 관리자 API는 현재 프로젝트 방식에 맞게 요청된다.
    - 최소한의 로딩/에러/빈 상태 처리가 반영되어 있다.
    - 변경 사항, 영향 범위, 남은 확인 필요 사항, 테스트 또는 검증 결과가 함께 정리되어 있다.
  

    # API 문서
    ```
    {"openapi":"3.1.0","info":{"title":"Luckydrop API","version":"v1"},"servers":[{"url":"https://port-0-luckydrop-api-dev-mmj1aamw01ba1757.sel3.cloudtype.app","description":"Generated server url"}],"paths":{"/api/admin/contents/{contentCode}":{"get":{"tags":["admin-content-controller"],"operationId":"getDetail","parameters":[{"name":"contentCode","in":"path","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminContentDetailResponse"}}}}},"security":[{"bearerAuth":[]}]},"put":{"tags":["admin-content-controller"],"operationId":"update","parameters":[{"name":"contentCode","in":"path","required":true,"schema":{"type":"string"}}],"requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AdminContentUpdateRequest"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminContentResponse"}}}}},"security":[{"bearerAuth":[]}]},"delete":{"tags":["admin-content-controller"],"operationId":"delete","parameters":[{"name":"contentCode","in":"path","required":true,"schema":{"type":"string"}}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminContentDeleteResponse"}}}}},"security":[{"bearerAuth":[]}]}},"/api/draw/execute":{"post":{"tags":["draw-controller"],"summary":"추첨 실행","description":"콘텐츠 코드와 초대 코드를 함께 받아 해당 참가자 기준으로 실제 추첨을 수행한다.","operationId":"executeDraw","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/DrawRequest"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseDrawResponse"}}}}}}},"/api/admin/contents":{"get":{"tags":["admin-content-controller"],"operationId":"getContents","responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListAdminContentResponse"}}}}},"security":[{"bearerAuth":[]}]},"post":{"tags":["admin-content-controller"],"operationId":"create","requestBody":{"content":{"application/json":{"schema":{"$ref":"#/components/schemas/AdminContentCreateRequest"}}},"required":true},"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseAdminContentResponse"}}}}},"security":[{"bearerAuth":[]}]}},"/user":{"get":{"tags":["user-controller"],"operationId":"getCurrentUser","responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseUserInfo"}}}}},"security":[{"bearerAuth":[]}]}},"/api/draw/verify":{"get":{"tags":["draw-controller"],"summary":"초대 코드 검증","description":"콘텐츠 코드와 초대 코드를 함께 받아 해당 참가자의 추첨 가능 상태와 남은 횟수를 확인한다.","operationId":"verifyCode","parameters":[{"name":"contentCode","in":"query","description":"참가자가 진입한 콘텐츠 코드","required":true,"schema":{"type":"string","minLength":1},"example":"CONTENT-001"},{"name":"invitationCode","in":"query","description":"콘텐츠 내부에서만 유니크한 초대 코드","required":true,"schema":{"type":"string","minLength":1},"example":"INVITE-001"}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseCodeVerifyResponse"}}}}}}},"/api/draw/rewards":{"get":{"tags":["draw-controller"],"summary":"참가자별 보상 목록 조회","description":"콘텐츠 코드와 초대 코드를 함께 받아 해당 참가자 기준으로 현재 추첨 가능한 보상 목록을 조회한다.","operationId":"getRewards","parameters":[{"name":"contentCode","in":"query","description":"참가자가 진입한 콘텐츠 코드","required":true,"schema":{"type":"string","minLength":1},"example":"CONTENT-001"},{"name":"invitationCode","in":"query","description":"콘텐츠 내부에서만 유니크한 초대 코드","required":true,"schema":{"type":"string","minLength":1},"example":"INVITE-001"}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListRewardResponse"}}}}}}},"/api/draw/results":{"get":{"tags":["draw-controller"],"summary":"참가자 추첨 결과 조회","description":"콘텐츠 코드와 초대 코드를 함께 받아 해당 참가자의 추첨 결과 이력을 조회한다.","operationId":"getResults","parameters":[{"name":"contentCode","in":"query","description":"참가자가 진입한 콘텐츠 코드","required":true,"schema":{"type":"string","minLength":1},"example":"CONTENT-001"},{"name":"invitationCode","in":"query","description":"콘텐츠 내부에서만 유니크한 초대 코드","required":true,"schema":{"type":"string","minLength":1},"example":"INVITE-001"}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseListDrawResultResponse"}}}}}}},"/api/draw/contents/{contentCode}":{"get":{"tags":["draw-controller"],"summary":"참가자용 콘텐츠 상세 조회","description":"콘텐츠 코드만으로 참가자에게 공개 가능한 콘텐츠 상세 정보를 조회한다.","operationId":"getContentDetail","parameters":[{"name":"contentCode","in":"path","description":"조회할 콘텐츠 코드","required":true,"schema":{"type":"string"},"example":"CONTENT-001"}],"responses":{"200":{"description":"OK","content":{"*/*":{"schema":{"$ref":"#/components/schemas/ApiResponseParticipantContentDetailResponse"}}}}}}}},"components":{"schemas":{"AdminContentUpdateRequest":{"type":"object","properties":{"type":{"type":"string","minLength":1},"title":{"type":"string","minLength":1},"description":{"type":"string","minLength":1}},"required":["description","title","type"]},"AdminContentResponse":{"type":"object","properties":{"code":{"type":"string"},"type":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"createdAt":{"type":"string","format":"date-time"}}},"ApiResponseAdminContentResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/AdminContentResponse"},"message":{"type":"string"}}},"DrawRequest":{"type":"object","properties":{"contentCode":{"type":"string","description":"참가자가 진입한 콘텐츠 코드","example":"CONTENT-001","minLength":1},"invitationCode":{"type":"string","description":"콘텐츠 내부에서만 유니크한 초대 코드","example":"INVITE-001","minLength":1}},"required":["contentCode","invitationCode"]},"ApiResponseDrawResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/DrawResponse"},"message":{"type":"string"}}},"DrawResponse":{"type":"object","properties":{"drawResultId":{"type":"integer","format":"int64"},"rewardName":{"type":"string"},"rewardImageUrl":{"type":"string"},"drawNo":{"type":"integer","format":"int32"},"remainingCount":{"type":"integer","format":"int32"},"drawnAt":{"type":"string","format":"date-time"}}},"AdminContentCreateRequest":{"type":"object","properties":{"type":{"type":"string","minLength":1},"title":{"type":"string","minLength":1},"description":{"type":"string","minLength":1}},"required":["description","title","type"]},"ApiResponseUserInfo":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/UserInfo"},"message":{"type":"string"}}},"UserInfo":{"type":"object","properties":{"name":{"type":"string"}}},"ApiResponseCodeVerifyResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/CodeVerifyResponse"},"message":{"type":"string"}}},"CodeVerifyResponse":{"type":"object","properties":{"maskedName":{"type":"string"},"remainingCount":{"type":"integer","format":"int32"},"canDraw":{"type":"boolean"}}},"ApiResponseListRewardResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"type":"array","items":{"$ref":"#/components/schemas/RewardResponse"}},"message":{"type":"string"}}},"RewardResponse":{"type":"object","properties":{"id":{"type":"integer","format":"int64"},"name":{"type":"string"},"description":{"type":"string"},"weight":{"type":"integer","format":"int32"},"probability":{"type":"number","format":"double"},"stock":{"type":"integer","format":"int32"},"unlimited":{"type":"boolean"},"imageUrl":{"type":"string"}}},"ApiResponseListDrawResultResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"type":"array","items":{"$ref":"#/components/schemas/DrawResultResponse"}},"message":{"type":"string"}}},"DrawResultResponse":{"type":"object","properties":{"drawResultId":{"type":"integer","format":"int64"},"rewardName":{"type":"string"},"rewardImageUrl":{"type":"string"},"drawNo":{"type":"integer","format":"int32"},"drawnAt":{"type":"string","format":"date-time"}}},"ApiResponseParticipantContentDetailResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/ParticipantContentDetailResponse"},"message":{"type":"string"}}},"ParticipantContentDetailResponse":{"type":"object","properties":{"code":{"type":"string"},"type":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"createdAt":{"type":"string","format":"date-time"}}},"ApiResponseListAdminContentResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"type":"array","items":{"$ref":"#/components/schemas/AdminContentResponse"}},"message":{"type":"string"}}},"AdminContentDetailResponse":{"type":"object","properties":{"code":{"type":"string"},"type":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"createdAt":{"type":"string","format":"date-time"}}},"ApiResponseAdminContentDetailResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/AdminContentDetailResponse"},"message":{"type":"string"}}},"AdminContentDeleteResponse":{"type":"object","properties":{"code":{"type":"string"},"deleted":{"type":"boolean"}}},"ApiResponseAdminContentDeleteResponse":{"type":"object","properties":{"success":{"type":"boolean"},"data":{"$ref":"#/components/schemas/AdminContentDeleteResponse"},"message":{"type":"string"}}}},"securitySchemes":{"bearerAuth":{"type":"http","scheme":"bearer","bearerFormat":"JWT"}}}}
    ```