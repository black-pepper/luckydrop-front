import { Percent, Sparkles, Ticket, type LucideIcon } from "lucide-react";

export type DrawMode = "WEIGHTED" | "DRAW" | "CUSTOM";

export const drawModeMeta: Record<DrawMode, { label: string; desc: string; Icon: LucideIcon }> = {
  WEIGHTED: {
    label: "확률 추첨",
    desc: "가중치 비율대로 재고가 소진될 때까지 당첨",
    Icon: Percent,
  },
  DRAW: {
    label: "제비뽑기",
    desc: "설정한 개수만큼만 당첨",
    Icon: Ticket,
  },
  CUSTOM: {
    label: "확장 모드",
    desc: "추후 추가 예정",
    Icon: Sparkles,
  },
};
