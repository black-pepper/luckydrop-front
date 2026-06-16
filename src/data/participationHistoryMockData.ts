export type EventStatus = "ONGOING" | "ENDED";

export interface ParticipationHistoryItem {
  id: string;
  eventTitle: string;
  description: string;
  status: EventStatus;
  code: string;
  lastVisitedAt: string;
  periodStart: string;
  periodEnd: string;
  hasResult: boolean;
}

export const mockParticipationHistory: ParticipationHistoryItem[] = [
  {
    id: "evt-1",
    eventTitle: "행운의 룰렛 이벤트",
    description: "매일 한 번 룰렛을 돌려 다양한 경품을 받아보세요.",
    status: "ONGOING",
    code: "SPRING2026",
    lastVisitedAt: "2026-06-15T14:32:00",
    periodStart: "2026-06-01",
    periodEnd: "2026-06-30",
    hasResult: true,
  },
  {
    id: "evt-2",
    eventTitle: "여름 휴가 추첨",
    description: "시원한 여름을 위한 특별 추첨 이벤트입니다.",
    status: "ENDED",
    code: "SUMMER01",
    lastVisitedAt: "2026-05-21T18:12:00",
    periodStart: "2026-05-01",
    periodEnd: "2026-05-20",
    hasResult: true,
  },
  {
    id: "evt-3",
    eventTitle: "신규 회원 감사 이벤트",
    description: "신규 회원 가입을 환영하는 감사 추첨입니다.",
    status: "ONGOING",
    code: "WELCOME",
    lastVisitedAt: "2026-04-10T10:01:00",
    periodStart: "2026-04-01",
    periodEnd: "2026-12-31",
    hasResult: false,
  },
];

export const formatHistoryDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatPeriod = (start: string, end: string) => {
  const fmt = (s: string) => s.replace(/-/g, ".");

  return `${fmt(start)} ~ ${fmt(end)}`;
};
