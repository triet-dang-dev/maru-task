import { create } from "zustand";

type LayoutDensity = "comfortable" | "compact";

interface UiState {
  density: LayoutDensity;
  isSidebarCollapsed: boolean;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  openSidebar: () => void;
  setDensity: (density: LayoutDensity) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapsed: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  density: "comfortable",
  isSidebarCollapsed: false,
  isSidebarOpen: false,
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  setDensity: (density) => set({ density }),
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSidebarCollapsed: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));

