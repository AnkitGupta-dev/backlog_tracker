import sql from '@/app/api/utils/sql';

export async function POST(request: Request) {
  try {
    const { action, ids, data } = await request.json();

    if (action === 'delete') {
      if (ids === 'all') {
        await sql`DELETE FROM subjects`;
        await sql`DELETE FROM notes`;
        return Response.json({ success: true });
      }
      await sql(`DELETE FROM subjects WHERE id = ANY($1)`, [ids]);
      return Response.json({ success: true });
    }

    if (action === 'update') {
      const allowedFields = ['status', 'semester', 'attempts'];
      const updates: string[] = [];
      const values: any[] = [];

      Object.entries(data).forEach(([key, value]) => {
        if (allowedFields.includes(key)) {
          values.push(value);
          updates.push(`${key} = $${values.length}`);
        }
      });

      if (updates.length === 0) {
        return Response.json({ error: 'No valid fields to update' }, { status: 400 });
      }

      values.push(ids);
      const query = `
        UPDATE subjects 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ANY($${values.length})
      `;

      await sql(query, values);
      return Response.json({ success: true });
    }

    if (action === 'insert') {
      const { subjects } = data;
      if (!subjects || !Array.isArray(subjects)) {
        return Response.json({ error: 'Invalid subjects data' }, { status: 400 });
      }

      for (const s of subjects) {
        await sql`
          INSERT INTO subjects (code, name, semester, credits, grade, status, attempts, exam_session, remarks)
          VALUES (${s.code}, ${s.name}, ${s.semester}, ${s.credits}, ${s.grade}, ${s.status}, ${s.attempts}, ${s.exam_session}, ${s.remarks})
          ON CONFLICT (code, semester) DO UPDATE SET
            name = EXCLUDED.name,
            credits = EXCLUDED.credits,
            grade = EXCLUDED.grade,
            status = EXCLUDED.status,
            attempts = EXCLUDED.attempts,
            exam_session = EXCLUDED.exam_session,
            remarks = EXCLUDED.remarks,
            updated_at = CURRENT_TIMESTAMP
        `;
      }
      return Response.json({ success: true });
    }

    if (action === 'shortlist') {
      await sql`UPDATE subjects SET is_shortlisted = FALSE`;
      if (ids && ids.length > 0) {
        await sql(`UPDATE subjects SET is_shortlisted = TRUE WHERE id = ANY($1)`, [ids]);
      }
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}
