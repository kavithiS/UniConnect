# UniConnect Chatbot - Code Reference & Examples

## Architecture Overview

```
Frontend (React)
    ↓
ChatBot.jsx Component
    ├── State: messages, inputValue, isOpen, isTyping
    ├── Handlers: handleSendMessage, handleActionClick
    └── UI: Message list, input field, action buttons
    ↓
API Request
    ↓
Backend (Express)
    ↓
aiChatController.js
    ├── detectIntent() - parse user message
    ├── responseTemplates - predefined responses
    └── return rich response object
    ↓
API Response
    ↓
ChatBot.jsx Rendering
    ├── renderMessage() - different message types
    └── navigate() - route to destination
```

---

## Backend Code Structure

### File: `backend/controllers/aiChatController.js`

#### 1. Response Templates System

```javascript
const responseTemplates = {
  groups: {
    keywords: ['group', 'create group', 'find group'],
    response: {
      type: 'feature',
      text: '📁 Groups - Collaboration Hub',
      features: [
        { icon: '👥', title: 'Create Groups', desc: 'Start a study group' },
        { icon: '🎯', title: 'Find Groups', desc: 'Join existing groups' },
        { icon: '💬', title: 'Collaborate', desc: 'Work together' },
        { icon: '🚀', title: 'Launch Projects', desc: 'Start team projects' }
      ]
    },
    action: 'view_groups'
  },
  // ... more topics (skills, requests, tasks, projects)
};
```

**Why This Approach?**
- ✅ No AI API required
- ✅ Fast response times
- ✅ Predictable behavior
- ✅ Easy to customize
- ✅ Cost-effective

#### 2. Intent Detection Function

```javascript
const detectIntent = (message) => {
  const lowerMsg = message.toLowerCase().trim();

  // Check greeting
  if (['hi', 'hello', 'hey'].some(kw => lowerMsg.includes(kw))) {
    return { type: 'greeting', intent: null };
  }

  // Check help
  if (['help', '?'].some(kw => lowerMsg.includes(kw))) {
    return { type: 'help', intent: null };
  }

  // Check each topic's keywords
  for (const [topic, config] of Object.entries(responseTemplates)) {
    if (config.keywords.some(kw => lowerMsg.includes(kw))) {
      return { type: 'topic', intent: topic, action: config.action };
    }
  }

  return { type: 'default', intent: null };
};
```

**How It Works:**
1. Convert message to lowercase
2. Check against greeting patterns → return greeting type
3. Check against help patterns → return help type
4. Loop through response templates
5. If any keyword matches → return topic type
6. Otherwise → return default type

#### 3. Main Controller Function

```javascript
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Detect user intent
    const { type, intent, action } = detectIntent(message);

    let responseData;

    if (type === 'greeting') {
      responseData = greetingResponses[0];
    } else if (type === 'help') {
      responseData = helpResponses[0];
    } else if (type === 'topic' && responseTemplates[intent]) {
      responseData = {
        ...responseTemplates[intent].response,
        suggestedAction: action
      };
    } else {
      responseData = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }

    // Simulate slight delay (300ms)
    await new Promise(resolve => setTimeout(resolve, 300));

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process your message.'
    });
  }
};
```

**Key Points:**
- Validates input is not empty
- Detects intent using keyword matching
- Returns rich response object
- Simulates 300ms delay for natural feel
- Includes error handling

---

## Frontend Code Structure

### File: `frontend/src/components/ChatBot.jsx`

#### 1. Component State

```javascript
const [messages, setMessages] = useState([
  {
    id: 1,
    type: 'greeting',
    text: 'Hey there, superstar!',
    subtext: 'I\'m your UniConnect Assistant!',
    timestamp: new Date()
  },
  // ... initial greeting message
]);

const [inputValue, setInputValue] = useState('');
const [isTyping, setIsTyping] = useState(false);
const [isOpen, setIsOpen] = useState(false);
const [isMinimized, setIsMinimized] = useState(false);
```

#### 2. Send Message Handler

```javascript
const handleSendMessage = async (messageText = inputValue) => {
  const trimmedMessage = messageText.trim();
  if (!trimmedMessage) return;

  // Add user message to chat
  const userMessage = {
    id: Date.now(),
    type: 'user',
    text: trimmedMessage,
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  setInputValue(''); // Clear input
  setIsTyping(true); // Show typing indicator

  try {
    // Call API
    const res = await chatAPI.sendMessage({
      message: trimmedMessage
    });

    // Get bot response
    const botResponse = res.data?.data;

    if (botResponse) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        ...botResponse,
        type: botResponse.type || 'suggestion',
        timestamp: new Date()
      }]);
    }
  } catch (err) {
    // Fallback error response
    setMessages(prev => [...prev, {
      id: Date.now() + 1,
      type: 'suggestion',
      text: 'I\'m having trouble. Try asking about:',
      actions: [
        { label: 'Groups', action: 'view_groups' },
        { label: 'Skills', action: 'view_recommendations' },
        { label: 'Requests', action: 'view_requests' },
        { label: 'Tasks', action: 'view_tasks' }
      ],
      timestamp: new Date()
    }]);
  } finally {
    setIsTyping(false); // Hide typing indicator
  }
};
```

