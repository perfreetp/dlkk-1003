import type { Study } from './study';

export type SharePermission = 'view' | 'download';

export interface ShareLink {
  id: string;
  studyId: string;
  studyInfo: Study;
  token: string;
  password: string;
  expireTime: string;
  visitLimit: number;
  visitedCount: number;
  permission: SharePermission;
  creatorId: string;
  createdAt: string;
}

export interface ArchiveRecord {
  id: string;
  studyId: string;
  patientName: string;
  modality: string;
  bodyPart: string;
  format: string;
  size: number;
  archiveTime: string;
  downloadCount: number;
}
