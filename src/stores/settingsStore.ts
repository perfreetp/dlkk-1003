import { create } from 'zustand'
import type { ThemeType, ViewerPreferences, NotificationSettings, ReportTemplate } from '@/types'
import { templates } from '@/mock'

interface SettingsState {
  theme: ThemeType
  viewerPreferences: ViewerPreferences
  notificationSettings: NotificationSettings
  savedTemplates: ReportTemplate[]
  updatePreference: <K extends keyof ViewerPreferences>(key: K, value: ViewerPreferences[K]) => void
  setTheme: (theme: ThemeType) => void
  updateNotification: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => void
  saveTemplate: (template: ReportTemplate) => void
  deleteTemplate: (templateId: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: 'light',
  viewerPreferences: {
    defaultLayout: '2x2',
    defaultWindowPreset: 'mediastinum',
  },
  notificationSettings: {
    email: true,
    push: true,
    studyAssigned: true,
    reportReviewed: true,
    consultationRequest: true,
    qcAlert: true,
  },
  savedTemplates: templates,
  updatePreference: <K extends keyof ViewerPreferences>(key: K, value: ViewerPreferences[K]) => {
    set((state) => ({
      viewerPreferences: {
        ...state.viewerPreferences,
        [key]: value,
      },
    }))
  },
  setTheme: (theme: ThemeType) => {
    set({ theme })
  },
  updateNotification: <K extends keyof NotificationSettings>(key: K, value: NotificationSettings[K]) => {
    set((state) => ({
      notificationSettings: {
        ...state.notificationSettings,
        [key]: value,
      },
    }))
  },
  saveTemplate: (template: ReportTemplate) => {
    set((state) => {
      const exists = state.savedTemplates.find((t) => t.id === template.id)
      if (exists) {
        return {
          savedTemplates: state.savedTemplates.map((t) =>
            t.id === template.id ? template : t
          ),
        }
      }
      return {
        savedTemplates: [...state.savedTemplates, template],
      }
    })
  },
  deleteTemplate: (templateId: string) => {
    set((state) => ({
      savedTemplates: state.savedTemplates.filter((t) => t.id !== templateId),
    }))
  },
}))
