import type { ManageContentResponse } from "./types";
import { messageFixtures, sampleContentCode } from "@/data/messageDrawFixtures";
import { generateCode } from "@/lib/utils";

export interface MessageDetails {
  title: string;
  question: string;
  start: string;
  end: string;
}
type Phase = "open" | "closed" | "scheduled";
interface Letter {
  code: string;
  body: string;
  opened: boolean;
  hidden: boolean;
}
interface Mailbox {
  event: MessageDetails;
  owner: string | null;
  canDelete: boolean;
  createdAt: string;
  invitations: string[];
  letters: Letter[];
  deleted: Set<string>;
}
const boxes = new Map<string, Mailbox>(
  messageFixtures.map((f) => [
    f.code,
    {
      event: {
        title: f.title,
        question: "함께한 시간 중 가장 기억에 남는 순간은 언제인가요?",
        start: f.start,
        end: f.end,
      },
      owner: null,
      invitations: f.invitations,
      canDelete: f.canDelete,
      createdAt: new Date(Math.min(Date.now(), Date.parse(f.start))).toISOString(),
      deleted: new Set<string>(),
      letters: f.letters.map((body, i) => ({
        code: i === 1 ? "own-1" : "letter-" + i,
        body,
        opened: i === 2,
        hidden: false,
      })),
    },
  ]),
);

function phase(event: MessageDetails): Phase {
  if (Date.now() < Date.parse(event.start)) return "scheduled";
  return Date.now() >= Date.parse(event.end) ? "closed" : "open";
}

// In-memory responses for message events only. Reward codes stay on the existing API.
export function isMessageContent(code: string) {
  return boxes.has(code) || /^message-local-[a-f0-9-]{36}$/.test(code);
}
export function createMessageEvent(owner: string, event: MessageDetails) {
  const code = "message-local-" + crypto.randomUUID();
  boxes.set(code, {
    event,
    owner,
    canDelete: false,
    createdAt: new Date().toISOString(),
    invitations: Array.from(
      new Set([generateCode(), generateCode(), generateCode()]),
    ),
    letters: [],
    deleted: new Set(),
  });
  return code;
}
export function assignSampleEvents(owner: string) {
  if (!owner) return;
  for (const box of boxes.values()) if (box.owner === null) box.owner = owner;
}
function canManage(box: Mailbox, owner: string) {
  return Boolean(owner) && box.owner === owner;
}
export function listMessageEvents(owner: string): ManageContentResponse[] {
  return Array.from(boxes, ([code, box]) => ({ code, box }))
    .filter(({ box }) => canManage(box, owner))
    .map(({ code, box }) => ({
      code,
      type: "MESSAGEBOX",
      title: box.event.title,
      description: box.event.question,
      createdAt: box.createdAt,
      startAt: box.event.start,
      endAt: box.event.end,
    }));
}

export function getMessageEntry(code: string) {
  const box = boxes.get(code);
  if (!box) return null;
  return {
    event: box.event,
    phase: phase(box.event),
    sampleCode: code === sampleContentCode ? box.invitations[0] : null,
  };
}

export function verifyMessageInvitation(code: string, invitation: string) {
  if (invitation === "EXPIRED" && code === sampleContentCode) return "expired";
  return boxes.get(code)?.invitations.includes(invitation)
    ? "valid"
    : "invalid";
}

export function getOwnMessage(code: string, invitation: string) {
  const box = boxes.get(code)!;
  if (verifyMessageInvitation(code, invitation) !== "valid") return null;
  const letterCode = "own-" + box.invitations.indexOf(invitation);
  return {
    body: box.letters.find((l) => l.code === letterCode)?.body ?? null,
    deleted: box.deleted.has(letterCode),
  };
}
export function saveOwnMessage(code: string, invitation: string, body: string) {
  const box = boxes.get(code)!;
  const own = getOwnMessage(code, invitation);
  if (!own || own.deleted || !body.trim() || Array.from(body).length > 300)
    return false;
  const letterCode = "own-" + box.invitations.indexOf(invitation);
  const letter = box.letters.find((l) => l.code === letterCode);
  if (letter) letter.body = body;
  else {
    if (phase(box.event) !== "open") return false;
    box.letters.push({ code: letterCode, body, opened: false, hidden: false });
  }
  return true;
}
function remove(box: Mailbox, code: string) {
  box.letters = box.letters.filter((l) => l.code !== code);
  box.deleted.add(code);
}
export function deleteOwnMessage(code: string, invitation: string) {
  const box = boxes.get(code)!;
  if (getOwnMessage(code, invitation)?.body)
    remove(box, "own-" + box.invitations.indexOf(invitation));
}
export function getMessageManagement(code: string, owner: string) {
  const box = boxes.get(code);
  if (!box || !canManage(box, owner)) return null;
  return {
    event: box.event,
    phase: phase(box.event),
    invitations: box.invitations,
    canDelete: box.canDelete,
    received: box.letters.length,
    unread: box.letters.filter((l) => !l.opened).length,
    history: box.letters
      .filter((l) => l.opened)
      .map((l) => ({ code: l.code, body: l.hidden ? null : l.body })),
    openNext() {
      const next = box.letters.find((l) => !l.opened);
      if (!next || phase(box.event) === "scheduled") return;
      next.opened = true;
      box.letters = [next, ...box.letters.filter((l) => l !== next)];
      return next.code;
    },
    hide(letterCode: string) {
      const letter = box.letters.find((l) => l.opened && l.code === letterCode);
      if (letter) letter.hidden = true;
    },
    remove(letterCode: string) {
      if (
        box.canDelete &&
        box.letters.some((l) => l.opened && l.code === letterCode)
      )
        remove(box, letterCode);
    },
  };
}
