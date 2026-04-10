import { create } from "zustand";
import { persist } from "zustand/middleware";

interface BookStore {
  activeBookId: string | null;
  setActiveBookId: (id: string) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set) => ({
      activeBookId: null,
      setActiveBookId: (id) => set({ activeBookId: id }),
    }),
    {
      name: "money-track-book",
    }
  )
);
