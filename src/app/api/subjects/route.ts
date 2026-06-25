import sql from '@/app/api/utils/sql';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const semester = searchParams.get('semester');
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  let query = 'SELECT * FROM subjects WHERE 1=1';
  const params: any[] = [];

  if (semester) {
    params.push(parseInt(semester));
    query += ` AND semester = $${params.length}`;
  }
  if (status) {
    params.push(status);
    query += ` AND status = $${params.length}`;
  }
  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length})`;
  }

  query += ' ORDER BY semester ASC, name ASC';

  try {
    const subjects = await sql(query, params);
    return Response.json(subjects);
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch subjects' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, semester, credits, grade, status, attempts, exam_session, remarks } = body;

    if (credits < 0 || attempts < 0) {
      return Response.json({ error: 'Credits and attempts must be non-negative' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO subjects (code, name, semester, credits, grade, status, attempts, exam_session, remarks)
      VALUES (${code}, ${name}, ${semester}, ${credits}, ${grade}, ${status}, ${attempts}, ${exam_session}, ${remarks})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: 'Failed to create subject. Ensure subject code is unique per semester.' },
      { status: 500 }
    );
  }
}
