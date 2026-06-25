const { neon } = require('@neondatabase/serverless');

// Ensure DATABASE_URL is present
if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is missing.');
  console.error('Please make sure you have it in your .env file and run the script with:');
  console.error('node --env-file=.env seed.js');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// ----------------------------------------------------
// 📝 EDIT THIS ARRAY WITH YOUR REAL SUBJECT DATA
// ----------------------------------------------------
const subjectsToSeed = [
  {
    code: '18B14CI744',
    name: 'AD-HOC AND WIRELESS NETWORKS',
    semester: 7,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
  {
    code: '18B14CI844',
    name: 'ALGORITHMS ANALYSIS AND DESIGN',
    semester: 7,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
  {
    code: '18B14CI645',
    name: 'GRAPH ALGORITHMS AND APPLICATIONS',
    semester: 7,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
  {
    code: '18B14ME852',
    name: 'ENERGY MANAGEMENT PRINCIPLES',
    semester: 8,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
  {
    code: '19B14CI852',
    name: 'NEURAL NETWORK AND APPLICATIONS',
    semester: 8,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
  {
    code: '18B14CI741',
    name: 'SOFT COMPUTING',
    semester: 8,
    credits: 3.0,
    status: 'dropped', // 'passed', 'failed', 'appearing', 'not_attempted', 'dropped'
    grade: 'NR',
    attempts: 0,
    exam_session: null,
    remarks: '',
  },
];

async function seed() {
  try {
    console.log('⏳ Seeding default settings...');
    await sql`
      INSERT INTO settings (id, degree_name, university_name, total_credits, passing_grade, theme)
      VALUES (1, 'Bachelor of Technology', 'Your University', 120, 'D', 'light')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✅ Settings initialized successfully.');

    console.log(`⏳ Seeding ${subjectsToSeed.length} subjects...`);
    for (const s of subjectsToSeed) {
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
      console.log(`   - Seeded/Updated: ${s.code} (${s.name})`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

seed();
