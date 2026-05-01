import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="border-t border-border py-10 px-4 text-sm text-muted-foreground bg-background">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-6">
        <div className="text-center md:text-left">
          <p className="font-bold text-foreground mb-1">🎉 LuckyDrop</p>
          <p className="mb-1">참여형 이벤트 콘텐츠 플랫폼</p>
          <p className="text-xs">© 2026 LuckyDrop. All rights reserved.</p>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
          <button onClick={() => navigate("/")} className="hover:text-foreground transition-colors">서비스 소개</button>
          <button onClick={() => navigate("/policy?tab=terms")} className="hover:text-foreground transition-colors">이용약관</button>
          <button onClick={() => navigate("/policy?tab=privacy")} className="hover:text-foreground transition-colors">개인정보처리방침</button>
          <button onClick={() => navigate("/contact")} className="hover:text-foreground transition-colors">문의</button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
