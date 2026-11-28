export type Phase = "open" | "scheduled" | "closed";
export interface EventDetails {
  title: string;
  question: string;
  start: string;
  end: string;
}
export const invitation = "LETTER";
export const base = "/preview/message-draw";
export const demoEvent: EventDetails = {
  title: "우리의 마지막 우체통",
  question: "함께한 시간 중 가장 기억에 남는 순간은 언제인가요?",
  start: "2026-11-23T09:00",
  end: "2026-11-30T18:00",
};
export const letters = [
  "비 오던 날 다 같이 우산 하나를 나눠 쓰고 뛰어간 순간이요. 그때 사진은 아직도 제 배경 화면이에요!",
  "첫 출근 날 건네주신 따뜻한 커피를 기억해요. 덕분에 금방 적응할 수 있었어요.",
  "점심마다 걷던 작은 공원, 다음 계절에도 함께 걸어요.",
];
export const scenarios = [
  ["open", "접수 중"],
  ["scheduled", "접수 전"],
  ["closed", "마감 후"],
  ["empty", "도착 0통"],
  ["all-read", "모두 읽음"],
  ["submitted", "이미 제출"],
  ["unavailable", "접근 불가"],
] as const;
export type Scenario = (typeof scenarios)[number][0];
export function scenarioFrom(params: URLSearchParams): Scenario {
  return (
    scenarios.find(([value]) => value === params.get("scene"))?.[0] ?? "open"
  );
}
export function formatTime(value: string) {
  return value.replace(/-/g, ".").replace("T", " ");
}
