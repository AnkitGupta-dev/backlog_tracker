import sql from '@/app/api/utils/sql';

export async function GET() {
  try {
    const subjects = await sql`SELECT * FROM subjects`;
    const settings = await sql`SELECT * FROM settings WHERE id = 1`;

    const totalSubjects = subjects.length;
    const backlogs = subjects.filter((s) => s.status === 'failed').length;
    const passed = subjects.filter((s) => s.status === 'passed').length;
    const appearing = subjects.filter((s) => s.status === 'appearing').length;

    const totalCreditsEarned = subjects
      .filter((s) => s.status === 'passed')
      .reduce((acc, s) => acc + parseFloat(s.credits), 0);

    const totalDegreeCredits = settings[0]?.total_credits || 180;
    const creditsRemaining = Math.max(0, totalDegreeCredits - totalCreditsEarned);
    const degreeProgress = Math.min(
      100,
      Math.round((totalCreditsEarned / totalDegreeCredits) * 100)
    );

    // Semester stats
    const semesterStats = Array.from({ length: 8 }, (_, i) => {
      const sem = i + 1;
      const semSubjects = subjects.filter((s) => s.semester === sem);
      const semPassed = semSubjects.filter((s) => s.status === 'passed').length;
      const semTotal = semSubjects.length;
      return {
        semester: sem,
        total: semTotal,
        passed: semPassed,
        backlogs: semSubjects.filter((s) => s.status === 'failed').length,
        isCompleted: semTotal > 0 && semPassed === semTotal,
        completionPercentage: semTotal > 0 ? Math.round((semPassed / semTotal) * 100) : 0,
      };
    });

    const completedSemesters = semesterStats.filter((s) => s.isCompleted).length;

    // Chart data: Semester-wise backlog count
    const backlogChartData = semesterStats.map((s) => ({
      name: `Sem ${s.semester}`,
      backlogs: s.backlogs,
    }));

    // Status distribution
    const statusDistribution = [
      { name: 'Passed', value: passed },
      { name: 'Failed', value: backlogs },
      { name: 'Appearing', value: appearing },
      { name: 'Not Attempted', value: subjects.filter((s) => s.status === 'not_attempted').length },
      { name: 'Dropped', value: subjects.filter((s) => s.status === 'dropped').length },
    ];

    // Activity timeline (last 10 updates)
    const recentActivity = await sql`
      SELECT * FROM subjects 
      ORDER BY updated_at DESC 
      LIMIT 10
    `;

    return Response.json({
      stats: {
        totalSubjects,
        backlogs,
        passed,
        appearing,
        totalCreditsEarned,
        creditsRemaining,
        degreeProgress,
        completedSemesters,
        totalAttempts: subjects.reduce((acc, s) => acc + s.attempts, 0),
        passPercentage: totalSubjects > 0 ? Math.round((passed / totalSubjects) * 100) : 0,
      },
      semesterStats,
      backlogChartData,
      statusDistribution,
      recentActivity,
      settings: settings[0],
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
