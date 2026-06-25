import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const result = await sql`SELECT * FROM settings WHERE id = 1`;
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { degree_name, university_name, total_credits, passing_grade, theme } = body;

    const result = await sql`
      UPDATE settings 
      SET 
        degree_name = ${degree_name}, 
        university_name = ${university_name}, 
        total_credits = ${total_credits}, 
        passing_grade = ${passing_grade}, 
        theme = ${theme}
      WHERE id = 1
      RETURNING *
    `;
    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
