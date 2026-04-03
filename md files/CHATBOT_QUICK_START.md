# UniConnect Chatbot - Quick Start Guide

## 🚀 Getting Started

The chatbot is **already fully integrated** into your UniConnect app. Follow these steps to use it:

---

## 📱 How to Open the Chatbot

1. **Login to UniConnect**
   - Go to http://localhost:5183 (or your frontend URL)
   - Sign in with your credentials

2. **Complete Your Profile** (if first time)
   - Fill in your personal information
   - Add your skills
   - Click "Save Profile"

3. **Click the Chat Button**
   - Look for the **purple floating button** in the bottom-right corner
   - It has a chat bubble icon with a spinning sparkle
   - Click it to open the AssistantTab

4. **Start Chatting**
   - Type your message (e.g., "Show me groups")
   - Press **Enter** or click the **Send** button
   - The bot will respond instantly

---

## 💬 What Can You Ask?

### Groups & Collaboration
```
"Show me groups"
"How do I create a group?"
"Tell me about group features"
"I want to find a study group"
→ Gets group management features
→ Click to go to /groups page
```

### Skills & Matching
```
"Find teammates"
"Show me skill matches"
"Recommend people to work with"
"I need a team for my project"
→ Gets skill matching features
→ Click to go to /recommendations page
```

### Requests & Invites
```
"Show my requests"
"How do I send an invitation?"
"Manage partnership requests"
"I want to invite someone"
→ Gets request management features
→ Click to go to /requests page
```

### Tasks & Organization
```
"Show my tasks"
"How do I create a task?"
"Help me organize my work"
"Track my progress"
→ Gets task management features
→ Click to go to /taskboard page
```

### Get Help
```
"Help!"
"What can I do?"
"Show me all features"
"How do I use UniConnect?"
→ Gets comprehensive feature overview
→ Click specific feature to navigate
```

---

## 🎯 Using the Chat Action Buttons

### When Bot Shows Feature Cards

**Groups Feature Card Example:**
```
📁 Groups - Collaboration Hub

┌─────────────┬─────────────┐
│  👥 Create  │  🎯 Find    │
│  Groups     │  Groups     │
├─────────────┼─────────────┤
│  💬 Work    │  🚀 Launch  │
│  Together   │  Projects   │
└─────────────┴─────────────┘

[Create Groups] Button
```

Click any button to:
1. Send a message to the bot
2. Automatically navigate to that page
3. Minimize the chat so you can see the page

### When Bot Shows Suggestions

**Example:**
```
What can I help you with?

[Groups]               ➜
[Skills & Match]       ➜
[Requests]             ➜
[Tasks]                ➜
```

Each button takes you directly to that feature.

---

## 🌓 Theme Support

The chatbot automatically matches your app's theme:

### Light Mode
- White/gray chat background
- Dark text
- Blue gradient buttons
- Smooth shadows

### Dark Mode
- Dark slate background
- Light text
- Blue/cyan gradient buttons
- Subtle glows

Toggle theme anytime - chatbot updates instantly!

---

## 🔄 Chat Features

### Auto-Scroll
- Chat automatically scrolls to the latest message
- Works on desktop and mobile
- Smooth scroll animation

### Typing Indicator
- See animated dots when bot is "thinking"
- Quick 300ms response time
- Natural conversation feel

### Clear Input
- Message input clears after sending
- Ready for next message immediately

### Minimize/Expand
- Click minimize button to collapse chat
- Chat stays on screen, takes less space
- Click expand to see messages again

### Close Chat
- Click X button to close chatbot
- Purple button reappears to reopen
- All conversation history preserved

---

## 📊 Conversation Examples

### Example 1: Beginner's First Chat

**You:** "Hi!"
**Bot:** "Hey there, superstar! 🌟 I'm your UniConnect Assistant! I can help you with..."
**Bot:** Shows 4 feature categories

**You:** Click [Groups]
**Bot:** Shows group features with Create/Find buttons

**You:** Click [Create Groups]
**Bot:** "📁 Show me the groups"
→ Page navigates to /groups
→ Chat minimizes
→ You can now create a group!

---

### Example 2: Intermediate User

**You:** "Find me good teammates"
**Bot:** Shows skill matching features
**Bot:** Provides 4 options related to finding teammates

**You:** Click [View Recommendations]
**Bot:** "⭐ Find teammates by skills"
→ Page navigates to /recommendations
→ You see recommended teammates based on skills!

---

### Example 3: Task Management

**You:** "I have too many tasks to manage"
**Bot:** Shows task management features with icons

**You:** Click [Track Progress]
**Bot:** "✅ Show my tasks"
→ Page navigates to /taskboard
→ You see all your tasks in a kanban board!

---

## 🎨 UI Controls

### Chat Header
```
[⚡ UniConnect Pro]    [−] [□] [×]
🟢 Active & Ready      Min Expand Close
```

### Chat Input Area
```
[Ask me anything...        ] [↑]
Message field              Send button
```

