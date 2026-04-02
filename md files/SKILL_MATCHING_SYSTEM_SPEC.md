# Skill-Based Matching & Request Management System
## Complete Technical Specification (MERN Stack)

---

## 1. SYSTEM EXPLANATION (END-TO-END)

### Overview
A decentralized skill-matching platform where all users have equal permissions. Users can:
- Create groups and define skill requirements
- Browse groups created by others
- Send join requests to groups they're interested in
- Invite other users to join their groups
- Accept/reject requests using a unified request management system

### Key Principles
- **No Role Hierarchy**: Every user has identical permissions
- **Transparent Visibility**: All groups are visible to all users
- **Mutual Matching**: Users can request to join OR invite others
- **Request Tracking**: All requests (sent/received) are tracked with status

---

## 2. WORKFLOW (CREATE → MATCH → REQUEST → RESPONSE)

```
┌─────────────────────────────────────────────────────────┐
│                   USER A                                 │
│                                                          │
│  1. Creates Group                                       │
│     ├─ Title: "Web Dev Team"                           │
│     ├─ Description: "Building React apps"              │
│     └─ Required Skills: ["React", "Node.js"]           │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   GROUP CREATED IN DB        │
            │   - Status: Active           │
            │   - Members: [User A]        │
            │   - Member Limit: 5          │
            │   - Remaining Slots: 4       │
            └─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   USER B                                 │
│                                                          │
│  2. Discovers Group (View All Groups)                  │
│     └─ Sees: "Web Dev Team" with User A as creator     │
│                         │                               │
│  3a. OPTION 1: Send Join Request                       │
│     ├─ Request Type: "join"                            │
│     ├─ Status: Pending                                 │
│     └─ Sent To: User A (creator)                       │
│                         │                               │
│  OR                     │                               │
│                         │                               │
│  3b. OPTION 2: User A invites User B                   │
│     ├─ Request Type: "invitation"                      │
│     ├─ Status: Pending                                 │
│     └─ Sent To: User B                                 │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │    REQUEST CREATED          │
            │    - From: User B / User A  │
            │    - To: User A / User B    │
            │    - Group: Group ID        │
            │    - Status: Pending        │
            │    - Skill Match Score: 85% │
            └─────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   USER A / USER B                        │
│                                                          │
│  4. Receives Request & Takes Action                    │
│     ├─ Accept ─────────► User added to group ✓        │
│     ├─ Reject ─────────► Request marked rejected       │
│     └─ Ignore (Expire) ─► Auto-expires after 30 days   │
│                         │                               │
└─────────────────────────┼───────────────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────┐
            │   FINAL STATE               │
            │   - Request: Accepted       │
            │   - User B: In Group        │
            │   - Group Members: [A, B]   │
            │   - Remaining Slots: 3      │
            └─────────────────────────────┘
```

### Workflow Steps

**Step 1: Group Creation**
- User A creates a group with skills required
- Group is stored in MongoDB with creator as first member

**Step 2: Discovery**
- User B views all active groups (list view or search)
- System calculates skill match score (Optional: 0-100%)

**Step 3: Request/Invitation**
- **User-Initiated Join**: User B sends join request to Group creator
- **Invitation**: User A invites User B to join

**Step 4: Request Management**
- Request sitting in UI (Inbox)
- User views request details (skills match, profile, message)
- Action: Accept → Add to group, Reject → Decline, Ignore → Auto-expire

**Step 5: Completion**
- User added to group members list
- Remaining slots decrease
- Request marked "Accepted"
- All other pending requests from that user to that group are closed

---

## 3. MONGODB SCHEMA DESIGN

### User Schema
```javascript
db.users.insertOne({
  _id: ObjectId("..."),
  email: "user@example.com",
  name: "John Doe",
  password: "hashed_password",
  skills: ["React", "Node.js", "MongoDB"], // User's own skills
  bio: "Full-stack developer",
  avatar: "https://...",
  createdAt: ISODate("2024-03-28"),
  updatedAt: ISODate("2024-03-28")
})
```

