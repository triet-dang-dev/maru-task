import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("merges conditional classes and resolves Tailwind conflicts", () => {
    const className = cn("px-2 text-sm", false && "hidden", ["px-4", "font-medium"]);

    expect(className).toContain("px-4");
    expect(className).toContain("text-sm");
    expect(className).toContain("font-medium");
    expect(className).not.toContain("px-2");
    expect(className).not.toContain("hidden");
  });
});
