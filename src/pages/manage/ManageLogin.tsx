import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAccessTokenFromSession, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getCurrentUser } from "@/api/client";

const DEFAULT_REDIRECT_PATH = import.meta.env.VITE_MANAGE_LOGIN_REDIRECT_PATH ?? "/manage";
const CALLBACK_EVENT_TYPES: AuthChangeEvent[] = ["INITIAL_SESSION", "SIGNED_IN", "TOKEN_REFRESHED"];
const LOGIN_CALLBACK_URL =
  import.meta.env.VITE_SUPABASE_REDIRECT_URL ?? new URL("/manage/login", window.location.origin).toString();

const ManageLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { redirectTo?: string } | null)?.redirectTo ?? DEFAULT_REDIRECT_PATH;
  const navigatedTokenRef = React.useRef<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const completeLogin = React.useCallback(
    async (session: Session | null) => {
      const accessToken = getAccessTokenFromSession(session);

      if (!accessToken || navigatedTokenRef.current === accessToken) {
        return;
      }

      navigatedTokenRef.current = accessToken;
      setIsSubmitting(true);
      setErrorMessage(null);
      setStatusMessage("로그인 정보를 확인하고 있어요.");

      try {
        await getCurrentUser();
        setStatusMessage("로그인에 성공했어요. 관리자 화면으로 이동합니다.");
        navigate(redirectTo, { replace: true });
      } catch (error) {
        navigatedTokenRef.current = null;
        setStatusMessage(null);
        setErrorMessage(error instanceof Error ? error.message : "로그인 처리 중 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [navigate, redirectTo],
  );

  React.useEffect(() => {
    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase 환경 변수가 설정되지 않았습니다. VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 확인해주세요.");
      return;
    }

    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (isMounted && data.session) {
          await completeLogin(data.session);
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : "Supabase 세션을 확인하지 못했습니다.");
      }
    };

    void initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (CALLBACK_EVENT_TYPES.includes(event) && session) {
        void completeLogin(session);
      }

      if (event === "SIGNED_OUT") {
        navigatedTokenRef.current = null;
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [completeLogin]);

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      setErrorMessage("Supabase 환경 변수가 설정되지 않았습니다. 관리자에게 설정값을 확인해주세요.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Google 로그인 화면으로 이동하고 있어요.");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: LOGIN_CALLBACK_URL,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      setIsSubmitting(false);
      setStatusMessage(null);
      setErrorMessage(error instanceof Error ? error.message : "Google 로그인을 시작하지 못했습니다.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-manage-bg">
      <Card className="w-full max-w-sm text-center shadow-lg">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-2xl font-bold text-foreground">LuckyDrop</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            이벤트를 만들고 공유해보세요.<br />
          </p>

          <Button
            className="w-full gap-2 font-semibold"
            variant="outline"
            size="lg"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.997 10.997 0 0 0 12 23Z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09A6.6 6.6 0 0 1 5.5 12c0-.72.13-1.43.34-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.66-2.84Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
                fill="#EA4335"
              />
            </svg>
            {isSubmitting ? "로그인 처리 중..." : "Google로 시작하기"}
          </Button>

          {statusMessage ? (
            <p className="text-xs text-muted-foreground">{statusMessage}</p>
          ) : (
            <p className="text-xs text-muted-foreground">주최자 계정으로 로그인해주세요</p>
          )}

          {errorMessage ? (
            <p className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorMessage}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageLogin;
