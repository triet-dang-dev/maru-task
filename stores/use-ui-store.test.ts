import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useUiStore } from "./use-ui-store";

describe("useUiStore", () => {
  afterEach(() => {
    useUiStore.setState({ density: "comfortable", isSidebarOpen: false });
  });

  it("manages sidebar state without server data", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.openSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(true);

    act(() => {
      result.current.toggleSidebar();
    });
    expect(result.current.isSidebarOpen).toBe(false);

    expect(result.current.isSidebarCollapsed).toBe(false);
    act(() => {
      result.current.toggleSidebarCollapsed();
    });
    expect(result.current.isSidebarCollapsed).toBe(true);
  });

  it("stores a typed layout density preference", () => {
    const { result } = renderHook(() => useUiStore());

    act(() => {
      result.current.setDensity("compact");
    });

    expect(result.current.density).toBe("compact");
  });
});
