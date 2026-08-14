import { create } from "zustand";

type LayoutDensity = "comfortable" | "compact";

interface UiState {
  density: LayoutDensity;
  isSidebarOpen: boolean;
  closeSidebar: () => void;
  openSidebar: () => void;
  setDensity: (density: LayoutDensity) => void;
  toggleSidebar: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  density: "comfortable",
  isSidebarOpen: false,
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
  setDensity: (density) => set({ density }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
