export type InquiryType = "SERVICE" | "EVENT" | "BILLING" | "BUG" | "ETC";

export const inquiryTypeLabel: Record<InquiryType, string> = {
  SERVICE: "서비스 이용",
  EVENT: "이벤트 생성/관리",
  BILLING: "결제/요금",
  BUG: "오류 신고",
  ETC: "기타",
};

export type InquiryStatus = "PENDING" | "ANSWERED";

export interface InquiryAnswer {
  content: string;
  answeredAt: string;
  author: string;
}

export interface Inquiry {
  id: number;
  title: string;
  type: InquiryType;
  content: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
  answer?: InquiryAnswer;
}

export const mockInquiries: Inquiry[] = [
  {
    id: 1,
    title: "추첨 이벤트 생성 시 보상 개수 제한이 있나요?",
    type: "EVENT",
    content:
      "안녕하세요! 추첨 이벤트를 만들고 있는데, 한 이벤트에 등록할 수 있는 보상 개수에 제한이 있는지 궁금해서 문의드립니다.",
    status: "PENDING",
    createdAt: "2026-06-07T14:20:00",
    updatedAt: "2026-06-07T14:20:00",
  },
  {
    id: 2,
    title: "참여자 코드를 한 번에 업로드할 수 있나요?",
    type: "SERVICE",
    content: "엑셀이나 CSV로 코드를 일괄 등록할 수 있는 기능이 있는지 알고 싶어요.",
    status: "ANSWERED",
    createdAt: "2026-06-03T09:10:00",
    updatedAt: "2026-06-04T11:32:00",
    answer: {
      content:
        "안녕하세요, LuckyDrop 운영팀입니다.\n현재는 CSV 업로드 기능이 베타로 제공되고 있어요. 코드 관리 화면 우측 상단의 '일괄 등록' 버튼을 통해 사용하실 수 있습니다. 이용해 보시고 불편한 점이 있다면 언제든 알려주세요!",
      answeredAt: "2026-06-04T11:32:00",
      author: "LuckyDrop 운영팀",
    },
  },
  {
    id: 3,
    title: "장문 케이스 - 결제 영수증과 세금계산서 관련 종합 문의",
    type: "BILLING",
    content:
      "안녕하세요. 회사에서 LuckyDrop 유료 플랜을 사용하고 있는 담당자입니다.\n\n1) 매월 결제되는 요금에 대해 세금계산서 발행이 가능한지 궁금합니다.\n2) 영수증은 별도로 다운로드할 수 있는 메뉴가 있는지 알고 싶어요.\n3) 연 단위 결제로 전환할 경우 할인 혜택이 있는지도 함께 안내 부탁드립니다.\n\n답변 기다리겠습니다. 감사합니다.",
    status: "ANSWERED",
    createdAt: "2026-05-28T16:45:00",
    updatedAt: "2026-05-30T10:05:00",
    answer: {
      content:
        "문의 주셔서 감사합니다.\n1) 세금계산서는 매월 결제일 기준 5영업일 이내에 등록된 사업자 이메일로 발송해 드리고 있어요.\n2) 영수증은 [설정 > 결제 내역]에서 PDF로 다운로드 가능합니다.\n3) 연간 결제 전환 시 약 2개월 무상 혜택이 제공돼요. 자세한 견적은 회신 메일로 안내드릴게요!",
      answeredAt: "2026-05-30T10:05:00",
      author: "LuckyDrop 운영팀",
    },
  },
];

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  PENDING: "답변 대기",
  ANSWERED: "답변 완료",
};

export function formatInquiryDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");

  return `${y}.${m}.${day} ${hh}:${mm}`;
}
