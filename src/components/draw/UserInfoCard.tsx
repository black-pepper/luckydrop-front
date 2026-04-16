import { User, RefreshCw, ClipboardList } from "lucide-react";
import RewardListCard from "./RewardListCard";

interface UserInfoCardProps {
  contentCode: string;
  invitationCode: string;
  maskedName: string;
  remainingDraws: number;
  hasHistory: boolean;
  onDraw: () => void;
  onBack: () => void;
  onViewHistory: () => void;
}

const UserInfoCard = ({
  contentCode,
  invitationCode,
  maskedName,
  remainingDraws,
  hasHistory,
  onDraw,
  onBack,
  onViewHistory,
}: UserInfoCardProps) => {
  const noDrawsLeft = remainingDraws <= 0;

  return (
    <div className="animate-bounce-in flex flex-col items-center gap-5 w-full max-w-sm mx-auto">
      <div className="w-full rounded-2xl bg-card p-6 shadow-[var(--shadow-card)] space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-secondary/40 flex items-center justify-center">
            <User className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">환영합니다!</p>
            <p className="text-xl font-extrabold text-card-foreground">{maskedName} 님</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
          <span className="text-sm font-semibold text-muted-foreground">남은 기회</span>
          <span className="text-2xl font-extrabold text-primary">
            {remainingDraws}
            <span className="text-sm font-semibold text-muted-foreground ml-1">회</span>
          </span>
        </div>

        {noDrawsLeft ? (
          <div className="text-center text-sm text-muted-foreground py-2">
            사용할 수 있는 기회가 없습니다 😢
          </div>
        ) : (
          <button
            onClick={onDraw}
            className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[var(--shadow-soft)] hover:brightness-105 active:scale-[0.98] transition-all"
          >
            🎰 뽑기 시작!
          </button>
        )}

        {hasHistory && (
          <button
            onClick={onViewHistory}
            className="w-full h-11 rounded-2xl bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-all flex items-center justify-center gap-1.5"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            내 결과 보기
          </button>
        )}

        <RewardListCard contentCode={contentCode} invitationCode={invitationCode} />
      </div>

      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        새 코드 입력
      </button>
    </div>
  );
};

export default UserInfoCard;
