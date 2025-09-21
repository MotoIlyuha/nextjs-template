import type { Tables } from './supabase';

// Основные типы из Supabase
export type Student = Tables<'students'>;
export type StudentContact = Tables<'student_contacts'>;
export type StudentRelation = Tables<'student_relations'>;

// Расширенные типы с связанными данными
export type StudentWithRelations = Student & {
  student_contacts: StudentContact[];
  student_relations: StudentRelation[];
};

// Типы для форм
export interface StudentFormData {
  first_name: string;
  last_name?: string | null;
  is_online: boolean;
  address?: string | null;
  color: string;
  class_or_course?: number | null;
  note?: string | null;
  contacts: ContactFormData[];
  relations: RelationFormData[];
}

export interface ContactFormData {
  type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'viber' | 'other';
  value: string;
}

export interface RelationFormData {
  relation_name: string;
  contact_type: 'phone' | 'email' | 'telegram' | 'whatsapp' | 'viber' | 'other';
  contact_value: string;
}

// Типы для API ответов
export interface StudentsResponse {
  students: StudentWithRelations[];
}

export interface StudentResponse {
  student: StudentWithRelations;
}

export interface ContactsResponse {
  contacts: StudentContact[];
}

export interface RelationsResponse {
  relations: StudentRelation[];
}

export interface ContactResponse {
  contact: StudentContact;
}

export interface RelationResponse {
  relation: StudentRelation;
}

// Утилитарные типы
export type ContactType = StudentContact['type'];
export type RelationType = StudentRelation['contact_type'];

// Константы для контактов
export const CONTACT_TYPES: ContactType[] = [
  'phone', 'email', 'telegram', 'whatsapp', 'viber', 'other'
];

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  phone: 'Телефон',
  email: 'Email',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  viber: 'Viber',
  other: 'Другой'
};
