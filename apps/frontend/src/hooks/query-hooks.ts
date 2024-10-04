import type { Board, Column, Tab } from "@kanbased/shared/src/mutators";
import { create } from "zustand";
import type { StoreApi } from "zustand";

export type DataStore = {
  boards: Board[];
  tabs: Tab[];
  columns: Column[];
  updateBoards: (boards: Board[]) => void;
  updateColumns: (columns: Column[]) => void;
  updateTabs: (tabs: Tab[]) => void;
};

export const useDataStore = create<DataStore>((set) => ({
  boards: [],
  tabs: [],
  columns: [],
  updateBoards: (boards) => set(() => ({ boards })),
  updateColumns: (columns) => set(() => ({ columns })),
  updateTabs: (tabs) => set(() => ({ tabs })),
}));
