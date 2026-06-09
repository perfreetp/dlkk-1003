export type { User, UserRole, Patient } from './patient';
export type {
  Modality,
  StudyStatus,
  LayoutType,
  ToolType,
  Pan,
  WindowLevel,
  StudyFilters,
  Image,
  Series,
  Study,
  AnnotationBase,
  LengthAnnotation,
  AngleAnnotation,
  AreaAnnotation,
  CTValueAnnotation,
  ArrowAnnotation,
  TextAnnotation,
  Annotation,
  ThemeType,
  ViewerPreferences,
  NotificationSettings,
} from './study';
export type { Annotation as AnnotationV2, AnnotationType } from './annotation';
export type { ReportStatus, ReportTemplate, Report } from './report';
export type {
  ConsultationStatus,
  ConsultationMessage,
  Consultation,
  ConsultationType,
  ConsultationMessageType,
  ConsultationParticipant,
} from './consultation';
export type {
  QCSeverity,
  QCType,
  QCRecord,
  MissingCase,
  TimelinessStats,
} from './quality';
export type { WorkloadStat, EfficiencyData } from './statistic';
export type { SharePermission, ShareLink, ArchiveRecord } from './share';

export type BodyPart = string;

export interface ImageInstance {
  id: string;
  seriesId: string;
  instanceNumber: number;
  imageData: string;
  thumbnail: string;
  windowCenter: number;
  windowWidth: number;
  sliceThickness: number;
  pixelSpacingX: number;
  pixelSpacingY: number;
  sliceLocation: number;
}

export interface ConsultationExpert {
  id: string;
  name: string;
  title: string;
  department: string;
  hospital: string;
}

export interface KeyImageRef {
  studyId: string;
  seriesId: string;
  imageId: string;
  annotation?: string;
}

export type QCRecordType = 'missing' | 'timeliness' | 'quality';

export type MissingDetectionReviewStatus = 'pending' | 'confirmed' | 'rejected';

export interface MissingDetectionRecord {
  id: string;
  reportId: string;
  studyId: string;
  patientName: string;
  patientId: string;
  accessionNumber?: string;
  modality: string;
  bodyPart: string;
  detectedIssue: string;
  detectedAt: string;
  confidence: number;
  aiSuggestion: string;
  reviewerId?: string;
  reviewerName?: string;
  reviewStatus: MissingDetectionReviewStatus;
  reviewComment?: string;
  reviewedAt?: string;
  suspectedIssue?: string;
}

export interface QualityRecord {
  id: string;
  reportId: string;
  studyId: string;
  patientName: string;
  reporterName: string;
  reporterId: string;
  auditorName?: string;
  auditorId?: string;
  type: QCRecordType;
  score: number;
  completenessScore: number;
  accuracyScore: number;
  timelinessScore: number;
  issueDescription: string;
  reviewerId?: string;
  reviewerName?: string;
  isResolved: boolean;
  resolveComment?: string;
  resolvedAt?: string;
  createdAt: string;
  auditDate: string;
}

export interface TimelinessStat {
  date: string;
  totalStudies: number;
  pendingCount: number;
  reportingCount: number;
  reportedCount: number;
  auditedCount: number;
  avgReceiveTime: number;
  avgReportTime: number;
  avgAuditTime: number;
  avgTotalTime: number;
  overdueCount: number;
  slaAchievementRate: number;
}

export interface QualityStatsSummary {
  totalMissingDetected: number;
  confirmedMissing: number;
  rejectedMissing: number;
  pendingMissing: number;
  averageQualityScore: number;
  averageCompletenessScore: number;
  averageAccuracyScore: number;
  averageTimelinessScore: number;
  totalOverdue: number;
  slaRate: number;
}

export interface QualityStats {
  missingDetections: MissingDetectionRecord[];
  qualityRecords: QualityRecord[];
  timelinessStats: TimelinessStat[];
  summary: QualityStatsSummary;
}
