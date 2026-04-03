# UniConnect Chatbot - Visual Architecture & Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BROWSER (Frontend)                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ React Application (React 19.2 + React Router v7)            │  │
│  │                                                              │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ App.jsx (Routes & Theme Setup)                        │ │  │
│  │  │  ├─ /dashboard/home → PersonalizedHomePage           │ │  │
│  │  │  ├─ /groups → GroupsDashboard                        │ │  │
│  │  │  ├─ /recommendations → RecommendationsPage           │ │  │
│  │  │  ├─ /requests → RequestsPage                         │ │  │
│  │  │  ├─ /taskboard → TaskBoard                           │ │  │
│  │  │  ├─ /dashboard/projects → ProjectDashboard           │ │  │
│  │  │  └─ Conditionally renders ChatBot component          │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │                          ▲                                    │  │
│  │                          │ uses                              │  │
│  │                          │                                    │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │ ChatBot Component                                      │ │  │
│  │  │ ┌─────────────────────────────────────────────────┐   │ │  │
│  │  │ │ ChatBot Button (Floating, Bottom-Right)        │   │ │  │
│  │  │ │  ◉ Purple gradient button w/ Sparkles         │   │ │  │
│  │  │ │  └─ onClick → setIsOpen(true)                 │   │ │  │
│  │  │ └─────────────────────────────────────────────────┘   │ │  │
│  │  │                      ▼                                 │ │  │
│  │  │ ┌─────────────────────────────────────────────────┐   │ │  │
│  │  │ │ Chat Window (Width: 384px, Height: 650px)    │   │ │  │
│  │  │ │                                                │   │ │  │
│  │  │ │ ┌────────────────────────────────────────┐   │ │  │
│  │  │ │ │ Chat Header                            │   │ │  │
│  │  │ │ │ [⚡ UniConnect Pro] 🟢 [−] [□] [×]   │   │ │  │
│  │  │ │ └───────────────────────────────────┬──┘   │ │  │
│  │  │ │ ┌────────────────────────────────┐  │       │ │  │
│  │  │ │ │ Messages Area                  │  │       │ │  │
│  │  │ │ │                                │  │       │ │  │
│  │  │ │ │ [User: "Tell me about groups"] │  │       │ │  │
│  │  │ │ │                                │  │       │ │  │
│  │  │ │ │ [Bot: Features in grid]        │  │       │ │  │
│  │  │ │ │  👥 Create  🎯 Find           │  │       │ │  │
│  │  │ │ │  💬 Work    🚀 Launch         │  │       │ │  │
│  │  │ │ │                                │  │       │ │  │
│  │  │ │ │ [Suggestion Buttons below]    │  │       │ │  │
│  │  │ │ │ [Create Groups]→ [Find Groups] │  │       │ │  │
│  │  │ │ │                                │  │       │ │  │
│  │  │ │ └────────────────────────────────┘  │       │ │  │
│  │  │ │ ┌────────────────────────────────┐  │       │ │  │
│  │  │ │ │ Input Area                     │  │       │ │  │
│  │  │ │ │ [Ask me anything...       ][→] │  │       │ │  │
│  │  │ │ │ Input Field          Send Btn   │  │       │ │  │
│  │  │ │ └────────────────────────────────┘  │       │ │  │
│  │  │ └────────────────────────────────────┘       │ │  │
│  │  └─────────────────────────────────────────────┘ │  │
│  │                    State Mgmt:                    │  │
│  │                  • messages[]                    │  │
│  │                  • inputValue                    │  │
│  │                  • isTyping                      │  │
│  │                  • isOpen/isMinimized            │  │
│  │                    Functions:                    │  │
│  │              • handleSendMessage()               │  │
│  │              • handleActionClick()               │  │
│  │              • renderMessage()                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  API: axios (api.js)                                        │
│  Theme: useTheme() context                                  │
│  Navigation: useNavigate() hook                             │
└─────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ POST Request
                                   │ {message: "..."}
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVER (Backend)                            │
│                                                                      │
│  Node.js + Express.js (Port: 5008)                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ server.js                                                    │  │
│  │  ├─ Express app setup                                       │  │
│  │  ├─ CORS configuration                                      │  │
│  │  ├─ Route registration                                      │  │
│  │  │  └─ app.use("/api/aichat", aiChatRoutes)               │  │
│  │  └─ Socket.IO setup (for group chat)                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                      ▲                              │
│                                      │                              │
│                          POST /api/aichat/message                   │
│                                      │                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ routes/aiChatRoutes.js                                       │  │
│  │  router.post('/message', aiChatController.chatWithAI)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                      ▲                              │
│                                      │                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ controllers/aiChatController.js                             │  │
│  │                                                              │  │
│  │  chatWithAI(req, res) {                                     │  │
│  │    Step 1: Extract message from req.body                  │  │
│  │    Step 2: Call detectIntent(message)                     │  │
│  │    Step 3: Match against responseTemplates               │  │
│  │    Step 4: Build response object                          │  │
│  │    Step 5: Simulate 300ms delay                           │  │
│  │    Step 6: Return JSON response                           │  │
│  │  }                                                          │  │
│  │                                                              │  │
│  │  Response Templates: {                                     │  │
│  │    groups: { keywords: [...], response: {...} },         │  │
│  │    skills: { keywords: [...], response: {...} },         │  │
│  │    requests: { keywords: [...], response: {...} },       │  │
│  │    tasks: { keywords: [...], response: {...} },          │  │
│  │    projects: { keywords: [...], response: {...} }        │  │
│  │  }                                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Database: MongoDB (for other features, not chat history)           │
│  Cache: None (stateless operation)                                  │
└─────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ JSON Response
                                   │ {success: true, data: {...}}
                                   ▼
                              BROWSER
