// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DrawParticipantParams {
  contentCode: string;
  invitationCode: string;
}

// GET /api/draw/verify?contentCode=&invitationCode=
export interface CodeVerifyResponse {
  maskedName: string;
  remainingCount: number;
  canDraw: boolean;
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
  weight: number;
  probability: number;
  stock: number;
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
}

// Manage content types
export interface ManageContentResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ManageContentDetailResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface ManageContentCreateRequest {
  type: string;
  title: string;
  description: string;
}

export interface ManageContentUpdateRequest {
  type: string;
  title: string;
  description: string;
}

export interface ManageContentDeleteResponse {
  code: string;
  deleted: boolean;
}

// GET /user
export interface UserInfo {
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
  weight: number;
  stock?: number;
  unlimited: boolean;
  imageUrl?: string;
  active: boolean;
  allowDuplicateReward: boolean;
  createdAt: string; // ISO date-time
  updatedAt: string; // ISO date-time
}

// POST /api/manage/rewards
export interface RewardCreateRequest {
  contentCode: string;
  name: string;
  description?: string;
  weight: number;
  stock?: number;
  imageUrl?: string;
  allowDuplicateReward?: boolean;
  active: boolean;
}

// PUT /api/manage/rewards/{rewardId}
export interface RewardUpdateRequest {
  name: string;
  description?: string;
  weight: number;
  stock?: number;
  imageUrl?: string;
  allowDuplicateReward?: boolean;
  active: boolean;
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

// PUT /api/manage/invitation-codes/{invitationCodeId}
export interface InvitationCodeUpdateRequest {
  name?: string;
  allowedDrawCount: number;
  expiresAt?: string; // ISO date-time
  active: boolean;
}

// GET /api/manage/draw-results?contentCode={contentCode}
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
