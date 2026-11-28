import { useState } from "react";
import {
  demoEvent,
  invitation,
  letters,
  type EventDetails,
  type Phase,
  type Scenario,
} from "./fixtures";

interface Letter {
  code: string;
  body: string;
  opened: boolean;
  hidden: boolean;
}
interface OpenedLetter {
  code: string;
  body: string | null;
}
interface EventView {
  event: EventDetails;
  phase: Phase;
}
export interface HostMailbox extends EventView {
  received: number;
  unread: number;
  history: OpenedLetter[];
  openNext: () => string | undefined;
  hide: (code: string) => void;
  remove: (code: string) => void;
}
export interface ParticipantMailbox extends EventView {
  verify: (code: string) => "valid" | "expired" | "invalid";
  own: string | null;
  ownDeleted: boolean;
  save: (body: string) => void;
  removeOwn: () => void;
}

// Deterministic fixture responses. Only opened messages enter the host view model.
export function usePreviewMailbox(
  scene: Scenario,
  custom?: EventDetails,
): { host: HostMailbox; participant: ParticipantMailbox } {
  const [phase] = useState<Phase>(() =>
    custom
      ? Date.now() < Date.parse(custom.start)
        ? "scheduled"
        : Date.now() >= Date.parse(custom.end)
          ? "closed"
          : "open"
      : scene === "closed" || scene === "scheduled"
        ? scene
        : "open",
  );
  const [items, setItems] = useState<Letter[]>(() => {
    if (custom || scene === "empty" || phase === "scheduled") return [];
    return letters.map((body, index) => ({
      code: scene === "submitted" && index === 0 ? "own" : "letter-" + index,
      body,
      opened: scene === "all-read" || index === 2,
      hidden: false,
    }));
  });
  const [ownDeleted, setOwnDeleted] = useState(false);
  function remove(code: string) {
    setItems((current) => current.filter((item) => item.code !== code));
    if (code === "own") setOwnDeleted(true);
  }
  const event = custom ?? {
    ...demoEvent,
    ...(scene === "scheduled"
      ? { start: "2026-12-01T09:00", end: "2026-12-07T18:00" }
      : {}),
    ...(scene === "closed" ? { end: "2026-11-27T18:00" } : {}),
  };
  return {
    host: {
      event,
      phase,
      received: items.length,
      unread: items.filter((item) => !item.opened).length,
      history: items
        .filter((item) => item.opened)
        .map((item) => ({
          code: item.code,
          body: item.hidden ? null : item.body,
        })),
      openNext() {
        const next = items.find((item) => !item.opened);
        if (phase === "scheduled" || !next) return;
        setItems((current) => [
          { ...next, opened: true },
          ...current.filter((item) => item.code !== next.code),
        ]);
        return next.code;
      },
      hide(code) {
        setItems((current) =>
          current.map((item) =>
            item.code === code ? { ...item, hidden: true } : item,
          ),
        );
      },
      remove,
    },
    participant: {
      event,
      phase,
      ownDeleted,
      verify(raw) {
        const code = raw.trim().toUpperCase();
        if (code === invitation) return "valid";
        return code === "EXPIRED" ? "expired" : "invalid";
      },
      own: items.find((item) => item.code === "own")?.body ?? null,
      save(body) {
        setItems((current) =>
          current.some((item) => item.code === "own")
            ? current.map((item) =>
                item.code === "own" ? { ...item, body } : item,
              )
            : [...current, { code: "own", body, opened: false, hidden: false }],
        );
      },
      removeOwn() {
        remove("own");
      },
    },
  };
}
