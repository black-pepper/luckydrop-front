import { useState } from "react";
import { Gift, ChevronDown, ChevronUp } from "lucide-react";
import { getRewards } from "@/api/client";
import type { DrawParticipantParams, RewardResponse } from "@/api/types";

interface RewardListCardProps {
  contentCode: string;
  invitationCode: string;
}

const RewardListCard = ({ contentCode, invitationCode }: RewardListCardProps) => {
  const [open, setOpen] = useState(false);
  const [rewards, setRewards] = useState<RewardResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setLoading(true);
      try {
        const params: DrawParticipantParams = { contentCode, invitationCode };
        const data = await getRewards(params);
        setRewards(data ?? []);
        setLoaded(true);
      } catch {
        setRewards([]);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleToggle}
        className="w-full h-11 rounded-2xl bg-accent/60 text-accent-foreground font-semibold text-sm hover:bg-accent/80 transition-all flex items-center justify-center gap-1.5"
      >
        <Gift className="w-3.5 h-3.5" />
        보상 목록 보기
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-1">🎁 당첨 가능 상품</p>
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">⏳ 불러오는 중...</div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">보상 정보가 없습니다</div>
          ) : (
            rewards.map((r) => (
              (() => {
                const quantityLabel =
                  r.poolCount != null
                    ? `${r.poolCount}개`
                    : r.stock != null
                      ? `${r.stock}개 남음`
                      : null;

                return (
                  <div
                    key={r.id}
                    className="rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)] border-l-4 border-l-mint flex items-center gap-3"
                  >
                    {r.imageUrl ? (
                      <img src={r.imageUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="text-2xl flex-shrink-0">🎁</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-card-foreground truncate">{r.name}</p>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                          {r.probability ?? 0}%
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-xs text-muted-foreground/70 mt-0.5">{r.description}</p>
                      )}
                      {quantityLabel && (
                        <p className="text-[10px] text-muted-foreground/60 mt-1">{quantityLabel}</p>
                      )}
                    </div>
                  </div>
                );
              })()
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RewardListCard;
