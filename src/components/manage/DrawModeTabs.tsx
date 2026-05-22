import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { drawModeMeta, type DrawMode } from "@/components/manage/draw-mode";

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
          {(Object.keys(drawModeMeta) as DrawMode[]).map((mode) => {
            const Icon = drawModeMeta[mode].Icon;

            return (
              <TabsTrigger
                key={mode}
                value={mode}
                disabled={mode === "CUSTOM"}
                className="flex flex-col items-center gap-1 py-2 text-xs data-[state=active]:font-semibold"
              >
                <span className="flex items-center gap-1">
                  <Icon className="h-4 w-4" />
                  <span>{drawModeMeta[mode].label}</span>
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      <p className="text-[11px] text-muted-foreground text-center">{current.desc}</p>
    </div>
  );
};

export default DrawModeTabs;
export type { DrawMode };
