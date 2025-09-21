import { describe, it, expect } from 'vitest';
import {
  TimeRowSchema,
  LessonTemplateFormSchema,
  CreateLessonTemplateSchema,
  UpdateLessonTemplateSchema,
} from './lesson-template';

describe('TimeRowSchema', () => {
  it('validates correct time row data', () => {
    const validData = {
      id: '1',
      startTime: '10:00',
      endTime: '11:00',
      price: '1000',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty start time', () => {
    const invalidData = {
      id: '1',
      startTime: '',
      endTime: '11:00',
      price: '1000',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Время начала обязательно');
    }
  });

  it('rejects empty end time', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '',
      price: '1000',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Время окончания обязательно');
    }
  });

  it('rejects empty price', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '11:00',
      price: '',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Стоимость обязательна');
    }
  });

  it('rejects invalid price format', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '11:00',
      price: 'invalid',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Стоимость должна быть положительным числом');
    }
  });

  it('rejects negative price', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '11:00',
      price: '-100',
      duration: 60,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Стоимость должна быть положительным числом');
    }
  });

  it('rejects duration less than 15 minutes', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '10:10',
      price: '1000',
      duration: 10,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Минимальная длительность 15 минут');
    }
  });

  it('rejects duration more than 240 minutes', () => {
    const invalidData = {
      id: '1',
      startTime: '10:00',
      endTime: '15:00',
      price: '1000',
      duration: 300,
    };

    const result = TimeRowSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Максимальная длительность 4 часа');
    }
  });
});

describe('LessonTemplateFormSchema', () => {
  it('validates correct form data', () => {
    const validData = {
      studentId: 'student-123',
      subject: 'Математика',
      selectedDays: [1, 3, 5], // Monday, Wednesday, Friday
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
        {
          id: '2',
          startTime: '14:00',
          endTime: '15:00',
          price: '1200',
          duration: 60,
        },
      ],
      note: 'Подготовка к ЕГЭ',
    };

    const result = LessonTemplateFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty student ID', () => {
    const invalidData = {
      studentId: '',
      subject: 'Математика',
      selectedDays: [1],
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
      ],
    };

    const result = LessonTemplateFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Выберите ученика');
    }
  });

  it('rejects empty subject', () => {
    const invalidData = {
      studentId: 'student-123',
      subject: '',
      selectedDays: [1],
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
      ],
    };

    const result = LessonTemplateFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Название предмета обязательно');
    }
  });

  it('rejects subject longer than 100 characters', () => {
    const invalidData = {
      studentId: 'student-123',
      subject: 'A'.repeat(101),
      selectedDays: [1],
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
      ],
    };

    const result = LessonTemplateFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Название предмета слишком длинное');
    }
  });

  it('rejects empty selected days', () => {
    const invalidData = {
      studentId: 'student-123',
      subject: 'Математика',
      selectedDays: [],
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
      ],
    };

    const result = LessonTemplateFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Выберите хотя бы один день недели');
    }
  });

  it('rejects empty time rows', () => {
    const invalidData = {
      studentId: 'student-123',
      subject: 'Математика',
      selectedDays: [1],
      timeRows: [],
    };

    const result = LessonTemplateFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Добавьте хотя бы одну строку времени');
    }
  });

  it('accepts optional note', () => {
    const validData = {
      studentId: 'student-123',
      subject: 'Математика',
      selectedDays: [1],
      timeRows: [
        {
          id: '1',
          startTime: '10:00',
          endTime: '11:00',
          price: '1000',
          duration: 60,
        },
      ],
      note: undefined,
    };

    const result = LessonTemplateFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('CreateLessonTemplateSchema', () => {
  it('validates correct template data', () => {
    const validData = {
      teacher_id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      subject: 'Математика',
      duration_minutes: 60,
      day_of_week: 1,
      start_time: '10:00',
      price: 1000,
      note: 'Подготовка к ЕГЭ',
      is_active: true,
    };

    const result = CreateLessonTemplateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid time format', () => {
    const invalidData = {
      teacher_id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      subject: 'Математика',
      duration_minutes: 60,
      day_of_week: 1,
      start_time: '25:00', // Invalid time
      price: 1000,
    };

    const result = CreateLessonTemplateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Неверный формат времени');
    }
  });

  it('rejects invalid day of week', () => {
    const invalidData = {
      teacher_id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      subject: 'Математика',
      duration_minutes: 60,
      day_of_week: 7, // Invalid day (should be 0-6)
      start_time: '10:00',
      price: 1000,
    };

    const result = CreateLessonTemplateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects negative price', () => {
    const invalidData = {
      teacher_id: '550e8400-e29b-41d4-a716-446655440000',
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      subject: 'Математика',
      duration_minutes: 60,
      day_of_week: 1,
      start_time: '10:00',
      price: -100,
    };

    const result = CreateLessonTemplateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('UpdateLessonTemplateSchema', () => {
  it('validates partial update data', () => {
    const validData = {
      subject: 'Физика',
      price: 1200,
    };

    const result = UpdateLessonTemplateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('allows teacher_id in update (ignored by omit)', () => {
    const dataWithTeacherId = {
      teacher_id: '550e8400-e29b-41d4-a716-446655440000',
      subject: 'Физика',
    };

    const result = UpdateLessonTemplateSchema.safeParse(dataWithTeacherId);
    expect(result.success).toBe(true);
    // teacher_id should be omitted from the result
    if (result.success) {
      expect(result.data).not.toHaveProperty('teacher_id');
    }
  });

  it('allows student_id in update (ignored by omit)', () => {
    const dataWithStudentId = {
      student_id: '550e8400-e29b-41d4-a716-446655440001',
      subject: 'Физика',
    };

    const result = UpdateLessonTemplateSchema.safeParse(dataWithStudentId);
    expect(result.success).toBe(true);
    // student_id should be omitted from the result
    if (result.success) {
      expect(result.data).not.toHaveProperty('student_id');
    }
  });
});

