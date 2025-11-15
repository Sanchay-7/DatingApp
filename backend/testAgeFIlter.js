// Quick test to verify age filtering works
import { authFetch } from '../frontend/src/lib/apiClient.js';
import fetch from 'node-fetch';

async function testAgeFilter() {
    // This is a mock test - you'll need to run the real one in the browser
    console.log('Age filtering test - check browser console for actual logs');
    console.log('');
    console.log('Expected flow:');
    console.log('1. Settings page saves: { settings: { minAge: 20, maxAge: 30 } }');
    console.log('2. Dashboard loads and calls /api/user/settings');
    console.log('3. Dashboard receives settings with minAge and maxAge');
    console.log('4. Profiles are filtered based on age');
    console.log('');
    console.log('To debug:');
    console.log('1. Open Settings > Set age range (e.g., 20-30)');
    console.log('2. Save settings');
    console.log('3. Go to Dashboard');
    console.log('4. Open browser console (F12)');
    console.log('5. Look for [DASHBOARD] and [FILTER] logs');
}

testAgeFilter();
