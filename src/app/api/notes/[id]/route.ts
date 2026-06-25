import sql from '@/app/api/utils/sql';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    const { title, content } = await request.json();
    const result = await sql`
      UPDATE notes 
      SET title = ${title}, content = ${content}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to update note' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = await params;
  try {
    await sql`DELETE FROM notes WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}
