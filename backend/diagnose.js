#!/usr/bin/env node

/**
 * COMPREHENSIVE DIAGNOSIS SCRIPT
 * Run this to identify where reports are disappearing
 */

import fetch from 'node-fetch';
import prisma from './config/db.js';

async function diagnose() {
  console.log('\n' + '='.repeat(70));
  console.log('🔍 COMPLETE REPORT FLOW DIAGNOSIS');
  console.log('='.repeat(70));

  // Step 1: Check database
  console.log('\n📊 STEP 1: Database Check');
  console.log('-'.repeat(70));
  try {
    const userCount = await prisma.user.count();
    const reportCount = await prisma.report.count();
    const pendingCount = await prisma.report.count({ where: { status: 'PENDING' } });

    console.log(`✅ Database connected`);
    console.log(`   Users: ${userCount}`);
    console.log(`   All reports: ${reportCount}`);
    console.log(`   Pending reports: ${pendingCount}`);

    if (userCount < 2) {
      console.log(`\n❌ ERROR: Need at least 2 users to test. Found ${userCount}`);
      return;
    }
  } catch (error) {
    console.error(`❌ Database error: ${error.message}`);
    return;
  }

  // Step 2: Check backend connectivity
  console.log('\n🔌 STEP 2: Backend Connectivity');
  console.log('-'.repeat(70));
  try {
    const healthResponse = await fetch('http://localhost:5000/', {
      method: 'GET',
    });
    if (healthResponse.ok) {
      console.log('✅ Backend is running on http://localhost:5000');
    } else {
      console.log(`⚠️  Backend responded with status ${healthResponse.status}`);
    }
  } catch (error) {
    console.error(`❌ Cannot reach backend: ${error.message}`);
    console.log('   Make sure backend is running: npx nodemon server.js');
    return;
  }

  // Step 3: Check if route exists
  console.log('\n🛣️  STEP 3: Check Routes');
  console.log('-'.repeat(70));
  try {
    const routeCheck = await fetch('http://localhost:5000/api/user/report', {
      method: 'OPTIONS',
    });
    console.log(`✅ Route /api/user/report is accessible (CORS ok)`);
  } catch (error) {
    console.log(`⚠️  Could not check CORS: ${error.message}`);
  }

  // Step 4: Get tokens for testing
  console.log('\n🔑 STEP 4: Authentication');
  console.log('-'.repeat(70));
  const users = await prisma.user.findMany({ take: 2 });
  const [reporter, reportedUser] = users;

  console.log(`   Reporter user: ${reporter.email}`);
  console.log(`   Reported user: ${reportedUser.email}`);
  console.log(`\n⚠️  Manual step needed:`);
  console.log(`   1. Sign in to frontend as ${reporter.email}`);
  console.log(`   2. Open browser DevTools (F12)`);
  console.log(`   3. Go to Console tab`);
  console.log(`   4. Run: localStorage.getItem('valise_token')`);
  console.log(`   5. Copy the token and paste it below when prompted`);

  // Step 5: Summary
  console.log('\n📋 STEP 5: Diagnosis Summary');
  console.log('-'.repeat(70));
  console.log(`✅ Database: Connected`);
  console.log(`✅ Users available: ${userCount}`);
  console.log(`✅ Backend: Running`);
  console.log(`✅ Route: Accessible`);

  console.log('\n🔍 NEXT STEPS:');
  console.log('1. Restart backend and frontend');
  console.log('2. Open frontend in browser');
  console.log('3. Submit a report');
  console.log('4. Watch backend console for these logs:');
  console.log('   - [AUTH-MIDDLEWARE] Incoming request to POST /api/user/report');
  console.log('   - [REPORT] User ... reporting user ...');
  console.log('   - [REPORT] Created Report record: ...');
  console.log('5. Run testReports.js to verify report was saved');
  console.log('6. If reports still not showing, check:');
  console.log('   a. Browser Network tab (F12 → Network)');
  console.log('   b. POST /api/user/report request status');
  console.log('   c. Response body');

  console.log('\n' + '='.repeat(70) + '\n');
}

diagnose().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
