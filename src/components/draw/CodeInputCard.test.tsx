import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CodeInputCard from "./CodeInputCard";

describe("CodeInputCard", () => {
  it("disables submit and shows countdown while cooling down", () => {
    const onSubmit = vi.fn();

    render(
      <CodeInputCard
        onSubmit={onSubmit}
        error={null}
        loading={false}
        initialValue="ABC123"
        cooldownRemainingSeconds={30}
      />,
    );

    const button = screen.getByRole("button", { name: "30초 후 다시 시도" });
    expect(button).toBeDisabled();

    fireEvent.submit(button.closest("form")!);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps normal error copy for non-rate-limit errors", () => {
    render(
      <CodeInputCard
        onSubmit={vi.fn()}
        error="사용할 수 없는 코드예요."
        loading={false}
      />,
    );

    expect(screen.getByText("사용할 수 없는 코드예요.")).toBeInTheDocument();
    expect(screen.getByText("코드를 다시 확인한 후 입력해 주세요")).toBeInTheDocument();
  });
});
