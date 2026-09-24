import { ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Footer from "@/components/Footer";

type Section = { title: string; body: ReactNode };

const termsSections: Section[] = [
  {
    title: "",
    body: 'LuckyDrop (이하 "서비스")의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항을 규정합니다.',
  },
  {
    title: "1. 서비스 소개",
    body: "본 서비스는 주최자가 추첨 이벤트(뽑기) 콘텐츠를 생성하고, 참여자가 초대 코드를 통해 해당 이벤트에 참여하여 보상을 추첨할 수 있도록 하는 플랫폼입니다.",
  },
  {
    title: "2. 이용 대상 및 방식",
    body: "- 주최자: Supabase가 제공하는 Google 계정 인증을 통해 로그인 후 콘텐츠를 생성·관리합니다.\n- 참여자: 별도 회원가입 없이, 주최자로부터 전달받은 콘텐츠 코드와 초대 코드를 입력하여 이벤트에 참여합니다.",
  },
  {
    title: "3. 금지 행위",
    body: "이용자는 다음 행위를 해서는 안 됩니다.\n- 금전 거래 또는 이를 유도하는 행위\n- 도박 또는 사행성 콘텐츠 생성\n- 타인의 개인정보를 무단으로 입력·수집하거나 이를 유도하는 행위\n- 타인에 대한 괴롭힘, 욕설, 비방\n- 사기, 피싱 등 불법 행위\n- 광고, 스팸성 콘텐츠 게시\n- 기타 관련 법령에 위반되는 행위",
  },
  {
    title: "4. 콘텐츠 책임",
    body: "- 이용자가 생성한 콘텐츠(콘텐츠명, 보상 정보, 초대 코드의 식별자 등)에 대한 책임은 해당 이용자에게 있습니다.\n- 서비스는 이용자 간 콘텐츠 전달을 매개하는 플랫폼이며, 개별 콘텐츠의 정확성·합법성에 대해 책임지지 않습니다.",
  },
  {
    title: "5. 서비스 이용 제한",
    body: "- 서비스는 약관 위반 시 콘텐츠 삭제 또는 계정 이용 제한 조치를 할 수 있습니다.\n- 반복적인 위반 시 서비스 이용이 영구적으로 제한될 수 있습니다.",
  },
  {
    title: "6. 면책 조항",
    body: "- 서비스는 이용자가 생성한 콘텐츠의 정확성·신뢰성에 대해 보장하지 않습니다.\n- 천재지변, 외부 인증 서비스(Supabase 등)의 장애 등 서비스의 합리적 통제 범위를 벗어난 사유로 인한 손해에 대해 책임을 지지 않습니다.",
  },
  {
    title: "7. 약관 변경",
    body: "본 약관은 관련 법령의 변경, 서비스 정책 변경 등의 사유로 개정될 수 있으며, 변경 시 시행일 7일 전(이용자에게 불리한 변경의 경우 30일 전) 서비스 내 공지합니다.",
  },
  {
    title: "부칙",
    body: "본 약관은 2026년 5월 1일부터 적용됩니다.",
  },
];

const privacySections: Section[] = [
  {
    title: "",
    body: 'LuckyDrop(이하 "서비스")은 이용자의 개인정보를 중요하게 생각하며, 다음과 같이 처리합니다.',
  },
  {
    title: "1. 수집하는 개인정보 항목",
    body: (
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="font-medium text-foreground">(1) 주최자 (로그인 이용자)</p>
          <p className="whitespace-pre-line">
            {"- 당사 서버에 저장: 이름, 식별자(UUID), 가입일시\n- 인증 처리 위탁사(Supabase)에 저장: Google 계정 정보(이메일, 프로필 이미지 등) — 당사는 위탁사 콘솔을 통해 조회 가능"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">(2) 참여자 (비로그인 이용자)</p>
          <p className="whitespace-pre-line">
            {"- 주최자가 초대 코드를 생성할 때 부여하는 식별 라벨(예: 닉네임)\n  ※ 참여자가 직접 입력하는 정보는 없으며, 주최자가 입력합니다. 주최자는 실명, 연락처 등 식별 가능한 개인정보를 라벨로 입력하지 않도록 주의해야 합니다.\n- 참여 기록: 추첨 결과, 추첨 일시, 보상 수령 여부"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">(3) 자동 수집 정보</p>
          <p className="whitespace-pre-line">
            {"- 서비스는 부정 이용 방지, 보안, 요청 제한 적용을 위해 IP 주소를 서버에서 일시적으로 처리할 수 있습니다.\n- IP 주소는 자동 대입 시도 등 비정상적인 요청을 제한하기 위한 in-memory rate limit 용도로 사용되며, 마케팅 또는 프로파일링 목적으로 사용하지 않습니다.\n- 인증 처리 위탁사(Supabase) 및 호스팅 사업자(Cloudtype)에서 서비스 운영을 위해 필요한 범위 내에서 일시적으로 접속 정보를 처리할 수 있으며, 이는 각 사의 정책에 따릅니다."}
          </p>
        </div>
      </div>
    ),
  },
  {
    title: "2. 수집·이용 목적",
    body: "- 서비스 제공 및 운영(이벤트 생성, 추첨 진행, 결과 확인)\n- 이용자 식별 및 부정 이용 방지\n- 보안 및 분쟁 대응",
  },
  {
    title: "3. 보유 및 이용 기간",
    body: (
      <div className="space-y-2">
        <p>
          {"- 주최자 계정 정보: "}
          <strong className="text-foreground font-semibold">회원 탈퇴 시 즉시 파기</strong>
          {" (Supabase 인증 정보 포함 즉시 삭제 처리)"}
        </p>
        <p>
          {"- 콘텐츠, 초대 코드, 추첨 결과 데이터: 주최자가 삭제를 요청한 시점으로부터 "}
          <strong className="text-foreground font-semibold">30일 후 자동 영구 삭제</strong>
        </p>
        <p className="text-sm pl-2">
          ※ 삭제 후 30일간은 복구가 가능하도록 보존되며, 30일 경과 후 배치 작업으로 영구 삭제됩니다.
        </p>
        <p>- 법령에 따라 보존이 필요한 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
      </div>
    ),
  },
  {
    title: "4. 제3자 제공",
    body: "- 서비스는 이용자의 개인정보를 외부에 제공하지 않습니다.\n- 단, 법령에 따른 요구가 있는 경우는 예외로 합니다.",
  },
  {
    title: "5. 처리 위탁",
    body: (
      <div className="space-y-3">
        <p>서비스는 원활한 운영을 위하여 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-foreground">수탁자</th>
              <th className="text-left py-2 pr-4 font-medium text-foreground">위탁 업무</th>
              <th className="text-left py-2 font-medium text-foreground">보유 기간</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2 pr-4">Supabase, Inc.</td>
              <td className="py-2 pr-4">Google OAuth 인증 처리, 회원 정보 저장</td>
              <td className="py-2">회원 탈퇴 시까지</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Cloudtype</td>
              <td className="py-2 pr-4">서비스 호스팅(서버 운영)</td>
              <td className="py-2">위탁 계약 종료 시까지</td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  },
  {
    title: "6. 이용자의 권리",
    body: "- 이용자는 자신의 개인정보에 대해 열람, 수정, 삭제, 처리 정지를 요청할 수 있습니다.\n- 회원 탈퇴는 서비스 내 탈퇴 기능을 통해 직접 진행할 수 있으며, 탈퇴 즉시 계정 정보가 파기됩니다.",
  },
  {
    title: "7. 개인정보 보호 조치",
    body: "- 통신 구간 암호화(HTTPS) 적용\n- 인증 토큰(JWT) 기반 접근 제어\n- 처리 위탁사가 제공하는 보안 기능 준수",
  },
  {
    title: "8. 이용자 주의사항",
    body: "- 주최자는 초대 코드의 라벨에 실명·연락처 등 민감한 식별 정보를 입력하지 않도록 주의해야 합니다.\n- 콘텐츠명, 보상 설명 등 이용자가 입력하는 모든 텍스트에 개인정보가 포함되지 않도록 유의해야 합니다.",
  },
  {
    title: "9. 개인정보 보호책임자",
    body: "- peppercode01@gmail.com (서비스 운영자) ",
  },
  {
    title: "부칙",
    body: "본 방침은 2026년 7월 1일부터 적용됩니다.",
  },
];

const renderBody = (body: ReactNode) => {
  if (typeof body === "string") {
    return (
      <p className="text-[15px] leading-[1.7] text-muted-foreground whitespace-pre-line">
        {body}
      </p>
    );
  }
  return (
    <div className="text-[15px] leading-[1.7] text-muted-foreground">
      {body}
    </div>
  );
};

const Policy = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: "terms" | "privacy" =
    tabParam === "privacy" || tabParam === "terms" ? tabParam : "terms";

  const handleTabChange = (value: string) => {
    const nextTab = value as "terms" | "privacy";
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
            마지막 업데이트: 2026.07.01
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
              {termsSections.map((section, i) => (
                <section key={i} className="space-y-2">
                  {section.title && (
                    <h2 className="text-lg font-semibold text-foreground md:text-xl">
                      {section.title}
                    </h2>
                  )}
                  {renderBody(section.body)}
                </section>
              ))}
            </article>
          </TabsContent>

          <TabsContent value="privacy" className="mt-8">
            <article className="space-y-8 leading-relaxed">
              {privacySections.map((section, i) => (
                <section key={i} className="space-y-2">
                  {section.title && (
                    <h2 className="text-lg font-semibold text-foreground md:text-xl">
                      {section.title}
                    </h2>
                  )}
                  {renderBody(section.body)}
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
