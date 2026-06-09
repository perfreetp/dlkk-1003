export type UserRole = 'doctor' | 'radiologist' | 'expert' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  department: string;
  avatar: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: 'male' | 'female' | string;
  idCard: string;
  birthDate: string;
  phone: string;
  age: number;
  address?: string;
  medicalRecordNumber?: string;
}
