import { useParams, useSearchParams } from "react-router-dom";
import CodeInputCard from "@/components/draw/CodeInputCard";
import UserInfoCard from "@/components/draw/UserInfoCard";
import DrawBox from "@/components/draw/DrawBox";
import ResultCard from "@/components/draw/ResultCard";
import ResultHistoryList from "@/components/draw/ResultHistoryList";
import { useIndex } from "@/hooks/useIndex";

const Index = () => {
  const { contentCode = "" } = useParams<{ contentCode: string }>();
  const [searchParams] = useSearchParams();
  const initialCode = searchParams.get("code") ?? "";
  const {
    state,
    error,
    loading,
    invitationCode,
    userName,
    remaining,
    drawStatus,
    isExpired,
    contentTitle,
    contentDescription,
    contentStartAt,
    contentEndAt,
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
  } = useIndex(contentCode);

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
            initialValue={initialCode}
          />
        )}
        {state === "user" && (
          <UserInfoCard
            contentCode={contentCode}
            invitationCode={invitationCode}
            userName={userName}
            remainingDraws={remaining}
            hasHistory={true}
            isExpired={isExpired}
            drawStatus={drawStatus}
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
