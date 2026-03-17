import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AdminLogin: React.FC = () => (
  <div
    className="flex items-center justify-center min-h-screen px-4"
    style={{ background: "hsl(var(--admin-bg))" }}
  >
    <Card className="w-full max-w-sm text-center shadow-lg">
      <CardContent className="p-8 space-y-6">
        {/* Logo */}
        <div className="text-4xl">🎯</div>
        <h1 className="text-2xl font-bold text-foreground">LuckyDrop</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          이벤트를 만들고 공유해보세요.<br />
          뽑기, 퀴즈, 메시지함 등 다양한<br />
          참여형 콘텐츠를 손쉽게 관리하세요.
        </p>

        {/* Google Login Button */}
        <Button
          className="w-full gap-2 font-semibold"
          variant="outline"
          size="lg"
          asChild
        >
          <Link to="/admin">
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
            Google로 시작하기
          </Link>
        </Button>

        <p className="text-xs text-muted-foreground">
          주최자 계정으로 로그인해주세요
        </p>
      </CardContent>
    </Card>
  </div>
);

export default AdminLogin;
