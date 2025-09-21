import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { StudentFormSchema, type StudentFormValues } from '@/schemas/student';
import type { TablesUpdate } from '@/types/supabase';

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
    
    const { data: student, error } = await supabase
      .from('students')
      .select(`
        *,
        student_contacts(*),
        student_relations(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      console.error('[students GET by id] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ student });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[students GET by id] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams): Promise<Response> {
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
    const parsed = StudentFormSchema.partial().safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: parsed.error.issues 
      }, { status: 400 });
    }

    const values: Partial<StudentFormValues> = parsed.data;
    const supabase = getSupabaseForRequest(request);

    // Get current user to verify ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prepare student update data
    const studentUpdateData: TablesUpdate<'students'> = {};
    
    if (values.first_name !== undefined) studentUpdateData.first_name = values.first_name;
    if (values.last_name !== undefined) studentUpdateData.last_name = values.last_name ?? null;
    if (values.color !== undefined) studentUpdateData.color = values.color;
    if (values.is_online !== undefined) {
      studentUpdateData.is_online = values.is_online;
      studentUpdateData.address = values.is_online ? null : (values.address || null);
    }
    if (values.address !== undefined && !values.is_online) {
      studentUpdateData.address = values.address;
    }
    if (values.class_or_course !== undefined) {
      (studentUpdateData as any).class_or_course = values.class_or_course ?? null;
    }
    if (values.note !== undefined) {
      (studentUpdateData as any).note = values.note || null;
    }
    const isArchived = typeof (body as any)?.is_archived === 'boolean' ? (body as any).is_archived as boolean : undefined;
    if (isArchived !== undefined) (studentUpdateData as any).is_archived = isArchived;

    // Update student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .update(studentUpdateData)
      .eq('id', id)
      .eq('teacher_id', user.id) // Ensure ownership
      .select('*')
      .single();

    if (studentError) {
      if (studentError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      console.error('[students PATCH] student error:', studentError.message);
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }


    // Update contacts if provided
    if (values.contacts !== undefined) {
      // Replace all contacts
      const { error: deleteContactsError } = await supabase
        .from('student_contacts')
        .delete()
        .eq('student_id', id);

      if (deleteContactsError) {
        console.error('[students PATCH] delete contacts error:', deleteContactsError.message);
      } else if (values.contacts.length > 0) {
        const contactsData = values.contacts.map(contact => ({
          student_id: id,
          type: contact.type,
          value: contact.value,
        }));

        const { error: contactsError } = await supabase
          .from('student_contacts')
          .insert(contactsData);

        if (contactsError) {
          console.error('[students PATCH] contacts error:', contactsError.message);
        }
      }
    }

    // Update relations if provided
    if (values.relations !== undefined) {
      // Replace all relations
      const { error: deleteRelationsError } = await supabase
        .from('student_relations')
        .delete()
        .eq('student_id', id);

      if (deleteRelationsError) {
        console.error('[students PATCH] delete relations error:', deleteRelationsError.message);
      } else if (values.relations.length > 0) {
        const relationsData = values.relations.map(relation => ({
          student_id: id,
          relation_name: relation.relation_name,
          contact_value: relation.contact_value,
          contact_type: relation.contact_type,
        }));

        const { error: relationsError } = await supabase
          .from('student_relations')
          .insert(relationsData);

        if (relationsError) {
          console.error('[students PATCH] relations error:', relationsError.message);
        }
      }
    }

    // Fetch complete student data with relations
    const { data: completeStudent, error: fetchError } = await supabase
      .from('students')
      .select(`
        *,
        student_contacts(*),
        student_relations(*)
      `)
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[students PATCH] fetch error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ student: completeStudent });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[students PATCH] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams): Promise<Response> {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseForRequest(request);

    // Get current user to verify ownership
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete student (contacts and relations will be deleted by CASCADE)
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('teacher_id', user.id); // Ensure ownership

    if (deleteError) {
      if (deleteError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      console.error('[students DELETE] error:', deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('[students DELETE] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
