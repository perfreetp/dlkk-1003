import { create } from 'zustand'
import type { Study, StudyFilters, StudyStatus } from '@/types'
import { studies } from '@/mock'

interface StudyState {
  studies: Study[]
  filters: StudyFilters
  loading: boolean
  setFilters: (filters: Partial<StudyFilters>) => void
  getStudyById: (id: string) => Study | undefined
  updateStudyStatus: (id: string, status: StudyStatus) => void
}

export const useStudyStore = create<StudyState>((set, get) => ({
  studies,
  filters: {},
  loading: false,
  setFilters: (filters: Partial<StudyFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }))
  },
  getStudyById: (id: string) => {
    return get().studies.find((s) => s.id === id)
  },
  updateStudyStatus: (id: string, status: StudyStatus) => {
    set((state) => ({
      studies: state.studies.map((s) =>
        s.id === id
          ? { ...s, status, updatedAt: new Date().toISOString() }
          : s
      ),
    }))
  },
}))
