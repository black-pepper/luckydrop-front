import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

type AuthState = "loading" | "authenticated" | "unauthenticated";

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authState, setAuthState] = useState<AuthState>("loading");

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      if (data.session) {
        setAuthState("authenticated");
      } else {
        setAuthState("unauthenticated");
        navigate("/manage/login", { replace: true, state: { redirectTo: location.pathname } });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!isMounted) return;
      if (event === "SIGNED_OUT") {
        setAuthState("unauthenticated");
        navigate("/manage/login", { replace: true, state: { redirectTo: location.pathname } });
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setAuthState("authenticated");
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return {
    isLoading: authState === "loading",
    isAuthenticated: authState === "authenticated",
  };
}
