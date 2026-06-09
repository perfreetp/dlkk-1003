import type { Patient } from './patient';

export type Modality = 'CT' | 'MRI' | 'X-Ray' | 'Ultrasound' | 'PET-CT' | 'MR' | 'DR' | 'US';

export type StudyStatus = 'pending' | 'reporting' | 'reviewing' | 'approved' | 'consulting' | 'reported' | 'audited';

export type LayoutType = '1x1' | '2x2' | '3x3' | '4x4';

export type ToolType = 'select' | 'zoom' | 'pan' | 'rotate' | 'length' | 'angle' | 'area' | 'ctvalue' | 'arrow' | 'text';

export interface Pan {
  x: number;
  y: number;
}

export interface WindowLevel {
  center: number;
  width: number;
}

export interface StudyFilters {
  patientName?: string;
  modality?: Modality;
  bodyPart?: string;
  status?: StudyStatus;
  dateRange?: [string, string];
}

export interface Image {
  id: string;
  seriesId: string;
  instanceNumber: number;
  sopInstanceUid: string;
  width: number;
  height: number;
  bitsAllocated: number;
  windowCenter: number;
  windowWidth: number;
  url: string;
}

export interface Series {
  id: string;
  studyId: string;
  seriesNumber: number;
  description: string;
  modality: Modality;
  instancesCount: number;
  images: Image[];
  thumbnail?: string;
  seriesDescription?: string;
  instanceCount?: number;
  bodyPart?: string;
  windowCenter?: number;
  windowWidth?: number;
  seriesDate?: string;
  seriesTime?: string;
}

export interface Study {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  modality: Modality;
  bodyPart: string;
  studyDate: string;
  studyTime: string;
  description: string;
  status: StudyStatus;
  series: Series[];
  reportId?: string;
  assigneeId?: string;
  createdAt: string;
  updatedAt: string;
  accessionNumber?: string;
  referringDoctor?: string;
  department?: string;
  patient?: Patient;
  studyInstanceUid?: string;
  institution?: string;
  stationName?: string;
}

export interface AnnotationBase {
  id: string;
  type: ToolType;
  imageId: string;
  color?: string;
}

export interface LengthAnnotation extends AnnotationBase {
  type: 'length';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  value?: number;
  unit?: string;
}

export interface AngleAnnotation extends AnnotationBase {
  type: 'angle';
  point1: { x: number; y: number };
  point2: { x: number; y: number };
  point3: { x: number; y: number };
  value?: number;
}

export interface AreaAnnotation extends AnnotationBase {
  type: 'area';
  points: { x: number; y: number }[];
  value?: number;
  unit?: string;
}

export interface CTValueAnnotation extends AnnotationBase {
  type: 'ctvalue';
  x: number;
  y: number;
  value?: number;
}

export interface ArrowAnnotation extends AnnotationBase {
  type: 'arrow';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export interface TextAnnotation extends AnnotationBase {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize?: number;
}

export type Annotation =
  | LengthAnnotation
  | AngleAnnotation
  | AreaAnnotation
  | CTValueAnnotation
  | ArrowAnnotation
  | TextAnnotation;

export type ThemeType = 'light' | 'dark';

export interface ViewerPreferences {
  defaultLayout: LayoutType;
  defaultWindowPreset: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  studyAssigned: boolean;
  reportReviewed: boolean;
  consultationRequest: boolean;
  qcAlert: boolean;
}
