import { useState, useCallback, useEffect, useRef } from "react";
import { verifyCode, executeDraw, getResults, getParticipantContentDetail, isRateLimitError } from "@/api/client";
import type { DrawParticipantParams, DrawResponse, DrawResultResponse, DrawStatus } from "@/api/types";
import { toast } from "@/hooks/use-toast";

type AppState = "code" | "user" | "drawing" | "result" | "history";
type HistoryReturnState = "user" | "result";
const RATE_LIMIT_COOLDOWN_MS = 30_000;

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = error.message;
    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
}

function checkExpired(startAt: string | null, endAt: string | null): boolean {
  const now = new Date();
  const started = startAt ? now >= new Date(startAt) : true;
  const notEnded = endAt ? now <= new Date(endAt) : true;
  return !(started && notEnded);
}

export function useIndex(contentCode: string) {
  const [state, setState] = useState<AppState>("code");
  const [invitationCode, setInvitationCode] = useState("");
  const [userName, setUserName] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [canDraw, setCanDraw] = useState(false);
  const [drawStatus, setDrawStatus] = useState<DrawStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [cooldownRemainingSeconds, setCooldownRemainingSeconds] = useState(0);

  const [contentTitle, setContentTitle] = useState<string | null>(null);
  const [contentDescription, setContentDescription] = useState<string | null>(null);
  const [contentStartAt, setContentStartAt] = useState<string | null>(null);
  const [contentEndAt, setContentEndAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const [drawResult, setDrawResult] = useState<DrawResponse | null>(null);

  const [history, setHistory] = useState<DrawResultResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReturnState, setHistoryReturnState] = useState<HistoryReturnState>("user");
  const executingDrawRef = useRef(false);

  const startRateLimitCooldown = useCallback((retryAfterSeconds?: number) => {
    const cooldownSeconds = retryAfterSeconds ?? Math.ceil(RATE_LIMIT_COOLDOWN_MS / 1000);
    const cooldownMs = cooldownSeconds * 1000;
    const nextCooldownUntil = Date.now() + cooldownMs;
    setCooldownUntil(nextCooldownUntil);
    setCooldownRemainingSeconds(cooldownSeconds);
    toast({
      description: `${cooldownSeconds}초 후 다시 시도해주세요.`,
      variant: "destructive",
    });
  }, []);

  const handleRateLimitError = useCallback((error: unknown) => {
    if (!isRateLimitError(error)) {
      return false;
    }

    startRateLimitCooldown(error.retryAfterSeconds);
    return true;
  }, [startRateLimitCooldown]);

  const isCoolingDown = cooldownRemainingSeconds > 0;

  useEffect(() => {
    if (!cooldownUntil) return;

    const updateRemaining = () => {
      const remainingMs = cooldownUntil - Date.now();
      const nextRemainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      setCooldownRemainingSeconds(nextRemainingSeconds);
      if (nextRemainingSeconds === 0) {
        setCooldownUntil(null);
      }
    };

    updateRemaining();
    const timer = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  useEffect(() => {
    if (!contentCode) return;
    getParticipantContentDetail(contentCode)
      .then((data) => {
        setContentTitle(data.title ?? null);
        setContentDescription(data.description ?? null);
        setContentStartAt(data.startAt ?? null);
        setContentEndAt(data.endAt ?? null);
        setIsExpired(checkExpired(data.startAt ?? null, data.endAt ?? null));
      })
      .catch((error) => {
        handleRateLimitError(error);
      });
  }, [contentCode, handleRateLimitError]);

  const getDrawParams = useCallback(
    (nextInvitationCode?: string): DrawParticipantParams => ({
      contentCode,
      invitationCode: nextInvitationCode ?? invitationCode,
    }),
    [contentCode, invitationCode],
  );

  async function handleCodeSubmit(inputCode: string) {
    if (isCoolingDown) return;
    setError(null);
    if (!contentCode) {
      setError("콘텐츠 정보가 없습니다. 올바른 참여 링크로 접속해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyCode(getDrawParams(inputCode));
      setInvitationCode(inputCode);
      setUserName(data.name ?? "사용자");
      setRemaining(data.remainingCount ?? 0);
      setCanDraw(data.canDraw ?? false);
      setDrawStatus(data.drawStatus);
      setState("user");
    } catch (error) {
      if (!handleRateLimitError(error)) {
        setError(getErrorMessage(error, "사용할 수 없는 코드예요. 코드를 다시 확인해 주세요 🙏"));
      }
    } finally {
      setLoading(false);
    }
  }

  const handleStartDraw = () => {
    if (isCoolingDown || !canDraw || remaining <= 0) return;
    setState("drawing");
  };

  const handleDrawComplete = useCallback(async () => {
    if (isCoolingDown || executingDrawRef.current) return;
    executingDrawRef.current = true;
    try {
      const result = await executeDraw(getDrawParams());
      setDrawResult(result);
      setRemaining(result.remainingCount ?? 0);
      setState("result");
    } catch (error) {
      if (!handleRateLimitError(error)) {
        setError(getErrorMessage(error, "뽑기 처리 중 오류가 발생했습니다"));
      }
      setState("user");
    } finally {
      executingDrawRef.current = false;
    }
  }, [getDrawParams, handleRateLimitError, isCoolingDown]);

  const handleDrawAgain = () => {
    if (isCoolingDown) return;
    setState("drawing");
  };

  const handleReset = () => {
    setState("code");
    setInvitationCode("");
    setUserName("");
    setError(null);
    setDrawResult(null);
    setRemaining(0);
    setCanDraw(false);
    setDrawStatus(null);
    setCooldownUntil(null);
    setCooldownRemainingSeconds(0);
    setHistory([]);
    setHistoryReturnState("user");
  };

  const handleViewHistory = useCallback(async () => {
    if (isCoolingDown) return;
    setHistoryReturnState(state === "result" && drawResult ? "result" : "user");
    setHistoryLoading(true);
    setState("history");
    try {
      const data = await getResults(getDrawParams());
      setHistory(data ?? []);
    } catch (error) {
      handleRateLimitError(error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [drawResult, getDrawParams, handleRateLimitError, isCoolingDown, state]);

  const handleHistoryBack = () => {
    setState(historyReturnState === "result" && drawResult ? "result" : "user");
  };

  return {
    state,
    error,
    loading,
    invitationCode,
    userName,
    remaining,
    canDraw,
    drawStatus,
    contentTitle,
    contentDescription,
    contentStartAt,
    contentEndAt,
    isExpired,
    drawResult,
    history,
    historyLoading,
    cooldownRemainingSeconds,
    isCoolingDown,
    handleRateLimitError,
    handleCodeSubmit,
    handleStartDraw,
    handleDrawComplete,
    handleDrawAgain,
    handleReset,
    handleViewHistory,
    handleHistoryBack,
  };
}
