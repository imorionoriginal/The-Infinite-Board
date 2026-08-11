import { create } from 'zustand';
import { useShallow } from 'zustand/shallow';
import type { CanvasElement } from '../types/schema';

interface AppState {
  elements: CanvasElement[];
  activeElementId: string | null;
  isModalOpen: boolean;
  modalElement: CanvasElement | null;
  maxZIndex: number;
  isLoading: boolean;
  isDarkMode: boolean;

  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  trashElement: (id: string) => void;
  bringToFront: (id: string) => void;
  setActiveElementId: (id: string | null) => void;
  openModal: (element: CanvasElement) => void;
  closeModal: () => void;
  toggleDarkMode: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()((set, get) => ({
  elements: [],
  activeElementId: null,
  isModalOpen: false,
  modalElement: null,
  maxZIndex: 0,
  isLoading: true,
  isDarkMode: true,

  setElements: (elements) => {
    const maxZ = elements.reduce((max, el) => Math.max(max, el.z_index), 0);
    set({ elements, maxZIndex: maxZ });
  },

  addElement: (element) => {
    set((state) => ({
      elements: [...state.elements, element],
      maxZIndex: Math.max(state.maxZIndex, element.z_index),
    }));
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates, updated_at: new Date().toISOString() } : el
      ),
      modalElement:
        state.modalElement?.id === id
          ? { ...state.modalElement, ...updates, updated_at: new Date().toISOString() }
          : state.modalElement,
    }));
  },

  removeElement: (id) => {
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      activeElementId: state.activeElementId === id ? null : state.activeElementId,
      modalElement: state.modalElement?.id === id ? null : state.modalElement,
      isModalOpen: state.modalElement?.id === id ? false : state.isModalOpen,
    }));
  },

  trashElement: (id) => {
    const now = new Date().toISOString();
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, is_trashed: true, trashed_at: now, updated_at: now }
          : el
      ),
      activeElementId: state.activeElementId === id ? null : state.activeElementId,
      modalElement: state.modalElement?.id === id ? null : state.modalElement,
      isModalOpen: state.modalElement?.id === id ? false : state.isModalOpen,
    }));
    set((state) => ({
      elements: state.elements.filter((el) => !el.is_trashed),
    }));
  },

  bringToFront: (id) => {
    const newMaxZ = get().maxZIndex + 1;
    set((state) => ({
      maxZIndex: newMaxZ,
      elements: state.elements.map((el) =>
        el.id === id
          ? { ...el, z_index: newMaxZ, updated_at: new Date().toISOString() }
          : el
      ),
    }));
  },

  setActiveElementId: (id) => {
    set({ activeElementId: id });
  },

  openModal: (element) => {
    set({
      isModalOpen: true,
      modalElement: element,
      activeElementId: element.id,
    });
  },

  closeModal: () => {
    set({
      isModalOpen: false,
      modalElement: null,
    });
  },

  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },
}));

export function useShallowAppStore<T>(selector: (state: AppState) => T): T {
  return useAppStore(useShallow(selector));
}
