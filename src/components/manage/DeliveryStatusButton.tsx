import { cn } from "@/lib/utils";

interface DeliveryStatusButtonProps {
  delivered: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export function DeliveryStatusButton({ delivered, loading = false, onClick }: DeliveryStatusButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        delivered
          ? "border-transparent bg-[hsl(220_60%_55%)] text-white hover:bg-[hsl(220_60%_48%)]"
          : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {loading ? "저장 중..." : delivered ? "지급완료" : "미지급"}
    </button>
  ); 
}
