import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

const navItems = [
  { to: "/manage", label: "대시보드", icon: LayoutDashboard },
  { to: "/manage/create", label: "콘텐츠 만들기", icon: PlusCircle },
];

interface Props {
  children: React.ReactNode;
}

const ManageLayout: React.FC<Props> = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

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
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 p-4 gap-2 bg-manage-sidebar text-manage-sidebar-foreground">
        <Link to="/manage" className="text-lg font-bold px-3 py-4 tracking-tight">
          🎯 LuckyDrop
        </Link>

        <nav className="flex flex-col gap-1 mt-2 flex-1">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
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

        <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-white/80 transition-colors mt-auto">
          <LogOut className="h-4 w-4" />
          로그아웃
        </button>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 h-14 border-b bg-manage-sidebar text-manage-sidebar-foreground border-manage-border">
        <Link to="/manage" className="font-bold text-base">🎯 LuckyDrop</Link>
        <div className="flex gap-3">
          {navItems.map((item) => (
            <Link key={item.to} to={item.to} className="text-white/70 hover:text-white">
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 mt-14 md:mt-0 overflow-auto">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default ManageLayout;
