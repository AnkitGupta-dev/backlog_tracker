import sql from '@/app/api/utils/sql';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const allowedFields = [
      'code',
      'name',
      'semester',
      'credits',
      'grade',
      'status',
      'attempts',
      'exam_session',
      'remarks',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    Object.entries(body).forEach(([key, value]) => {
      if (allowedFields.includes(key)) {
        values.push(value);
        updates.push(`${key} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return Response.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id);
    const query = `
      UPDATE subjects 
      SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `;

    const result = await sql(query, values);

    if (result.length === 0) {
      return Response.json({ error: 'Subject not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    await sql`DELETE FROM subjects WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const result = await sql`SELECT * FROM subjects WHERE id = ${id}`;
    if (result.length === 0) {
      return Response.json({ error: 'Subject not found' }, { status: 404 });
    }
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch subject' }, { status: 500 });
  }
}
