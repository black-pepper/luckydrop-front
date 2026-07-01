import type {
  ApiResponse,
  CodeVerifyResponse,
  DrawRequest,
  DrawResponse,
  DrawParticipantParams,
  RewardResponse,
  DrawResultResponse,
  ParticipantContentDetailResponse,
  ManageContentResponse,
  ManageContentDetailResponse,
  ManageContentCreateRequest,
  ManageContentUpdateRequest,
  ManageContentDeleteResponse,
  UserInfo,
  ManageRewardResponse,
  RewardCreateRequest,
  RewardUpdateRequest,
  RewardBatchCreateRequest,
  RewardBatchUpdateRequest,
  ManageInvitationCodeResponse,
  InvitationCodeCreateRequest,
  InvitationCodeBatchCreateRequest,
  InvitationCodeUpdateRequest,
  ManageParticipantCodeResponse,
  ParticipantCodeCreateRequest,
  ParticipantCodeBatchCreateRequest,
  ParticipantCodeUpdateRequest,
  ParticipantCodeImportRequest,
  ParticipantCodeImportResponse,
  ManageDrawResultResponse,
  ManageDrawResultsParams,
  PageResponse,
  DrawResultDeliveryUpdateRequest,
  InquiryRequest,
  UserInquiry,
  ParticipationHistory,
  ParticipationHistorySearchParams,
} from "./types";
import { supabase } from "@/lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Base request helpers ────────────────────────────────────────────────────

async function request<T>(
  url: string,
  options?: RequestInit,
  config?: { includeAuth?: boolean }
): Promise<T> {
  const headers = new Headers(options?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (config?.includeAuth) {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.message ?? `요청 실패 (${res.status})`);
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(400, json.message ?? "요청을 처리할 수 없습니다");
  }

  return json.data;
}

function buildDrawQuery({ contentCode, invitationCode }: DrawParticipantParams) {
  return new URLSearchParams({
    contentCode,
    invitationCode,
  }).toString();
}

// 코드 검증 (mock findUser → API)
export async function verifyCode(params: DrawParticipantParams): Promise<CodeVerifyResponse> {
  return request<CodeVerifyResponse>(
    `/api/draw/verify?${buildDrawQuery(params)}`,
    undefined,
    { includeAuth: true }
  );
}

// 뽑기 실행 (mock getRandomPrize → API)
export async function executeDraw(payload: DrawRequest): Promise<DrawResponse> {
  return request<DrawResponse>("/api/draw/execute", {
    method: "POST",
    body: JSON.stringify(payload satisfies DrawRequest),
  }, { includeAuth: true });
}

// 보상 목록 조회 (mock rewards → API)
export async function getRewards(params: DrawParticipantParams): Promise<RewardResponse[]> {
  return request<RewardResponse[]>(`/api/draw/rewards?${buildDrawQuery(params)}`);
}

// 결과 내역 조회 (mock history → API)
export async function getResults(params: DrawParticipantParams): Promise<DrawResultResponse[]> {
  return request<DrawResultResponse[]>(`/api/draw/results?${buildDrawQuery(params)}`);
}

async function authRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (res.status === 401 && body?.code === "TOKEN_EXPIRED") {
      // 토큰 만료 시에만 signOut. SIGNED_OUT 이벤트 → ProtectedRoute가 /manage/login으로 리다이렉트.
      await supabase.auth.signOut();
    }
    throw new ApiError(res.status, body?.message ?? `요청 실패 (${res.status})`);
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new ApiError(
      500,
      "API 서버 응답이 JSON이 아닙니다. VITE_API_BASE_URL이 백엔드 서버 주소로 설정되어 있는지 확인해주세요."
    );
  }

  const json: ApiResponse<T> = await res.json();

  if (!json.success) {
    throw new ApiError(400, json.message ?? "요청을 처리할 수 없습니다");
  }

  return json.data;
}

// ── Participant content detail ──────────────────────────────────────────────

export async function getParticipantContentDetail(
  contentCode: string
): Promise<ParticipantContentDetailResponse> {
  return request<ParticipantContentDetailResponse>(
    `/api/draw/contents/${encodeURIComponent(contentCode)}`
  );
}

// ── Manage Content API ─────────────────────────────────────────────────────

