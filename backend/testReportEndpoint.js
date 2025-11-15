/**
 * Direct API testing script
 * Tests report submission and retrieval without frontend
 * Run from backend directory: node testReportEndpoint.js
 */

import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';
const API_PREFIX = '/api/v1';
const USER_API_PREFIX = '/api';

let userToken = null;
let adminToken = null;

// Helper to make authenticated requests
const apiCall = async (method, path, token, body = null) => {
  const url = `${BASE_URL}${path}`;
  console.log(`\n📤 ${method} ${path}`);
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
    console.log(`   Body: ${JSON.stringify(body)}`);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
    
    return { status: response.status, data };
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { status: 0, data: { error: error.message } };
  }
};

// Test flow
const runTests = async () => {
  console.log('🧪 Report Endpoint Testing\n');
  console.log(`Base URL: ${BASE_URL}`);

  // Step 1: Create test users (you need actual user IDs from your DB)
  console.log('\n=== Step 1: Getting test user tokens ===');
  console.log('⚠️  You need to manually provide valid tokens for testing.');
  console.log('   Tokens should be from: ');
  console.log('   - A regular user (for reporting)');
  console.log('   - An admin user (for viewing moderation queue)');
  
  // For now, we'll ask you to set them manually
  userToken = process.env.TEST_USER_TOKEN;
  adminToken = process.env.TEST_ADMIN_TOKEN;

  if (!userToken) {
    console.log('\n❌ Missing TEST_USER_TOKEN environment variable');
    console.log('   Set it and try again: TEST_USER_TOKEN=your_token node testReportEndpoint.js');
    process.exit(1);
  }

  if (!adminToken) {
    console.log('\n❌ Missing TEST_ADMIN_TOKEN environment variable');
    console.log('   Set it and try again: TEST_ADMIN_TOKEN=your_token node testReportEndpoint.js');
    process.exit(1);
  }

  console.log('\n✓ Tokens loaded from environment');

  // Step 2: Get list of users to report
  console.log('\n=== Step 2: Fetching user list (to get IDs for testing) ===');
  // This endpoint might not exist, just showing the structure
  
  // For testing, we'll use a hardcoded user ID (you should change this)
  const testReportedUserId = process.env.TEST_REPORTED_USER_ID || '123e4567-e89b-12d3-a456-426614174000';
  
  console.log(`   Using test user ID: ${testReportedUserId}`);

  // Step 3: Submit a report
  console.log('\n=== Step 3: Submitting a report ===');
  const reportResult = await apiCall('POST', `${USER_API_PREFIX}/user/report`, userToken, {
    reportedUserId: testReportedUserId,
    reason: 'Test report from automated script - ' + new Date().toISOString(),
  });

  if (reportResult.status !== 201 && reportResult.status !== 200) {
    console.error('\n❌ Report submission failed');
    console.log('\n📋 Troubleshooting:');
    console.log('   - Check if token is valid');
    console.log('   - Check if backend is running');
    console.log('   - Check if user exists');
    process.exit(1);
  }

  console.log('✓ Report submitted successfully');

  // Step 4: Wait a moment and fetch moderation queue
  console.log('\n=== Step 4: Fetching moderation queue ===');
  console.log('   Waiting 1 second for database sync...');
  await new Promise(r => setTimeout(r, 1000));

  const queueResult = await apiCall('GET', `${API_PREFIX}/admin/moderation`, adminToken);

  if (queueResult.status !== 200) {
    console.error('\n❌ Moderation queue fetch failed');
    console.log('\n📋 Troubleshooting:');
    console.log('   - Check if admin token is valid');
    console.log('   - Check if user has admin privileges');
    process.exit(1);
  }

  console.log('✓ Moderation queue fetched successfully');

  // Step 5: Verify report appears in queue
  console.log('\n=== Step 5: Verifying report appears ===');
  const queue = queueResult.data.queue || [];
  const reportFound = queue.some(r => r.reportedUserId === testReportedUserId);

  if (reportFound) {
    console.log('✅ SUCCESS: Report appears in moderation queue!');
  } else {
    console.log('❌ FAILURE: Report was submitted but does not appear in moderation queue');
    console.log(`\n   Submitted report for: ${testReportedUserId}`);
    console.log(`   Queue length: ${queue.length}`);
    if (queue.length > 0) {
      console.log(`   Queue contains:`, queue.map(r => r.reportedUserId));
    }
  }

  // Summary
  console.log('\n=== Test Summary ===');
  console.log(`Report submission: ${reportResult.status === 200 || reportResult.status === 201 ? '✓' : '✗'}`);
  console.log(`Queue fetch: ${queueResult.status === 200 ? '✓' : '✗'}`);
  console.log(`Report visible: ${reportFound ? '✓' : '✗'}`);
};

// Run tests
runTests().catch(console.error);
