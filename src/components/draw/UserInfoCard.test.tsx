import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import UserInfoCard from "./UserInfoCard";

const defaultProps = {
  contentCode: "content-1",
  invitationCode: "invite-1",
  userName: "홍길동",
  remainingDraws: 1,
  hasHistory: false,
  drawStatus: null,
  onRateLimit: vi.fn(),
  onDraw: vi.fn(),
  onBack: vi.fn(),
  onViewHistory: vi.fn(),
};

describe("UserInfoCard", () => {
  it("shows not-started copy before expired copy when draw status is not started", () => {
    render(
      <UserInfoCard
        {...defaultProps}
        isExpired
        drawStatus="CONTENT_NOT_STARTED"
      />,
    );

    expect(screen.getByRole("button", { name: "아직 시작되지 않았습니다" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "종료되었습니다." })).not.toBeInTheDocument();
  });
});
