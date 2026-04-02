# Quick Start Implementation Guide

## PHASE 1: DATABASE SETUP (Estimated: 30 minutes)

### Step 1: Create MongoDB Collections

```bash
# Connect to MongoDB
mongosh

# Run setup script from BACKEND_IMPLEMENTATION.md
# Copy and paste the MongoDB setup script to create collections and indexes
```

### Step 2: Verify Collections

```javascript
// Verify collections created
db.getCollectionNames();
// Output should include: users, groups, requests

// Verify indexes
db.requests.getIndexes();
```

---

## PHASE 2: BACKEND SETUP (Estimated: 1-2 hours)

### Step 1: Create Models Directory

```bash
cd backend
mkdir -p models routes controllers middleware
```

### Step 2: Create Model Files

**Create `backend/models/User.js`**
- Copy code from BACKEND_IMPLEMENTATION.md → User.js section
- Install bcryptjs: `npm install bcryptjs`

**Create `backend/models/Group.js`**
- Copy code from BACKEND_IMPLEMENTATION.md → Group.js section

**Create `backend/models/Request.js`**
- Copy code from BACKEND_IMPLEMENTATION.md → Request.js section

### Step 3: Create Controller

**Create `backend/controllers/requestController.js`**
- Copy complete controller code from BACKEND_IMPLEMENTATION.md
- This handles all 7 request operations

### Step 4: Create Routes

**Create `backend/routes/requestRoutes.js`**
- Copy route definitions from BACKEND_IMPLEMENTATION.md
- Import requestRoutes in main Express app

**Add to `backend/index.js` or main Express file:**
```javascript
const requestRoutes = require('./routes/requestRoutes');
app.use('/api/requests', requestRoutes);
```

### Step 5: Add Authentication Middleware

**Create `backend/middleware/auth.js`** (if not exists)
```javascript
const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Step 6: Setup Cron Job (Optional)

**Add to `backend/index.js`:**
```bash
npm install node-cron
```

Then add:
```javascript
const cron = require('node-cron');
const Request = require('./models/Request');

// Run at 2 AM daily
cron.schedule('0 2 * * *', async () => {
  try {
    const result = await Request.expireOldRequests();
    console.log(`[CRON] Auto-expired ${result.modifiedCount} requests`);
  } catch (err) {
    console.error('[CRON] Error:', err);
  }
});
```

### Step 7: Test Backend Endpoints

```bash
# Start backend server
npm run dev

# Test with Postman/Insomnia:

# 1. Create group (POST /api/groups)
{
  "title": "Test Group",
  "description": "Testing",
  "requiredSkills": ["React", "Node.js"],
  "memberLimit": 5
}

# 2. Send request (POST /api/requests)
{
  "groupId": "<GROUP_ID>",
  "requestType": "join",
  "message": "I want to join!"
}

# 3. Get received requests (GET /api/requests/received)

# 4. Accept request (PUT /api/requests/<REQUEST_ID>/accept)
```

---

## PHASE 3: FRONTEND SETUP (Estimated: 2-3 hours)

### Step 1: Create Folder Structure

```bash
cd frontend/src
mkdir -p hooks services utils

# Create component folders
mkdir -p components/groups
mkdir -p components/requests
mkdir -p components/profile
mkdir -p components/common
mkdir -p pages
mkdir -p context
```

### Step 2: Create Hooks

**Create `frontend/src/hooks/useRequests.js`**
- Copy from FRONTEND_IMPLEMENTATION.md

**Create `frontend/src/hooks/useGroups.js`**
- Copy from FRONTEND_IMPLEMENTATION.md

**Create `frontend/src/hooks/useSkillMatch.js`**
- Copy from FRONTEND_IMPLEMENTATION.md

**Create `frontend/src/hooks/useAuth.js`** (if not exists)
```javascript
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### Step 3: Create Services

**Create `frontend/src/services/api.js`** (if not exists)
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**Create `frontend/src/services/requestApi.js`**
- Copy from FRONTEND_IMPLEMENTATION.md

**Create `frontend/src/services/groupApi.js`**
- Copy from FRONTEND_IMPLEMENTATION.md

### Step 4: Create Components

**Groups Components:**
- `components/groups/GroupsList.jsx` - From FRONTEND_IMPLEMENTATION.md
- `components/groups/GroupCard.jsx` - From FRONTEND_IMPLEMENTATION.md
- `components/groups/GroupDetails.jsx` - Still needed (create basic)
- `components/groups/CreateGroupModal.jsx` - Still needed if not exists

