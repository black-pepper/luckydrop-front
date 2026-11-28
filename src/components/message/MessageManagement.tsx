import { useReducer, useState } from "react";
import { ArrowLeft, Inbox, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getMessageManagement } from "@/api/messageDraw";
import { useMessageOwner } from "@/hooks/useMessageOwner";
import { DeleteMessage } from "./DeleteMessage";

function Sharing({
  contentCode,
  invitations,
}: {
  contentCode: string;
  invitations: string[];
}) {
  const [notice, setNotice] = useState("");
  const path = "/draw/" + contentCode;
  const url = location.origin + path;
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("복사했어요.");
    } catch {
      setNotice("아래 내용을 선택해서 직접 복사해 주세요.");
    }
  }
  return (
    <Card className="space-y-4 p-5">
      <h2>참여 초대</h2>
      <Link to={path} className="block break-all text-sm underline">
        {url}
      </Link>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => copy(url)}>
          링크 복사
        </Button>
      </div>
      <h3 className="font-semibold">초대 코드</h3>
      {invitations.map((code) => (
        <div key={code} className="flex items-center justify-between gap-2">
          <b className="font-mono">{code}</b>
          <Button size="sm" variant="outline" onClick={() => copy(code)}>
            코드 복사
          </Button>
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        현재 예시 데이터로 동작해요. 새로 만든 이벤트와 변경 사항은 이 탭에서
        확인할 수 있어요.
      </p>
      {notice && <p role="status">{notice}</p>}
    </Card>
  );
}

export function MessageManagement({ contentCode }: { contentCode: string }) {
  const owner = useMessageOwner();
  const [, refresh] = useReducer((n) => n + 1, 0);
  const [selected, setSelected] = useState<string>();
  const box = getMessageManagement(contentCode, owner);
  if (!box)
    return <p>{owner ? "이 이벤트에 접근할 수 없어요." : "불러오는 중..."}</p>;
  const result = box.history.find((item) => item.code === selected);
  return (
    <section className="[&_h2]:text-lg [&_h2]:font-bold">
      <header className="mb-6 flex items-center gap-3">
        <Button asChild size="icon" variant="ghost" className="shrink-0">
          <Link to="/manage" aria-label="내 콘텐츠로 돌아가기">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-foreground">
            {box.event.title}
          </h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <Badge variant="outline">메시지 뽑기</Badge>
            <span className="break-all font-mono text-xs text-muted-foreground">
              {contentCode}
            </span>
          </div>
        </div>
      </header>
      <Tabs defaultValue="info">
        <TabsList
          aria-label="메시지 뽑기 관리"
          className="mb-4 h-auto max-w-full flex-wrap justify-start"
        >
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="draw">메시지 뽑기</TabsTrigger>
          <TabsTrigger value="history">읽은 메시지</TabsTrigger>
          <TabsTrigger value="share">공유</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <Card className="space-y-4 p-5">
            <h2>기본정보</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium">참여자에게 보여줄 질문</dt>
                <dd className="mt-1.5 rounded-md bg-muted/30 px-3 py-2">
                  {box.event.question}
                </dd>
              </div>
              <div>
                <dt className="font-medium">접수 기간</dt>
                <dd className="mt-1.5 rounded-md bg-muted/30 px-3 py-2">
                  {new Date(box.event.start).toLocaleString("ko-KR")} ~{" "}
                  {new Date(box.event.end).toLocaleString("ko-KR")}
                </dd>
              </div>
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="draw">
          <Card className="space-y-4 p-5">
            <h2 className="flex items-center gap-2">
              <Inbox /> 받은 편지함
            </h2>
            <dl className="grid grid-cols-2 gap-3">
              {[
                ["받은 메시지", box.received],
                ["아직 안 읽은 메시지", box.unread],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-manage-muted p-4">
                  <dt className="text-sm">{label}</dt>
                  <dd className="mt-1 text-3xl font-bold">
                    {value}
                    <small className="ml-1 text-sm">통</small>
                  </dd>
                </div>
              ))}
            </dl>
            <p>
              {box.phase === "scheduled"
                ? "접수 전"
                : box.phase === "closed"
                  ? "접수 마감"
                  : "접수 중"}{" "}
              · 마감 {new Date(box.event.end).toLocaleString("ko-KR")}
            </p>
            {box.unread === 0 && (
              <p>
                {box.received === 0
                  ? "도착한 메시지가 없어요"
                  : "모두 읽었어요"}
              </p>
            )}
            <Button
              className="bg-manage-accent hover:bg-manage-accent/90"
              disabled={!box.unread || box.phase === "scheduled"}
              onClick={() => {
                setSelected(box.openNext());
                refresh();
              }}
            >
              <MailOpen /> 메시지 한 장 뽑기
            </Button>
            {result?.body && (
              <section aria-live="polite">
                <h3>열어 본 메시지</h3>
                <blockquote className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted p-4">
                  {result.body}
                </blockquote>
              </section>
            )}
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card className="space-y-4 p-5">
            <h2>읽은 메시지</h2>
            {box.history.length === 0 && (
              <p>한 장 뽑으면 이곳에서 다시 볼 수 있어요.</p>
            )}
            {box.history.map((item) => (
              <article key={item.code} className="space-y-3 border-t pt-4">
                <p className="whitespace-pre-wrap break-words">
                  {item.body ?? "숨긴 메시지예요."}
                </p>
                <div className="flex flex-wrap gap-2">
                  {item.body && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        box.hide(item.code);
                        refresh();
                      }}
                    >
                      숨기기
                    </Button>
                  )}
                  {box.canDelete && (
                    <DeleteMessage
                      onConfirm={() => {
                        box.remove(item.code);
                        refresh();
                      }}
                    />
                  )}
                </div>
              </article>
            ))}
          </Card>
        </TabsContent>
        <TabsContent value="share">
          <Sharing contentCode={contentCode} invitations={box.invitations} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
