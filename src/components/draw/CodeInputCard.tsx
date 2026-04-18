import { useState } from "react";
import { Gift, AlertCircle } from "lucide-react";

interface CodeInputCardProps {
  onSubmit: (code: string) => void;
  error: string | null;
  loading: boolean;
}

const CodeInputCard = ({ onSubmit, error, loading }: CodeInputCardProps) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) onSubmit(code.trim());
  };

  return (
    <div className="animate-bounce-in flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
      <div className="animate-float">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <Gift className="w-10 h-10 text-primary" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold text-foreground">🎉 럭키 드로우</h1>
        <p className="text-muted-foreground text-sm">
          발급받은 코드를 입력하고 행운을 뽑아보세요!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-3">
        <div className="relative">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              const value = e.target.value;
              // 대문자, 소문자, 숫자, 하이픈(-), 언더스코어(_)만 허용
              const filteredValue = value.replace(/[^A-Za-z0-9-_]/g, "");
              setCode(filteredValue);
            }}
            placeholder="참여 코드 입력"
            maxLength={10}
            className={`w-full h-14 px-4 text-center text-lg font-bold tracking-widest rounded-2xl border-2 bg-card text-card-foreground placeholder:text-muted-foreground/50 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-4 transition-all ${
              error
                ? "border-destructive focus:border-destructive focus:ring-destructive/10"
                : "border-border focus:border-primary focus:ring-primary/10"
            }`}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/5 border border-destructive/15 px-3 py-2.5 animate-pop">
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive text-sm font-semibold">{error}</p>
              <p className="text-destructive/60 text-xs mt-0.5">코드를 다시 확인한 후 입력해 주세요</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!code.trim() || loading}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-lg shadow-[var(--shadow-soft)] hover:brightness-105 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          {loading ? "확인 중..." : "코드 확인"}
        </button>
      </form>

      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        이벤트 기간: 2026.03.01 ~ 2026.03.31<br />
        코드는 요청 시 발급됩니다
      </p>
    </div>
  );
};

export default CodeInputCard;
