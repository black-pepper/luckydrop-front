import { describe, expect, it } from "vitest";
import { ApiError, isRateLimitError, parseRetryAfterSeconds, RATE_LIMIT_MESSAGE, RATE_LIMIT_STATUS } from "./client";

describe("rate limit helpers", () => {
  it("detects 429 ApiError as rate limited", () => {
    expect(isRateLimitError(new ApiError(RATE_LIMIT_STATUS, RATE_LIMIT_MESSAGE))).toBe(true);
  });

  it("does not treat non-429 errors as rate limited", () => {
    expect(isRateLimitError(new ApiError(400, "bad request"))).toBe(false);
    expect(isRateLimitError(new Error("network"))).toBe(false);
  });

  it("keeps retry-after seconds on ApiError", () => {
    const error = new ApiError(RATE_LIMIT_STATUS, RATE_LIMIT_MESSAGE, 37);

    expect(error.retryAfterSeconds).toBe(37);
  });

  it("parses valid retry-after seconds", () => {
    expect(parseRetryAfterSeconds("37")).toBe(37);
  });

  it("ignores missing or invalid retry-after values", () => {
    expect(parseRetryAfterSeconds(null)).toBeUndefined();
    expect(parseRetryAfterSeconds("0")).toBeUndefined();
    expect(parseRetryAfterSeconds("-1")).toBeUndefined();
    expect(parseRetryAfterSeconds("1.5")).toBeUndefined();
    expect(parseRetryAfterSeconds("soon")).toBeUndefined();
  });
});
