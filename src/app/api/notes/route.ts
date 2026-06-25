import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const notes = await sql`SELECT * FROM notes ORDER BY created_at DESC`;
    return Response.json(notes);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { title, content } = await request.json();
    const result = await sql`
      INSERT INTO notes (title, content)
      VALUES (${title}, ${content})
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
