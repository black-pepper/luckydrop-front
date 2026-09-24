import { Sparkles, RotateCcw, Home, ClipboardList, RefreshCw } from "lucide-react";

interface ResultCardProps {
  rewardName: string;
  rewardImageUrl?: string;
  drawNo: number;
  remainingDraws: number;
  cooldownRemainingSeconds?: number;
  onDrawAgain: () => void;
  onFinish: () => void;
  onViewHistory: () => void;
  onReset: () => void;
}

// 보상 이름 기반으로 이모지와 등급 추정 (API에 grade/emoji 없으므로 fallback)
const guessEmoji = (name: string): string => {
  if (name.includes("커피") || name.includes("아메리카노")) return "☕";
  if (name.includes("치킨")) return "🍗";
  if (name.includes("상품권") || name.includes("교환권")) return "🎁";
  if (name.includes("카페") || name.includes("음료")) return "🥤";
  if (name.includes("스페셜")) return "✨";
  if (name.includes("꽝")) return "💨";
  return "🎉";
};

const guessGrade = (name: string): "special" | "normal" | "consolation" => {
  if (name.includes("스페셜")) return "special";
  if (name.includes("꽝") || name.includes("감사")) return "consolation";
  return "normal";
};

const gradeLabel: Record<string, string> = {
  special: "🏆 대박!",
  normal: "🎉 축하해요!",
  consolation: "💝 감사해요!",
};

const gradeBg: Record<string, string> = {
  special: "from-lemon/50 to-peach/50",
  normal: "from-mint/30 to-sky/30",
  consolation: "from-lavender/30 to-muted/50",
};

const ResultCard = ({ rewardName, rewardImageUrl, drawNo, remainingDraws, cooldownRemainingSeconds = 0, onDrawAgain, onFinish, onViewHistory, onReset }: ResultCardProps) => {
  const noDrawsLeft = remainingDraws <= 0;
  const isCoolingDown = cooldownRemainingSeconds > 0;
  const emoji = guessEmoji(rewardName);
  const grade = guessGrade(rewardName);

  return (
    <div className="animate-bounce-in flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className={`w-full rounded-2xl bg-gradient-to-br ${gradeBg[grade]} p-6 shadow-[var(--shadow-card)] text-center space-y-4`}>
        <div className="flex justify-center">
          <div className="animate-pop w-14 h-14 rounded-2xl bg-card/80 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
        </div>

        <p className="text-sm font-bold text-muted-foreground">{gradeLabel[grade]}</p>

        {rewardImageUrl ? (
          <img src={rewardImageUrl} alt={rewardName} className="animate-pop w-20 h-20 rounded-2xl object-cover mx-auto" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }} />
        ) : (
          <div className="animate-pop text-6xl py-2" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
            {emoji}
          </div>
        )}

        <h2 className="text-xl font-extrabold text-card-foreground animate-pop" style={{ animationDelay: "0.35s", animationFillMode: "backwards" }}>
          {rewardName}
        </h2>

        <p className="text-xs text-muted-foreground">{drawNo}회차 결과</p>

        {!noDrawsLeft && (
          <div className="inline-block rounded-full bg-card/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground">
            남은 기회 {remainingDraws}회
          </div>
        )}
      </div>

      {noDrawsLeft ? (
        <div className="w-full space-y-3 text-center">
          <p className="text-sm text-muted-foreground">
            모든 기회를 사용했어요! 참여해 주셔서 감사합니다 🙏
          </p>
          <button
            onClick={onViewHistory}
            disabled={isCoolingDown}
            className="w-full h-12 rounded-2xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-4 h-4" />
            {isCoolingDown ? `${cooldownRemainingSeconds}초 후 다시 시도` : "내 결과 보기"}
          </button>
          <button
            onClick={onFinish}
            className="w-full h-12 rounded-2xl bg-muted text-muted-foreground font-semibold hover:bg-muted/80 transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            처음으로
          </button>
        </div>
      ) : (
        <div className="w-full space-y-2">
          <button
            onClick={onDrawAgain}
            disabled={isCoolingDown}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[var(--shadow-soft)] hover:brightness-105 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            {isCoolingDown ? `${cooldownRemainingSeconds}초 후 다시 시도` : "다시 뽑기"}
          </button>
          <button
            onClick={onViewHistory}
            disabled={isCoolingDown}
            className="w-full h-11 rounded-2xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            {isCoolingDown ? `${cooldownRemainingSeconds}초 후 다시 시도` : "내 결과 보기"}
          </button>
        </div>
      )}

      <button
        onClick={onReset}
        className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        새 코드 입력
      </button>
    </div>
  );
};

export default ResultCard;
