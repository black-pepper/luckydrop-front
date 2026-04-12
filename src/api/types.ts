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
}

// GET /api/draw/contents/{contentCode}
export interface ParticipantContentDetailResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

// Admin content types
export interface AdminContentResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface AdminContentDetailResponse {
  code: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
}

export interface AdminContentCreateRequest {
  type: string;
  title: string;
  description: string;
}

export interface AdminContentUpdateRequest {
  type: string;
  title: string;
  description: string;
}

export interface AdminContentDeleteResponse {
  code: string;
  deleted: boolean;
}

// GET /user
export interface UserInfo {
  name: string;
}
