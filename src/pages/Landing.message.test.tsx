import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { it, expect } from "vitest";
import Landing from "./Landing";
import Index from "./Index";

it("opens the seeded message event from home and submits through the normal draw route", async () => {
  render(<MemoryRouter><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/draw/:contentCode" element={<Index />} />
  </Routes></MemoryRouter>);
  const entry = screen.getByRole("link", { name: "메시지 뽑기 참여하기" });
  expect(entry.getAttribute("href")).toBe("/draw/message-letter");
  fireEvent.click(entry);
  fireEvent.change(await screen.findByPlaceholderText("참여 코드 입력"), { target: { value: "LETTER" } });
  fireEvent.click(screen.getByRole("button", { name: "코드 확인" }));
  fireEvent.change(await screen.findByLabelText("메시지 본문"), { target: { value: "고마워요!" } });
  fireEvent.click(screen.getByRole("button", { name: "메시지 미리보기" }));
  fireEvent.click(screen.getByRole("button", { name: "메시지 보내기" }));
  expect(await screen.findByRole("heading", { name: "메시지를 보냈어요" })).toBeTruthy();
});
