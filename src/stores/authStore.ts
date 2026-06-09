import { create } from 'zustand'
import type { User, UserRole } from '@/types'
import { mockUsers } from '@/mock'

interface AuthState {
  currentUser: User | null
  login: (userId: string) => void
  logout: () => void
  switchRole: (role: UserRole) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: mockUsers[0],
  login: (userId: string) => {
    const user = mockUsers.find((u) => u.id === userId) || null
    set({ currentUser: user })
  },
  logout: () => {
    set({ currentUser: null })
  },
  switchRole: (role: UserRole) => {
    set((state) => {
      if (!state.currentUser) return state
      return {
        currentUser: {
          ...state.currentUser,
          role,
        },
      }
    })
  },
}))
