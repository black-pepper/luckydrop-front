import { describe, expect, it } from "vitest";
import { ApiError, isRateLimitError, RATE_LIMIT_MESSAGE, RATE_LIMIT_STATUS } from "./client";

describe("rate limit helpers", () => {
  it("detects 429 ApiError as rate limited", () => {
    expect(isRateLimitError(new ApiError(RATE_LIMIT_STATUS, RATE_LIMIT_MESSAGE))).toBe(true);
  });

  it("does not treat non-429 errors as rate limited", () => {
    expect(isRateLimitError(new ApiError(400, "bad request"))).toBe(false);
    expect(isRateLimitError(new Error("network"))).toBe(false);
  });
});
