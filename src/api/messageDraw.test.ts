import { expect, it } from "vitest";
import { createMessageEvent, getMessageManagement, getOwnMessage, saveOwnMessage } from "./messageDraw";

it("keeps submissions separate by code and exposes only opened bodies to the owner", () => {
  const code = createMessageEvent("host", { title: "우체통", question: "안부를 전해주세요", start: "2000-01-01", end: "2099-01-01" });
  expect(getMessageManagement(code, "other")).toBeNull();
  const host = () => getMessageManagement(code, "host")!;
  const [first, second] = host().invitations;
  expect(saveOwnMessage(code, first, "첫 메시지")).toBe(true);
  expect(saveOwnMessage(code, first, "고친 메시지")).toBe(true);
  expect(getOwnMessage(code, second)?.body).toBeNull();
  expect(host()).toMatchObject({ received: 1, unread: 1, history: [] });
  host().openNext();
  expect(host()).toMatchObject({ received: 1, unread: 0, history: [{ body: "고친 메시지" }] });
});
