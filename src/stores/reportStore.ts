import { create } from 'zustand'
import type { Report, ReportTemplate, ReportStatus } from '@/types'
import { templates } from '@/mock'

interface ReportState {
  currentReport: Report | null
  templates: ReportTemplate[]
  activeTemplateId: string | null
  findings: string
  impression: string
  setFindings: (findings: string) => void
  setImpression: (impression: string) => void
  applyTemplate: (templateId: string) => void
  saveDraft: (studyId: string, createdBy: string) => void
  submitReport: (studyId: string, createdBy: string) => void
  auditReport: (reportId: string, status: ReportStatus, reviewerId: string, comment?: string) => void
}

const firstTemplate = templates[0]

export const useReportStore = create<ReportState>((set, get) => ({
  currentReport: null,
  templates,
  activeTemplateId: null,
  findings: firstTemplate?.findingsTemplate || firstTemplate?.findings || '',
  impression: firstTemplate?.impressionTemplate || firstTemplate?.impression || '',
  setFindings: (findings: string) => {
    set({ findings })
  },
  setImpression: (impression: string) => {
    set({ impression })
  },
  applyTemplate: (templateId: string) => {
    const template = get().templates.find((t) => t.id === templateId)
    if (template) {
      set({
        activeTemplateId: templateId,
        findings: template.findingsTemplate || template.findings,
        impression: template.impressionTemplate || template.impression,
      })
    }
  },
  saveDraft: (studyId: string, createdBy: string) => {
    const { findings, impression } = get()
    const existing = get().currentReport
    const now = new Date().toISOString()
    const report: Report = existing
      ? {
          ...existing,
          findings,
          impression,
          status: 'draft',
          updatedAt: now,
        }
      : {
          id: `report-${Date.now()}`,
          studyId,
          findings,
          impression,
          status: 'draft',
          createdBy,
          createdAt: now,
          updatedAt: now,
        }
    set({ currentReport: report })
  },
  submitReport: (studyId: string, createdBy: string) => {
    const { findings, impression } = get()
    const existing = get().currentReport
    const now = new Date().toISOString()
    const report: Report = existing
      ? {
          ...existing,
          findings,
          impression,
          status: 'submitted',
          updatedAt: now,
        }
      : {
          id: `report-${Date.now()}`,
          studyId,
          findings,
          impression,
          status: 'submitted',
          createdBy,
          createdAt: now,
          updatedAt: now,
        }
    set({ currentReport: report })
  },
  auditReport: (reportId: string, status: ReportStatus, reviewerId: string, comment?: string) => {
    const { currentReport } = get()
    if (currentReport && currentReport.id === reportId) {
      set({
        currentReport: {
          ...currentReport,
          status,
          reviewerId,
          reviewedAt: new Date().toISOString(),
          auditComment: comment,
          updatedAt: new Date().toISOString(),
        },
      })
    }
  },
}))