```

---

## 🔄 Message Flow Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│ DETAILED MESSAGE FLOW                                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Types Message
┌──────────────────────────────────────────────────────────────┐
│ User Input:                                                  │
│ ┌──────────────────────────────────────────────────────────┐│
│ │ "Tell me about groups"                                  ││
│ └──────────────────────────────────────────────────────────┘│
│                          │                                   │
│                         ▼                                    │
│ onChange Event:                                              │
│ setInputValue("Tell me about groups")                        │
│                                                              │
│ [Send] Button Clicked                                        │
│                          │                                   │
│                         ▼                                    │
│ handleSendMessage("Tell me about groups")                    │
└──────────────────────────────────────────────────────────────┘

Step 2: User Message Added to Chat
┌──────────────────────────────────────────────────────────────┐
│ State Update:                                                │
│ setMessages(prev => [...prev, {                             │
│   id: 1712246400000,                                        │
│   type: 'user',                                             │
│   text: 'Tell me about groups',                             │
│   timestamp: 2024-04-04T12:00:00Z                          │
│ }])                                                          │
│                                                              │
│ UI Result:                                                   │
│  ┌────────────────────────────────────────────────────────┐│
│  │ [Tell me about groups]                                ││
│  │ (blue bubble on right)                                ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│ State: setIsTyping(true)                                    │
│        (show typing indicator with 3 bouncing dots)         │
│                                                              │
│ State: setInputValue('') (clear input field)                │
└──────────────────────────────────────────────────────────────┘

Step 3: API Call
┌──────────────────────────────────────────────────────────────┐
│ Frontend:                                                    │
│                                                              │
│ const res = await chatAPI.sendMessage({                     │
│   message: 'Tell me about groups'                           │
│ })                                                           │
│                                                              │
│ Request Details:                                             │
│ • Method: POST                                              │
│ • URL: http://localhost:5008/api/aichat/message             │
│ • Content-Type: application/json                            │
│ • Body: {"message": "Tell me about groups"}                │
│ • Headers: JWT auth token                                   │
│                                                              │
│ Backend Receives Request                                     │
└──────────────────────────────────────────────────────────────┘

Step 4: Backend Processing
┌──────────────────────────────────────────────────────────────┐
│ aiChatController.chatWithAI(req, res):                       │
│                                                              │
│ 4a. Extract message:                                        │
│     message = "Tell me about groups"                        │
│                                                              │
│ 4b. Detect Intent:                                          │
│     lowerMsg = "tell me about groups"                       │
│     for topic in responseTemplates:                         │
│       if keywords match → intent found!                     │
│     Result: intent = 'groups'                               │
│                                                              │
│ 4c. Build Response:                                         │
│     responseData = responseTemplates['groups'].response     │
│     = {                                                      │
│       type: 'feature',                                      │
│       text: '📁 Groups - Collaboration Hub',                │
│       features: [                                           │
│         { icon: '👥', title: 'Create Groups', ... },       │
│         { icon: '🎯', title: 'Find Groups', ... },         │
│         { icon: '💬', title: 'Collaborate', ... },         │
│         { icon: '🚀', title: 'Launch Projects', ... }      │
│       ]                                                      │
│     }                                                        │
│                                                              │
│ 4d. Simulate Delay:                                         │
│     await new Promise(resolve =>                           │
│       setTimeout(resolve, 300)                             │
│     )                                                        │
│                                                              │
│ 4e. Send Response:                                          │
│     res.status(200).json({                                 │
│       success: true,                                        │
│       data: responseData                                    │
│     })                                                       │
└──────────────────────────────────────────────────────────────┘

Step 5: Frontend Receives Response
┌──────────────────────────────────────────────────────────────┐
│ Response Data:                                               │
│ {                                                            │
│   "success": true,                                           │
│   "data": {                                                  │
│     "type": "feature",                                       │
│     "text": "📁 Groups - Collaboration Hub",                │
│     "features": [...]                                        │
│   }                                                          │
│ }                                                            │
│                                                              │
│ Extract botResponse = res.data?.data                        │
│ = the feature object with features array                    │
└──────────────────────────────────────────────────────────────┘

Step 6: Bot Message Added to Chat
┌──────────────────────────────────────────────────────────────┐
│ State Update:                                                │
│ setMessages(prev => [...prev, {                             │
│   id: 1712246400001,                                        │
│   ...botResponse,  // Spread feature object                 │
│   type: 'feature',                                          │
│   timestamp: 2024-04-04T12:00:00Z                          │
│ }])                                                          │
│                                                              │
│ State: setIsTyping(false)                                   │
│        (remove typing indicator)                            │
│                                                              │
│ UI Result:                                                   │
│  ┌────────────────────────────────────────────────────────┐│
│  │ 📁 Groups - Collaboration Hub                        ││
│  │                                                        ││
│  │ ┌──────────────┬──────────────┐                      ││
│  │ │ 👥 Create    │ 🎯 Find      │                      ││
│  │ │ Groups       │ Groups       │                      ││
│  │ ├──────────────┼──────────────┤                      ││
│  │ │ 💬 Work      │ 🚀 Launch    │                      ││
│  │ │ Together     │ Projects     │                      ││
│  │ └──────────────┴──────────────┘                      ││
│  └────────────────────────────────────────────────────────┘│
│                                                              │
│ Auto-scroll:                                                │
│ messagesEndRef.current?.scrollIntoView({                    │
│   behavior: 'smooth'                                        │
│ })                                                          │
│ → Chat window scrolls to show bot message                  │
└──────────────────────────────────────────────────────────────┘

Step 7: User Clicks Action Button (e.g., "Create Groups")
┌──────────────────────────────────────────────────────────────┐
│ handleActionClick('create_group')                            │
│                                                              │
│ 7a. Send Follow-up Message:                                 │
│     handleSendMessage('🎉 Create a new group')             │
│     (Bot responds to user's action)                         │
│                                                              │
│ 7b. After ~800ms Delay:                                     │
│     navigate('/create-group')                               │
│     setIsMinimized(true)                                    │
│                                                              │
│ UI Result:                                                   │
│  • Chat minimizes (shows header only)                       │
│  • Page changes to /create-group                            │
│  • App is ready for user to create group                    │
└──────────────────────────────────────────────────────────────┘

Complete Flow Visualization:

User Input
    ▼
handleSendMessage()
    ▼
Add user message to chat
    ▼
Set isTyping = true
    ▼
Clear input field
    ▼
API POST /api/aichat/message
    ▼
Backend detectIntent()
    ▼
Match keywords
    ▼
Build response object
    ▼
Simulate 300ms delay
    ▼
Return JSON response
    ▼
Frontend receives response
    ▼
Add bot message to chat
    ▼
Set isTyping = false
    ▼
Auto-scroll to latest
    ▼
User Sees:
 • Their message
 • Typing indicator (briefly)
 • Bot response with features
 • Action buttons

Option 1: Click Action Button
    ▼
Send follow-up message
    ▼
Wait for response (~300ms)
    ▼
Navigate to page (~800ms after click)
    ▼
Minimize chat
    ▼
User on new page

Option 2: Type Another Message
    ▼
Repeat from handleSendMessage()
```

