import type { Modality } from './study';

export type ReportStatus = 'draft' | 'submitted' | 'reviewing' | 'approved' | 'rejected';

export interface ReportTemplate {
  id: string;
  name: string;
  modality: Modality;
  bodyPart: string;
  findings: string;
  impression: string;
  createdBy: string;
  createdAt: string;
  category?: string;
  useCount?: number;
  isShared?: boolean;
  isFavorite?: boolean;
  creatorName?: string;
  isNormal?: boolean;
  findingsTemplate?: string;
  impressionTemplate?: string;
  creatorId?: string;
  updatedAt?: string;
}

export interface Report {
  id: string;
  studyId: string;
  findings: string;
  impression: string;
  status: ReportStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  reviewerId?: string;
  reviewedAt?: string;
  auditComment?: string;
  templateId?: string;
  reporterName?: string;
  reporterId?: string;
  reportTime?: string;
  auditorId?: string;
  auditorName?: string;
  auditTime?: string;
  auditOpinion?: string;
}
