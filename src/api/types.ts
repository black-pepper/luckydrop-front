// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
}

export interface DrawParticipantParams {
  contentCode: string;
  invitationCode: string;
}

// GET /api/draw/verify?contentCode=&invitationCode=
export type DrawStatus =
  | "DRAWABLE"
  | "NO_REMAINING"
  | "CONTENT_NOT_STARTED"
  | "CONTENT_EXPIRED"
  | "NO_AVAILABLE_REWARD";

export interface CodeVerifyResponse {
  name: string;
  remainingCount: number;
  canDraw: boolean;
  drawStatus: DrawStatus;
}

// POST /api/draw/execute
export type DrawRequest = DrawParticipantParams;

export interface DrawResponse {
  drawResultId: number;
  rewardName: string;
  rewardImageUrl?: string;
  drawNo: number;
  remainingCount: number;
  drawnAt: string; // ISO date-time
}

// GET /api/draw/rewards?contentCode=&invitationCode=
export interface RewardResponse {
  id: number;
  name: string;
  description: string;
  weight: number | null;
  poolCount: number | null;
  probability: number;
  stock: number | null;
  unlimited: boolean;
  imageUrl?: string;
}

// GET /api/draw/results?contentCode=&invitationCode=
export interface DrawResultResponse {
  drawResultId: number;
  rewardName: string;
  rewardImageUrl?: string;
  drawNo: number;
  drawnAt: string; // ISO date-time
  delivered: boolean;
}

// GET /api/draw/contents/{contentCode}
export interface ParticipantContentDetailResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  startAt?: string; // ISO date-time
  endAt?: string;   // ISO date-time
}

// Manage content types
export interface ManageContentResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  startAt?: string; // ISO date-time
  endAt?: string;   // ISO date-time
}

export interface ManageContentDetailResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  startAt?: string; // ISO date-time
  endAt?: string;   // ISO date-time
}

export interface ManageContentCreateRequest {
  type: string;
  title: string;
  description?: string;
  startAt?: string; // ISO date-time
  endAt?: string;   // ISO date-time
}

export interface ManageContentUpdateRequest {
  type: string;
  title: string;
  description?: string;
  startAt?: string; // ISO date-time
  endAt?: string;   // ISO date-time
}

export interface ManageContentDeleteResponse {
  code: string;
  deleted: boolean;
}

// GET /user
export interface UserInfo {
  name: string;
  createdAt?: string; // ISO date-time
}

// PUT /user
export interface UserRequest {
  name: string;
}

// Manage reward types
// GET /api/manage/rewards?contentCode={contentCode}
// GET /api/manage/rewards/{rewardId}
export interface ManageRewardResponse {
  id: number;
  contentCode: string;
  name: string;
  description?: string;
  weight: number | null;
  poolCount: number | null;
  probability: number;
  stock: number | null;
  unlimited: boolean;
  imageUrl?: string;
  active: boolean;
  allowDuplicateReward: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// POST /api/manage/rewards
// weight 또는 poolCount 중 하나만 포함해야 합니다. poolCount 사용 시 stock 불가.
export interface RewardCreateRequest {
  contentCode: string;
  name: string;
  description?: string;
  weight?: number;
  poolCount?: number;
  stock?: number;
  imageUrl?: string;
  allowDuplicateReward?: boolean;
  active: boolean;
}

// PUT /api/manage/rewards/{rewardId}
// weight 또는 poolCount 중 하나만 포함해야 합니다. poolCount 사용 시 stock 불가.
export interface RewardUpdateRequest {
  name: string;
  description?: string;
  weight?: number;
  poolCount?: number;
  stock?: number;
  imageUrl?: string;
  allowDuplicateReward?: boolean;
  active: boolean;
}

// POST /api/manage/rewards/batch
export interface RewardBatchCreateRequest {
  contentCode: string;
  rewards: RewardUpdateRequest[];
}

// PUT /api/manage/rewards/batch
export interface RewardBatchUpdateItem {
  rewardId: number;
  name: string;
  description?: string;
  weight?: number;
  poolCount?: number;
  stock?: number;
  imageUrl?: string;
  allowDuplicateReward?: boolean;
  active: boolean;
}

export interface RewardBatchUpdateRequest {
  rewards: RewardBatchUpdateItem[];
}

// Manage invitation code (추첨 코드) types
// GET /api/manage/invitation-codes?contentCode={contentCode}
// GET /api/manage/invitation-codes/{invitationCodeId}
export interface ManageInvitationCodeResponse {
  id: number;
  contentCode: string;
  code: string;
  name?: string;
  allowedDrawCount: number;
  usedDrawCount: number;
  remainingCount: number;
  active: boolean;
  expiresAt?: string; // ISO date-time
  lastUsedAt?: string; // ISO date-time
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// POST /api/manage/invitation-codes
export interface InvitationCodeCreateRequest {
  contentCode: string;
  code: string;
  name?: string;
  allowedDrawCount: number;
  expiresAt?: string; // ISO date-time
  active: boolean;
}

// POST /api/manage/invitation-codes/batch
export interface InvitationCodeBatchCreateRequest {
  contentCode: string;
  invitationCodes: Array<{
    code: string;
    name?: string;
    allowedDrawCount: number;
    expiresAt?: string | null; // ISO date-time
  }>;
}

// PUT /api/manage/invitation-codes/{invitationCodeId}
export interface InvitationCodeUpdateRequest {
  name?: string;
  allowedDrawCount: number;
  expiresAt?: string; // ISO date-time
  active: boolean;
}

// Spring Page 래퍼 (UI에서 사용하는 필드만)
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // 0-based current page
  size: number;
  first: boolean;
  last: boolean;
}

// GET /api/me/participation-histories
export type ParticipationContentStatus = "ACTIVE" | "SCHEDULED" | "ENDED" | "DELETED";

export interface ParticipationHistory {
  contentCode: string;
  contentTitle: string | null;
  contentStatus: ParticipationContentStatus;
  invitationCode: string;
  accessedAt: string; // ISO date-time
  startAt: string | null; // ISO date-time
  endAt: string | null; // ISO date-time
}

export interface ParticipationHistorySearchParams {
  keyword?: string;
  status?: ParticipationContentStatus;
  page?: number;
  size?: number;
}

// GET /api/manage/draw-results 쿼리 파라미터
export interface ManageDrawResultsParams {
  contentCode: string;
  drawnAtFrom?: string; // ISO date-time
  drawnAtTo?: string; // ISO date-time
  delivered?: boolean;
  invitationCode?: string; // 정확 일치
  rewardName?: string; // 부분 일치
  page?: number; // default 0
  size?: number; // default 20
}

// GET /api/manage/draw-results
export interface ManageDrawResultResponse {
  drawResultId: number;
  invitationCode: string;
  invitationCodeName: string;
  rewardName: string;
  drawNo: number;
  drawnAt: string; // ISO date-time
  delivered: boolean;
}

// PUT /api/manage/draw-results/{drawResultId}/delivery
export interface DrawResultDeliveryUpdateRequest {
  delivered: boolean;
}

// POST /inquiries
export type InquiryType = "GENERAL" | "BUG" | "FEATURE" | "ETC";
export type InquiryStatus = "PENDING" | "DONE";

// GET /user/inquiries
export interface UserInquiry {
  id: number;
  createdAt: string; // ISO date-time
  type: InquiryType;
  title: string;
  content: string;
  status: InquiryStatus;
  answer: string | null;
  answeredAt: string | null; // ISO date-time
}

export interface InquiryRequest {
  type: InquiryType;
  title: string;
  content: string;
}