---

## 🎯 Keyword Detection Flow

```
┌──────────────────────────────────────────────────────────────┐
│ INTENT DETECTION PROCESS                                     │
└──────────────────────────────────────────────────────────────┘

Input: "How do I create a study group?"

Step 1: Normalize
✓ Convert to lowercase: "how do i create a study group?"
✓ Trim whitespace: "how do i create a study group?"

Step 2: Check Greeting
if message.includes("hi|hello|hey|greetings")
→ No match

Step 3: Check Help
if message.includes("help|?|what can you do")
→ No match

Step 4: Loop Through Topics
for (topic in responseTemplates) {
  
  Topic 1: 'groups'
  const keywords = ['group', 'create group', 'find group', 'groups']
  
  Check: "how do i create a study group?"
    matches: group ✓
    matches: create group ✓
    
  Result: MATCH FOUND!
  
  return {
    type: 'topic',
    intent: 'groups',
    action: 'view_groups'
  }
}

Output: { type: 'topic', intent: 'groups' }

Response: responseTemplates['groups'].response
= {
  type: 'feature',
  text: '📁 Groups - Collaboration Hub',
  features: [...]
}
```

---

## 🌳 Response Template Structure

```
responseTemplates = {
  
  groups: {
    keywords: [
      'group',
      'create group', 
      'find group',
      'groups'
    ],
    response: {
      type: 'feature',
      text: '📁 Groups - Collaboration Hub',
      features: [
        {
          icon: '👥',
          title: 'Create Groups',
          desc: 'Start a study group'
        },
        {
          icon: '🎯',
          title: 'Find Groups',
          desc: 'Join existing groups'
        },
        {
          icon: '💬',
          title: 'Collaborate',
          desc: 'Work together seamlessly'
        },
        {
          icon: '🚀',
          title: 'Launch Projects',
          desc: 'Start team projects'
        }
      ]
    },
    action: 'view_groups'
  },
  
  skills: {
    keywords: ['skill', 'match', 'recommend', ...],
    response: { /* similar structure */ },
    action: 'view_recommendations'
  },
  
  // ... more topics
  
}
```

