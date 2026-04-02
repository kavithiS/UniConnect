# SmartHub Setup Guide

## Quick Start - Populate Database with Sample Data

The Smart Request & Invitation Hub needs sample data to demonstrate features. Follow these steps:

### Option 1: Using Browser Console (Recommended)

1. Open the app in your browser: `http://localhost:3000` (or your frontend port)
2. Open Developer Tools (F12 or right-click → Inspect)
3. Go to the **Console** tab
4. Paste and run this command:

```javascript
fetch('http://localhost:5000/api/users/seed/sample')
  .then(r => r.json())
  .then(d => {
    console.log('✅ Seed Success!', d);
    if (d.testData) {
      console.log('📋 Test Data:');
      console.log('   Student User ID:', d.testData.sampleUserId);
      console.log('   Group ID:', d.testData.sampleGroupId);
      alert('✅ Sample data created! Check console for test IDs');
    }
  })
  .catch(e => console.error('❌ Seed Failed:', e));
```

5. You'll see success confirmation in the console
6. Copy the **Student User ID** from the console output
7. Go to the Smart Request & Invitation Hub page
8. Paste the User ID and click the input field
9. You should now see "Recommended Groups", "My Join Requests", and "My Invitations" populated with sample data

### Option 2: Command Line

From the project root, run:

```bash
node -e "fetch('http://localhost:5000/api/users/seed/sample').then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2)))"
```

### Option 3: Using cURL

```bash
curl http://localhost:5000/api/users/seed/sample
```

---

## What Sample Data Gets Created?

The seed endpoint creates:

- **5 Sample Users:**
  - Alice Johnson (Leader) - React, Node.js, PostgreSQL
  - Bob Smith (Developer) - React, Vue.js, JavaScript  
  - Charlie Davis (Designer) - Figma, UI/UX
  - Diana Wilson (Developer) - Java, Spring Boot
  - **Eve Martinez** (Student) - React, HTML/CSS ← Use this for testing!





































































**That's it!** 🎉 Your Smart Request & Invitation Hub should now be fully functional with sample data.
---- `GET /api/invitations/group/:groupId` - Get group's sent invitations- `GET /api/invitations/student/:studentId` - Get student's invitations- `GET /api/requests/group/:groupId` - Get group's requests- `GET /api/requests/student/:userId` - Get student's requests- `GET /api/recommend/users/:groupId` - Get recommendations for leader- `GET /api/recommend/groups/:userId` - Get recommendations for student
- `GET /api/users/seed/sample` - Create sample data## API Endpoints
---- Port 5000 should be free- MongoDB should be connected (check backend console logs)- Check that backend is running: `npm start` in backend folder
### Backend not responding?- The ID should look like: `507f1f77bcf86cd799439011`- Paste directly without extra spaces- Make sure you copied the full User ID
### "User not found" error?- Check that you're using the correct User ID from console output- Try refreshing the page (Ctrl+R)- Ensure backend is running on port 5000- Check browser console for errors (F12)
### "No data" shown even after seeding?## Troubleshooting
---- ✅ Request expiration (30 days)- ✅ Auto-closure when group is full- ✅ Leader mode: review and accept join requests- ✅ Match score calculations (%)- ✅ See skill gap analysis and recommendations- ✅ Accept/decline invitations- ✅ Send join requests with automatic skill analysis
- ✅ View AI-powered group recommendations## Features to Test---   - ✅ Send Invitations to top matches   - ✅ Join Requests from students like Eve   - ✅ Recommended Users with skill matching3. See:2. Enter Group ID in leader mode search1. Copy **Web App Development Team's Group ID** from console### Leader Mode Test     - ✅ My Invitations when groups invite Eve   - ✅ My Join Requests showing pending requests   - ✅ Recommended Groups with AI matching scores3. See:2. Paste into "Paste your User ID here" field1. Copy **Eve Martinez's User ID** from console### Student Mode Test## Testing the Features
---  - Bob's request to Mobile App (33% match - needs React Native)  - Eve's request to Web App Team (66% match - needs Node.js)
- **2 Sample Requests:**  - Backend Optimization Group (4 slots) - Needs: Java, Spring Boot  - UI/UX Design Squad (3 slots) - Needs: Figma, UI/UX  - Mobile App Project (4 slots) - Needs: React Native, JavaScript  - Web App Development Team (5 slots) - Needs: React, Node.js, REST APIs- **4 Sample Groups:**