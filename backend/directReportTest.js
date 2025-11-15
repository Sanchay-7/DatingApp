/**
 * Direct Test: Create a report manually to test the database
 * Run: node directReportTest.js
 */

import prisma from './config/db.js';

async function testDirectReportCreation() {
  try {
    console.log('\n🧪 DIRECT REPORT CREATION TEST\n');

    // Get the first two users
    const users = await prisma.user.findMany({ take: 2 });

    if (users.length < 2) {
      console.log('❌ Need at least 2 users in database');
      process.exit(1);
    }

    const [reporter, reportedUser] = users;
    console.log(`📋 Found reporter: ${reporter.email}`);
    console.log(`📋 Found reported user: ${reportedUser.email}\n`);

    // Create a report directly
    console.log('📝 Creating report...');
    const report = await prisma.report.create({
      data: {
        reason: 'Direct test report - ' + new Date().toISOString(),
        reporterId: reporter.id,
        reportedUserId: reportedUser.id,
      },
    });

    console.log('✅ Report created successfully!');
    console.log(`   Report ID: ${report.id}`);
    console.log(`   Status: ${report.status}`);
    console.log(`   Created At: ${report.createdAt}\n`);

    // Verify it can be fetched
    console.log('✅ Verifying report can be fetched...');
    const fetchedReport = await prisma.report.findUnique({
      where: { id: report.id },
      include: {
        reporter: { select: { email: true, name: true } },
        reportedUser: { select: { email: true, name: true } },
      },
    });

    console.log(`✅ Report fetched successfully`);
    console.log(`   Reported by: ${fetchedReport.reporter.email}`);
    console.log(`   Report about: ${fetchedReport.reportedUser.email}\n`);

    // Count all reports
    const reportCount = await prisma.report.count();
    console.log(`📊 Total reports in database: ${reportCount}`);

    console.log('\n✅ DATABASE IS WORKING CORRECTLY\n');
    console.log('🔍 NEXT STEP: Check if API endpoint receives requests');
    console.log('   1. Restart backend: npx nodemon server.js');
    console.log('   2. Submit report from frontend');
    console.log('   3. Watch backend console for [REPORT] and [AUTH-MIDDLEWARE] logs\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'P2025') {
      console.log('\n⚠️  Record not found. Make sure users exist in database.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDirectReportCreation();
