import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { RelationSchema } from '@/schemas/student';
import type { TablesInsert } from '@/types/supabase';

interface RouteParams {
  params: { id: string };
}

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseForRequest(request);
    
    const { data: relations, error } = await supabase
      .from('student_relations')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[relations GET] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ relations });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[relations GET] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const body = await request.json();
    const parsed = RelationSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const relationData = parsed.data;
    const supabase = getSupabaseForRequest(request);

    // Get current user to verify ownership of student
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

    // Create relation
    const relationInsertData: TablesInsert<'student_relations'> = {
      student_id: id,
      relation_name: relationData.relation_name,
      contact_value: relationData.contact_value,
      contact_type: relationData.contact_type,
    };

    const { data: relation, error: relationError } = await supabase
      .from('student_relations')
      .insert(relationInsertData)
      .select('*')
      .single();

    if (relationError) {
      console.error('[relations POST] error:', relationError.message);
      return NextResponse.json({ error: relationError.message }, { status: 500 });
    }

    return NextResponse.json({ relation }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[relations POST] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
