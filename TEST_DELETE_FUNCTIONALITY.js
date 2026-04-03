#!/usr/bin/env node
/**
 * UNICONNECT PROJECT DELETE FIX - TEST SCRIPT
 * 
 * This script helps verify the project delete functionality is working correctly.
 * Run in browser console (F12) to test the backend URL detection and delete flow.
 */

(async function testProjectDelete() {
  console.log('🔍 UniConnect Project Delete Test Suite');
  console.log('=========================================\n');

  // Test 1: Check localStorage state
  console.log('TEST 1: Checking localStorage states');
  const storedBackend = localStorage.getItem('backendBaseUrl');
  console.log(`  Stored backend URL: ${storedBackend || '(none)'}`);
  
  if (storedBackend && storedBackend.includes('5001')) {
    console.warn('  ⚠️ WARNING: Old port 5001 detected in cache!');
    console.log('  → Run: localStorage.removeItem("backendBaseUrl"); window.location.reload();');
  } else if (storedBackend && storedBackend.includes('5008')) {
    console.log('  ✅ Correct port 5008 found!');
  } else {
    console.log('  ℹ️ No backend URL cached (will be auto-detected)');
  }

  // Test 2: Check current backend base URL
  console.log('\nTEST 2: Verifying backend detection');
  try {
    // Import-style call won't work here, so we'll test API connectivity
    const testEndpoints = [
      'http://localhost:5008/api/projects',
      'http://localhost:5007/api/projects',
      'http://localhost:5006/api/projects',
      'http://localhost:5005/api/projects',
      'http://localhost:5004/api/projects',
      'http://localhost:5003/api/projects',
      'http://localhost:5002/api/projects',
      'http://localhost:5001/api/projects',
      'http://localhost:5000/api/projects',
    ];

    let foundBackend = null;
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await fetch(endpoint, { 
          method: 'GET',
          signal: AbortSignal.timeout(1000),
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          foundBackend = endpoint;
          console.log(`  ✅ Backend found at: ${endpoint}`);
          break;
        }
      } catch (err) {
        // Timeout or connection refused - try next port
        continue;
      }
    }

    if (!foundBackend) {
      console.error('  ❌ No backend found on any port!');
      console.error('  → Make sure backend is running: npm run dev (in backend folder)');
      return;
    }
  } catch (err) {
    console.error('  ❌ Error testing backend connectivity:', err.message);
  }

  // Test 3: Check API connectivity
  console.log('\nTEST 3: Testing API connectivity');
  try {
    const response = await fetch('/api/projects', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      const projects = data.data || data.projects || [];
      console.log(`  ✅ API connected successfully`);
      console.log(`  📋 Found ${projects.length} projects`);
      
      if (projects.length > 0) {
        console.log(`  First project: ${projects[0]._id} (${projects[0].title})`);
      }
    } else {
      console.error(`  ❌ API returned status ${response.status}`);
    }
  } catch (err) {
    console.error('  ❌ API connectivity failed:', err.message);
  }

  // Test 4: Simulate delete request
  console.log('\nTEST 4: Simulating delete request');
  console.log('  (This will NOT actually delete, just test the endpoint)');
  
  try {
    // Use a fake ID to test without deleting real data
    const testId = 'test-' + Date.now();
    const response = await fetch(`/api/projects/${testId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log(`  Response status: ${response.status}`);
    const body = await response.json();
    console.log(`  Response: ${JSON.stringify(body, null, 2)}`);
    
    if (response.status === 404) {
      console.log('  ℹ️ Expected 404 for test ID (endpoint is working)');
    }
  } catch (err) {
    console.error('  ❌ Delete request failed:', err.message);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`
If all tests passed:
  ✅ Backend is running and accessible
  ✅ Frontend can communicate with backend
  ✅ Delete endpoint is responding
  
Next steps:
  1. Go to "Add Project" page
  2. Find a project in the list
  3. Click the delete (trash) icon
  4. Should see no 404 error
  5. Project should be removed from list

If tests failed:
  1. Clear localStorage: localStorage.clear(); window.location.reload();
  2. Hard refresh: Ctrl+Shift+R
  3. Check backend is running on port 5008
  4. Check browser console for errors
  `);
})();

// Alternative: Quick fix command
console.log('\n💡 Quick fix if needed:');
console.log('localStorage.removeItem("backendBaseUrl"); window.location.reload();');
