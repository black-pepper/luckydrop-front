import { AlertCircle, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentStateCardProps {
  type: "loading" | "notFound" | "error";
  message?: string | null;
  onHome: () => void;
}

const ContentStateCard = ({ type, message, onHome }: ContentStateCardProps) => {
  const isLoading = type === "loading";
  const Icon = isLoading ? Loader2 : type === "notFound" ? Gift : AlertCircle;

  const title = isLoading
    ? "이벤트를 불러오는 중..."
    : type === "notFound"
      ? "존재하지 않는 이벤트입니다"
      : "이벤트 정보를 불러오지 못했습니다";

  const description = isLoading
    ? "잠시만 기다려 주세요."
    : type === "notFound"
      ? "링크가 잘못되었거나 더 이상 사용할 수 없는 이벤트일 수 있습니다."
      : message ?? "잠시 후 다시 접속해 주세요.";

  return (
    <div className="animate-bounce-in flex flex-col items-center gap-6 w-full max-w-sm mx-auto text-center">
      <div className="animate-float">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Icon className={`w-10 h-10 text-primary ${isLoading ? "animate-spin" : ""}`} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
      </div>

      {!isLoading && (
        <Button type="button" onClick={onHome} className="w-full h-14 rounded-2xl font-bold text-base shadow-[var(--shadow-soft)]">
          서비스 소개로 이동
        </Button>
      )}
    </div>
  );
};

export default ContentStateCard;
