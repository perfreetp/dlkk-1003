import type { Modality } from './study';

export type QCSeverity = 'low' | 'medium' | 'high' | 'critical';

export type QCType = 'missing' | 'timeliness' | 'quality';

export interface QCRecord {
  id: string;
  studyId: string;
  reporterId: string;
  reporterName: string;
  issueType: string;
  description: string;
  severity: QCSeverity;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  reportId?: string;
  type?: QCType;
  score?: number;
  issueDescription?: string;
  reviewerId?: string;
  isResolved?: boolean;
  completenessScore?: number;
  accuracyScore?: number;
  timelinessScore?: number;
  auditorName?: string;
  auditorId?: string;
  reviewerName?: string;
  resolveComment?: string;
  auditDate?: string;
  patientName?: string;
}

export interface MissingCase {
  id: string;
  studyId: string;
  patientName: string;
  modality: Modality;
  studyDate: string;
  missedDiagnosis: string;
  reportedBy: string;
  reportedAt: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewComment?: string;
  patientId?: string;
  accessionNumber?: string;
  bodyPart?: string;
  suspectedIssue?: string;
  confidence?: number;
  isReviewed?: boolean;
  reviewResult?: string;
  reportId?: string;
  detectedIssue?: string;
  detectedAt?: string;
  aiSuggestion?: string;
  reviewerName?: string;
  reviewStatus?: string;
}

export interface TimelinessStats {
  totalStudies: number;
  onTimeCount: number;
  delayedCount: number;
  averageTime: number;
  byModality: Record<string, { total: number; onTime: number; average: number }>;
  dailyStats?: Array<{
    date: string;
    total: number;
    onTime: number;
    delayed: number;
  }>;
  pendingCount?: number;
  reportingCount?: number;
  reportedCount?: number;
  auditedCount?: number;
  avgReceiveTime?: number;
  avgReportTime?: number;
  avgAuditTime?: number;
  avgTotalTime?: number;
  overdueCount?: number;
  slaAchievementRate?: number;
}
