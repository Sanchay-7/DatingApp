/**
 * Frontend Test Report Helper
 * Add this to browser console after signing in to a user account
 * This helps verify the report submission flow works
 */

window.testReportSubmission = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 FRONTEND REPORT TEST');
  console.log('='.repeat(60));

  // Step 1: Check token
  console.log('\n📋 Step 1: Checking authentication...');
  const token = localStorage.getItem('valise_token');
  if (!token) {
    console.error('❌ No token found in localStorage');
    console.log('   → You must sign in first');
    return;
  }
  console.log('✓ Token found in localStorage');
  console.log(`  Token (first 30 chars): ${token.substring(0, 30)}...`);

  // Step 2: Prepare test data
  console.log('\n📋 Step 2: Preparing test data...');
  const testReportData = {
    reportedUserId: 'test-user-' + Date.now(),
    reason: 'Test report from browser - ' + new Date().toLocaleString(),
  };
  console.log('✓ Test data prepared:');
  console.log(`  User ID: ${testReportData.reportedUserId}`);
  console.log(`  Reason: ${testReportData.reason}`);

  // Step 3: Make API call
  console.log('\n📋 Step 3: Submitting report to API...');
  try {
    const response = await fetch('/api/user/report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(testReportData),
    });

    const data = await response.json();

    console.log(`✓ API responded with status: ${response.status}`);
    console.log('  Response:', data);

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Report submitted successfully!');
      
      // Step 4: Verify in database
      console.log('\n📋 Step 4: Checking database (requires backend terminal)...');
      console.log('   Run this in backend terminal:');
      console.log('   node testReports.js');
      console.log('   ↳ Look for a report with reason containing "Test report"');
      
      // Step 5: Check admin page
      console.log('\n📋 Step 5: Checking admin moderation page...');
      console.log('   1. Open new incognito window');
      console.log('   2. Go to http://localhost:3000/admin/moderation');
      console.log('   3. Sign in as admin');
      console.log('   4. Look for the report in the list');
      console.log('   5. Check browser Network tab for GET request');
      
    } else {
      console.error('❌ API returned error status');
      console.log('   Check your auth token and try again');
    }
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    console.log('   Check if API endpoint is correct: /api/user/report');
  }

  console.log('\n' + '='.repeat(60));
  console.log('📝 NEXT: Monitor backend terminal for [REPORT] logs');
  console.log('='.repeat(60) + '\n');
};

// Also create a helper for admin page testing
window.testAdminFetch = async () => {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 ADMIN MODERATION PAGE TEST');
  console.log('='.repeat(60));

  console.log('\n📋 Checking admin authentication...');
  const adminToken = localStorage.getItem('admin_token');
  if (!adminToken) {
    console.error('❌ No admin token found');
    console.log('   → You must sign in as admin first');
    return;
  }
  console.log('✓ Admin token found');

  console.log('\n📋 Fetching moderation queue...');
  try {
    const response = await fetch('/api/v1/admin/moderation', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();
    console.log(`✓ API responded with status: ${response.status}`);
    console.log(`✓ Found ${data.queue?.length || 0} reports`);

    if (data.queue && data.queue.length > 0) {
      console.log('\n📋 Reports found:');
      data.queue.forEach((report, index) => {
        console.log(`  ${index + 1}. ID: ${report.id}`);
        console.log(`     Reason: ${report.reason}`);
        console.log(`     Reported: ${report.reportedUser?.name || 'Unknown'}`);
        console.log(`     Reporter: ${report.reporter?.name || 'Unknown'}`);
      });
    } else {
      console.log('⚠️  No reports in moderation queue');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');
};

// Display help
console.log('\n' + '='.repeat(60));
console.log('✅ Test helpers loaded! Use these commands:');
console.log('\n  testReportSubmission()');
console.log('  └─ Tests user report submission flow\n');
console.log('  testAdminFetch()');
console.log('  └─ Tests admin moderation queue fetch\n');
console.log('='.repeat(60));