#### 3. Action Click Handler with Navigation

```javascript
const handleActionClick = (action) => {
  // First, send a message to the bot
  const actionMessages = {
    view_groups: '📁 Show me the groups',
    view_recommendations: '⭐ Find teammates by skills',
    view_requests: '📨 View my requests',
    view_tasks: '✅ Show my tasks',
    view_projects: '🚀 View my projects',
    // ... more actions
  };

  const message = actionMessages[action] || '';
  if (message) {
    handleSendMessage(message);
  }

  // Then navigate after a delay
  const navigationMap = {
    view_groups: '/groups',
    view_recommendations: '/recommendations',
    view_requests: '/requests',
    view_tasks: '/taskboard',
    view_projects: '/dashboard/projects',
    // ... more routes
  };

  const navPath = navigationMap[action];
  if (navPath) {
    setTimeout(() => {
      navigate(navPath); // Use React Router navigation
      setIsMinimized(true); // Minimize chat
    }, 800); // Wait for bot response to appear
  }
};
```

#### 4. Message Rendering

```javascript
const renderMessage = (message) => {
  switch (message.type) {
    case 'user':
      // User message (blue, right-aligned)
      return (
        <div key={message.id} className="flex justify-end">
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
            {message.text}
          </div>
        </div>
      );

    case 'feature':
      // Feature card (grid of features)
      return (
        <div key={message.id} className="flex justify-start">
          <div className="max-w-sm px-4 py-3 rounded-2xl">
            <h3 className="font-bold mb-3">{message.text}</h3>
            <div className="grid grid-cols-2 gap-2">
              {message.features.map((feature, idx) => (
                <div key={idx} className="p-3 rounded-lg border">
                  <div className="text-xl">{feature.icon}</div>
                  <p className="font-semibold text-xs">{feature.title}</p>
                  <p className="text-xs mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );

    case 'suggestion':
      // Suggestion with action buttons
      return (
        <div key={message.id} className="flex justify-start">
          <div className="max-w-sm px-4 py-3 rounded-2xl">
            <p className="font-semibold mb-3">{message.text}</p>
            <div className="space-y-2">
              {message.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => handleActionClick(action.action)}
                  className="w-full px-3 py-2 rounded-lg bg-gradient-to-r from-primary/40 to-accent/40"
                >
                  <span>{action.label}</span>
                  <ArrowRight size={14} />
                </button>
              ))}
            </div>
          </div>
        </div>
      );

    default:
      // Plain text message
      return (
        <div key={message.id} className="flex justify-start">
          <div className="px-4 py-3 rounded-2xl bg-slate-800 text-slate-100">
            {message.text}
          </div>
        </div>
      );
  }
};
```

---

## API Communication

### File: `frontend/src/api/api.js`

```javascript
import axios from 'axios';
import { getApiBaseUrl } from '../utils/backendUrl';

// Create axios instance
const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to set base URL
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

// ChatBot API
export const chatAPI = {
  sendMessage: (payload) => api.post('/aichat/message', payload)
};
```

### Usage Example

```javascript
// Frontend sends message
const res = await chatAPI.sendMessage({
  message: "Tell me about groups"
});

// Response structure
{
  success: true,
  data: {
    type: 'feature',
    text: '📁 Groups - Collaboration Hub',
    features: [
      { icon: '👥', title: 'Create Groups', desc: '...' },
      // ...
    ]
  }
}
```

---

## How Keyword Matching Works

### Example 1: User Asks "How do I create a group?"

```
Input: "How do I create a group?"
↓
Lowercase: "how do i create a group?"
↓
Loop through responseTemplates
↓
Check groups.keywords: ['group', 'create group', ...]
↓
Match found! 'group' matches
↓
intent = 'groups'
↓
Return responseTemplates.groups.response
↓
Response sent to frontend
```

### Example 2: User Asks "What's a task?"

```
Input: "What's a task?"
↓
Lowercase: "what's a task?"
↓
Loop through responseTemplates
↓
Check tasks.keywords: ['task', 'todo', 'work', ...]
↓
Match found! 'task' matches
↓
intent = 'task'
↓
Return responseTemplates.tasks.response
↓
Response sent to frontend
```

### Example 3: User Asks "Help me!"

```
Input: "Help me!"
↓
Lowercase: "help me!"
↓
Check help patterns: ['help', '?', ...]
↓
Match found! 'help' matches
↓
type = 'help'
↓
Return helpResponses[0]
↓
Response sent to frontend
```

---

## Navigation Flow Example

### Step 1: User Clicks "View Tasks"

```javascript
// handleActionClick('view_tasks') is called
```

### Step 2: Send Message to Bot

```javascript
handleSendMessage('✅ Show my tasks')
// This adds a user message to the chat
```

### Step 3: Wait for Response

```javascript
// Bot responds with task features
// Takes ~300ms to respond
```

### Step 4: Navigate After Delay

```javascript
setTimeout(() => {
  navigate('/taskboard'); // Go to task page
  setIsMinimized(true);   // Minimize chat
}, 800); // Wait for response to display
```

