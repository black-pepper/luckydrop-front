import { useState, useCallback, useEffect } from "react";
import { verifyCode, executeDraw, getResults, getParticipantContentDetail } from "@/api/client";
import type { DrawParticipantParams, DrawResponse, DrawResultResponse } from "@/api/types";

type AppState = "code" | "user" | "drawing" | "result" | "history";
type HistoryReturnState = "user" | "result";

function checkExpired(startAt: string | null, endAt: string | null): boolean {
  const now = new Date();
  const started = startAt ? now >= new Date(startAt) : true;
  const notEnded = endAt ? now <= new Date(endAt) : true;
  return !(started && notEnded);
}

export function useIndex(contentCode: string) {
  const [state, setState] = useState<AppState>("code");
  const [invitationCode, setInvitationCode] = useState("");
  const [maskedName, setMaskedName] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [canDraw, setCanDraw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [contentTitle, setContentTitle] = useState<string | null>(null);
  const [contentDescription, setContentDescription] = useState<string | null>(null);
  const [contentStartAt, setContentStartAt] = useState<string | null>(null);
  const [contentEndAt, setContentEndAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const [drawResult, setDrawResult] = useState<DrawResponse | null>(null);

  const [history, setHistory] = useState<DrawResultResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReturnState, setHistoryReturnState] = useState<HistoryReturnState>("user");

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
      .catch(() => {});
  }, [contentCode]);

  const getDrawParams = useCallback(
    (nextInvitationCode?: string): DrawParticipantParams => ({
      contentCode,
      invitationCode: nextInvitationCode ?? invitationCode,
    }),
    [contentCode, invitationCode],
  );

  const handleCodeSubmit = async (inputCode: string) => {
    setError(null);
    if (!contentCode) {
      setError("콘텐츠 정보가 없습니다. 올바른 참여 링크로 접속해 주세요.");
      return;
    }
    setLoading(true);
    try {
      const data = await verifyCode(getDrawParams(inputCode));
      setInvitationCode(inputCode);
      setMaskedName(data.maskedName ?? "사용자");
      setRemaining(data.remainingCount ?? 0);
      setCanDraw(data.canDraw ?? false);
      setState("user");
    } catch (e: any) {
      setError(e.message ?? "사용할 수 없는 코드예요. 코드를 다시 확인해 주세요 🙏");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDraw = () => {
    if (!canDraw || remaining <= 0) return;
    setState("drawing");
  };

  const handleDrawComplete = useCallback(async () => {
    try {
      const result = await executeDraw(getDrawParams());
      setDrawResult(result);
      setRemaining(result.remainingCount ?? 0);
      setState("result");
    } catch (e: any) {
      setError(e.message ?? "뽑기 처리 중 오류가 발생했습니다");
      setState("user");
    }
  }, [getDrawParams]);

  const handleDrawAgain = () => {
    setState("drawing");
  };

  const handleReset = () => {
    setState("code");
    setInvitationCode("");
    setMaskedName("");
    setError(null);
    setDrawResult(null);
    setRemaining(0);
    setCanDraw(false);
    setHistory([]);
    setHistoryReturnState("user");
  };

  const handleViewHistory = useCallback(async () => {
    setHistoryReturnState(state === "result" && drawResult ? "result" : "user");
    setHistoryLoading(true);
    setState("history");
    try {
      const data = await getResults(getDrawParams());
      setHistory(data ?? []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, [drawResult, getDrawParams, state]);

  const handleHistoryBack = () => {
    setState(historyReturnState === "result" && drawResult ? "result" : "user");
  };

  return {
    state,
    error,
    loading,
    invitationCode,
    maskedName,
    remaining,
    canDraw,
    contentTitle,
    contentDescription,
    contentStartAt,
    contentEndAt,
    isExpired,
    drawResult,
    history,
    historyLoading,
    handleCodeSubmit,
    handleStartDraw,
    handleDrawComplete,
    handleDrawAgain,
    handleReset,
    handleViewHistory,
    handleHistoryBack,
  };
}
