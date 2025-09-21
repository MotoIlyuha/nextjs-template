import { create } from 'zustand';

interface UIState {
  isStudentFormOpen: boolean;
  isArchiveDrawerOpen: boolean;
  activeTab: 'students' | 'schedule' | 'assignments' | 'files' | 'finance';
  teacherId: string | null;
  openStudentForm: () => void;
  closeStudentForm: () => void;
  openArchiveDrawer: () => void;
  closeArchiveDrawer: () => void;
  setActiveTab: (
    tab: 'students' | 'schedule' | 'assignments' | 'files' | 'finance',
  ) => void;
  setTeacherId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStudentFormOpen: false,
  isArchiveDrawerOpen: false,
  activeTab: 'students',
  teacherId: null,
  openStudentForm: () => set({ isStudentFormOpen: true }),
  closeStudentForm: () => set({ isStudentFormOpen: false }),
  openArchiveDrawer: () => set({ isArchiveDrawerOpen: true }),
  closeArchiveDrawer: () => set({ isArchiveDrawerOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTeacherId: (id) => set({ teacherId: id }),
}));


