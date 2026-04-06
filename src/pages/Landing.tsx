import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Gift, MessageCircle, KeyRound, Sparkles, Users, Settings, ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/* ───────── Header ───────── */
const LandingHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { label: "소개", href: "#features" },
    { label: "참여하기", href: "#roles" },
    { label: "주최자", href: "#flow" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <span className="font-extrabold text-lg tracking-tight text-foreground">🎉 LuckyDrop</span>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              {l.label}
            </a>
          ))}
          <Button size="sm" variant="outline" onClick={() => navigate("/admin/login")}>
            로그인
          </Button>
        </nav>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 text-foreground" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 space-y-3">
          {links.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
              {l.label}
            </a>
          ))}
          <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/admin/login")}>
            로그인
          </Button>
        </div>
      )}
    </header>
  );
};

/* ───────── Hero ───────── */
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="text-center px-4 pt-16 pb-12 md:pt-24 md:pb-16">
      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-bold mb-6">
        <Sparkles size={14} /> 참여형 이벤트 플랫폼
      </div>
      <h1 className="text-3xl md:text-5xl font-extrabold text-foreground leading-tight mb-4">
        이벤트를 만들고,<br />코드 하나로 참여하세요
      </h1>
      <p className="text-muted-foreground text-base md:text-lg max-w-md mx-auto mb-8">
        룰렛, 익명 메시지함 등 다양한 이벤트를 손쉽게 만들고 공유할 수 있어요.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button size="lg" className="w-full sm:w-auto gap-2" onClick={() => navigate("/draw")}>
          <KeyRound size={18} /> 코드로 참여하기
        </Button>
        <Button size="lg" variant="secondary" className="w-full sm:w-auto gap-2" onClick={() => navigate("/admin/login")}>
          <Settings size={18} /> 주최자로 시작하기
        </Button>
      </div>
    </section>
  );
};

/* ───────── Role Entry Cards ───────── */
const RoleEntrySection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      title: "참여자",
      desc: "로그인 없이 코드 하나로 빠르게 참여할 수 있어요.",
      points: ["회원가입 필요 없음", "코드 입력으로 즉시 참여", "룰렛 · 메시지함 이용"],
      cta: "참여하러 가기",
      icon: <Users size={28} />,
      style: "bg-[hsl(var(--peach)/0.25)] border-[hsl(var(--peach))]",
      onClick: () => navigate("/draw"),
    },
    {
      title: "주최자",
      desc: "이벤트를 만들고, 보상을 설정하고, 결과를 확인하세요.",
      points: ["콘텐츠 생성 · 관리", "보상 · 코드 설정", "참여 결과 확인"],
      cta: "콘텐츠 만들기",
      icon: <Settings size={28} />,
      style: "bg-[hsl(var(--sky)/0.25)] border-[hsl(var(--sky))]",
      onClick: () => navigate("/admin/login"),
    },
  ];

  return (
    <section id="roles" className="px-4 py-12 md:py-16 max-w-4xl mx-auto">
      <h2 className="text-xl md:text-2xl font-extrabold text-center text-foreground mb-8">어떻게 시작할까요?</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {roles.map((r) => (
          <Card key={r.title} className={`border-2 ${r.style} hover:shadow-lg transition-shadow`}>
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-background shadow-sm">{r.icon}</div>
                <h3 className="text-lg font-bold text-foreground">{r.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <ul className="space-y-1.5">
                {r.points.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-foreground">
                    <ChevronRight size={14} className="text-primary shrink-0" /> {p}
                  </li>
                ))}
              </ul>
              <Button className="mt-2 w-full" onClick={r.onClick}>{r.cta}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

/* ───────── Features ───────── */
const FeaturesSection = () => {
  const features = [
    { icon: <Gift size={28} className="text-primary" />, title: "룰렛 이벤트", desc: "보상을 설정하고 코드를 나눠주면, 참여자가 직접 뽑기를 즐길 수 있어요." },
    { icon: <MessageCircle size={28} className="text-secondary-foreground" />, title: "익명 메시지함", desc: "이름 없이 마음을 전할 수 있는 따뜻한 메시지 공간이에요." },
    { icon: <KeyRound size={28} className="text-accent-foreground" />, title: "코드 기반 참여", desc: "회원가입 없이, 주최자가 공유한 코드 하나로 간편하게 참여해요." },
  ];

  return (
    <section id="features" className="px-4 py-12 md:py-16 bg-muted/40">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-extrabold text-center text-foreground mb-8">어떤 것들을 할 수 있나요?</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card key={f.title} className="border border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-2xl bg-muted">{f.icon}</div>
                <h3 className="font-bold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ───────── Flow Steps ───────── */
const FlowSection = () => {
  const steps = [
    { num: "1", title: "콘텐츠 생성", desc: "주최자가 룰렛이나 메시지함을 만들어요" },
    { num: "2", title: "코드 공유", desc: "참여 코드를 생성하고 나눠줘요" },
    { num: "3", title: "참여자 참여", desc: "코드를 입력하면 바로 참여할 수 있어요" },
    { num: "4", title: "결과 확인", desc: "주최자와 참여자 모두 결과를 확인해요" },
  ];

  return (
    <section id="flow" className="px-4 py-12 md:py-16 max-w-3xl mx-auto">
      <h2 className="text-xl md:text-2xl font-extrabold text-center text-foreground mb-10">이용 흐름</h2>
      <div className="relative space-y-6">
        {/* vertical line */}
        <div className="absolute left-5 top-2 bottom-2 w-0.5 bg-border hidden md:block" />
        {steps.map((s, i) => (
          <div key={i} className="flex items-start gap-4 md:pl-4">
            <div className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-extrabold text-sm z-10">
              {s.num}
            </div>
            <div>
              <h3 className="font-bold text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ───────── Bottom CTA ───────── */
const BottomCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="px-4 py-14 md:py-20 bg-primary/5 text-center">
      <h2 className="text-xl md:text-2xl font-extrabold text-foreground mb-3">지금 바로 시작해보세요</h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-sm mx-auto">이벤트를 만들거나, 코드를 입력해 참여할 수 있어요.</p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/draw")}>코드로 참여하기</Button>
        <Button size="lg" variant="secondary" className="w-full sm:w-auto" onClick={() => navigate("/admin/login")}>이벤트 만들기</Button>
      </div>
    </section>
  );
};

/* ───────── Footer ───────── */
const LandingFooter = () => (
  <footer className="border-t border-border py-8 px-4 text-center text-sm text-muted-foreground">
    <p className="font-bold text-foreground mb-1">🎉 LuckyDrop</p>
    <p className="mb-3">참여형 이벤트 콘텐츠 플랫폼</p>
    <p className="text-xs">© 2026 LuckyDrop. All rights reserved.</p>
  </footer>
);

/* ───────── Landing Page ───────── */
const Landing = () => (
  <div className="min-h-screen bg-background font-[Nunito]">
    <HeroSection />
    <RoleEntrySection />
    <FeaturesSection />
    <FlowSection />
    <BottomCTA />
    <LandingFooter />
  </div>
);

export default Landing;
