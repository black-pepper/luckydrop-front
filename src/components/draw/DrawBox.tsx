import { useState, useEffect } from "react";
import { Gift } from "lucide-react";

interface DrawBoxProps {
  onComplete: () => void;
}

const emojis = ["🎁", "🎀", "🎊", "🎈", "⭐", "💎", "🌟", "🍀"];

const DrawBox = ({ onComplete }: DrawBoxProps) => {
  const [phase, setPhase] = useState<"ready" | "shaking" | "opening">("ready");
  const [currentEmoji, setCurrentEmoji] = useState("🎁");

  useEffect(() => {
    if (phase === "shaking") {
      const interval = setInterval(() => {
        setCurrentEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
      }, 100);

      const timer = setTimeout(() => {
        clearInterval(interval);
        setPhase("opening");
      }, 1800);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }

    if (phase === "opening") {
      const timer = setTimeout(onComplete, 500);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  const handleDraw = () => {
    if (phase === "ready") setPhase("shaking");
  };

  return (
    <div className="animate-bounce-in flex flex-col items-center gap-8 w-full max-w-sm mx-auto">
      <p className="text-muted-foreground font-semibold text-sm">
        {phase === "ready" && "아래 상자를 터치하세요!"}
        {phase === "shaking" && "두근두근... 🥁"}
        {phase === "opening" && "결과를 확인하세요!"}
      </p>

      <button
        onClick={handleDraw}
        disabled={phase !== "ready"}
        className={`
          w-40 h-40 rounded-3xl flex items-center justify-center text-7xl
          transition-all cursor-pointer select-none
          ${phase === "ready" ? "bg-lemon/60 hover:bg-lemon/80 animate-float shadow-[var(--shadow-card)]" : ""}
          ${phase === "shaking" ? "bg-peach/60 animate-shake animate-sparkle" : ""}
          ${phase === "opening" ? "bg-lavender/60 scale-110 opacity-0 transition-all duration-500" : ""}
          disabled:cursor-default
        `}
      >
        {phase === "opening" ? "✨" : currentEmoji}
      </button>

      {phase === "ready" && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/30"
              style={{ animation: `float 2s ease-in-out ${i * 0.3}s infinite` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DrawBox;