### Step 5: User Sees

```
1. Chat message appears: "✅ Show my tasks"
2. Bot responds with features (300ms)
3. Chat minimizes and page changes to /taskboard
```

---

## Theme Support

### Dark Mode Detection

```javascript
const { isDarkMode } = useTheme();

// Conditional styling
<div className={isDarkMode ? 'bg-slate-800' : 'bg-white'}>
  {/* Content */}
</div>
```

### Dynamic Colors in JSX

```javascript
// Custom styling based on theme
style={{
  background: isDarkMode
    ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), ...)'
    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), ...)',
  boxShadow: isDarkMode
    ? '0 8px 32px rgba(59, 130, 246, 0.1)'
    : '0 8px 32px rgba(59, 130, 246, 0.15)'
}}
```

---

## Error Handling Strategy

### API Error Handling

```javascript
try {
  const res = await chatAPI.sendMessage({ message });
  // Process response
} catch (err) {
  console.error("Chat Error:", err);
  
  // Show fallback message with feature suggestions
  setMessages(prev => [...prev, {
    type: 'suggestion',
    text: 'Having trouble. Try these:',
    actions: [
      { label: 'Groups', action: 'view_groups' },
      // ... more options
    ]
  }]);
}
```

### Backend Error Response

```javascript
if (!message || !message.trim()) {
  return res.status(400).json({
    success: false,
    message: 'Message is required'
  });
}
```

---

## Performance Optimizations

### 1. Message ID Strategy
```javascript
// Unique ID based on timestamp
id: Date.now(), // First message
id: Date.now() + 1, // Second message

// Ensures no duplicate keys in lists
```

### 2. Auto-Scroll Optimization
```javascript
const messagesEndRef = useRef(null);

useEffect(() => {
  // Only scroll when messages array changes
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
}, [messages]);

// At end of chat: <div ref={messagesEndRef} />
```

### 3. Memoization (Optional upgrade)
```javascript
// For large chat histories, could use useMemo
const renderedMessages = useMemo(() => {
  return messages.map(msg => renderMessage(msg));
}, [messages, isDarkMode]);
```

---

## Extension Points

### Adding a New Topic

```javascript
// In backend/controllers/aiChatController.js

const responseTemplates = {
  // ... existing topics
  
  feedback: { // NEW TOPIC
    keywords: ['feedback', 'review', 'rating', 'give feedback'],
    response: {
      type: 'feature',
      text: '⭐ Peer Feedback System',
      features: [
        { icon: '✍️', title: 'Write Feedback', desc: 'Review teammates' },
        { icon: '📊', title: 'View Ratings', desc: 'See your feedback' },
        { icon: '💬', title: 'Comments', desc: 'Detailed feedback' },
        { icon: '📈', title: 'Analytics', desc: 'Track growth' }
      ]
    },
    action: 'view_feedback'
  }
};
```

### Adding a New Action

```javascript
// In frontend/src/components/ChatBot.jsx

const actionMessages = {
  // ... existing actions
  view_feedback: '⭐ Show me feedback' // NEW
};

const navigationMap = {
  // ... existing routes
  view_feedback: '/feedback' // NEW
};
```

---

## Testing Scenarios

### Test 1: Message Sending
```
✓ Type "Hello"
✓ Click send button
✓ Message appears instantly
✓ Input cleared
✓ Typing indicator shows
✓ Bot responds ~300ms later
```

### Test 2: Feature Button
```
✓ Type "groups"
✓ Bot shows group features
✓ Click "Create Groups"
✓ Message logged ("📁 Show me the groups")
✓ Page navigates to /groups
✓ Chat minimizes
```

### Test 3: Multiple Messages
```
✓ Send message 1 → bot responds
✓ Send message 2 → bot responds
✓ Chat history preserved
✓ Auto-scroll shows latest
✓ All messages visible in history
```

### Test 4: Theme Toggle
```
✓ Open chat in light mode
✓ Toggle to dark mode
✓ Chat colors update
✓ Text remains readable
✓ Buttons styled correctly
```

---

## Debugging Tips

### Enable Console Logging

```javascript
// Add in handleSendMessage
console.log('Sending message:', trimmedMessage);

// Add in handleActionClick
console.log('Navigating to:', navPath);

// Add in response handling
console.log('Bot response:', botResponse);
```

### Check Network Request

1. Open DevTools → Network tab
2. Type message and send
3. Look for `POST /api/aichat/message`
4. View request payload and response
5. Check response structure

### Verify State

```javascript
// Add console logging
console.log('Messages:', messages);
console.log('IsTyping:', isTyping);
console.log('InputValue:', inputValue);
```

---

## Summary

The UniConnect Assistant chatbot provides:

- ✅ **Fast responses** - Rule-based (no AI API delays)
- ✅ **Easy customization** - Simple keyword templates
- ✅ **Full navigation** - Integrated with React Router
- ✅ **Rich UI** - Multiple message types
- ✅ **Good UX** - Typing indicators, auto-scroll, themes
- ✅ **Error handling** - Graceful fallbacks
- ✅ **Extensible** - Easy to add new topics

**Ready for production!** 🚀
