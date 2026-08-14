import { describe, expect, it, vi } from "vitest";

import PostLoginPage from "./page";

const { redirect } = vi.hoisted(() => ({ redirect: vi.fn() }));

vi.mock("next/navigation", () => ({ redirect }));

describe("post-login landing page", () => {
  it("maps the backend /home redirect to the frontend dashboard", () => {
    PostLoginPage();

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
