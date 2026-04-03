# UniConnect Assistant - Chatbot Implementation Guide

## ✅ Status: FULLY FUNCTIONAL

The UniConnect Assistant chatbot is now **completely functional** with rule-based responses and full navigation integration.

---

## 📋 What Was Implemented

### 1. **Rule-Based Chat Controller** (Backend)
**File:** `backend/controllers/aiChatController.js`

The chatbot now uses intelligent keyword detection instead of AI APIs:

```javascript
// Response templates for different topics
const responseTemplates = {
  groups: { keywords: ['group', 'create group', ...], response: {...} },
  skills: { keywords: ['skill', 'match', 'recommend', ...], response: {...} },
  requests: { keywords: ['request', 'invite', ...], response: {...} },
  tasks: { keywords: ['task', 'todo', 'work', ...], response: {...} },
  projects: { keywords: ['project', 'build', ...], response: {...} }
};
```

**Key Features:**
- ✅ Keyword-based intent detection
- ✅ Rich response objects with features and actions
- ✅ Smart fallback messages
- ✅ No external API dependencies (no Gemini API required)
- ✅ Lightweight and fast (300ms response simulation)

### 2. **Enhanced ChatBot Component** (Frontend)
**File:** `frontend/src/components/ChatBot.jsx`

**Key Enhancements:**
- ✅ Full navigation integration with React Router
- ✅ Real chat history management with React state
- ✅ Dynamic message rendering (user, bot, features, suggestions)
- ✅ Auto-scroll to latest messages
- ✅ Typing indicators simulation
- ✅ Action buttons with direct navigation
- ✅ Light/dark theme support
- ✅ Minimize/expand functionality

---

## 🎯 How It Works

### Message Flow

```
User Types Message
       ↓
ChatBot.jsx handleSendMessage()
       ↓
API POST /api/aichat/message
       ↓
aiChatController.detectIntent()
       ↓
Match Keywords → Generate Response
       ↓
Return Rich Response Object
       ↓
Render in Chat UI
```

### Response Types

The chatbot returns one of these response types:

#### 1. **Feature Response**
Shows features in a 2x2 grid with icons and descriptions

```javascript
{
  type: 'feature',
  text: '📁 Groups - Collaboration Hub',
  features: [
    { icon: '👥', title: 'Create Groups', desc: 'Start a study group' },
    { icon: '🎯', title: 'Find Groups', desc: 'Join existing groups' },
    // ... more features
  ]
}
```

#### 2. **Suggestion Response**
Shows actionable buttons to navigate to different pages

```javascript
{
  type: 'suggestion',
  text: 'What can I help you with?',
  actions: [
    { label: 'Groups', action: 'view_groups' },
    { label: 'Skills & Match', action: 'view_recommendations' },
    // ... more actions
  ]
}
```

#### 3. **Text Response** (Default)
Simple text messages for conversational responses

```javascript
{
  type: 'bot',
  text: 'Here is helpful information...'
}
```

---

## 🧠 Intent Detection & Keywords

### Auto-Detected Topics

| Input Keyword | Bot Response | Navigation |
|---|---|---|
| "groups", "create group" | Groups features | `/groups` |
| "skills", "match", "recommend" | Skill matching features | `/recommendations` |
| "request", "invite", "join" | Requests & invitations | `/requests` |
| "task", "todo", "deadline" | Task management | `/taskboard` |
| "project", "build", "manage" | Project info | `/dashboard/projects` |
| "help", "?", "what can you do" | Help with features | Show all features |
| "hi", "hello", "hey" | Greeting response | Show main features |
| *anything else* | Smart fallback | Suggest features |

### Examples

**User:** "Tell me about groups"
- **Detection:** Keywords match 'group'
- **Response:** Feature cards showing group management capabilities
- **Action:** Groups button navigates to `/groups`

**User:** "I need help with my tasks"
- **Detection:** Keywords match 'task'
- **Response:** Task management features displayed
- **Action:** Clicking on task button navigates to `/taskboard`

**User:** "I want to find teammates"
- **Detection:** Keywords match 'match' or 'recommend'
- **Response:** Skill matching features shown
- **Action:** Click to navigate to `/recommendations`

---

## 🔌 API Endpoint

### Request
```
POST http://localhost:5008/api/aichat/message

{
  "message": "Tell me about groups"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "type": "feature",
    "text": "📁 Groups - Collaboration Hub",
    "features": [
      {
        "icon": "👥",
        "title": "Create Groups",
        "desc": "Start a study group"
      },
      // ... more features
    ]
  }
}
```

---

## 🚀 Navigation Integration

When a user clicks an action button, the chatbot:

1. **Displays Response** - Shows a message button was clicked
2. **Navigates** - Automatically routes to the relevant page (800ms delay)
3. **Minimizes Chat** - Collapses chatbot so user can see the destination page

### Navigation Map

```javascript
const navigationMap = {
  view_groups: '/groups',                // Groups Dashboard
  view_recommendations: '/recommendations', // Skill Matching
  view_requests: '/requests',            // Requests & Invites
  view_tasks: '/taskboard',              // Task Board
  view_projects: '/dashboard/projects',  // Project Dashboard
  create_group: '/create-group',         // Create Group Form
  create_task: '/taskboard',             // Go to Task Board
  create_project: '/add-project',        // Create Project Form
  send_request: '/requests'              // Requests Page
};
```

---

## 🎨 Features

