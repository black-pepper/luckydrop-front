import type { InquiryStatus, InquiryType } from "@/api/types";

export const inquiryTypeLabel: Record<InquiryType, string> = {
  GENERAL: "일반 문의",
  BUG: "버그 문의",
  FEATURE: "기능 제안",
  ETC: "기타",
};

export const inquiryStatusLabel: Record<InquiryStatus, string> = {
  PENDING: "처리 대기",
  DONE: "처리 완료",
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