---

## 📱 UI State Management

```
ChatBot Component State:

┌─ messages: Message[]
│  ├─ Each message: {
│  │  ├─ id: number (timestamp)
│  │  ├─ type: 'user' | 'bot' | 'feature' | 'suggestion' | 'greeting'
│  │  ├─ text: string
│  │  ├─ timestamp: Date
│  │  └─ features?: Feature[] | actions?: Action[]
│  │
│  ├─ Message 1 (initial greeting): {
│  │   id: 1,
│  │   type: 'greeting',
│  │   text: 'Hey there, superstar! 🌟',
│  │   subtext: 'I\'m your UniConnect Assistant!'
│  │ }
│  │
│  ├─ Message 2 (features): {
│  │   id: 2,
│  │   type: 'feature',
│  │   text: 'I can help you with:',
│  │   features: [...]
│  │ }
│  │
│  ├─ Message N (user message): {
│  │   id: 1712246400000,
│  │   type: 'user',
│  │   text: 'Tell me about groups',
│  │   timestamp: Date
│  │ }
│  │
│  └─ Message N+1 (bot response): {
│      id: 1712246400001,
│      type: 'feature',
│      text: '📁 Groups - Collaboration Hub',
│      features: [...]
│    }
│
├─ inputValue: string ("")
│
├─ isTyping: boolean (false)
│  └─ When true: show 3 bouncing dots animation
│
├─ isOpen: boolean (false)
│  ├─ false: Show only floating button
│  └─ true: Show full chat window
│
└─ isMinimized: boolean (false)
   ├─ false: Show messages + input
   └─ true: Show header only
```

