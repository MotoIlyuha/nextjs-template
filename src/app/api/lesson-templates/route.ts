import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { LessonTemplateFormSchema, CreateLessonTemplateSchema } from '@/schemas/lesson-template';
import type { TablesInsert } from '@/types/supabase';
import { handleApiError, successResponse, validateRequestBody, getAuthenticatedUser } from '@/lib/api-utils';

export async function GET(request: Request): Promise<Response> {
  try {
    const { user, supabase } = await getAuthenticatedUser(request);
    
    const { data: templates, error } = await supabase
      .from('lesson_templates')
      .select(`
        *,
        students!inner(
          id,
          first_name,
          last_name,
          color
        )
      `)
      .eq('teacher_id', user.id)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) {
      console.error('[lesson-templates GET] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return successResponse({ templates });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const values = await validateRequestBody(request, LessonTemplateFormSchema);
    const { user, supabase } = await getAuthenticatedUser(request);

    // Проверяем, что ученик принадлежит учителю
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', values.studentId)
      .eq('teacher_id', user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Ученик не найден' }, { status: 404 });
    }

    const templatesToCreate: TablesInsert<'lesson_templates'>[] = [];

    // Создаем шаблоны для каждого выбранного дня и каждой строки времени
    for (const day of values.selectedDays) {
      for (const timeRow of values.timeRows) {
        const templateData: TablesInsert<'lesson_templates'> = {
          teacher_id: user.id,
          student_id: values.studentId,
          subject: values.subject,
          duration_minutes: timeRow.duration,
          day_of_week: day,
          start_time: timeRow.startTime,
          price: Number(timeRow.price),
          note: values.note || null,
          is_active: true,
        };

        templatesToCreate.push(templateData);
      }
    }

    // Создаем все шаблоны
    const { data: createdTemplates, error: createError } = await supabase
      .from('lesson_templates')
      .insert(templatesToCreate)
      .select(`
        *,
        students!inner(
          id,
          first_name,
          last_name,
          color
        )
      `);

    if (createError) {
      console.error('[lesson-templates POST] error:', createError.message);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    return successResponse({ templates: createdTemplates }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
