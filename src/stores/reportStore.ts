import { create } from 'zustand'
import type { Report, ReportTemplate, ReportStatus, ReportVersion, ReportVersionAction } from '@/types'
import { templates } from '@/mock'

interface ReportStatePerStudy {
  currentReport: Report | null
  findings: string
  impression: string
  activeTemplateId: string | null
}

interface ReportState {
  reportByStudy: Record<string, ReportStatePerStudy>
  versionsByStudy: Record<string, ReportVersion[]>
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
  getVersionsForStudy: (studyId: string) => ReportVersion[]
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

export const useReportStore = create<ReportState>((set, get) => {
  const _pushVersion = (studyId: string, payload: {
    action: ReportVersionAction,
    actionLabel: string,
    operatorId: string,
    operatorName: string,
    findingsSnapshot: string,
    impressionSnapshot: string,
    statusAfter: ReportStatus,
    comment?: string,
  }) => {
    const { versionsByStudy } = get()
    const list = versionsByStudy[studyId] || []
    const next: ReportVersion = {
      id: `ver_${Date.now()}_${Math.floor(Math.random()*10000)}`,
      studyId,
      version: list.length + 1,
      action: payload.action,
      actionLabel: payload.actionLabel,
      operatorId: payload.operatorId,
      operatorName: payload.operatorName,
      createdAt: new Date().toISOString(),
      findingsSnapshot: payload.findingsSnapshot,
      impressionSnapshot: payload.impressionSnapshot,
      statusAfter: payload.statusAfter,
      comment: payload.comment,
    }
    set({
      versionsByStudy: {
        ...versionsByStudy,
        [studyId]: [...list, next],
      },
    })
  }

  return {
    reportByStudy: {},
    versionsByStudy: {},
    activeStudyId: null,
    templates,
    setActiveStudy: (studyId: string) => {
      const { reportByStudy, versionsByStudy } = get()
      const newReportByStudy = { ...reportByStudy }
      const newVersionsByStudy = { ...versionsByStudy }
      if (!newReportByStudy[studyId]) {
        newReportByStudy[studyId] = createEmptyStudyState()
      }
      if (!newVersionsByStudy[studyId]) {
        newVersionsByStudy[studyId] = []
      }
      set({
        reportByStudy: newReportByStudy,
        versionsByStudy: newVersionsByStudy,
        activeStudyId: studyId,
      })
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
      _pushVersion(activeStudyId, {
        action: 'save_draft',
        actionLabel: '保存草稿',
        operatorId: createdBy,
        operatorName: createdBy,
        findingsSnapshot: findings,
        impressionSnapshot: impression,
        statusAfter: 'draft',
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
      _pushVersion(activeStudyId, {
        action: 'submit',
        actionLabel: '提交审核',
        operatorId: createdBy,
        operatorName: createdBy,
        findingsSnapshot: findings,
        impressionSnapshot: impression,
        statusAfter: 'submitted',
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

      if (!currentReport) {
        report = {
          id: `report-${Date.now()}`,
          studyId: activeStudyId,
          findings,
          impression,
          status: 'draft',
          createdBy: reviewerId,
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
        _pushVersion(activeStudyId, {
          action: 'create_draft',
          actionLabel: '创建报告',
          operatorId: reviewerId,
          operatorName: reviewerId,
          findingsSnapshot: findings,
          impressionSnapshot: impression,
          statusAfter: 'draft',
        })
      }

      const finalReport: Report = {
        ...(currentReport || report),
        status,
        reviewerId,
        reviewedAt: now,
        auditComment: comment,
        updatedAt: now,
      }
      set({
        reportByStudy: {
          ...get().reportByStudy,
          [activeStudyId]: {
            ...get().reportByStudy[activeStudyId],
            currentReport: finalReport,
          },
        },
      })

      if (status === 'approved') {
        _pushVersion(activeStudyId, {
          action: 'audit_approve',
          actionLabel: '审核通过',
          operatorId: reviewerId,
          operatorName: reviewerId,
          findingsSnapshot: findings,
          impressionSnapshot: impression,
          statusAfter: 'approved',
        })
      } else if (status === 'rejected') {
        _pushVersion(activeStudyId, {
          action: 'audit_reject',
          actionLabel: '审核退回',
          operatorId: reviewerId,
          operatorName: reviewerId,
          findingsSnapshot: findings,
          impressionSnapshot: impression,
          statusAfter: 'rejected',
          comment: comment,
        })
      }
    },
    getVersionsForStudy: (studyId: string) => {
      const { versionsByStudy } = get()
      return versionsByStudy[studyId] || []
    },
  }
})
