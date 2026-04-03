const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function seedData() {
  try {
    console.log('Starting seed process...');
    
    // Call the seed endpoint
    const response = await axios.post(`${API_URL}/projects/seed`);
    console.log('✅ Seed successful!');
    console.log('Created data:', response.data.seedData);
    
    // Now create some join requests and invitations
    console.log('\nCreating sample requests and invitations...');
    
    const userData = response.data.seedData;
    if (userData && userData.userIds && userData.groupIds) {
      const userId = userData.userIds[4]; // Eve Martinez
      const groupId = userData.groupIds[0]._id; // Web App Development Team
      const groupId2 = userData.groupIds[1]._id; // Mobile App Project
      
      // Create join requests
      try {
        const req1 = await axios.post(`${API_URL}/requests`, {
          userId,
          groupId: groupId2
        });
        console.log('✅ Created join request');
      } catch (err) {
        console.log('Note: Request may already exist');
      }
      
      // Create an invitation
      try {
        const inv = await axios.post(`${API_URL}/invitations`, {
          studentId: userId,
          groupId,
          message: 'We think you would be a great fit for our Web App team!'
        });
        console.log('✅ Created invitation');
      } catch (err) {
        console.log('Note: Invitation may already exist');
      }
      
      console.log('\n📊 Sample IDs for testing:');
      console.log(`   User ID: ${userId}`);
      console.log(`   Group ID: ${groupId}`);
      console.log(`   Use these IDs in the Smart Request & Invitation Hub`);
    }
    
  } catch (error) {
    console.error('❌ Seed failed:', error.response?.data || error.message);
  }
}

seedData();