export async function getManageContents(): Promise<ManageContentResponse[]> {
  return authRequest<ManageContentResponse[]>("/api/manage/contents");
}

export async function createManageContent(
  payload: ManageContentCreateRequest
): Promise<ManageContentResponse> {
  return authRequest<ManageContentResponse>("/api/manage/contents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getManageContentDetail(
  contentCode: string
): Promise<ManageContentDetailResponse> {
  return authRequest<ManageContentDetailResponse>(
    `/api/manage/contents/${encodeURIComponent(contentCode)}`
  );
}

export async function updateManageContent(
  contentCode: string,
  payload: ManageContentUpdateRequest
): Promise<ManageContentResponse> {
  return authRequest<ManageContentResponse>(
    `/api/manage/contents/${encodeURIComponent(contentCode)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteManageContent(
  contentCode: string
): Promise<ManageContentDeleteResponse> {
  return authRequest<ManageContentDeleteResponse>(
    `/api/manage/contents/${encodeURIComponent(contentCode)}`,
    { method: "DELETE" }
  );
}

// ── User API ────────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<UserInfo> {
  return authRequest<UserInfo>("/user");
}

export async function updateCurrentUser(payload: { name: string }): Promise<UserInfo> {
  return authRequest<UserInfo>("/user", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function withdrawUser(): Promise<void> {
  return authRequest<void>("/user", {
    method: "DELETE",
  });
}

// ── My Participation History API ───────────────────────────────────────────

export async function getMyParticipationHistories(
  params: ParticipationHistorySearchParams = {}
): Promise<PageResponse<ParticipationHistory>> {
  const sp = new URLSearchParams();
  if (params.keyword?.trim()) sp.set("keyword", params.keyword.trim());
  if (params.status) sp.set("status", params.status);
  sp.set("page", String(params.page ?? 0));
  sp.set("size", String(params.size ?? 20));

  return authRequest<PageResponse<ParticipationHistory>>(
    `/api/me/participation-histories?${sp.toString()}`
  );
}

// ── Manage Reward API ──────────────────────────────────────────────────────

export async function getManageRewardsByContent(contentCode: string): Promise<ManageRewardResponse[]> {
  return authRequest<ManageRewardResponse[]>(
    `/api/manage/rewards?contentCode=${encodeURIComponent(contentCode)}`
  );
}

export async function getManageReward(rewardId: number): Promise<ManageRewardResponse> {
  return authRequest<ManageRewardResponse>(`/api/manage/rewards/${rewardId}`);
}

export async function createManageReward(payload: RewardCreateRequest): Promise<ManageRewardResponse> {
  return authRequest<ManageRewardResponse>("/api/manage/rewards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateManageReward(
  rewardId: number,
  payload: RewardUpdateRequest
): Promise<ManageRewardResponse> {
  return authRequest<ManageRewardResponse>(`/api/manage/rewards/${rewardId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteManageReward(rewardId: number): Promise<void> {
  return authRequest<void>(`/api/manage/rewards/${rewardId}`, { method: "DELETE" });
}

export async function createManageRewards(
  payload: RewardBatchCreateRequest
): Promise<ManageRewardResponse[]> {
  return authRequest<ManageRewardResponse[]>("/api/manage/rewards/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateManageRewards(
  payload: RewardBatchUpdateRequest
): Promise<ManageRewardResponse[]> {
  return authRequest<ManageRewardResponse[]>("/api/manage/rewards/batch", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAllManageRewardsByContent(contentCode: string): Promise<void> {
  return authRequest<void>(
    `/api/manage/rewards/batch?contentCode=${encodeURIComponent(contentCode)}`,
    { method: "DELETE" }
  );
}

// ── Manage Invitation Code API (추첨 코드) ─────────────────────────────────

export async function getManageInvitationCodesByContent(contentCode: string): Promise<ManageInvitationCodeResponse[]> {
  return authRequest<ManageInvitationCodeResponse[]>(
    `/api/manage/invitation-codes?contentCode=${encodeURIComponent(contentCode)}`
  );
}

export async function getManageInvitationCode(invitationCodeId: number): Promise<ManageInvitationCodeResponse> {
  return authRequest<ManageInvitationCodeResponse>(`/api/manage/invitation-codes/${invitationCodeId}`);
}

export async function createManageInvitationCode(payload: InvitationCodeCreateRequest): Promise<ManageInvitationCodeResponse> {
  return authRequest<ManageInvitationCodeResponse>("/api/manage/invitation-codes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createManageInvitationCodesBatch(
  payload: InvitationCodeBatchCreateRequest
): Promise<ManageInvitationCodeResponse[]> {
  return authRequest<ManageInvitationCodeResponse[]>("/api/manage/invitation-codes/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateManageInvitationCode(
  invitationCodeId: number,
  payload: InvitationCodeUpdateRequest
): Promise<ManageInvitationCodeResponse> {
  return authRequest<ManageInvitationCodeResponse>(`/api/manage/invitation-codes/${invitationCodeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteManageInvitationCode(invitationCodeId: number): Promise<void> {
  return authRequest<void>(`/api/manage/invitation-codes/${invitationCodeId}`, { method: "DELETE" });
}

// ── Manage Participant Code API ────────────────────────────────────────────

export async function getManageParticipantCodes(): Promise<ManageParticipantCodeResponse[]> {
  return authRequest<ManageParticipantCodeResponse[]>("/api/manage/participant-codes");
}

export async function getManageParticipantCode(participantCodeId: number): Promise<ManageParticipantCodeResponse> {
  return authRequest<ManageParticipantCodeResponse>(`/api/manage/participant-codes/${participantCodeId}`);
}

export async function createManageParticipantCode(
  payload: ParticipantCodeCreateRequest
): Promise<ManageParticipantCodeResponse> {
  return authRequest<ManageParticipantCodeResponse>("/api/manage/participant-codes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createManageParticipantCodesBatch(
  payload: ParticipantCodeBatchCreateRequest
): Promise<ManageParticipantCodeResponse[]> {
  return authRequest<ManageParticipantCodeResponse[]>("/api/manage/participant-codes/batch", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateManageParticipantCode(
  participantCodeId: number,
  payload: ParticipantCodeUpdateRequest
): Promise<ManageParticipantCodeResponse> {
  return authRequest<ManageParticipantCodeResponse>(
    `/api/manage/participant-codes/${participantCodeId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteManageParticipantCode(participantCodeId: number): Promise<void> {
  return authRequest<void>(`/api/manage/participant-codes/${participantCodeId}`, { method: "DELETE" });
}

export async function importParticipantCodesToInvitationCodes(
  payload: ParticipantCodeImportRequest
): Promise<ParticipantCodeImportResponse> {
  return authRequest<ParticipantCodeImportResponse>("/api/manage/invitation-codes/import-participant-codes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ── Manage Draw Results API ─────────────────────────────────────────────────

export async function getManageDrawResults(
  params: ManageDrawResultsParams
): Promise<PageResponse<ManageDrawResultResponse>> {
  const sp = new URLSearchParams();
  sp.set("contentCode", params.contentCode);
  if (params.drawnAtFrom) sp.set("drawnAtFrom", params.drawnAtFrom);
  if (params.drawnAtTo) sp.set("drawnAtTo", params.drawnAtTo);
  if (params.delivered !== undefined) sp.set("delivered", String(params.delivered));
  if (params.invitationCode) sp.set("invitationCode", params.invitationCode);
  if (params.rewardName) sp.set("rewardName", params.rewardName);
  sp.set("page", String(params.page ?? 0));
  sp.set("size", String(params.size ?? 20));
  return authRequest<PageResponse<ManageDrawResultResponse>>(
    `/api/manage/draw-results?${sp.toString()}`
  );
}

// ── Inquiry API ────────────────────────────────────────────────────────────

export async function getUserInquiries(): Promise<UserInquiry[]> {
  return authRequest<UserInquiry[]>("/user/inquiries");
}

export async function getUserInquiry(inquiryId: number): Promise<UserInquiry> {
  return authRequest<UserInquiry>(`/user/inquiries/${inquiryId}`);
}

export async function createInquiry(payload: InquiryRequest): Promise<void> {
  return request<void>("/inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  }, { includeAuth: true });
}

export async function updateDeliveryStatus(
  drawResultId: number,
  payload: DrawResultDeliveryUpdateRequest
): Promise<ManageDrawResultResponse> {
  return authRequest<ManageDrawResultResponse>(
    `/api/manage/draw-results/${drawResultId}/delivery`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}
