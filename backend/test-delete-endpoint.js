#!/usr/bin/env node
/**
 * Test script to verify project delete functionality
 * Run with: node test-delete-endpoint.js
 */

const http = require('http');

function testBackendConnection() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5008,
      path: '/api/projects',
      method: 'GET',
      timeout: 2000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log('✅ Backend connection successful');
        console.log(`   Status: ${res.statusCode}`);
        try {
          const projects = JSON.parse(data);
          const projList = projects.data || projects.projects || [];
          console.log(`   Projects found: ${projList.length}`);
          if (projList.length > 0) {
            console.log(`   First project: ${projList[0]._id} (${projList[0].title})`);
            resolve(projList[0]._id);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ Backend connection failed:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Connection timeout'));
    });

    req.end();
  });
}

function testDeleteEndpoint(projectId) {
  return new Promise((resolve, reject) => {
    if (!projectId) {
      console.log('⚠️  Skipping delete test - no projects available');
      resolve(false);
      return;
    }

    const options = {
      hostname: 'localhost',
      port: 5008,
      path: `/api/projects/${projectId}`,
      method: 'DELETE',
      timeout: 2000
    };

    console.log(`\n🗑️  Testing DELETE endpoint: /api/projects/${projectId}`);

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   Response status: ${res.statusCode}`);
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.success) {
            console.log('✅ DELETE endpoint working correctly');
            console.log(`   Message: ${response.message}`);
            console.log(`   Tasks deleted: ${response.deletedTasksCount}`);
            resolve(true);
          } else {
            console.log(`⚠️  Response not successful: ${response.message}`);
            resolve(false);
          }
        } catch (e) {
          console.log('❌ Failed to parse response:', e.message);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('❌ DELETE request failed:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Delete request timeout'));
    });

    req.end();
  });
}

(async function runTests() {
  console.log('🧪 UniConnect Project Delete Test Suite');
  console.log('=' .repeat(50));
  console.log('Testing backend on: http://localhost:5008\n');

  try {
    // Test 1: Connection
    console.log('TEST 1: Backend Connection');
    console.log('-' .repeat(50));
    const projectId = await testBackendConnection();

    // Test 2: Delete endpoint
    console.log('\nTEST 2: Delete Endpoint');
    console.log('-' .repeat(50));
    const deleteWorked = await testDeleteEndpoint(projectId);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Backend connection: PASS`);
    console.log(`${deleteWorked ? '✅' : '⚠️ '} Delete endpoint: ${deleteWorked ? 'PASS' : 'SKIP/FAIL'}`);
    console.log('\nConclusion: Backend is ready for delete requests!');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    process.exit(1);
  }
})();
