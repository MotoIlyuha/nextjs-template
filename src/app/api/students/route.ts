import { NextResponse } from 'next/server';
import { getSupabaseForRequest } from '@/core/supabaseServer';
import { StudentFormSchema, type StudentFormValues } from '@/schemas/student';
import type { TablesInsert } from '@/types/supabase';
import { handleApiError, successResponse, validateRequestBody, getAuthenticatedUser } from '@/lib/api-utils';

export async function GET(request: Request): Promise<Response> {
  try {
    const supabase = getSupabaseForRequest(request);
    
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        student_contacts(*),
        student_relations(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[students GET] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return successResponse({ students });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const values = await validateRequestBody(request, StudentFormSchema);
    const { user, supabase } = await getAuthenticatedUser(request);

    // Prepare student data
    const studentData: TablesInsert<'students'> = {
      first_name: values.first_name,
      last_name: values.last_name ?? null,
      is_online: values.is_online,
      address: values.is_online ? null : values.address || null,
      color: values.color,
      class_or_course: values.class_or_course ?? null,
      note: values.note || null,
      teacher_id: user.id,
    };

    // Create student
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert(studentData)
      .select('*')
      .single();

    if (studentError) {
      console.error('[students POST] student error:', studentError.message);
      return NextResponse.json({ error: studentError.message }, { status: 500 });
    }


    // Create contacts
    if (values.contacts.length > 0) {
      const contactsData: TablesInsert<'student_contacts'>[] = values.contacts.map(contact => ({
        student_id: student.id,
        type: contact.type,
        value: contact.value,
      }));

      const { error: contactsError } = await supabase
        .from('student_contacts')
        .insert(contactsData);

      if (contactsError) {
        console.error('[students POST] contacts error:', contactsError.message);
        // Continue anyway, not critical
      }
    }

    // Create relations
    if (values.relations.length > 0) {
      const relationsData: TablesInsert<'student_relations'>[] = values.relations.map(relation => ({
        student_id: student.id,
        relation_name: relation.relation_name,
        contact_value: relation.contact_value,
        contact_type: relation.contact_type,
      }));

      const { error: relationsError } = await supabase
        .from('student_relations')
        .insert(relationsData);

      if (relationsError) {
        console.error('[students POST] relations error:', relationsError.message);
        // Continue anyway, not critical
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
      .eq('id', student.id)
      .single();

    if (fetchError) {
      console.error('[students POST] fetch error:', fetchError.message);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    return successResponse({ student: completeStudent }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
