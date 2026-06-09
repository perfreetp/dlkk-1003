export type AnnotationType = 'length' | 'angle' | 'area' | 'arrow' | 'text' | 'ctvalue';

export interface Annotation {
  id: string;
  seriesId: string;
  imageId: string;
  type: AnnotationType;
  data: Record<string, unknown>;
  userId: string;
  userName: string;
  label: string;
  createdAt: string;
}
