import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base, type EventDetails } from "./fixtures";

export function Create() {
  const navigate = useNavigate();
  const [type, setType] = useState("");
  const [event, setEvent] = useState<EventDetails>({
    title: "",
    question: "",
    start: "",
    end: "",
  });
  const [attempted, setAttempted] = useState(false);
  const errors = {
    type: type ? "" : "이벤트 유형을 선택해 주세요.",
    title: event.title.trim() ? "" : "제목을 입력해 주세요.",
    question: event.question.trim() ? "" : "질문을 입력해 주세요.",
    start: event.start ? "" : "접수 시작 시각을 입력해 주세요.",
    end: !event.end
      ? "접수 마감 시각을 입력해 주세요."
      : event.end <= event.start
        ? "마감은 시작 시각보다 늦어야 해요."
        : "",
  };
  return (
    <main className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6">이벤트 만들기</h1>
      <Card className="preview-panel">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            setAttempted(true);
            if (!Object.values(errors).some(Boolean)) {
              const params = new URLSearchParams({ ...event, created: "1" });
              navigate(base + "/host?" + params.toString());
            }
          }}
        >
          <label htmlFor="event-type">이벤트 유형</label>
          <select
            id="event-type"
            className="preview-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">유형 선택</option>
            <option value="message">메시지 뽑기</option>
          </select>
          {attempted && errors.type && <p role="alert">{errors.type}</p>}
          {(
            [
              ["title", "이벤트 제목"],
              ["question", "참여자에게 보여줄 질문"],
              ["start", "접수 시작"],
              ["end", "접수 마감"],
            ] as const
          ).map(([key, label]) => {
            const props = {
              id: key,
              value: event[key],
              onChange: (
                e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
              ) => setEvent({ ...event, [key]: e.target.value }),
            };
            return (
              <div className="mt-4" key={key}>
                <label htmlFor={key}>{label}</label>
                {key === "question" ? (
                  <Textarea {...props} />
                ) : (
                  <Input
                    {...props}
                    type={key === "title" ? "text" : "datetime-local"}
                  />
                )}
                {attempted && errors[key] && <p role="alert">{errors[key]}</p>}
              </div>
            );
          })}
          <Button
            type="submit"
            className="mt-6 bg-manage-accent hover:bg-manage-accent/90"
          >
            만들고 참여 초대하기
          </Button>
        </form>
      </Card>
    </main>
  );
}
