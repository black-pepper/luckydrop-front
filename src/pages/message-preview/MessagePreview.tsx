import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { ArrowUpRight, Inbox, Mail, MailPlus, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Create } from "./Create";
import { Host } from "./Host";
import { Participant } from "./Participant";
import {
  base,
  scenarioFrom,
  scenarios,
  type EventDetails,
  type Scenario,
} from "./fixtures";
import { usePreviewMailbox } from "./usePreviewMailbox";
import "./preview.css";

const views = [
  {
    path: "create",
    label: "이벤트 만들기",
    icon: MailPlus,
    detail: "질문과 접수 기간 설정",
  },
  {
    path: "participant",
    label: "참여자",
    icon: Mail,
    detail: "초대 코드 입력과 메시지 작성",
  },
  {
    path: "host",
    label: "주최자",
    icon: Inbox,
    detail: "받은 메시지 뽑기와 열람",
  },
  {
    path: "admin",
    label: "모의 관리자",
    icon: Settings,
    detail: "읽은 메시지 삭제 체험",
  },
];
function Hub({ search }: { search: string }) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <header className="letter-banner relative overflow-hidden sm:pr-48">
        <div aria-hidden className="paper-envelope" />
        <h1>메시지 뽑기</h1>
        <p className="mt-3 max-w-md">
          초대받은 사람들이 글을 보내면, 주최자가 한 통씩 뽑아 읽는
          우체통이에요.
        </p>
      </header>
      <h2 className="mb-4 mt-8">화면 둘러보기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {views.map(({ path, label, detail, icon: Icon }) => (
          <Link key={path} to={base + "/" + path + search}>
            <Card className="flex h-full items-center gap-4 p-5 transition-shadow hover:shadow-md">
              <span className="rounded-xl bg-muted p-3">
                <Icon size={21} />
              </span>
              <div>
                <h3>{label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
              <ArrowUpRight
                aria-hidden
                className="ml-auto shrink-0"
                size={17}
              />
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
function PreviewScreens({
  scene,
  custom,
}: {
  scene: Scenario;
  custom?: EventDetails;
}) {
  const box = usePreviewMailbox(scene, custom);
  const { pathname, search } = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const manage = ["host", "admin", "create"].some((path) =>
    pathname.endsWith("/" + path),
  );
  return (
    <div
      className={
        "message-preview min-h-screen " +
        (manage ? "bg-manage-bg" : "bg-background")
      }
    >
      <header
        className={manage ? "bg-manage-sidebar text-white" : "border-b bg-card"}
      >
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link
            to={base + search}
            className="inline-flex items-center gap-2 font-bold"
          >
            <Mail size={20} /> LuckyDrop{" "}
            <span className="font-normal">· 미리보기</span>
          </Link>
          <nav
            aria-label="미리보기 화면"
            className="flex flex-wrap gap-x-4 gap-y-1 text-sm"
          >
            {views.map((view) => (
              <Link
                className={
                  pathname.endsWith("/" + view.path)
                    ? "font-bold underline underline-offset-4"
                    : ""
                }
                key={view.path}
                to={base + "/" + view.path + search}
              >
                {view.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <div className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-2 text-xs">
          <label htmlFor="scene">체험 상황</label>
          <select
            id="scene"
            className="rounded border bg-card px-2 py-1"
            value={custom ? "custom" : scene}
            onChange={(e) => navigate(window.location.pathname + "?scene=" + e.target.value)}
          >
            {custom && <option value="custom">직접 만든 이벤트</option>}
            {scenarios.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <span className="text-muted-foreground">
            예시 데이터 · 새로고침하면 초기화돼요
          </span>
        </div>
      </div>
      <Routes>
        <Route index element={<Hub search={search} />} />
        <Route path="create" element={<Create />} />
        {["participant", "host", "admin"].map((path) => (
          <Route
            key={path}
            path={path}
            element={
              scene === "unavailable" ? (
                <main className="mx-auto max-w-xl px-4 py-12">
                  <h1>이 이벤트에 접근할 수 없어요</h1>
                  <p>참여 링크를 다시 확인해 주세요.</p>
                </main>
              ) : path === "participant" ? (
                <Participant box={box.participant} />
              ) : (
                <>
                  {params.get("created") && (
                    <p role="status" className="mx-auto max-w-5xl px-4 pt-4">
                      미리보기 이벤트를 만들었어요.
                    </p>
                  )}
                  <Host
                    box={box.host}
                    admin={path === "admin"}
                    search={search}
                  />
                </>
              )
            }
          />
        ))}
        <Route path="*" element={<Hub search={search} />} />
      </Routes>
    </div>
  );
}
export default function MessagePreview() {
  const [params] = useSearchParams();
  const scene = scenarioFrom(params);
  const title = params.get("title"),
    question = params.get("question"),
    start = params.get("start"),
    end = params.get("end");
  const custom =
    params.has("created") &&
    title &&
    question &&
    start &&
    end &&
    Date.parse(start) < Date.parse(end)
      ? { title, question, start, end }
      : undefined;
  return (
    <PreviewScreens
      key={JSON.stringify([scene, custom])}
      scene={scene}
      custom={custom}
    />
  );
}