### UI Components
- ✅ Floating chat button (bottom-right, always available)
- ✅ Message display area with auto-scroll
- ✅ Text input field with Enter-to-send support
- ✅ Rich message rendering (features, suggestions, text)
- ✅ Typing indicators (bouncing dots animation)
- ✅ Minimize/Maximize/Close buttons
- ✅ Responsive design (mobile & desktop)
- ✅ Dark/Light theme support
- ✅ Smooth animations and transitions

### State Management
- Chat history stored in React state (`messages` array)
- Messages structured as: `{ id, type, text, timestamp, features/actions? }`
- Input value cleared after sending
- Typing state managed during API call

### Accessibility
- Title attributes on buttons
- Semantic HTML structure
- Proper contrast in light/dark modes
- Keyboard support (Enter to send)
- Screen reader friendly labels

---

## 📝 Usage Examples

### Example 1: User Asks About Groups
```
User: "How do I create a group?"
Bot: (shows feature card with group features)
User: (clicks "Create Groups" button)
→ Navigates to /create-group
```

### Example 2: User Asks for Help
```
User: "What can I do on UniConnect?"
Bot: (shows suggestion with all feature categories)
User: (clicks any button)
→ Navigates to relevant page with chatbot minimized
```

### Example 3: User Asks About Teammates
```
User: "Find me teammates based on my skills"
Bot: (shows skill matching features)
User: (clicks "Skills & Match" button)
→ Navigates to /recommendations
```

---

## 🔧 Configuration

### Backend Port
- Default: `5000`
- Fallback: `5001-5009`
- Current: `5008`

### Frontend Port
- Development: `5173-5182`
- Configured in CORS

### Routes
- API Base: `/api/`
- Chat Endpoint: `/api/aichat/message`
- Auth Protected: Yes (JWT token in headers)

---

## ✨ Advanced Features

### 1. **Smart Context Awareness**
The chatbot maintains conversation context:
- Detects user intent from keywords
- Matches against response templates
- Provides relevant suggestions

### 2. **Error Handling**
- Graceful fallback if API fails
- User-friendly error messages
- Displays default suggestions on error

### 3. **Performance**
- Lightweight rule-based system (no AI overhead)
- Quick response times (simulated 300ms delay)
- Efficient state management
- No unnecessary re-renders

### 4. **Extensibility**
Easy to add new topics:
```javascript
const responseTemplates = {
  // Add new topic here
  feedback: {
    keywords: ['feedback', 'review', 'rating'],
    response: { /* ... */ },
    action: 'view_feedback'
  }
};
```

---

## 📊 Testing Checklist

- ✅ ChatBot button visible when logged in and profile complete
- ✅ Clicking button opens chat window
- ✅ Typing message and clicking send shows user message
- ✅ Bot responds with relevant features/suggestions
- ✅ Clicking feature buttons navigates to correct page
- ✅ Chat minimizes after navigation
- ✅ Typing indicators show while bot "thinking"
- ✅ Works in both dark and light themes
- ✅ Mobile responsive layout
- ✅ Multiple messages create scrollable history

---

## 🐛 Troubleshooting

### Issue: ChatBot not appearing
**Solutions:**
- ✓ Verify you're logged in
- ✓ Check if profile is complete (required for chatbot visibility)
- ✓ Check browser console for errors
- ✓ Reload the page

### Issue: API returning 404
**Solutions:**
- ✓ Verify backend is running on port 5008
- ✓ Check `/api/aichat/message` endpoint exists
- ✓ Verify auth token is in headers

### Issue: Navigation not working
**Solutions:**
- ✓ Ensure React Router is properly configured
- ✓ Check that all routes exist in App.jsx
- ✓ Verify useNavigate hook is imported

### Issue: Messages not displaying
**Solutions:**
- ✓ Check browser console for errors
- ✓ Verify message structure has required fields
- ✓ Check theme context is providing isDarkMode

---

## 🚀 Deployment Considerations

### Production Setup
1. Environment Variables
   - `REACT_APP_API_BASE_URL=https://api.yourdomain.com`
   - Backend port should be stable (not 5000-5009 range)

2. API Endpoint
   - Should be at `https://yourdomain.com/api/aichat/message`
   - CORS configured for production domain

3. Testing
   - Test on actual deployment domain
   - Verify navigation works with deployed routes
   - Check CSS/styling loads correctly

---

## 💾 File Changes Summary

### Created/Modified Files:
1. **backend/controllers/aiChatController.js** - Rule-based responses
2. **frontend/src/components/ChatBot.jsx** - Enhanced with navigation
3. **frontend/src/api/api.js** - ChatAPI already configured
4. **backend/routes/aiChatRoutes.js** - Routes configured
5. **backend/server.js** - Routes registered (no changes needed)

### No Breaking Changes
- ✅ All existing functionality preserved
- ✅ No dependencies added
- ✅ Backward compatible
- ✅ Can revert to AI API easily

---

## 📚 Resources

- [React Router Navigation](https://reactrouter.com/en/main)
- [React Hooks (useState, useRef, useEffect)](https://react.dev/reference/react)
- [Axios API Client](https://axios-http.com/)
- [Tailwind CSS Theming](https://tailwindcss.com/docs/dark-mode)

---

## ✅ Implementation Complete

The UniConnect Assistant chatbot is **production-ready** and fully functional with:
- ✅ Real-time message handling
- ✅ Intelligent keyword detection
- ✅ Rich UI with multiple message types
- ✅ Full page navigation integration
- ✅ Light/dark theme support
- ✅ Mobile responsive design
- ✅ Error handling and fallbacks
- ✅ No external AI API required

**Ready to deploy! 🚀**
