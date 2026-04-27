import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

type Section = { title: string; body: string };
// ... (termsSections, privacySections unchanged)

const termsSections: Section[] = [
  {
    title: "1. 서비스 소개",
    body: "본 서비스는 행사 주최자와 참여자를 위한 럭키드로우 및 메시지 박스 기능을 제공합니다. 사용자는 별도의 회원가입 없이 코드 기반으로 서비스를 이용할 수 있습니다.",
  },
  {
    title: "2. 이용 조건",
    body: "본 서비스를 이용하기 위해서는 본 약관에 동의해야 합니다. 만 14세 미만의 사용자는 보호자의 동의가 필요할 수 있습니다.",
  },
  {
    title: "3. 금지 행위",
    body: "타인의 권리를 침해하거나 서비스의 정상적인 운영을 방해하는 행위는 금지됩니다. 부적절한 콘텐츠 게시 시 사전 통보 없이 제한될 수 있습니다.",
  },
  {
    title: "4. 콘텐츠 책임",
    body: "사용자가 작성한 모든 콘텐츠에 대한 책임은 작성자 본인에게 있습니다. 운영자는 게시된 콘텐츠의 정확성을 보장하지 않습니다.",
  },
  {
    title: "5. 서비스 제한",
    body: "운영자는 서비스의 안정적인 운영을 위해 일부 기능을 제한하거나 변경할 수 있으며, 사전 공지 후 시행하는 것을 원칙으로 합니다.",
  },
  {
    title: "6. 면책 조항",
    body: "천재지변, 네트워크 장애 등 불가항력적인 사유로 인한 서비스 중단에 대해 운영자는 책임을 지지 않습니다.",
  },
  {
    title: "7. 약관 변경",
    body: "본 약관은 필요에 따라 변경될 수 있으며, 변경 시 서비스 내 공지를 통해 안내합니다. 변경된 약관은 공지일로부터 효력이 발생합니다.",
  },
];

const privacySections: Section[] = [
  {
    title: "1. 수집하는 정보",
    body: "서비스 이용을 위해 닉네임, 접속 코드, 작성한 메시지 내용 등을 수집할 수 있습니다. 별도의 개인 식별 정보는 최소한으로 수집합니다.",
  },
  {
    title: "2. 수집 목적",
    body: "수집된 정보는 서비스 제공, 부정 이용 방지, 서비스 품질 개선을 목적으로 사용됩니다. 수집 목적 외 용도로는 사용되지 않습니다.",
  },
  {
    title: "3. 보관 기간",
    body: "수집된 정보는 서비스 이용 종료 또는 사용자 요청 시까지 보관되며, 관련 법령에서 정한 기간을 준수합니다.",
  },
  {
    title: "4. 제3자 제공",
    body: "사용자의 사전 동의 없이 개인정보를 외부 제3자에게 제공하지 않습니다. 단, 법령에 따른 요청이 있을 경우는 예외로 합니다.",
  },
  {
    title: "5. 처리 위탁",
    body: "원활한 서비스 운영을 위해 일부 업무를 외부 업체에 위탁할 수 있으며, 위탁 시에는 관련 법령에 따라 안전하게 관리합니다.",
  },
  {
    title: "6. 사용자 권리",
    body: "사용자는 언제든지 본인의 정보 조회, 수정, 삭제를 요청할 수 있으며, 운영자는 지체 없이 이에 응합니다.",
  },
  {
    title: "7. 보안 조치",
    body: "수집된 정보의 안전한 보호를 위해 기술적, 관리적 조치를 시행하고 있으며, 정기적으로 보안 점검을 수행합니다.",
  },
];

const Policy = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">("terms");

  // URL 파라미터가 변경되면 탭 상태 업데이트
  useEffect(() => {
    if (tabParam === "privacy" || tabParam === "terms") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // 탭이 변경되면 URL 파라미터 업데이트
  const handleTabChange = (value: string) => {
    const nextTab = value as "terms" | "privacy";
    setActiveTab(nextTab);
    setSearchParams({ tab: nextTab });
  };

  const title = activeTab === "terms" ? "이용약관" : "개인정보처리방침";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 mx-auto w-full max-w-[720px] px-4 py-10 md:py-16">
        <header className="mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-muted-foreground">
            서비스 이용과 관련된 정책을 안내합니다.
          </p>
          <p className="text-xs text-muted-foreground">
            마지막 업데이트: 2026.04.01
          </p>
        </header>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terms">이용약관</TabsTrigger>
            <TabsTrigger value="privacy">개인정보처리방침</TabsTrigger>
          </TabsList>

          <TabsContent value="terms" className="mt-8">
            <article className="space-y-8 leading-relaxed">
              {termsSections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground md:text-xl">
                    {section.title}
                  </h2>
                  <p className="text-[15px] leading-[1.7] text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </article>
          </TabsContent>

          <TabsContent value="privacy" className="mt-8">
            <article className="space-y-8 leading-relaxed">
              {privacySections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground md:text-xl">
                    {section.title}
                  </h2>
                  <p className="text-[15px] leading-[1.7] text-muted-foreground">
                    {section.body}
                  </p>
                </section>
              ))}
            </article>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Policy;
