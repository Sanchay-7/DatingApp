#!/usr/bin/env node

/**
 * Quick Report Debug Script
 * Run this after a report is submitted to check all components quickly
 * Usage: node quickDebug.js
 */

import prisma from '@prisma/client';
import fs from 'fs';
import path from 'path';

const { PrismaClient } = prisma;
const prismaClient = new PrismaClient();

console.log('\n🔍 QUICK REPORT DEBUG SCRIPT\n');
console.log('='.repeat(50));

const checkDatabase = async () => {
  console.log('\n📊 DATABASE CHECK');
  console.log('-'.repeat(50));
  
  try {
    const totalReports = await prismaClient.report.count();
    const pendingReports = await prismaClient.report.count({ 
      where: { status: 'PENDING' } 
    });
    const resolvedReports = await prismaClient.report.count({ 
      where: { status: 'RESOLVED' } 
    });
    
    console.log(`✓ Total reports: ${totalReports}`);
    console.log(`✓ Pending reports: ${pendingReports}`);
    console.log(`✓ Resolved reports: ${resolvedReports}`);
    
    // Get latest report
    const latestReport = await prismaClient.report.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { reporter: { select: { id: true, name: true } }, reportedUser: { select: { id: true, name: true } } },
    });
    
    if (latestReport) {
      console.log(`\n📌 Latest Report:`);
      console.log(`   ID: ${latestReport.id}`);
      console.log(`   Reason: ${latestReport.reason}`);
      console.log(`   Status: ${latestReport.status}`);
      console.log(`   Reported: ${latestReport.reportedUser?.name || 'N/A'}`);
      console.log(`   Reporter: ${latestReport.reporter?.name || 'N/A'}`);
      console.log(`   Created: ${latestReport.createdAt}`);
    } else {
      console.log('\n⚠️  No reports found in database');
    }
    
    return { totalReports, pendingReports };
  } catch (error) {
    console.error(`✗ Database error: ${error.message}`);
    return null;
  }
};

const checkServerLogs = () => {
  console.log('\n📋 LOG FILE CHECK');
  console.log('-'.repeat(50));
  
  // Check if server.js has been started (basic check)
  try {
    const serverPath = path.resolve('./server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✓ server.js exists');
    } else {
      console.log('✗ server.js not found');
    }
  } catch (error) {
    console.log(`⚠️  Could not check server.js: ${error.message}`);
  }
  
  console.log('\n📝 To check logs:');
  console.log('   1. Look at backend console output for:');
  console.log('      - [AUTH-MIDDLEWARE] logs');
  console.log('      - [REPORT] logs');
  console.log('   2. Look at frontend console for:');
  console.log('      - [REPORT-FRONTEND] logs');
};

const checkEnvironment = async () => {
  console.log('\n🔧 ENVIRONMENT CHECK');
  console.log('-'.repeat(50));
  
  try {
    // Check if we can connect to database
    await prismaClient.$queryRaw`SELECT 1`;
    console.log('✓ Database connection successful');
  } catch (error) {
    console.log(`✗ Database connection failed: ${error.message}`);
  }
  
  // Check environment variables
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'CLOUDINARY_URL'];
  console.log('\nEnvironment variables:');
  requiredEnvVars.forEach(envVar => {
    const value = process.env[envVar];
    if (value) {
      console.log(`✓ ${envVar}: Set`);
    } else {
      console.log(`✗ ${envVar}: Missing`);
    }
  });
};

const checkFileSystem = () => {
  console.log('\n📂 FILE SYSTEM CHECK');
  console.log('-'.repeat(50));
  
  const filesToCheck = [
    './controllers/userController.js',
    './controllers/adminController.js',
    './routes/userRoutes.js',
    './routes/adminRoutes.js',
    './middleware/auth.js',
    '../frontend/src/app/dashboard/user/page.jsx',
  ];
  
  filesToCheck.forEach(file => {
    const exists = fs.existsSync(path.resolve(file));
    const status = exists ? '✓' : '✗';
    console.log(`${status} ${file}`);
  });
};

const showRecommendations = async () => {
  console.log('\n💡 RECOMMENDATIONS');
  console.log('-'.repeat(50));
  
  const dbStatus = await checkDatabase().catch(() => null);
  
  if (!dbStatus) {
    console.log('1. ⚠️  Database connection failed');
    console.log('   → Check DATABASE_URL in .env file');
    console.log('   → Verify PostgreSQL is running');
    return;
  }
  
  if (dbStatus.pendingReports === 0) {
    console.log('1. ⚠️  No pending reports in database');
    console.log('   → Reports may not be being created');
    console.log('   → Check [REPORT] logs in backend console');
    console.log('   → Check [REPORT-FRONTEND] logs in browser console');
    return;
  }
  
  if (dbStatus.pendingReports > 0) {
    console.log(`1. ✓ Found ${dbStatus.pendingReports} pending report(s)`);
    console.log('   → Database is working correctly');
    console.log('   → Issue may be in admin page fetch');
    console.log('   → Check [MODERATION] logs in backend console');
    console.log('   → Check admin token is valid');
    return;
  }
};

const main = async () => {
  try {
    await checkEnvironment();
    checkFileSystem();
    const dbStatus = await checkDatabase();
    checkServerLogs();
    await showRecommendations();
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Debug check complete\n');
  } catch (error) {
    console.error('❌ Error during debug check:', error.message);
  } finally {
    await prismaClient.$disconnect();
    process.exit(0);
  }
};

main();
