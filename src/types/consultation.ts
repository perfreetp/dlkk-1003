import type { UserRole } from './patient';
import type { KeyImageRef } from './index';

export type ConsultationStatus = 'active' | 'ended' | 'discussing' | 'finished';

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId?: string;
  senderName?: string;
  userId: string;
  userName: string;
  userRole?: string;
  content: string;
  type: 'text' | 'image' | 'keyImage';
  createdAt?: string;
  sendTime?: string;
  keyImageRef?: KeyImageRef;
}

export interface Consultation {
  id: string;
  studyId: string;
  title: string;
  status: ConsultationStatus;
  participants: {
    id: string;
    name: string;
    role: UserRole;
  }[];
  keyImages: {
    id: string;
    imageId: string;
    description: string;
    addedBy: string;
    addedAt: string;
    studyId?: string;
    seriesId?: string;
    thumbnail?: string;
    annotation?: string;
  }[];
  createdBy: string;
  createdAt: string;
  endedAt?: string;
  hostId?: string;
  hostName?: string;
  type?: 'normal' | 'emergency';
  startTime?: string;
  endTime?: string;
  summary?: string;
  experts?: {
    id: string;
    name: string;
    title: string;
    department: string;
    hospital: string;
  }[];
  messages?: ConsultationMessage[];
}

export type ConsultationType = 'normal' | 'emergency';
export type ConsultationMessageType = 'text' | 'image' | 'audio';

export interface ConsultationParticipant {
  userId: string;
  userName: string;
  userTitle: string;
}
