import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { ContactSchema } from '@/schemas/student';
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
    
    const { data: contacts, error } = await supabase
      .from('student_contacts')
      .select('*')
      .eq('student_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[contacts GET] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ contacts });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[contacts GET] error:', message);
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
    const parsed = ContactSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const contactData = parsed.data;
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

    // Create contact
    const contactInsertData: TablesInsert<'student_contacts'> = {
      student_id: id,
      type: contactData.type,
      value: contactData.value,
    };

    const { data: contact, error: contactError } = await supabase
      .from('student_contacts')
      .insert(contactInsertData)
      .select('*')
      .single();

    if (contactError) {
      console.error('[contacts POST] error:', contactError.message);
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }


    return NextResponse.json({ contact }, { status: 201 });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[contacts POST] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