**Request Components:**
- `components/requests/ReceivedRequests.jsx` - From FRONTEND_IMPLEMENTATION.md
- `components/requests/SentRequests.jsx` - From FRONTEND_IMPLEMENTATION.md
- `components/requests/RequestCard.jsx` - From FRONTEND_IMPLEMENTATION.md
- `components/requests/JoinRequestForm.jsx` - From FRONTEND_IMPLEMENTATION.md

### Step 5: Create Pages

**Create `frontend/src/pages/GroupsPage.jsx`**
```javascript
import GroupsList from '../components/groups/GroupsList';

export default function GroupsPage() {
  return <GroupsList />;
}
```

**Create `frontend/src/pages/RequestsPage.jsx`**
```javascript
import React, { useState } from 'react';
import ReceivedRequests from '../components/requests/ReceivedRequests';
import SentRequests from '../components/requests/SentRequests';

export default function RequestsPage() {
  const [tab, setTab] = useState('received');

  return (
    <div>
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setTab('received')}
          className={`px-6 py-3 ${tab === 'received' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Received Requests
        </button>
        <button
          onClick={() => setTab('sent')}
          className={`px-6 py-3 ${tab === 'sent' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
        >
          Sent Requests
        </button>
      </div>
      {tab === 'received' && <ReceivedRequests />}
      {tab === 'sent' && <SentRequests />}
    </div>
  );
}
```

### Step 6: Update App.jsx with Routes

```javascript
import { Routes, Route } from 'react-router-dom';
import GroupsList from './components/groups/GroupsList';
import GroupDetails from './components/groups/GroupDetails';
import JoinRequestForm from './components/requests/JoinRequestForm';
import RequestsPage from './pages/RequestsPage';

function App() {
  return (
    <Routes>
      {/* Groups */}
      <Route path="/groups" element={<GroupsList />} />
      <Route path="/groups/:id" element={<GroupDetails />} />
      <Route path="/groups/:id/request" element={<JoinRequestForm />} />

      {/* Requests */}
      <Route path="/requests" element={<RequestsPage />} />
    </Routes>
  );
}

export default App;
```

### Step 7: Install Dependencies

```bash
cd frontend
npm install axios
```

### Step 8: Test Frontend

```bash
npm run dev
# Navigate to http://localhost:5173/groups
```

---

## PHASE 4: INTEGRATION TESTING (Estimated: 1-2 hours)

### Test Scenario 1: Basic Join Request

```
1. User A: Create a group "React Team"
   - Required Skills: React, Node.js
   - Member Limit: 5

2. User B: View groups → See "React Team"
   - Skill Match: 80% (has React, not Node.js)

3. User B: Send join request
   - System: Create request, calculate match, send notification

4. User A: Check received requests
   - See User B's request with match score

5. User A: Accept request
   - User B added to group
   - Group members: 2/5
   - Request marked "accepted"
```

### Test Scenario 2: Duplicate Prevention

```
1. User B: Already sent request to React Team
2. User B: Try to send another request to same group
   - System: Show error "You already have a pending request"
   - Status: 400 Bad Request
```

### Test Scenario 3: Group Full

```
1. Group has memberLimit: 2, current members: 2/2
2. User C: Try to send join request
   - System: Show error "Group has reached member limit"
3. User A: Check received requests
   - All pending requests show as "rejected"
```

### Test Scenario 4: Request Expiration

```
1. User B: Send request to Group
2. Wait 30 days (or manually update DB)
3. Run cron job: POST /api/requests/job/expire
4. Request status changes to "expired"
```

### Test Scenario 5: Accept → Cancel Others

```
1. User B: Send request to React Team (pending)
2. User C: Send another request to React Team (pending)
3. User A: Accept User B's request
   - User B added to group
   - User C's request to same group: cancelled
   - User C gets notification
```

---

## COMMON ISSUES & SOLUTIONS

### Issue: "Cannot send duplicate request"
**Cause:** Index on (from, groupId) unique constraint
**Solution:** Ensure status='pending' in request; check DB for existing pending request

### Issue: "next is not a function"
**Cause:** Using `next()` callback in async/await pre-save hook
**Solution:** Remove `next` parameter and callback; return promise automatically

### Issue: Skill match showing 0% or wrong percentage
**Cause:** Case sensitivity in skill comparison
**Solution:** Use `.toLowerCase()` on both arrays before comparing

### Issue: Group members not updating after acceptance
**Cause:** addMember() method not awaited or not saving
**Solution:** Ensure `await this.save()` after `this.members.push(userId)`

### Issue: CORS errors
**Cause:** Backend and frontend on different origins
**Solution:** Add CORS middleware:
```javascript
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:5173' }));
```

---

## FILE CHECKLIST

### Backend Files Created
- [ ] `models/User.js`
- [ ] `models/Group.js`
- [ ] `models/Request.js`
- [ ] `controllers/requestController.js`
- [ ] `routes/requestRoutes.js`
- [ ] `middleware/auth.js` (may already exist)

### Frontend Files Created
- [ ] `hooks/useRequests.js`
- [ ] `hooks/useGroups.js`
- [ ] `hooks/useSkillMatch.js`
- [ ] `hooks/useAuth.js` (may already exist)
- [ ] `services/api.js` (may already exist)
- [ ] `services/requestApi.js`
- [ ] `services/groupApi.js`
- [ ] `components/groups/GroupsList.jsx`
- [ ] `components/groups/GroupCard.jsx`
- [ ] `components/groups/GroupDetails.jsx`
- [ ] `components/requests/ReceivedRequests.jsx`
- [ ] `components/requests/SentRequests.jsx`
- [ ] `components/requests/RequestCard.jsx`
- [ ] `components/requests/JoinRequestForm.jsx`
- [ ] `pages/GroupsPage.jsx`
- [ ] `pages/RequestsPage.jsx`

### Configuration Updates
- [ ] `backend/index.js` - Add requestRoutes
- [ ] `backend/index.js` - Add cron schedule (optional)
- [ ] `frontend/src/App.jsx` - Add routes
- [ ] `.env` - Add JWT_SECRET if not set
- [ ] `.env` - Add MONGODB_URI if not set

---

## DEPLOYMENT COMMANDS

### Backend Deployment
```bash
cd backend

# Install dependencies
npm install

# Set environment variables
export MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/uniconnect"
export JWT_SECRET="your_secret_key"
export NODE_ENV="production"

# Start server
npm run start
# Server runs on port 5000
```

### Frontend Deployment
```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy dist/ folder to hosting (Vercel/Netlify)
```

---

## VERIFICATION CHECKLIST

### Backend Verification
```
curl -X POST http://localhost:5000/api/groups \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Group",
    "description": "Test",
    "requiredSkills": ["React"],
    "memberLimit": 5
  }'

# Should return group with groupCode
```

### Frontend Verification
```
1. Open http://localhost:5173/groups
2. Should see "Discover Groups" page
3. Should see list of all groups (if any exist)
4. Click group → "Join Request" button → Should navigate to request form
5. Open http://localhost:5173/requests → Should show received requests
```

### Database Verification
```javascript
// In MongoDB
db.groups.findOne() // Should have fields: title, requiredSkills, members, etc.
db.requests.findOne() // Should have: from, to, groupId, status, skillMatchScore
db.requests.getIndexes() // Should include unique index on (from, groupId)
```

---

## NEXT STEPS AFTER IMPLEMENTATION

1. **User Search** - Add ability to search users by skills/name for invitations
2. **Skill Recommendation** - Suggest skills based on group requirements
3. **Group Discovery** - Add advanced filters (distance, difficulty level)
4. **Chat/Messages** - Add messaging between group members
5. **Group Analytics** - Show group statistics and metrics
6. **Notifications** - Real-time notifications for request events
7. **User Ratings** - Allow rating group members after project
8. **Invitations from Users** - Allow inviting friends to join groups

---

## SUPPORT & REFERENCES

**Schema Design:** See SKILL_MATCHING_SYSTEM_SPEC.md → Section 3
**API Details:** See SKILL_MATCHING_SYSTEM_SPEC.md → Section 5
**Business Rules:** See SKILL_MATCHING_SYSTEM_SPEC.md → Section 7
**Backend Code:** See BACKEND_IMPLEMENTATION.md
**Frontend Code:** See FRONTEND_IMPLEMENTATION.md

---

*Last Updated: March 28, 2026*
*Status: Ready for Implementation*