### Chat Window Size
- **Width:** 384px (w-96)
- **Height:** 650px (h-[650px])
- **Responsive:** Yes, mobile friendly
- **Position:** Bottom-right corner, z-index 50

### Action Buttons
- **Style:** Gradient background (primary → accent)
- **Hover:** Slight color shift + arrow animation
- **Disabled:** Grayed out when message is empty

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| **Enter** | Send message |
| **Shift+Enter** | New line (if needed) |
| **Escape** | Close chat (optional) |
| **Tab** | Navigate between buttons |

---

## 🔍 What Happens Behind the Scenes

### Message Flow
```
You type: "groups"
    ↓
Press Enter
    ↓
Message sent to: POST /api/aichat/message
    ↓
Backend detects: "groups" keyword found
    ↓
Returns: Groups feature card + buttons
    ↓
Chat displays: Rich feature card
    ↓
You click button
    ↓
Navigates to: /groups page
```

### Response Time
- **Perception:** Instant (~300ms + network time)
- **Actual:** Backend simulates 300ms "thinking" time
- **Result:** Feels natural and conversational

---

## ❓ FAQ

### Q: Why does the chatbot need profile completion?
**A:** The chatbot shows personalized features based on your profile information (skills, interests, etc.)

### Q: Can I chat without internet?
**A:** No, it requires backend connection. If API fails, you get helpful fallback suggestions.

### Q: Does chatbot save my conversation?
**A:** No, conversations are only in memory during your session. Page refresh clears history (by design).

### Q: Can I customize the bot?
**A:** Yes! Modify keywords and responses in `backend/controllers/aiChatController.js`

### Q: Is the chatbot using AI?
**A:** No! It uses simple keyword matching - fast, reliable, no API costs.

### Q: How do I add a new feature to the chatbot?
**A:** See CHATBOT_CODE_REFERENCE.md → "Extension Points" section

---

## 🐛 Troubleshooting

### ChatBot Button Not Showing?
```
Checklist:
☐ Are you logged in?
☐ Is your profile complete? (required!)
☐ Is the button in bottom-right corner?
☐ Check browser console for errors (F12)
```

### Messages Not Sending?
```
Checklist:
☐ Is backend running? (http://localhost:5008)
☐ Did you type something? (can't send empty messages)
☐ Is there a network error? (check console)
☐ Reload the page and try again
```

### Navigation Not Working?
```
Checklist:
☐ Are all routes defined in App.jsx?
☐ Is React Router working? (test normal navigation)
☐ Check console for routing errors
☐ Verify URLs match the navigation map in ChatBot.jsx
```

### Chatbot Appears Blank?
```
Checklist:
☐ Is theme loading? (check isDarkMode in ThemeContext)
☐ Do CSS styles load? (check for Tailwind errors)
☐ Open DevTools → Elements → inspect chatbot div
☐ Check if messages array is populated
```

---

## 📈 Usage Tips

### Best Practices
1. **Be specific** - "Show me groups" works better than "groups"
2. **Use natural language** - "Help me find teammates" or "I want to collaborate"
3. **Click buttons** - Buttons are faster than typing
4. **Minimize after navigation** - Gives more screen space
5. **Scroll through chat** - See full conversation history

### Workflow Example
1. Open chat
2. Ask "What can I do?" to see all features
3. Click feature you want to explore
4. Chat minimizes as you navigate
5. Complete your task
6. Reopen chat for next action

---

## 🎓 Learning Resources

### Understanding the Chatbot
1. Read [CHATBOT_IMPLEMENTATION.md](./CHATBOT_IMPLEMENTATION.md) - Full overview
2. Read [CHATBOT_CODE_REFERENCE.md](./CHATBOT_CODE_REFERENCE.md) - Code examples
3. Explore responses in `backend/controllers/aiChatController.js`

### Customizing the Chatbot
1. Modify keywords in response templates
2. Add new featured topics
3. Change navigation routes
4. Update UI styling

### Advanced Topics
- Integrating real AI (swap controller logic)
- Adding chat persistence (save to database)
- Implementing user-specific responses
- Adding analytics/logging

---

## 🚀 Next Steps

1. **Try It Out**
   - Open the app
   - Click the chat button
   - Send "Hello"
   - Explore different topics

2. **Customize It**
   - Modify response text
   - Add new keywords
   - Change navigation routes
   - Update styling

3. **Deploy It**
   - Test on staging
   - Configure production URLs
   - Monitor usage
   - Gather user feedback

---

## 📞 Support

### For Issues with Chatbot:
1. Check console for errors (F12 → Console)
2. Verify backend is running
3. Check CHATBOT_IMPLEMENTATION.md for troubleshooting
4. Review CHATBOT_CODE_REFERENCE.md for implementation details

### To Report Bugs:
1. Note exact steps to reproduce
2. Include error message from console
3. Provide screenshot if visual issue
4. Check current behavior vs expected

---

## ✨ Happy Chatting!

The UniConnect Assistant is ready to help your users explore the platform, discover features, and navigate with ease. Enjoy! 🎉

---

**Version:** 1.0
**Status:** Production Ready ✅
**Last Updated:** April 4, 2026
