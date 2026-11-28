import { useState } from "react";
import { Mail, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatTime, invitation } from "./fixtures";
import { DeleteMessage } from "./shared";
import type { ParticipantMailbox } from "./usePreviewMailbox";

export function Participant({ box }: { box: ParticipantMailbox }) {
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draft, setDraft] = useState("");
  const count = Array.from(draft).length;
  const invalid = !draft.trim() || count > 300;
  const canCompose = box.phase === "open" || box.own !== null;
  return (
    <main className="mx-auto max-w-xl space-y-5 px-4 py-8 sm:py-12">
      <header className="letter-banner">
        <Mail className="mb-5 size-9" aria-hidden />
        <p className="mb-1 text-sm font-bold">메시지 뽑기 · 참여자</p>
        <h1>{box.event.title}</h1>
        <p className="mt-3">{box.event.question}</p>
        <p className="mt-6 text-sm">접수 마감 {formatTime(box.event.end)}</p>
      </header>
      <Card className="preview-panel">
        {!verified && (
          <>
            <h2>초대 코드 입력</h2>
            {box.phase !== "open" && (
              <p>
                {box.phase === "closed"
                  ? "메시지 접수가 마감됐어요."
                  : "아직 접수 전이에요. 시작 " + formatTime(box.event.start)}
              </p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const result = box.verify(code);
                if (result === "valid") {
                  setVerified(true);
                  setError("");
                } else
                  setError(
                    result === "expired"
                      ? "만료된 초대 코드예요."
                      : "이 이벤트의 초대 코드를 확인해 주세요.",
                  );
              }}
            >
              <label htmlFor="invite">초대 코드</label>
              <Input
                id="invite"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="받은 코드를 입력해 주세요"
              />
              {error && <p role="alert">{error}</p>}
              <Button className="mt-4" type="submit">
                코드 확인
              </Button>
            </form>
            <p className="text-sm text-muted-foreground">
              체험용 코드 <b>{invitation}</b> · 만료 코드 EXPIRED
            </p>
          </>
        )}
        {verified &&
          (box.ownDeleted ? (
            <h2>내 메시지를 삭제했어요</h2>
          ) : box.own !== null && !editing ? (
            <>
              <MailCheck className="size-9 text-primary" />
              <h2>메시지를 보냈어요</h2>
              <p>내가 보낸 글은 편집창에서 확인할 수 있어요.</p>
              <Button
                onClick={() => {
                  setDraft(box.own ?? "");
                  setEditing(true);
                }}
              >
                내 메시지 편집
              </Button>
            </>
          ) : !canCompose ? (
            <h2>
              {box.phase === "scheduled"
                ? "아직 접수 전이에요"
                : "메시지 접수가 마감됐어요"}
            </h2>
          ) : preview ? (
            <>
              <h2>보낼 메시지 미리보기</h2>
              <blockquote className="letter-body">{draft}</blockquote>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setPreview(false)}>
                  다시 작성
                </Button>
                <Button
                  onClick={() => {
                    box.save(draft);
                    setDraft("");
                    setEditing(false);
                    setPreview(false);
                  }}
                >
                  {editing ? "수정 저장" : "메시지 보내기"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <h2>{editing ? "내 메시지 편집" : "메시지 작성"}</h2>
              <p>
                주최자가 한 통씩 열어 읽어요. 연락처 등 개인정보는 적지 마세요.
                보낸 글은 같은 코드로 다시 확인할 수 있어요.
              </p>
              <label htmlFor="letter">메시지 본문</label>
              <Textarea
                id="letter"
                rows={5}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="기억에 남는 순간을 들려주세요"
              />
              <p className="text-right text-sm" aria-live="polite">
                {count} / 300자
              </p>
              {invalid && draft && (
                <p role="alert">
                  {count > 300
                    ? "300자 이하로 작성해 주세요."
                    : "공백 외에 한 글자 이상 입력해 주세요."}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button disabled={invalid} onClick={() => setPreview(true)}>
                  메시지 미리보기
                </Button>
                {editing && (
                  <DeleteMessage
                    onConfirm={() => {
                      box.removeOwn();
                      setDraft("");
                      setEditing(false);
                    }}
                  />
                )}
              </div>
            </>
          ))}
      </Card>
    </main>
  );
}
