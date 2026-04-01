// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// GET /api/draw/verify?code=
export interface CodeVerifyResponse {
  maskedName: string;
  remainingCount: number;
  canDraw: boolean;
}

// POST /api/draw/execute
export interface DrawRequest {
  code: string;
}

export interface DrawResponse {
  drawResultId: number;
  rewardName: string;
  rewardImageUrl?: string;
  drawNo: number;
  remainingCount: number;
  drawnAt: string; // ISO date-time
}

// GET /api/draw/rewards?code=
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

// GET /api/draw/results?code=
export interface DrawResultResponse {
  drawResultId: number;
  rewardName: string;
  rewardImageUrl?: string;
  drawNo: number;
  drawnAt: string; // ISO date-time
}
