import type { DrawResultResponse } from "@/api/types";
import { ClipboardList, ArrowLeft } from "lucide-react";

interface ResultHistoryListProps {
  results: DrawResultResponse[];
  loading: boolean;
  onBack: () => void;
  onReset: () => void;
}

const formatDateTime = (iso: string): string => {
  try {
    return new Date(iso).toLocaleString("ko-KR", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso ?? "";
  }
};

const ResultHistoryList = ({ results, loading, onBack, onReset }: ResultHistoryListProps) => {
  return (
    <div className="animate-bounce-in flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="flex items-center gap-2">
        <ClipboardList className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-extrabold text-foreground">내 뽑기 결과</h2>
      </div>

      {loading ? (
        <div className="w-full rounded-3xl bg-card p-8 shadow-[var(--shadow-card)] text-center space-y-3">
          <div className="text-4xl animate-float">⏳</div>
          <p className="text-sm font-semibold text-muted-foreground">결과를 불러오는 중...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="w-full rounded-3xl bg-card p-8 shadow-[var(--shadow-card)] text-center space-y-3">
          <div className="text-4xl">📭</div>
          <p className="text-sm font-semibold text-muted-foreground">아직 뽑기 결과가 없어요</p>
          <p className="text-xs text-muted-foreground/70">뽑기를 진행하면 여기에 결과가 표시됩니다</p>
        </div>
      ) : (
        <div className="w-full space-y-3">
          {results.map((r, i) => (
            <div
              key={r.drawResultId ?? i}
              className="w-full rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] flex items-center gap-3 animate-pop"
              style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "backwards" }}
            >
              {r.rewardImageUrl ? (
                <img src={r.rewardImageUrl} alt={r.rewardName ?? "보상"} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="text-3xl flex-shrink-0">🎁</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-card-foreground truncate">{r.rewardName ?? "보상"}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{r.drawNo}회차</span>
                  <span className="text-xs text-muted-foreground/60">·</span>
                  <span className="text-xs text-muted-foreground/60">{formatDateTime(r.drawnAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="w-full space-y-2">
        <button
          onClick={onBack}
          className="w-full h-12 rounded-2xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-all flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>
        <button
          onClick={onReset}
          className="w-full text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors py-2"
        >
          새 코드 입력
        </button>
      </div>
    </div>
  );
};

export default ResultHistoryList;
