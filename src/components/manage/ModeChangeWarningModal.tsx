import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { type DrawMode } from "./DrawModeTabs";
import { drawModeMeta } from "./draw-mode";

export interface ModeChangeWarningModalProps {
  open: boolean;
  currentMode?: DrawMode | null;
  nextMode: DrawMode | null;
  onClose: () => void;
  onResetClick: () => void;
  onConvertClick: () => void;
  loading?: boolean;
}

const ModeChangeWarningModal: React.FC<ModeChangeWarningModalProps> = ({
  open,
  currentMode,
  nextMode,
  onClose,
  onResetClick,
  onConvertClick,
  loading,
}) => {
  if (!open || !nextMode) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="sm:max-w-[420px] gap-5"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle className="text-base font-semibold">추첨 방식 변경</DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            추첨 방식을 변경하면 기존 설정이 달라질 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 px-4 py-3 space-y-1">
          {currentMode && (
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              변경 대상:{" "}
              <span className="font-semibold">
                {drawModeMeta[currentMode].label} → {drawModeMeta[nextMode].label}
              </span>
            </p>
          )}
          <p className="text-xs text-amber-600/80 dark:text-amber-400/70">
            입력한 확률 또는 개수 값이 초기화되거나 변환될 수 있습니다.
          </p>
        </div>

        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          {loading ? (
            <p className="w-full text-center text-sm font-medium text-muted-foreground">
              처리 중...
            </p>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onClose} className="w-full sm:w-auto">
                취소
              </Button>
              <Button variant="outline" size="sm" onClick={onConvertClick} className="w-full sm:w-auto">
                변환해서 유지
              </Button>
              <Button size="sm" onClick={onResetClick} className="w-full sm:w-auto">
                초기화하고 변경
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ModeChangeWarningModal;
