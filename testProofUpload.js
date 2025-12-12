#!/usr/bin/env node

/**
 * Test script to verify manual proof upload endpoint
 * Run: node testProofUpload.js <YOUR_JWT_TOKEN>
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const JWT_TOKEN = process.argv[2];
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

if (!JWT_TOKEN) {
  console.error('❌ Usage: node testProofUpload.js <JWT_TOKEN>');
  console.error('Get JWT token from: POST /api/auth/login with { email, password }');
  process.exit(1);
}

console.log('🧪 Testing Manual Proof Upload...');
console.log(`📍 API: ${API_BASE_URL}`);
console.log(`🔐 Token: ${JWT_TOKEN.substring(0, 20)}...`);

async function testWithoutFile() {
  console.log('\n📝 Test 1: Upload WITHOUT file (should create NONE status)');
  
  const formData = new FormData();
  formData.append('amount', '49');
  formData.append('subscriptionTier', 'PREMIUM');

  try {
    const response = await fetch(`${API_BASE_URL}/api/payment/manual/proof`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Failed (${response.status}):`, data);
      return false;
    }

    console.log('✅ Success:', {
      orderId: data.orderId,
      status: data.status,
      proofStatus: data.payment?.proofStatus,
    });
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  }
}

async function testWithFile() {
  console.log('\n📷 Test 2: Upload WITH file (should create PENDING status)');

  // Create a test image file (1x1 red pixel PNG)
  const testImagePath = path.join(process.cwd(), 'test-image.png');
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG signature
    0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
    0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
    0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, // IDAT chunk
    0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x3b, 0x6e, 0x6b,
    0xd3, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, // IEND chunk
    0x44, 0xae, 0x42, 0x60,
  ]);

  fs.writeFileSync(testImagePath, pngBuffer);

  try {
    const formData = new FormData();
    formData.append('proof', fs.createReadStream(testImagePath), 'test-image.png');
    formData.append('amount', '49');
    formData.append('subscriptionTier', 'PREMIUM');

    const response = await fetch(`${API_BASE_URL}/api/payment/manual/proof`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${JWT_TOKEN}`,
      },
      body: formData,
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error(`❌ Failed (${response.status}):`, data);
      return false;
    }

    console.log('✅ Success:', {
      orderId: data.orderId,
      status: data.status,
      proofStatus: data.payment?.proofStatus,
      proofUrl: data.proofUrl,
    });
    return true;
  } catch (err) {
    console.error('❌ Error:', err.message);
    return false;
  } finally {
    // Cleanup
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }
  }
}

async function run() {
  const test1 = await testWithoutFile();
  const test2 = await testWithFile();

  console.log('\n📊 Summary:');
  console.log(`  Without file: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  With file:    ${test2 ? '✅ PASS' : '❌ FAIL'}`);

  if (test1 && test2) {
    console.log('\n✨ All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Some tests failed. Check the error messages above.');
    process.exit(1);
  }
}

run();
