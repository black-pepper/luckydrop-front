// ─── Admin mock data (UI only, no real logic) ───

export type ContentType = "draw" | "quiz" | "messagebox";
export type ContentStatus = "active" | "ended";

export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
}

export interface MockReward {
  id: string;
  name: string;
  weight: number;
  stock: number;
}

export interface MockInviteCode {
  id: string;
  code: string;
  nickname: string;
  memo: string;
  remaining: number;
}

export interface MockDrawResult {
  id: string;
  code: string;
  reward: string;
  drawnAt: string;
}

// ── Dashboard content list ──
export const mockContents: ContentItem[] = [
  {
    id: "1",
    title: "여름 이벤트 뽑기",
    type: "draw",
    status: "active",
    createdAt: "2026-03-10",
  },
  {
    id: "2",
    title: "회사 퀴즈 이벤트",
    type: "quiz",
    status: "active",
    createdAt: "2026-03-08",
  },
  {
    id: "3",
    title: "익명 메시지함",
    type: "messagebox",
    status: "ended",
    createdAt: "2026-02-20",
  },
];

// ── Content‑detail mock (for manage page) ──
export const mockRewards: MockReward[] = [
  { id: "r1", name: "스타벅스 쿠폰", weight: 10, stock: 12 },
  { id: "r2", name: "비타500", weight: 25, stock: 54 },
  { id: "r3", name: "편의점 상품권", weight: 5, stock: 3 },
  { id: "r4", name: "꽝", weight: 60, stock: 999 },
];

export const mockInviteCodes: MockInviteCode[] = [
  { id: "c1", code: "ABC123", nickname: "김철수", memo: "VIP 고객", remaining: 3 },
  { id: "c2", code: "DEF456", nickname: "이영희", memo: "", remaining: 1 },
  { id: "c3", code: "GHI789", nickname: "박지훈", memo: "테스트용", remaining: 0 },
];

export const mockResults: MockDrawResult[] = [
  { id: "d1", code: "ABC123", reward: "스타벅스 쿠폰", drawnAt: "2026-03-12 14:23" },
  { id: "d2", code: "DEF456", reward: "꽝", drawnAt: "2026-03-12 15:01" },
  { id: "d3", code: "ABC123", reward: "비타500", drawnAt: "2026-03-11 10:45" },
];

// ── Helpers ──
export const contentTypeLabel: Record<ContentType, string> = {
  draw: "뽑기",
  quiz: "퀴즈",
  messagebox: "메시지함",
};

export const contentStatusLabel: Record<ContentStatus, string> = {
  active: "진행중",
  ended: "종료",
};
