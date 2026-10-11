import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import CodeInputCard from "@/components/draw/CodeInputCard";
import UserInfoCard from "@/components/draw/UserInfoCard";
import DrawBox from "@/components/draw/DrawBox";
import ResultCard from "@/components/draw/ResultCard";
import ResultHistoryList from "@/components/draw/ResultHistoryList";
import ContentStateCard from "@/components/draw/ContentStateCard";
import { useIndex } from "@/hooks/useIndex";

const Index = () => {
  const { contentCode = "" } = useParams<{ contentCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialCode = searchParams.get("code") ?? "";
  const {
    state,
    contentLoadState,
    contentLoadError,
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
    cooldownRemainingSeconds,
    handleRateLimitError,
    handleCodeSubmit,
    handleStartDraw,
    handleDrawComplete,
    handleDrawAgain,
    handleReset,
    handleViewHistory,
    handleHistoryBack,
  } = useIndex(contentCode);

  return (
    <div className="min-h-screen flex flex-col px-4">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-peach/20 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-lavender/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 rounded-full bg-mint/20 blur-3xl" />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-sm">
          {contentLoadState !== "ready" && (
            <ContentStateCard
              type={contentLoadState}
              message={contentLoadError}
              onHome={() => navigate("/")}
            />
          )}
          {contentLoadState === "ready" && state === "code" && (
            <CodeInputCard
              onSubmit={handleCodeSubmit}
              error={error}
              loading={loading}
              title={contentTitle}
              description={contentDescription}
              startAt={contentStartAt}
              endAt={contentEndAt}
              initialValue={initialCode}
              cooldownRemainingSeconds={cooldownRemainingSeconds}
            />
          )}
          {contentLoadState === "ready" && state === "user" && (
            <UserInfoCard
              contentCode={contentCode}
              invitationCode={invitationCode}
              userName={userName}
              remainingDraws={remaining}
              hasHistory={true}
              isExpired={isExpired}
              drawStatus={drawStatus}
              cooldownRemainingSeconds={cooldownRemainingSeconds}
              onRateLimit={handleRateLimitError}
              onDraw={handleStartDraw}
              onBack={handleReset}
              onViewHistory={handleViewHistory}
            />
          )}
          {contentLoadState === "ready" && state === "drawing" && (
            <DrawBox onComplete={handleDrawComplete} />
          )}
          {contentLoadState === "ready" && state === "result" && drawResult && (
            <ResultCard
              rewardName={drawResult.rewardName ?? "알 수 없는 보상"}
              rewardImageUrl={drawResult.rewardImageUrl}
              drawNo={drawResult.drawNo ?? 0}
              remainingDraws={remaining}
              cooldownRemainingSeconds={cooldownRemainingSeconds}
              onDrawAgain={handleDrawAgain}
              onFinish={handleReset}
              onViewHistory={handleViewHistory}
              onReset={handleReset}
            />
          )}
          {contentLoadState === "ready" && state === "history" && (
            <ResultHistoryList
              results={history}
              loading={historyLoading}
              onBack={handleHistoryBack}
              onReset={handleReset}
            />
          )}
        </div>
      </div>

      <footer className="py-4 text-xs text-muted-foreground">
        <nav className="flex items-center justify-center gap-x-4">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">서비스 소개</button>
          <button onClick={() => navigate("/policy?tab=terms")} className="hover:text-foreground transition-colors">이용약관</button>
          <button onClick={() => navigate("/policy?tab=privacy")} className="hover:text-foreground transition-colors">개인정보처리방침</button>
          <button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">문의</button>
        </nav>
      </footer>
    </div>
  );
};

export default Index;