### Group Schema
```javascript
db.groups.insertOne({
  _id: ObjectId("..."),
  groupCode: "IT100-ABC123",
  title: "Web Development Team",
  description: "Building modern web applications",
  requiredSkills: ["React", "Node.js"],
  
  // Membership
  createdBy: ObjectId("user_a_id"), // Group creator
  members: [
    ObjectId("user_a_id"),
    ObjectId("user_b_id")
  ],
  memberLimit: 5,
  
  // Status
  status: "active", // active | closed | archived
  
  // Timestamps
  createdAt: ISODate("2024-03-28"),
  updatedAt: ISODate("2024-03-28")
})
```

### Request Schema
```javascript
db.requests.insertOne({
  _id: ObjectId("..."),
  
  // Request Details
  requestType: "join", // join | invitation
  status: "pending", // pending | accepted | rejected | expired
  
  // Parties Involved
  from: ObjectId("user_b_id"), // Who sent the request
  to: ObjectId("user_a_id"),   // Who can accept/reject
  groupId: ObjectId("group_id"),
  
  // Skill Matching
  skillMatchScore: 85, // 0-100 (Optional, calculated at request time)
  
  // Metadata
  message: "I'm interested in joining", // Optional message from requester
  expiresAt: ISODate("2024-04-27"), // Auto-expire after 30 days
  
  // Timestamps
  createdAt: ISODate("2024-03-28"),
  respondedAt: ISODate("2024-03-29"), // When accepted/rejected
  updatedAt: ISODate("2024-03-28")
})
```

### Indexes for Performance
```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })

// Groups
db.groups.createIndex({ createdBy: 1 })
db.groups.createIndex({ status: 1 })
db.groups.createIndex({ groupCode: 1 }, { unique: true })

// Requests
db.requests.createIndex({ from: 1, groupId: 1 }, { unique: true }) // Prevent duplicates
db.requests.createIndex({ to: 1, status: 1 }) // For inbox view
db.requests.createIndex({ from: 1, status: 1 }) // For sent requests view
db.requests.createIndex({ expiresAt: 1 }) // For auto-expire cleanup
```

---

## 4. MATCHING LOGIC (SKILL SCORING)

### Skill Match Algorithm
```javascript
/**
 * Calculate skill match score between user and group requirements
 * Returns: 0-100 percentage
 */
function calculateSkillMatch(userSkills, requiredSkills) {
  if (requiredSkills.length === 0) return 100; // No requirements = 100% match
  
  const userSkillsLower = userSkills.map(s => s.toLowerCase());
  const requiredSkillsLower = requiredSkills.map(s => s.toLowerCase());
  
  // Count matched skills
  const matchedSkills = requiredSkillsLower.filter(skill =>
    userSkillsLower.includes(skill)
  ).length;
  
  // Calculate percentage
  const matchPercentage = Math.round(
    (matchedSkills / requiredSkillsLower.length) * 100
  );
  
  return matchPercentage;
}

// Example Usage
const userSkills = ["React", "Node.js", "Python"];
const requiredSkills = ["React", "Node.js"];
const score = calculateSkillMatch(userSkills, requiredSkills);
console.log(score); // Output: 100 (all required skills present)

// Example 2
const userSkills2 = ["React", "Vue.js"];
const requiredSkills2 = ["React", "Node.js", "MongoDB"];
const score2 = calculateSkillMatch(userSkills2, requiredSkills2);
console.log(score2); // Output: 33 (1 out of 3 required skills)
```

### When to Calculate Score
- When displaying join request (show match score to requester)
- When group creator reviews requests (show match score)
- Optional: When listing groups for discovery

---

## 5. API ENDPOINTS (EXPRESS.JS)

