# Smart Request Hub - Real Data Implementation Guide

## Overview
Your backend has all the APIs needed for real data. This guide shows how to convert the SmartRequestHub from mock data to real data.

---

## 1. AVAILABLE BACKEND ENDPOINTS

### User Endpoints
```
GET  /api/users              - Get all users
GET  /api/users/:id          - Get single user
POST /api/users/seed/sample  - Seed sample users with groups
```

### Group Endpoints
```
GET    /api/groups           - Get all groups
GET    /api/groups/:id       - Get single group by ID
GET    /api/groups/code/:code - Get group by group code (e.g., IT100)
POST   /api/groups           - Create new group
PUT    /api/groups/:id       - Update group
DELETE /api/groups/:id       - Archive group
```

### Join Request Endpoints
```
GET    /api/requests                    - Get all join requests
POST   /api/requests                    - Send new join request
GET    /api/requests/student/:userId    - Get student's requests
GET    /api/requests/group/:groupId     - Get group's incoming requests
PUT    /api/requests/:id                - Accept/reject request
DELETE /api/requests/:id                - Cancel request
```

### Recommendation Endpoints (SMART MATCHING)
```
GET /api/recommend/groups/:userId   - Get recommended groups for a student
GET /api/recommend/users/:groupId   - Get recommended students for a group
```

---

## 2. DATA STRUCTURES

### User Object
```javascript
{
  _id: "64a1b2c3d4e5f6g7h8i9j0k1",
  name: "Alice Johnson",
  email: "alice@example.com",
  role: "Developer",  // Developer, Designer, Manager, Leader, Student
  skills: ["React", "Node.js", "PostgreSQL"],
  createdAt: "2024-01-15T10:20:30Z",
  updatedAt: "2024-01-15T10:20:30Z"
}
```

### Group Object
```javascript
{
  _id: "64b2c3d4e5f6g7h8i9j0k1l2",
  title: "Web App Development",
  description: "Building modern web applications",
  groupCode: "IT100",
  requiredSkills: ["React", "Node.js", "REST APIs"],
  members: ["64a1b2c3d4e5f6g7h8i9j0k1"],  // Array of user IDs
  memberLimit: 5,
  status: "active",  // active, closed, archived
  createdAt: "2024-01-15T10:20:30Z",
  updatedAt: "2024-01-15T10:20:30Z"
}
```

### Join Request Object
```javascript
{
  _id: "64c3d4e5f6g7h8i9j0k1l2m3",
  userId: "64a1b2c3d4e5f6g7h8i9j0k1",
  groupId: "64b2c3d4e5f6g7h8i9j0k1l2",
  requestType: "student-request",  // student-request or leader-invitation
  status: "pending",  // pending, accepted, rejected, expired, withdrawn
  matchScore: 92,
  matchedSkills: ["React", "Node.js"],
  missingSkills: ["REST APIs"],
  expiresAt: "2024-04-15T10:20:30Z",
  respondedAt: null,
  responseMessage: "",
  createdAt: "2024-01-15T10:20:30Z"
}
```

---

## 3. DATA FLOW FOR STUDENT MODE

### Step 1: Get Current User
```javascript
// In your app, you need to know which user is logged in
const currentUserId = localStorage.getItem('userId') || /* from auth */;
```

### Step 2: Get Recommended Groups
```javascript
// Call backend recommendation endpoint
const response = await axios.get(
  `http://localhost:5000/api/recommend/groups/${currentUserId}`
);
// Returns array of groups with match scores
const recommendedGroups = response.data;
```

### Step 3: Get Student's Join Requests
```javascript
// See which groups the student has already requested to join
const myRequests = await axios.get(
  `http://localhost:5000/api/requests/student/${currentUserId}`
);
// Returns array of join requests
```

---

## 4. DATA FLOW FOR LEADER MODE

### Step 1: Get Group by Code
```javascript
// Leader enters "IT100" in search box
const groupCode = "IT100";
const groupResponse = await axios.get(
  `http://localhost:5000/api/groups/code/${groupCode}`
);
const group = groupResponse.data;
const groupId = group._id;
```

### Step 2: Get Join Requests for This Group
```javascript
// See who wants to join
const joinRequests = await axios.get(
  `http://localhost:5000/api/requests/group/${groupId}`
);
// Filter by status: "pending"
const pendingRequests = joinRequests.data.filter(r => r.status === 'pending');
```

### Step 3: Get Recommended Students
```javascript
// Get students that match the group's needs
const recommendedUsers = await axios.get(
  `http://localhost:5000/api/recommend/users/${groupId}`
);
```

---

## 5. IMPLEMENTATION STEPS

### Step 1: Update SmartRequestHub Component

Replace the mock data generation with API calls:

#### BEFORE (Mock Data):
```javascript
const generateMockData = () => {
  const mockUsers = [
    { id: 1, name: 'Alice Chen', ... },
    // hardcoded data
  ];
};
```

#### AFTER (Real Data):
```javascript
const [currentUserId, setCurrentUserId] = useState(null);
const [loading, setLoading] = useState(false);

useEffect(() => {
  // Get logged-in user ID from localStorage or auth
  const userId = localStorage.getItem('userId');
  setCurrentUserId(userId);
}, []);

const fetchRecommendedGroups = async (userId) => {
  try {
    setLoading(true);
    const response = await axios.get(
      `http://localhost:5000/api/recommend/groups/${userId}`
    );
    setRecommendations(response.data);
  } catch (error) {
    setError('Failed to load recommended groups');
  } finally {
    setLoading(false);
  }
};

const fetchStudentRequests = async (userId) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/requests/student/${userId}`
    );
    setSentInvitations(response.data.filter(r => r.status === 'pending'));
  } catch (error) {
    console.error('Failed to load requests:', error);
  }
};
```

