import type {
  ApiResponse,
  CodeVerifyResponse,
  DrawRequest,
  DrawResponse,
  DrawParticipantParams,
  RewardResponse,
  DrawResultResponse,
  ParticipantContentDetailResponse,
  AdminContentResponse,
  AdminContentDetailResponse,
  AdminContentCreateRequest,
  AdminContentUpdateRequest,
  AdminContentDeleteResponse,
  UserInfo,
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

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    throw new ApiError(res.status, `요청 실패 (${res.status})`);
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
  return request<CodeVerifyResponse>(`/api/draw/verify?${buildDrawQuery(params)}`);
}

// 뽑기 실행 (mock getRandomPrize → API)
export async function executeDraw(payload: DrawRequest): Promise<DrawResponse> {
  return request<DrawResponse>("/api/draw/execute", {
    method: "POST",
    body: JSON.stringify(payload satisfies DrawRequest),
  });
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
    throw new ApiError(res.status, `요청 실패 (${res.status})`);
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

// ── Admin Content API ───────────────────────────────────────────────────────

export async function getAdminContents(): Promise<AdminContentResponse[]> {
  return authRequest<AdminContentResponse[]>("/api/admin/contents");
}

export async function createAdminContent(
  payload: AdminContentCreateRequest
): Promise<AdminContentResponse> {
  return authRequest<AdminContentResponse>("/api/admin/contents", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAdminContentDetail(
  contentCode: string
): Promise<AdminContentDetailResponse> {
  return authRequest<AdminContentDetailResponse>(
    `/api/admin/contents/${encodeURIComponent(contentCode)}`
  );
}

export async function updateAdminContent(
  contentCode: string,
  payload: AdminContentUpdateRequest
): Promise<AdminContentResponse> {
  return authRequest<AdminContentResponse>(
    `/api/admin/contents/${encodeURIComponent(contentCode)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
}

export async function deleteAdminContent(
  contentCode: string
): Promise<AdminContentDeleteResponse> {
  return authRequest<AdminContentDeleteResponse>(
    `/api/admin/contents/${encodeURIComponent(contentCode)}`,
    { method: "DELETE" }
  );
}

// ── User API ────────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<UserInfo> {
  return authRequest<UserInfo>("/user");
}
