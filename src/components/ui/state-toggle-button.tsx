import * as React from "react";
import { cn } from "@/lib/utils";

interface StateToggleButtonProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  checkedLabel: string;
  uncheckedLabel: string;
  className?: string;
}

const StateToggleButton = React.forwardRef<HTMLButtonElement, StateToggleButtonProps>(
  ({ checked, onCheckedChange, checkedLabel, uncheckedLabel, className }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "h-9 px-3 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0",
        checked
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-muted-foreground border-input hover:bg-muted",
        className,
      )}
    >
      {checked ? checkedLabel : uncheckedLabel}
    </button>
  ),
);
StateToggleButton.displayName = "StateToggleButton";

export { StateToggleButton };
