import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiError, RATE_LIMIT_MESSAGE } from "@/api/client";
import RewardListCard from "./RewardListCard";

const { getRewardsMock } = vi.hoisted(() => ({
  getRewardsMock: vi.fn(),
}));

vi.mock("@/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/api/client")>();
  return {
    ...actual,
    getRewards: getRewardsMock,
  };
});

describe("RewardListCard", () => {
  it("shows a retry hint instead of an empty state when rewards are rate limited", async () => {
    const error = new ApiError(429, RATE_LIMIT_MESSAGE);
    const onRateLimit = vi.fn(() => true);
    getRewardsMock.mockRejectedValueOnce(error);

    render(
      <RewardListCard
        contentCode="content-1"
        invitationCode="invite-1"
        onRateLimit={onRateLimit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /보상 목록 보기/ }));

    await waitFor(() => {
      expect(onRateLimit).toHaveBeenCalledWith(error);
    });

    expect(screen.getByText("잠시 후 다시 시도해주세요")).toBeInTheDocument();
    expect(screen.queryByText("보상 정보가 없습니다")).not.toBeInTheDocument();
  });

  it("disables the rewards button while cooling down", () => {
    render(
      <RewardListCard
        contentCode="content-1"
        invitationCode="invite-1"
        cooldownRemainingSeconds={12}
        onRateLimit={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /12초 후 다시 시도/ })).toBeDisabled();
  });
});
