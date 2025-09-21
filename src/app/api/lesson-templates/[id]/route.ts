import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { UpdateLessonTemplateSchema } from '@/schemas/lesson-template';
import type { TablesUpdate } from '@/types/supabase';
import { handleApiError, successResponse, validateRequestBody, getAuthenticatedUser } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { user, supabase } = await getAuthenticatedUser(request);
    
    const { data: template, error } = await supabase
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
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('[lesson-templates GET by id] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return successResponse({ template });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const values = await validateRequestBody(request, UpdateLessonTemplateSchema);
    const { user, supabase } = await getAuthenticatedUser(request);

    // Подготавливаем данные для обновления
    const updateData: TablesUpdate<'lesson_templates'> = {};
    
    if (values.subject !== undefined) updateData.subject = values.subject;
    if (values.duration_minutes !== undefined) updateData.duration_minutes = values.duration_minutes;
    if (values.day_of_week !== undefined) updateData.day_of_week = values.day_of_week;
    if (values.start_time !== undefined) updateData.start_time = values.start_time;
    if (values.price !== undefined) updateData.price = values.price;
    if (values.note !== undefined) updateData.note = values.note;
    if (values.is_active !== undefined) updateData.is_active = values.is_active;

    // Обновляем шаблон
    const { data: template, error: updateError } = await supabase
      .from('lesson_templates')
      .update(updateData)
      .eq('id', id)
      .eq('teacher_id', user.id) // Ensure ownership
      .select(`
        *,
        students!inner(
          id,
          first_name,
          last_name,
          color
        )
      `)
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('[lesson-templates PATCH] error:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return successResponse({ template });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { user, supabase } = await getAuthenticatedUser(request);

    // Удаляем шаблон
    const { error: deleteError } = await supabase
      .from('lesson_templates')
      .delete()
      .eq('id', id)
      .eq('teacher_id', user.id); // Ensure ownership

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('[lesson-templates DELETE] error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
