import prisma from "./config/db.js";

async function testReports() {
  try {
    console.log("=== TESTING REPORTS TABLE ===\n");

    // Count all reports
    const reportCount = await prisma.report.count();
    console.log(`Total reports in database: ${reportCount}\n`);

    // Count pending reports
    const pendingCount = await prisma.report.count({
      where: { status: "PENDING" },
    });
    console.log(`Pending reports: ${pendingCount}\n`);

    // Fetch all pending reports with details
    const reports = await prisma.report.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, firstName: true, email: true } },
        reportedUser: { select: { id: true, firstName: true, email: true } },
      },
    });

    if (reports.length === 0) {
      console.log("❌ No pending reports found!\n");
    } else {
      console.log("✅ Pending Reports:\n");
      reports.forEach((r, idx) => {
        console.log(`${idx + 1}. Report ID: ${r.id}`);
        console.log(`   Reason: ${r.reason}`);
        console.log(`   Reporter: ${r.reporter?.firstName} (${r.reporter?.email})`);
        console.log(`   Reported User: ${r.reportedUser?.firstName} (${r.reportedUser?.email})`);
        console.log(`   Created: ${r.createdAt}\n`);
      });
    }

    // List some users to verify they exist
    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, email: true },
      take: 5,
    });
    console.log(`Sample users in database: ${users.length}`);
    users.forEach((u) => {
      console.log(`  - ${u.firstName} (${u.email})`);
    });
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

testReports();
