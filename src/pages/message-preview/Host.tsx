import { useState } from "react";
import { Inbox, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { base, formatTime, invitation } from "./fixtures";
import { DeleteMessage } from "./shared";
import type { HostMailbox } from "./usePreviewMailbox";

export function Sharing({ search }: { search: string }) {
  const [notice, setNotice] = useState("");
  const url = location.origin + base + "/participant" + search;
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("복사했어요.");
    } catch {
      setNotice("아래 내용을 선택해서 직접 복사해 주세요.");
    }
  }
  return (
    <Card className="preview-panel">
      <h2>참여 초대</h2>
      <p className="break-all text-sm select-all">{url}</p>
      <p>
        초대 코드 <b>{invitation}</b>
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => copy(url)}>
          링크 복사
        </Button>
        <Button variant="outline" onClick={() => copy(invitation)}>
          코드 복사
        </Button>
      </div>
      {notice && <p role="status">{notice}</p>}
    </Card>
  );
}

export function Host({
  box,
  admin,
  search,
}: {
  box: HostMailbox;
  admin: boolean;
  search: string;
}) {
  const [selected, setSelected] = useState<string>();
  const result = box.history.find((item) => item.code === selected);
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-6">
        <p className="mb-2 text-sm font-bold text-manage-accent">
          {admin ? "모의 관리자" : "주최자"} · 메시지 관리
        </p>
        <h1>{box.event.title}</h1>
        <p className="mt-2 text-muted-foreground">{box.event.question}</p>
      </header>
      <div className="grid items-start gap-5 md:grid-cols-[3fr_2fr]">
        <div className="space-y-5">
          <Card className="preview-panel">
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
              · 마감 {formatTime(box.event.end)}
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
              onClick={() => setSelected(box.openNext())}
            >
              <MailOpen /> 메시지 한 장 뽑기
            </Button>
            {result?.body && (
              <section aria-live="polite">
                <h3>열어 본 메시지</h3>
                <blockquote className="letter-body">{result.body}</blockquote>
              </section>
            )}
          </Card>
          <Card className="preview-panel">
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
                      onClick={() => box.hide(item.code)}
                    >
                      숨기기
                    </Button>
                  )}
                  {admin && (
                    <DeleteMessage onConfirm={() => box.remove(item.code)} />
                  )}
                </div>
              </article>
            ))}
          </Card>
        </div>
        <Sharing search={search} />
      </div>
    </main>
  );
}