---

## 🗺️ Navigation Map

```
ACTION → ROUTE → COMPONENT → PURPOSE

view_groups
  ↓
  /groups
  ↓
  GroupsDashboard
  ↓
  View and create groups

view_recommendations
  ↓
  /recommendations
  ↓
  RecommendationsPage
  ↓
  Find teammates by skills

view_requests
  ↓
  /requests
  ↓
  RequestsPage
  ↓
  Manage requests & invites

view_tasks
  ↓
  /taskboard
  ↓
  TaskBoard
  ↓
  Kanban task management

view_projects
  ↓
  /dashboard/projects
  ↓
  ProjectDashboard
  ↓
  Project management & tracking

create_group
  ↓
  /create-group
  ↓
  CreateGroupPage
  ↓
  Form to create new group

create_task
  ↓
  /taskboard
  ↓
  TaskBoard (w/ create modal)
  ↓
  Create task in project

create_project
  ↓
  /add-project
  ↓
  AddProject
  ↓
  Form to create new project

send_request
  ↓
  /requests
  ↓
  RequestsPage (focused on send)
  ↓
  Send collaboration request
```

---

## 🎨 Rendering Flow

```
renderMessage(message)

if type === 'user' → Render User Message
  ├─ Alignment: Right
  ├─ Color: Gradient (primary to accent)
  ├─ Style: Rounded bubble
  ├─ Text: User's input
  └─ Animation: Fade in + slide up

if type === 'feature' → Render Feature Card
  ├─ Alignment: Left
  ├─ Grid: 2 columns
  ├─ Header: Feature category (e.g., "📁 Groups")
  ├─ Cards: 4 feature items each with:
  │  ├─ Icon (emoji)
  │  ├─ Title
  │  └─ Description
  └─ Animation: Fade in + slide up

if type === 'suggestion' → Render Suggestion
  ├─ Alignment: Left
  ├─ Header: Suggestion text
  ├─ Buttons: Action buttons
  │  ├─ Color: Gradient background
  │  ├─ Hover: Color shift + arrow animation
  │  └─ Click: handleActionClick()
  └─ Animation: Fade in + slide up

if type === 'greeting' → Render Greeting
  ├─ Alignment: Left
  ├─ Main Text: Bold heading
  ├─ Subtext: Secondary text
  └─ Animation: Fade in + slide up

if isTyping === true → Show Typing Indicator
  ├─ Alignment: Left
  ├─ Animation: 3 bouncing dots
  ├─ Duration: ~600ms per bounce
  └─ Show: Until bot responds

default → Render Plain Text
  ├─ Alignment: Left
  ├─ Style: Simple message bubble
  ├─ Color: Theme-aware
  └─ Animation: Fade in + slide up
```

---

This visual architecture helps understand how all the pieces fit together in the UniConnect Chatbot system!
