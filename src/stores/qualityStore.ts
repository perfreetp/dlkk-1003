import { create } from 'zustand'
import type { Modality, QCRecord, MissingCase, TimelinessStats, QCSeverity, MissingDetectionRecord, QualityRecord, TimelinessStat } from '@/types'
import { missingDetections, qualityRecords, timelinessStats } from '@/mock'

interface QualityState {
  qcRecords: QCRecord[]
  missingCases: MissingCase[]
  timelinessStats: TimelinessStats
  qualityRecordsList: QualityRecord[]
  missingDetectionList: MissingDetectionRecord[]
  timelinessStatList: TimelinessStat[]
  reviewMissingCase: (id: string, reviewedBy: string, reviewComment: string) => void
  addQCRecord: (studyId: string, reporterId: string, reporterName: string, issueType: string, description: string, severity: QCSeverity) => void
}

const rawTimeliness = timelinessStats as unknown as TimelinessStat[]

const computedTimelinessStats: TimelinessStats = {
  totalStudies: rawTimeliness.reduce((s, t) => s + t.totalStudies, 0),
  onTimeCount: rawTimeliness.reduce((s, t) => s + (t.totalStudies - t.overdueCount), 0),
  delayedCount: rawTimeliness.reduce((s, t) => s + t.overdueCount, 0),
  averageTime: Math.round(rawTimeliness.reduce((s, t) => s + t.avgTotalTime, 0) / rawTimeliness.length),
  byModality: {},
  dailyStats: rawTimeliness.slice(0, 7).map((t) => ({
    date: t.date,
    total: t.totalStudies,
    onTime: t.totalStudies - t.overdueCount,
    delayed: t.overdueCount,
  })),
}

const qcRecordsMapped: QCRecord[] = qualityRecords.map((qr) => ({
  id: qr.id,
  studyId: qr.studyId,
  reporterId: qr.reporterId,
  reporterName: qr.reporterName,
  issueType: qr.type || '',
  description: qr.issueDescription || '',
  severity: (qr.score && qr.score >= 90 ? 'low' : qr.score && qr.score >= 75 ? 'medium' : qr.score && qr.score >= 60 ? 'high' : 'critical') as QCSeverity,
  status: qr.isResolved ? 'resolved' : 'open',
  createdAt: qr.createdAt,
  resolvedAt: qr.resolvedAt,
  resolution: qr.resolveComment,
  reportId: qr.reportId,
}))

const missingCasesMapped: MissingCase[] = missingDetections.map((md) => ({
  id: md.id,
  studyId: md.studyId,
  patientName: md.patientName,
  modality: md.modality as Modality,
  studyDate: md.detectedAt.split('T')[0],
  missedDiagnosis: md.detectedIssue,
  reportedBy: md.reviewerName || '',
  reportedAt: md.detectedAt,
  reviewed: md.reviewStatus !== 'pending',
  reviewedBy: md.reviewerId,
  reviewedAt: md.reviewedAt,
  reviewComment: md.reviewComment,
}))

export const useQualityStore = create<QualityState>((set) => ({
  qcRecords: qcRecordsMapped,
  missingCases: missingCasesMapped,
  timelinessStats: computedTimelinessStats,
  qualityRecordsList: qualityRecords,
  missingDetectionList: missingDetections,
  timelinessStatList: rawTimeliness,
  reviewMissingCase: (id: string, reviewedBy: string, reviewComment: string) => {
    set((state) => ({
      missingCases: state.missingCases.map((mc) =>
        mc.id === id
          ? {
              ...mc,
              reviewed: true,
              reviewedBy,
              reviewedAt: new Date().toISOString(),
              reviewComment,
            }
          : mc
      ),
      missingDetectionList: state.missingDetectionList.map((md) =>
        md.id === id
          ? {
              ...md,
              reviewStatus: 'confirmed',
              reviewerId: reviewedBy,
              reviewedAt: new Date().toISOString(),
              reviewComment,
            }
          : md
      ),
    }))
  },
  addQCRecord: (studyId: string, reporterId: string, reporterName: string, issueType: string, description: string, severity: QCSeverity) => {
    const qcRecord: QCRecord = {
      id: `qc-${Date.now()}`,
      studyId,
      reporterId,
      reporterName,
      issueType,
      description,
      severity,
      status: 'open',
      createdAt: new Date().toISOString(),
    }
    set((state) => ({
      qcRecords: [...state.qcRecords, qcRecord],
    }))
  },
}))
