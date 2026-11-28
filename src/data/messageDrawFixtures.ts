export const sampleContentCode = "message-letter";
export const sampleInvitation = "LETTER";

const day = 24 * 60 * 60 * 1000;
const today = Date.now();
const date = (offset: number) => new Date(today + offset * day).toISOString();
const letters = [
  "비 오던 날 다 같이 우산 하나를 나눠 쓰고 뛰어간 순간이요. 그때 사진은 아직도 제 배경 화면이에요!",
  "첫 출근 날 건네주신 따뜻한 커피를 기억해요. 덕분에 금방 적응할 수 있었어요.",
  "점심마다 걷던 작은 공원, 다음 계절에도 함께 걸어요.",
];
export const messageFixtures = [
  {
    code: sampleContentCode,
    title: "우리의 마지막 우체통",
    invitations: [sampleInvitation, "POSTCARD"],
    canDelete: true,
    start: date(-2),
    end: date(7),
    letters,
  },
  {
    code: "message-scheduled",
    title: "새해에 열리는 우체통",
    invitations: ["NEWYEAR", "START"],
    canDelete: false,
    start: date(3),
    end: date(10),
    letters: [],
  },
  {
    code: "message-closed",
    title: "지난 모임의 한 줄 인사",
    invitations: ["MEMORY", "REUNION"],
    canDelete: false,
    start: date(-7),
    end: date(-1),
    letters,
  },
];
