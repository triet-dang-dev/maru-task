import { describe, expect, it, vi } from "vitest";

import PostLoginPage from "./page";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

describe("post-login landing page", () => {
  it("renders Home without redirecting to My page", () => {
    const page = PostLoginPage();

    expect(page).toBeDefined();
    expect(redirect).not.toHaveBeenCalled();
  });
});
