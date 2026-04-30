export type ContentType = "DRAW" | "QUIZ" | "MESSAGEBOX";

export const CONTENT_TYPE_LABEL_MAP: Record<ContentType, string> = {
  DRAW: "뽑기",
  QUIZ: "퀴즈",
  MESSAGEBOX: "메시지함",
};

export const CONTENT_TYPE_COLOR_MAP: Record<ContentType, string> = {
  DRAW: "bg-manage-accent/10 text-manage-accent border-manage-accent/20",
  QUIZ: "bg-secondary/20 text-secondary-foreground",
  MESSAGEBOX: "bg-accent/20 text-accent-foreground",
};

export function getContentTypeLabel(type: string): string {
  return CONTENT_TYPE_LABEL_MAP[type as ContentType] ?? type;
}

export function getContentTypeColor(type: string): string {
  return CONTENT_TYPE_COLOR_MAP[type as ContentType] ?? "";
}
