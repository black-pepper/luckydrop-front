import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { History, LayoutDashboard, PlusCircle, LogOut, Settings, Menu, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/manage", label: "대시보드", icon: LayoutDashboard },
  { to: "/manage/create", label: "콘텐츠 만들기", icon: PlusCircle },
  { to: "/manage/history", label: "참여 내역", icon: History },
  { to: "/manage/inquiries", label: "내 문의", icon: MessageCircle },
  { to: "/manage/settings", label: "설정", icon: Settings },
];

interface Props {
  children: React.ReactNode;
}

interface SidebarNavProps {
  pathname: string;
  onLogout: () => void;
  onNavigate?: () => void;
}

const SidebarNav = ({ pathname, onLogout, onNavigate }: SidebarNavProps) => (
  <>
    <Link
      to="/manage"
      onClick={onNavigate}
      className="text-lg font-bold px-3 py-4 tracking-tight"
    >
      LuckyDrop
    </Link>

    <nav className="flex flex-col gap-1 mt-2 flex-1">
      {navItems.map((item) => {
        const active = pathname === item.to || (item.to !== "/manage" && pathname.startsWith(`${item.to}/`));
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              active
                ? "bg-white/15 text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>

    <button
      onClick={onLogout}
      className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors mt-auto"
    >
      <LogOut className="h-4 w-4" />
      로그아웃
    </button>
  </>
);

const ManageLayout: React.FC<Props> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mobileOpenPath, setMobileOpenPath] = useState<string | null>(null);
  const mobileOpen = mobileOpenPath === pathname;

  useEffect(() => {
    document.body.style.backgroundColor = "hsl(var(--manage-bg))";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-manage-bg">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 gap-2 bg-manage-sidebar text-manage-sidebar-foreground h-screen sticky top-0">
        <SidebarNav pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center gap-3 px-4 h-14 border-b bg-manage-sidebar text-manage-sidebar-foreground border-manage-border">
        <Sheet open={mobileOpen} onOpenChange={(open) => setMobileOpenPath(open ? pathname : null)}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10 -ml-2"
              aria-label="메뉴 열기"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-64 p-4 flex flex-col gap-2 border-0 bg-manage-sidebar text-manage-sidebar-foreground"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <SidebarNav
              pathname={pathname}
              onLogout={handleLogout}
              onNavigate={() => setMobileOpenPath(null)}
            />
          </SheetContent>
        </Sheet>
        <Link to="/manage" className="font-bold text-base">LuckyDrop</Link>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default ManageLayout;
