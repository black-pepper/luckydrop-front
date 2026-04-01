import type {
  ApiResponse,
  CodeVerifyResponse,
  DrawRequest,
  DrawResponse,
  RewardResponse,
  DrawResultResponse,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

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

// 코드 검증 (mock findUser → API)
export async function verifyCode(code: string): Promise<CodeVerifyResponse> {
  return request<CodeVerifyResponse>(`/api/draw/verify?code=${encodeURIComponent(code)}`);
}

// 뽑기 실행 (mock getRandomPrize → API)
export async function executeDraw(code: string): Promise<DrawResponse> {
  return request<DrawResponse>("/api/draw/execute", {
    method: "POST",
    body: JSON.stringify({ code } satisfies DrawRequest),
  });
}

// 보상 목록 조회 (mock rewards → API)
export async function getRewards(code: string): Promise<RewardResponse[]> {
  return request<RewardResponse[]>(`/api/draw/rewards?code=${encodeURIComponent(code)}`);
}

// 결과 내역 조회 (mock history → API)
export async function getResults(code: string): Promise<DrawResultResponse[]> {
  return request<DrawResultResponse[]>(`/api/draw/results?code=${encodeURIComponent(code)}`);
}

export { ApiError };
