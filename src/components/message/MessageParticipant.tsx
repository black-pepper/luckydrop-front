import { useNavigate } from "react-router-dom";
import ContentStateCard from "@/components/draw/ContentStateCard";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import CodeInputCard from "@/components/draw/CodeInputCard";
import { Textarea } from "@/components/ui/textarea";
import {
  getMessageEntry,
  getOwnMessage,
  saveOwnMessage,
  deleteOwnMessage,
  verifyMessageInvitation,
} from "@/api/messageDraw";
import { DeleteMessage } from "./DeleteMessage";

export function MessageParticipant({ contentCode }: { contentCode: string }) {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draft, setDraft] = useState("");
  const count = Array.from(draft).length;
  const invalid = !draft.trim() || count > 300;
  const box = getMessageEntry(contentCode);
  if (!box) return <ContentStateCard type="notFound" onHome={() => navigate("/")} />;
  const own = code ? getOwnMessage(contentCode, code) : null;
  const canCompose = box.phase === "open" || own?.body != null;
  if (!own) {
    const hint = box.sampleCode
      ? "체험용 초대 코드 " + box.sampleCode
      : "주최자가 공유한 초대 코드를 입력해 주세요.";
    return (
      <>
        <p className="mb-4 text-center text-sm font-bold text-primary">
          메시지 뽑기 ·{" "}
          {box.phase === "open"
            ? "접수 중"
            : box.phase === "closed"
              ? "접수 마감"
              : "접수 전"}
        </p>
        <CodeInputCard
          title={box.event.title}
          description={box.event.question}
          startAt={box.event.start}
          endAt={box.event.end}
          loading={false}
          error={error}
          messageHint={hint}
          onSubmit={(raw) => {
            const invitation = raw.toUpperCase();
            const result = verifyMessageInvitation(contentCode, invitation);
            if (result === "valid") {
              setCode(invitation);
              setError("");
            } else
              setError(
                result === "expired"
                  ? "만료된 초대 코드예요."
                  : "이 이벤트의 초대 코드를 확인해 주세요.",
              );
          }}
        />
      </>
    );
  }
  return (
    <section className="space-y-4">
      <header className="text-center">
        <h1 className="text-2xl font-extrabold">{box.event.title}</h1>
        <p className="mt-2 text-muted-foreground">{box.event.question}</p>
      </header>
      <Card className="space-y-4 p-5 [&_h2]:text-xl [&_h2]:font-bold">
        {own.deleted ? (
          <h2>내 메시지를 삭제했어요</h2>
        ) : own.body !== null && !editing ? (
          <>
            <MailCheck className="size-9 text-primary" />
            <h2>메시지를 보냈어요</h2>
            <p>내가 보낸 글은 편집창에서 확인할 수 있어요.</p>
            <Button
              onClick={() => {
                setDraft(own.body ?? "");
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
            <blockquote className="whitespace-pre-wrap break-words rounded-lg bg-muted p-4">
              {draft}
            </blockquote>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setPreview(false)}>
                다시 작성
              </Button>
              <Button
                onClick={() => {
                  if (!saveOwnMessage(contentCode, code, draft)) {
                    setPreview(false);
                    return;
                  }
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
                    deleteOwnMessage(contentCode, code);
                    setDraft("");
                    setEditing(false);
                  }}
                />
              )}
            </div>
          </>
        )}
      </Card>
    </section>
  );
}
