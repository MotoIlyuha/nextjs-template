import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { ContactSchema } from '@/schemas/student';
import type { TablesUpdate } from '@/types/supabase';

interface RouteParams {
  params: Promise<{ id: string; contactId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id, contactId } = await params;
    if (!id || !contactId) {
      return NextResponse.json({ error: 'Student ID and Contact ID are required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 415 });
    }

    const body = await request.json();
    const parsed = ContactSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const contactData = parsed.data;
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

    // Update contact
    const contactUpdateData: TablesUpdate<'student_contacts'> = {};
    if (contactData.type !== undefined) contactUpdateData.type = contactData.type;
    if (contactData.value !== undefined) contactUpdateData.value = contactData.value;

    const { data: contact, error: contactError } = await supabase
      .from('student_contacts')
      .update(contactUpdateData)
      .eq('id', contactId)
      .eq('student_id', id) // Ensure it belongs to the student
      .select('*')
      .single();

    if (contactError) {
      if (contactError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      console.error('[contacts PATCH] error:', contactError.message);
      return NextResponse.json({ error: contactError.message }, { status: 500 });
    }


    return NextResponse.json({ contact });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[contacts PATCH] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id, contactId } = await params;
    if (!id || !contactId) {
      return NextResponse.json({ error: 'Student ID and Contact ID are required' }, { status: 400 });
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

    // Get contact to check its type before deletion
    const { data: contact, error: getContactError } = await supabase
      .from('student_contacts')
      .select('type, value')
      .eq('id', contactId)
      .eq('student_id', id)
      .single();

    if (getContactError) {
      if (getContactError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
      }
      console.error('[contacts DELETE] get contact error:', getContactError.message);
      return NextResponse.json({ error: getContactError.message }, { status: 500 });
    }

    // Delete contact
    const { error: deleteError } = await supabase
      .from('student_contacts')
      .delete()
      .eq('id', contactId)
      .eq('student_id', id);

    if (deleteError) {
      console.error('[contacts DELETE] error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }


    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[contacts DELETE] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
