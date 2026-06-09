import { create } from 'zustand'
import type { Report, ReportTemplate, ReportStatus } from '@/types'
import { templates } from '@/mock'

interface ReportStatePerStudy {
  currentReport: Report | null
  findings: string
  impression: string
  activeTemplateId: string | null
}

interface ReportState {
  reportByStudy: Record<string, ReportStatePerStudy>
  activeStudyId: string | null
  templates: ReportTemplate[]
  setActiveStudy: (studyId: string) => void
  getActive: () => ReportStatePerStudy
  setFindings: (val: string) => void
  setImpression: (val: string) => void
  applyTemplate: (templateId: string) => void
  saveDraft: (createdBy: string) => void
  submitReport: (createdBy: string) => void
  auditReport: (status: ReportStatus, reviewerId: string, comment?: string) => void
}

const firstTemplate = templates[0]

const createEmptyStudyState = (): ReportStatePerStudy => {
  const tpl = firstTemplate
  return {
    currentReport: null,
    findings: tpl?.findingsTemplate || tpl?.findings || '',
    impression: tpl?.impressionTemplate || tpl?.impression || '',
    activeTemplateId: tpl?.id || null,
  }
}

export const useReportStore = create<ReportState>((set, get) => ({
  reportByStudy: {},
  activeStudyId: null,
  templates,
  setActiveStudy: (studyId: string) => {
    const { reportByStudy } = get()
    if (!reportByStudy[studyId]) {
      set({
        reportByStudy: {
          ...reportByStudy,
          [studyId]: createEmptyStudyState(),
        },
        activeStudyId: studyId,
      })
    } else {
      set({ activeStudyId: studyId })
    }
  },
  getActive: () => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) {
      return createEmptyStudyState()
    }
    return reportByStudy[activeStudyId] || createEmptyStudyState()
  },
  setFindings: (val: string) => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) return
    if (!reportByStudy[activeStudyId]) return
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...reportByStudy[activeStudyId],
          findings: val,
        },
      },
    })
  },
  setImpression: (val: string) => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) return
    if (!reportByStudy[activeStudyId]) return
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...reportByStudy[activeStudyId],
          impression: val,
        },
      },
    })
  },
  applyTemplate: (templateId: string) => {
    const { reportByStudy, activeStudyId, templates: tpls } = get()
    if (!activeStudyId) return
    if (!reportByStudy[activeStudyId]) return
    const template = tpls.find((t) => t.id === templateId)
    if (!template) return
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...reportByStudy[activeStudyId],
          activeTemplateId: templateId,
          findings: template.findingsTemplate || template.findings,
          impression: template.impressionTemplate || template.impression,
        },
      },
    })
  },
  saveDraft: (createdBy: string) => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) return
    const studyState = reportByStudy[activeStudyId]
    if (!studyState) return
    const { findings, impression, currentReport } = studyState
    const now = new Date().toISOString()
    const report: Report = currentReport
      ? {
          ...currentReport,
          findings,
          impression,
          status: 'draft',
          updatedAt: now,
        }
      : {
          id: `report-${Date.now()}`,
          studyId: activeStudyId,
          findings,
          impression,
          status: 'draft',
          createdBy,
          createdAt: now,
          updatedAt: now,
        }
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...studyState,
          currentReport: report,
        },
      },
    })
  },
  submitReport: (createdBy: string) => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) return
    const studyState = reportByStudy[activeStudyId]
    if (!studyState) return
    const { findings, impression, currentReport } = studyState
    const now = new Date().toISOString()
    const report: Report = currentReport
      ? {
          ...currentReport,
          findings,
          impression,
          status: 'submitted',
          updatedAt: now,
        }
      : {
          id: `report-${Date.now()}`,
          studyId: activeStudyId,
          findings,
          impression,
          status: 'submitted',
          createdBy,
          createdAt: now,
          updatedAt: now,
        }
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...studyState,
          currentReport: report,
        },
      },
    })
  },
  auditReport: (status: ReportStatus, reviewerId: string, comment?: string) => {
    const { reportByStudy, activeStudyId } = get()
    if (!activeStudyId) return
    const studyState = reportByStudy[activeStudyId]
    if (!studyState) return
    const { findings, impression, currentReport } = studyState
    const now = new Date().toISOString()
    let report: Report
    if (currentReport) {
      report = {
        ...currentReport,
        status,
        reviewerId,
        reviewedAt: now,
        auditComment: comment,
        updatedAt: now,
      }
    } else {
      report = {
        id: `report-${Date.now()}`,
        studyId: activeStudyId,
        findings,
        impression,
        status,
        createdBy: reviewerId,
        createdAt: now,
        updatedAt: now,
        reviewerId,
        reviewedAt: now,
        auditComment: comment,
      }
    }
    set({
      reportByStudy: {
        ...reportByStudy,
        [activeStudyId]: {
          ...studyState,
          currentReport: report,
        },
      },
    })
  },
}))
