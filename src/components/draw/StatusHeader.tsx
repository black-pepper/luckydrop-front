interface StatusHeaderProps {
  step: string;
  description?: string;
}

const StatusHeader = ({ step, description }: StatusHeaderProps) => {
  return (
    <div className="text-center mb-6 animate-bounce-in">
      <div className="inline-block rounded-full bg-card px-4 py-1.5 shadow-[var(--shadow-card)] text-xs font-bold text-muted-foreground tracking-wide">
        {step}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-2">{description}</p>
      )}
    </div>
  );
};

export default StatusHeader;