### Authentication (Prerequisite)
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
POST   /api/auth/logout          - Logout
GET    /api/auth/me              - Get current user
```

### User Endpoints
```
GET    /api/users/:id            - Get user profile
PUT    /api/users/:id            - Update profile (skills, bio, etc.)
GET    /api/users/search         - Search users by name/skills
```

### Group Endpoints
```
POST   /api/groups               - Create group
GET    /api/groups               - Get all active groups
GET    /api/groups/:id           - Get group details
PUT    /api/groups/:id           - Update group (by creator only)
DELETE /api/groups/:id           - Archive group (by creator only)
GET    /api/groups/created       - Get groups created by user
GET    /api/groups/joined        - Get groups user has joined
```

### Request Endpoints
```
POST   /api/requests             - Send join request or invitation
GET    /api/requests/sent        - Get requests sent by user
GET    /api/requests/received    - Get requests received by user
GET    /api/requests/:id         - Get single request details
PUT    /api/requests/:id/accept  - Accept request
PUT    /api/requests/:id/reject  - Reject request
DELETE /api/requests/:id         - Cancel request (sender only)
```

---

## 6. UI SCREENS (REACT)

### Screen 1: Groups Discovery / List
```
┌─────────────────────────────────────────────────────┐
│                  ALL GROUPS                         │
├─────────────────────────────────────────────────────┤
│ [Search] [Filter by Skills] [Sort by Match]        │
├─────────────────────────────────────────────────────┤
│
│ ┌──────────────────────────────────────────────┐
│ │ Web Development Team                         │
│ │ Creator: John Doe                            │
│ │ Members: 2/5                                 │
│ │ Required Skills: React, Node.js              │
│ │ Your Match: 85% ✓                            │
│ │ [View Details] [Send Join Request]           │
│ └──────────────────────────────────────────────┘
│
│ ┌──────────────────────────────────────────────┐
│ │ Mobile Dev Squad                             │
│ │ Creator: Jane Smith                          │
│ │ Members: 3/4                                 │
│ │ Required Skills: React Native, Swift         │
│ │ Your Match: 45%                              │
│ │ [View Details] [Send Join Request]           │
│ └──────────────────────────────────────────────┘
│
└─────────────────────────────────────────────────────┘
```

### Screen 2: Group Details
```
┌──────────────────────────────────────────────────────┐
│ Web Development Team                                 │
├──────────────────────────────────────────────────────┤
│ Created by: John Doe (View Profile)                 │
│ Members: 2 / 5                                      │
│ Required Skills: React, Node.js, MongoDB            │
│                                                     │
│ Description:                                        │
│ "Building modern web applications with the MERN    │
│  stack. Looking for motivated developers."          │
│                                                     │
│ Your Skill Match: 85% ✓                            │
│                                                     │
│ [Send Join Request]  [Invite Members] [Report]    │
│                                                     │
│ ─── MEMBERS ───                                    │
│ John Doe (Creator)                                 │
│ Sarah Khan                                         │
│                                                     │
└──────────────────────────────────────────────────────┘
```

### Screen 3: Send Join Request
```
┌──────────────────────────────────────────────────────┐
│ Join Request: Web Development Team                   │
├──────────────────────────────────────────────────────┤
│                                                     │
│ Skill Match Analysis:                              │
│ ✓ React (You have it)                              │
│ ✓ Node.js (You have it)                            │
│ ✗ MongoDB (You don't have it yet)                  │
│ Score: 67%                                         │
│                                                     │
│ Optional Message:                                  │
│ ┌──────────────────────────────────────────────┐   │
│ │ Hi John! I'm interested in joining your team │   │
│ │ and would love to learn MongoDB.              │   │
│ └──────────────────────────────────────────────┘   │
│                                                     │
│ [Cancel] [Send Request]                           │
│                                                     │
└──────────────────────────────────────────────────────┘
```

### Screen 4: Requests Inbox (Received)
```
┌──────────────────────────────────────────────────────┐
│ REQUESTS RECEIVED                                    │
├──────────────────────────────────────────────────────┤
│ [Pending] [Accepted] [Rejected] [All]              │
├──────────────────────────────────────────────────────┤
│
│ PENDING (3):
│
│ ┌─────────────────────────────────────────────┐
│ │ Sarah Khan wants to join "Web Dev Team"     │
│ │ Skill Match: 85% ✓✓✓                       │
│ │ "I'm very interested..."                    │
│ │ Sent: 2 days ago                            │
│ │ [View Profile] [Accept] [Reject]            │
│ └─────────────────────────────────────────────┘
│
│ ┌─────────────────────────────────────────────┐
│ │ Mike Lee wants to join "Web Dev Team"       │
│ │ Skill Match: 40%                            │
│ │ Sent: 5 days ago                            │
│ │ [View Profile] [Accept] [Reject]            │
│ └─────────────────────────────────────────────┘
│
│ ACCEPTED (2):
│ Sarah Khan joined "Web Dev Team"
│ Mike Brown joined "Web Dev Team"
│
└──────────────────────────────────────────────────────┘
```

### Screen 5: Sent Requests
```
┌──────────────────────────────────────────────────────┐
│ SENT REQUESTS                                        │
├──────────────────────────────────────────────────────┤
│ [Pending] [Accepted] [Rejected] [All]              │
├──────────────────────────────────────────────────────┤
│
│ PENDING (2):
│
│ ┌─────────────────────────────────────────────┐
│ │ Requested to join "AI Research Lab"         │
│ │ Skill Match: 72%                            │
│ │ Status: Waiting for response...             │
│ │ Sent: 1 day ago                             │
│ │ [View Group] [Cancel Request]               │
│ └─────────────────────────────────────────────┘
│
│ ┌─────────────────────────────────────────────┐
│ │ Requested to join "Python Enthusiasts"      │
│ │ Skill Match: 95% ✓✓✓                       │
│ │ Status: Waiting for response...             │
│ │ Sent: 3 days ago                            │
│ │ [View Group] [Cancel Request]               │
│ └─────────────────────────────────────────────┘
│
│ ACCEPTED (1):
│ Accepted to "Web Development Team" (2 days ago)
│
│ REJECTED (1):
│ Rejected from "Mobile Dev Squad" (1 week ago)
│
└──────────────────────────────────────────────────────┘
```

### Screen 6: My Groups (Groups I Created)
```
┌──────────────────────────────────────────────────────┐
│ MY GROUPS (Created)                                  │
├──────────────────────────────────────────────────────┤
│
│ ┌──────────────────────────────────────────────┐
│ │ Web Development Team                         │
│ │ Members: 3 / 5                               │
│ │ Pending Requests: 2                          │
│ │ Status: Active                               │
│ │ Created: 2 months ago                        │
│ │ [View Details] [Review Requests] [Edit]      │
│ │ [Manage Members] [Close Group]               │
│ └──────────────────────────────────────────────┘
│
│ ┌──────────────────────────────────────────────┐
│ │ Python Beginners                             │
│ │ Members: 8 / 10                              │
│ │ Pending Requests: 0                          │
│ │ Status: Active                               │
│ │ [View Details] [Review Requests] [Edit]      │
│ └──────────────────────────────────────────────┘
│
└──────────────────────────────────────────────────────┘
```

---

## 7. BUSINESS RULES & VALIDATION

### User Rules
```
1. Every user must have a unique email
2. Users must have at least one skill in their profile (optional but recommended)
3. Users can only edit their own profile
4. Users cannot be forced-removed from a group (only leave voluntarily)
5. User profile is visible to all other users
```

### Group Rules
```
1. Group title must be unique per creator (User A can create "Dev Team", 
   User B can also create "Dev Team" - different creators)
2. Group must have at least 1 member (creator)
3. Group must have a member limit between 2-100
4. Required skills must be non-empty array (at least 1 skill)
5. Only group creator can edit group details
6. Only group creator can close/archive the group
7. When group reaches member limit:
   - All pending join requests are automatically rejected
   - No new requests can be sent
8. Group status: "active" | "closed" | "archived"
9. Closed groups cannot receive new requests
```

### Request Rules
```
REQUEST CREATION:
1. A user CANNOT send multiple requests to the same group
   - Check: from + groupId must be UNIQUE
   - Error: "You already have a pending request for this group"
2. A user CANNOT send request to join a group they're already a member of
   - Check: User ID not in group.members
   - Error: "You are already a member of this group"
3. A user CANNOT send request to a closed/archived group
   - Error: "This group is no longer accepting requests"
4. Request must include group ID and type (join | invitation)

REQUEST STATUS LIFECYCLE:
pending
  ├─ Accept (User in group, request marked "accepted")
  ├─ Reject (Request marked "rejected")
  └─ Expire (Auto-expire after 30 days, marked "expired")

ACCEPTANCE RULES:
- Only the "to" user can accept a request
- On acceptance:
  * Add "from" user to group.members
  * Mark request as "accepted"
  * Close all OTHER pending requests from same user to same group
  * Decrease available slots

REJECTION RULES:
- Only the "to" user can reject
- Mark request as "rejected"

CANCELLATION RULES:
- Only the "from" user can cancel their own request
- Request must be "pending" status
- Mark request as "cancelled"

AUTO-EXPIRATION:
- Requests expire after 30 days if not responded
- Run daily cleanup job to mark expired requests
- Mark status as "expired"

DUPLICATE PREVENTION:
- Unique index on (from, groupId)
- Before creating request, check:
  * No pending request exists from this user to this group
  * User not already in group
  * Group not closed

GROUP FULL CLOSURE:
- When group reaches memberLimit:
  * Reject all pending requests for that group
  * Prevent new requests
  * Send notification to all pending requesters
```

### Workflow Validation
```
SENDING REQUEST:
1. ✓ User is authenticated
2. ✓ Group exists and is active
3. ✓ User is not already a member
4. ✓ No pending request already exists
5. ✓ Group has available slots
6. ✓ Create request with status "pending"
7. ✓ Calculate skill match score
8. ✓ Set expiration date (now + 30 days)

ACCEPTING REQUEST:
1. ✓ Request exists and is in "pending" status
2. ✓ Current user is the "to" user
3. ✓ Group still has available slots
4. ✓ User not already in group
5. ✓ Add user to group.members
6. ✓ Update request status to "accepted"
7. ✓ Close other pending requests from this user to same group
8. ✓ Decrement available slots
9. ✓ If group now full, reject all other pending requests

SENDING INVITATION:
1. ✓ User is group member or creator
2. ✓ Target user exists
3. ✓ Target user not already in group
4. ✓ No pending status between these two for this group
5. ✓ Create request with type "invitation"
6. ✓ Set "to" as target user, "from" as inviter

VIEWING REQUESTS:
1. ✓ Can only see requests where user is "to" or "from"
2. ✓ Filter by status (pending, accepted, rejected, expired)
3. ✓ Sort by date (newest first)
4. ✓ Include skill match score
```

---

## IMPLEMENTATION CHECKLIST

### Phase 1: Core Setup
- [ ] User Schema & Authentication
- [ ] Group Schema
- [ ] Request Schema
- [ ] Indexes for performance

### Phase 2: Core APIs
- [ ] POST /api/groups (create)
- [ ] GET /api/groups (list all)
- [ ] POST /api/requests (send request)
- [ ] GET /api/requests/received
- [ ] GET /api/requests/sent
- [ ] PUT /api/requests/:id/accept
- [ ] PUT /api/requests/:id/reject

### Phase 3: Validation & Business Logic
- [ ] Duplicate request prevention
- [ ] Skill match calculation
- [ ] Group full closure
- [ ] Auto-expiration logic
- [ ] Status lifecycle validation

### Phase 4: UI Implementation
- [ ] Groups discovery page
- [ ] Group details page
- [ ] Join request form
- [ ] Requests inbox (received)
- [ ] Sent requests page
- [ ] My groups page

### Phase 5: Testing & Refinement
- [ ] Unit tests for matching logic
- [ ] API endpoint tests
- [ ] Edge case handling
- [ ] Performance optimization

---

## KEY BUSINESS LOGIC SUMMARY

| Feature | Logic |
|---------|-------|
| **Duplicate Prevention** | Unique index on (from, groupId) |
| **Skill Matching** | % of required skills user has |
| **Request Expiration** | Auto-expire after 30 days |
| **Group Full** | Auto-reject all pending requests |
| **Roles** | None - all users equal |
| **Visibility** | All groups visible to all users |
| **Access Control** | Creator-only for edits/close |
| **Member Removal** | User can only leave, not be removed |

---

## NEXT STEPS

1. **Review & Approve** this specification with stakeholders
2. **Create Database Schemas** in MongoDB
3. **Build APIs** following the endpoints list
4. **Implement Skill Matching** algorithm
5. **Create UI Screens** in React
6. **Add Validation** for all business rules
7. **Test End-to-End** workflow
8. **Deploy** to production

---

*Document Version: 1.0*  
*Date: March 28, 2026*  
*Status: Ready for Implementation*
