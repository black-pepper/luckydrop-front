import { useState, useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import CodeInputCard from "@/components/draw/CodeInputCard";
import UserInfoCard from "@/components/draw/UserInfoCard";
import DrawBox from "@/components/draw/DrawBox";
import ResultCard from "@/components/draw/ResultCard";
import ResultHistoryList from "@/components/draw/ResultHistoryList";
import { verifyCode, executeDraw, getResults, getParticipantContentDetail } from "@/api/client";
import type { DrawParticipantParams, DrawResponse, DrawResultResponse } from "@/api/types";

type AppState = "code" | "user" | "drawing" | "result" | "history";
type HistoryReturnState = "user" | "result";

const Index = () => {
  const { contentCode = "" } = useParams<{ contentCode: string }>();
  const [state, setState] = useState<AppState>("code");
  const [invitationCode, setInvitationCode] = useState("");
  const [maskedName, setMaskedName] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [canDraw, setCanDraw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 컨텐츠 정보
  const [contentTitle, setContentTitle] = useState<string | null>(null);
  const [contentDescription, setContentDescription] = useState<string | null>(null);
  const [contentStartAt, setContentStartAt] = useState<string | null>(null);
  const [contentEndAt, setContentEndAt] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // 뽑기 결과
  const [drawResult, setDrawResult] = useState<DrawResponse | null>(null);

  // 결과 내역
  const [history, setHistory] = useState<DrawResultResponse[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyReturnState, setHistoryReturnState] = useState<HistoryReturnState>("user");

  // 컨텐츠 상세 조회 및 기간 판별
  useEffect(() => {
    if (!contentCode) return;
    getParticipantContentDetail(contentCode)
      .then((data) => {
        setContentTitle(data.title ?? null);
        setContentDescription(data.description ?? null);
        setContentStartAt(data.startAt ?? null);
        setContentEndAt(data.endAt ?? null);

        const now = new Date();
        const started = data.startAt ? now >= new Date(data.startAt) : true;
        const notEnded = data.endAt ? now <= new Date(data.endAt) : true;
        setIsExpired(!(started && notEnded));
      })
      .catch(() => {
        // 상세 정보 실패 시 기본값 유지
      });
  }, [contentCode]);

  const getDrawParams = useCallback(
    (nextInvitationCode?: string): DrawParticipantParams => ({
      contentCode,
      invitationCode: nextInvitationCode ?? invitationCode,
    }),
    [contentCode, invitationCode],
  );

  // 코드 검증 (mock findUser → verifyCode API)
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
    if (!canDraw || remaining <= 0) {
      return;
    }
    setState("drawing");
  };

  // 뽑기 실행 (mock getRandomPrize → executeDraw API)
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

  // 초기화
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

  // 결과 내역 보기 (mock history → getResults API)
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-peach/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-lavender/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-mint/20 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {state === "code" && (
          <CodeInputCard
            onSubmit={handleCodeSubmit}
            error={error}
            loading={loading}
            title={contentTitle}
            description={contentDescription}
            startAt={contentStartAt}
            endAt={contentEndAt}
          />
        )}
        {state === "user" && (
          <UserInfoCard
            contentCode={contentCode}
            invitationCode={invitationCode}
            maskedName={maskedName}
            remainingDraws={remaining}
            hasHistory={true}
            isExpired={isExpired}
            onDraw={handleStartDraw}
            onBack={handleReset}
            onViewHistory={handleViewHistory}
          />
        )}
        {state === "drawing" && (
          <DrawBox onComplete={handleDrawComplete} />
        )}
        {state === "result" && drawResult && (
          <ResultCard
            rewardName={drawResult.rewardName ?? "알 수 없는 보상"}
            rewardImageUrl={drawResult.rewardImageUrl}
            drawNo={drawResult.drawNo ?? 0}
            remainingDraws={remaining}
            onDrawAgain={handleDrawAgain}
            onFinish={handleReset}
            onViewHistory={handleViewHistory}
            onReset={handleReset}
          />
        )}
        {state === "history" && (
          <ResultHistoryList
            results={history}
            loading={historyLoading}
            onBack={handleHistoryBack}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
