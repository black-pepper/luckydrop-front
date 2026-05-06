import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Percent, Ticket, Sparkles } from "lucide-react";

export type DrawMode = "WEIGHTED" | "DRAW" | "CUSTOM";

export const drawModeMeta: Record<DrawMode, { label: string; desc: string; icon: React.ReactNode }> = {
  WEIGHTED: {
    label: "확률 추첨",
    desc: "가중치 비율대로 무제한 뽑기",
    icon: <Percent className="h-4 w-4" />,
  },
  DRAW: {
    label: "제비뽑기",
    desc: "설정한 개수만큼만 당첨",
    icon: <Ticket className="h-4 w-4" />,
  },
  CUSTOM: {
    label: "확장 모드",
    desc: "추후 추가 예정",
    icon: <Sparkles className="h-4 w-4" />,
  },
};

interface Props {
  value: DrawMode;
  onChange: (mode: DrawMode) => void;
}

const DrawModeTabs: React.FC<Props> = ({ value, onChange }) => {
  const current = drawModeMeta[value];
  return (
    <div className="space-y-2">
      <Tabs value={value} onValueChange={(v) => onChange(v as DrawMode)}>
        <TabsList className="grid w-full grid-cols-3 h-auto">
          {(Object.keys(drawModeMeta) as DrawMode[]).map((mode) => (
            <TabsTrigger
              key={mode}
              value={mode}
              disabled={mode === "CUSTOM"}
              className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:font-semibold"
            >
              <span className="flex items-center gap-1">
                {drawModeMeta[mode].icon}
                <span>{drawModeMeta[mode].label}</span>
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <p className="text-[11px] text-muted-foreground text-center">{current.desc}</p>
    </div>
  );
};

export default DrawModeTabs;
