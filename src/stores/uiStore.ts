import { create } from 'zustand';

interface UIState {
  isStudentFormOpen: boolean;
  activeTab: 'students' | 'schedule' | 'assignments' | 'files' | 'finance';
  teacherId: string | null;
  openStudentForm: () => void;
  closeStudentForm: () => void;
  setActiveTab: (
    tab: 'students' | 'schedule' | 'assignments' | 'files' | 'finance',
  ) => void;
  setTeacherId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isStudentFormOpen: false,
  activeTab: 'students',
  teacherId: null,
  openStudentForm: () => set({ isStudentFormOpen: true }),
  closeStudentForm: () => set({ isStudentFormOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTeacherId: (id) => set({ teacherId: id }),
}));


