import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import type { ZodSchema } from 'zod';

export interface ApiError {
  message: string;
  status: number;
}

export class ApiError extends Error {
  constructor(public message: string, public status: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Общая функция для валидации JSON тела запроса
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  const contentType = request.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new ApiError('Content-Type must be application/json', 415);
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    throw new ApiError('Validation failed', 400);
  }

  return parsed.data;
}

/**
 * Общая функция для получения авторизованного пользователя
 */
export async function getAuthenticatedUser(request: Request) {
  const supabase = getSupabaseForRequest(request);
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw new ApiError('Unauthorized', 401);
  }
  
  return { user, supabase };
}

/**
 * Общая функция для проверки владения студентом
 */
export async function verifyStudentOwnership(
  supabase: any,
  studentId: string,
  userId: string
) {
  const { data: student, error } = await supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('teacher_id', userId)
    .single();

  if (error || !student) {
    throw new ApiError('Student not found', 404);
  }

  return student;
}

/**
 * Общая функция для обработки ошибок API
 */
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error('[API Error]:', message);
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Общая функция для успешного ответа
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}
