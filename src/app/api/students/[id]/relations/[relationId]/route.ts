import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { RelationSchema } from '@/schemas/student';
import type { TablesUpdate } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string; relationId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id, relationId } = await params;
    if (!id || !relationId) {
      return NextResponse.json({ error: 'Student ID and Relation ID are required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const body = await request.json();
    const parsed = RelationSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const relationData = parsed.data;
    const supabase = getSupabaseForRequest(request);

    // Get current user to verify ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify student exists and belongs to user
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Update relation
    const relationUpdateData: TablesUpdate<'student_relations'> = {};
    if (relationData.relation_name !== undefined) relationUpdateData.relation_name = relationData.relation_name;
    if (relationData.contact_value !== undefined) relationUpdateData.contact_value = relationData.contact_value;
    if (relationData.contact_type !== undefined) relationUpdateData.contact_type = relationData.contact_type;

    const { data: relation, error: relationError } = await supabase
      .from('student_relations')
      .update(relationUpdateData)
      .eq('id', relationId)
      .eq('student_id', id) // Ensure it belongs to the student
      .select('*')
      .single();

    if (relationError) {
      if (relationError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Relation not found' }, { status: 404 });
      }
      console.error('[relations PATCH] error:', relationError.message);
      return NextResponse.json({ error: relationError.message }, { status: 500 });
    }

    return NextResponse.json({ relation });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[relations PATCH] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id, relationId } = await params;
    if (!id || !relationId) {
      return NextResponse.json({ error: 'Student ID and Relation ID are required' }, { status: 400 });
    }

    const supabase = getSupabaseForRequest(request);

    // Get current user to verify ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify student exists and belongs to user
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .eq('teacher_id', user.id)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Delete relation
    const { error: deleteError } = await supabase
      .from('student_relations')
      .delete()
      .eq('id', relationId)
      .eq('student_id', id);

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Relation not found' }, { status: 404 });
      }
      console.error('[relations DELETE] error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[relations DELETE] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
