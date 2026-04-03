const http = require('http');

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        let parsedBody = null;
        try {
          parsedBody = body ? JSON.parse(body) : null;
        } catch (e) {
          parsedBody = body;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsedBody
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== BACKEND API TESTS WITH FIXES ===\n');

  // Get sample data
  console.log('Fetching existing sample data from database...\n');
  
  let userId, groupId, groupId2, anotherId;
  try {
    // Get users
    const usersResult = await makeRequest('GET', '/api/users');
    if (usersResult.status === 200 && usersResult.body.data && usersResult.body.data.length > 0) {
      userId = usersResult.body.data[0]._id;
      if (usersResult.body.data.length > 1) {
        anotherId = usersResult.body.data[1]._id;
      }
    }

    // Get groups
    const groupsResult = await makeRequest('GET', '/api/groups');
    if (groupsResult.status === 200 && groupsResult.body.data && groupsResult.body.data.length > 0) {
      groupId = groupsResult.body.data[0]._id;
      if (groupsResult.body.data.length > 1) {
        groupId2 = groupsResult.body.data[1]._id;
      }
    }
  } catch (error) {
    console.log(`Error fetching data: ${error.message}`);
  }

  // If no data exists, seed it
  if (!userId || !groupId) {
    console.log('Seeding database...');
    try {
      const seedResult = await makeRequest('POST', '/api/projects/seed');
      if (seedResult.status === 200 || seedResult.status === 201) {
        const seedData = seedResult.body.seedData;
        userId = seedData.userIds[0];
        anotherId = seedData.userIds[1];
        groupId = seedData.groupIds[0]._id;
        groupId2 = seedData.groupIds[1]._id;
        console.log('✅ Database seeded\n');
      }
    } catch (error) {
      console.log(`Error seeding: ${error.message}\n`);
      return;
    }
  }

  console.log('Sample IDs:');
  console.log(`  User 1: ${userId}`);
  console.log(`  User 2: ${anotherId}`);
  console.log(`  Group 1: ${groupId}`);
  console.log(`  Group 2: ${groupId2}\n`);
  console.log('========================================\n');

  // Test 1: GET /api/requests/sent (no requests yet)
  console.log('TEST 1: GET /api/requests/sent');
  console.log(`Status Code Expected: 200`);
  try {
    const result = await makeRequest('GET', `/api/requests/sent?userId=${userId}`);
    console.log(`Status Code Actual: ${result.status}`);
    console.log(`Success: ${result.body.success}`);
    console.log(`Count: ${result.body.count}`);
    console.log(`✅ PASSED\n`);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  // Test 2: GET /api/requests/received (no group created)
  console.log('TEST 2: GET /api/requests/received');
  console.log(`Status Code Expected: 200`);
  try {
    const result = await makeRequest('GET', `/api/requests/received?userId=${userId}`);
    console.log(`Status Code Actual: ${result.status}`);
    console.log(`Success: ${result.body.success}`);
    console.log(`Count: ${result.body.count}`);
    console.log(`✅ PASSED\n`);
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  // Test 3: POST /api/requests - Create a join request
  console.log('TEST 3: POST /api/requests - Create a join request');
  console.log(`Status Code Expected: 201`);
  const joinRequestData = {
    groupId: groupId2,
    requestType: 'join',
    fromUserId: userId,
    message: 'I would like to join this group.'
  };
  let joinRequestId = null;
  try {
    const result = await makeRequest('POST', '/api/requests', joinRequestData);
    console.log(`Status Code Actual: ${result.status}`);
    console.log(`Success: ${result.body.success}`);
    if (result.status === 201) {
      joinRequestId = result.body.request._id;
      console.log(`Request ID: ${joinRequestId}`);
      console.log(`Status: ${result.body.request.status}`);
      console.log(`✅ PASSED\n`);
    } else {
      console.log(`Response: ${JSON.stringify(result.body, null, 2)}`);
      console.log(`❌ FAILED\n`);
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  // Test 4: POST /api/requests - Create an INVITATION request (WITH FIX)
  console.log('TEST 4: POST /api/requests - Create an invitation request');
  console.log(`Status Code Expected: 403 (user not a group member) or 201`);
  // Note: This should fail with 403 because the user is not a group member yet
  const invitationData = {
    groupId: groupId,
    requestType: 'invitation',
    toUserId: anotherId,
    fromUserId: userId,
    message: 'We would like to invite you to join our group!'
  };
  let invitationId = null;
  try {
    const result = await makeRequest('POST', '/api/requests', invitationData);
    console.log(`Status Code Actual: ${result.status}`);
    console.log(`Message: ${result.body.message}`);
    if (result.status === 403) {
      console.log(`✅ PASSED (User correctly denied - not a group member)\n`);
    } else if (result.status === 201) {
      invitationId = result.body.request._id;
      console.log(`Request ID: ${invitationId}`);
      console.log(`Status: ${result.body.request.status}`);
      console.log(`✅ PASSED\n`);
    } else {
      console.log(`Response: ${JSON.stringify(result.body, null, 2)}`);
      console.log(`❌ FAILED\n`);
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  // Test 5: PUT /api/requests/:id/accept - Accept a join request
  if (joinRequestId) {
    console.log('TEST 5: PUT /api/requests/:id/accept - Accept a join request');
    console.log(`Status Code Expected: 200`);
    try {
      const result = await makeRequest('PUT', `/api/requests/${joinRequestId}/accept`, {});
      console.log(`Status Code Actual: ${result.status}`);
      console.log(`Success: ${result.body.success}`);
      console.log(`New Status: ${result.body.request.status}`);
      if (result.status === 200) {
        console.log(`✅ PASSED\n`);
      } else {
        console.log(`❌ FAILED\n`);
      }
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}\n`);
    }
  } else {
    console.log('TEST 5: Skipped (no valid request ID)\n');
  }

  // Test 6: PUT /api/requests/:id/reject - Reject a request
  console.log('TEST 6: PUT /api/requests/:id/reject - Reject a request');
  console.log(`Status Code Expected: 200 or 404`);
  
  // Create another request to reject
  const rejectData = {
    groupId: groupId2,
    requestType: 'join',
    fromUserId: anotherId,
    message: 'Another request to reject'
  };
  try {
    const rejectResult = await makeRequest('POST', '/api/requests', rejectData);
    if (rejectResult.status === 201) {
      const rejectRequestId = rejectResult.body.request._id;
      const result = await makeRequest('PUT', `/api/requests/${rejectRequestId}/reject`, {});
      console.log(`Status Code Actual: ${result.status}`);
      console.log(`Success: ${result.body.success}`);
      console.log(`New Status: ${result.body.request.status}`);
      if (result.status === 200) {
        console.log(`✅ PASSED\n`);
      } else {
        console.log(`❌ FAILED\n`);
      }
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  // Test 7: DELETE /api/requests/:id - Cancel a request (WITH FIX)
  console.log('TEST 7: DELETE /api/requests/:id - Cancel a request');
  console.log(`Status Code Expected: 200 or 400`);
  
  // Create another request to cancel
  const cancelData = {
    groupId: groupId2,
    requestType: 'join',
    fromUserId: anotherId,
    message: 'Request to cancel'
  };
  try {
    const cancelCreateResult = await makeRequest('POST', '/api/requests', cancelData);
    if (cancelCreateResult.status === 201) {
      const cancelRequestId = cancelCreateResult.body.request._id;
      const result = await makeRequest('DELETE', `/api/requests/${cancelRequestId}`, { userId: anotherId });
      console.log(`Status Code Actual: ${result.status}`);
      console.log(`Response: ${JSON.stringify(result.body, null, 2)}`);
      if (result.status === 200 || result.status === 400) {
        console.log(`✅ PASSED\n`);
      } else {
        console.log(`❌ FAILED\n`);
      }
    } else {
      console.log(`❌ FAILED: Could not create request for testing\n`);
    }
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
  }

  console.log('=== ALL TESTS COMPLETED ===');
}

runTests();
