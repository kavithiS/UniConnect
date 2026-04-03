// Smart Rule-Based Chat Controller with NLP
// Intelligent keyword matching with fuzzy logic and context awareness

// Levenshtein distance for typo tolerance
const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  const distance = matrix[len2][len1];
  return 1 - (distance / Math.max(len1, len2));
};

// Enhanced response templates with expanded keywords and intents
const responseTemplates = {
  groups: {
    keywords: [
      'group', 'groups', 'create group', 'find group', 'join group', 'student group',
      'study group', 'team', 'collaborate', 'team up', 'get together', 'community',
      'club', 'peer', 'peers', 'together', 'partnership', 'group collaboration'
    ],
    priority: 10,
    response: {
      type: 'feature',
      text: '📁 Groups - Find Your Collaboration Hub',
      features: [
        { icon: '👥', title: 'Browse Groups', desc: 'Find active study groups' },
        { icon: '✨', title: 'Create Groups', desc: 'Start your own community' },
        { icon: '💬', title: 'Real-time Chat', desc: 'Discuss with members' },
        { icon: '🎯', title: 'Collaborate', desc: 'Work on projects together' }
      ]
    },
    action: 'view_groups',
    suggestions: ['Want to find teammates?', 'Looking to join a group?', 'Create your own group!']
  },
  skills: {
    keywords: [
      'skill', 'skills', 'match', 'recommend', 'recommendation', 'find teammate',
      'find partner', 'compatibility', 'perfect match', 'colleague', 'partner',
      'expertise', 'ability', 'capable', 'qualified', 'talent', 'strength'
    ],
    priority: 9,
    response: {
      type: 'feature',
      text: '⭐ Smart Skill Matching',
      features: [
        { icon: '🤖', title: 'Match Engine', desc: 'AI finds your perfect partners' },
        { icon: '📊', title: 'Compatibility', desc: 'See skill alignment scores' },
        { icon: '👥', title: 'Teammate Zoo', desc: 'Browse and connect' },
        { icon: '🚀', title: 'Instant Collab', desc: 'Start working together' }
      ]
    },
    action: 'view_recommendations',
    suggestions: ['Show me compatible teammates', 'Find my match!', 'Explore recommendations']
  },
  requests: {
    keywords: [
      'request', 'requests', 'invite', 'invitation', 'join', 'ask', 'message',
      'partnership', 'inbox', 'pending', 'response', 'accept', 'decline',
      'notification', 'alert', 'reach out', 'connect me'
    ],
    priority: 8,
    response: {
      type: 'feature',
      text: '📨 Requests & Partnerships',
      features: [
        { icon: '✉️', title: 'Compose Request', desc: 'Reach out to others' },
        { icon: '📬', title: 'Inbox', desc: 'View your invitations' },
        { icon: '✅', title: 'Respond', desc: 'Accept or decline' },
        { icon: '🔔', title: 'Track All', desc: 'See all pending requests' }
      ]
    },
    action: 'view_requests',
    suggestions: ['Check my inbox', 'Send a request', 'See my pending invites']
  },
  tasks: {
    keywords: [
      'task', 'tasks', 'todo', 'to-do', 'work', 'deadline', 'deadline', 'organize',
      'organize', 'checklist', 'progress', 'complete', 'finish', 'assignment',
      'milestone', 'activity', 'action item', 'project task', 'workflow'
    ],
    priority: 8,
    response: {
      type: 'feature',
      text: '✅ Task Management',
      features: [
        { icon: '📝', title: 'Create Tasks', desc: 'Define work items clearly' },
        { icon: '⏰', title: 'Set Deadlines', desc: 'Stay on schedule' },
        { icon: '🎯', title: 'Prioritize', desc: 'Focus on important work' },
        { icon: '📊', title: 'Track Progress', desc: 'Monitor completion rates' }
      ]
    },
    action: 'view_tasks',
    suggestions: ['What\'s my task list?', 'Create a new task', 'Show my progress']
  },
  projects: {
    keywords: [
      'project', 'projects', 'build', 'create project', 'manage project', 'project management',
      'team project', 'work on', 'working on', 'initiative', 'endeavor', 'objective',
      'goal', 'mission', 'undertaking', 'assignment'
    ],
    priority: 9,
    response: {
      type: 'feature',
      text: '🚀 Projects - Your Command Center',
      features: [
        { icon: '📋', title: 'Organize All', desc: 'Centralize everything' },
        { icon: '👥', title: 'Manage Teams', desc: 'Add and remove members' },
        { icon: '⚙️', title: 'Configure', desc: 'Custom workflows' },
        { icon: '📈', title: 'Track', desc: 'Monitor all metrics' }
      ]
    },
    action: 'view_projects',
    suggestions: ['Show my projects', 'Create a project', 'Who\'s on my team?']
  }
};

// Dynamic response selection based on context
const generateContextualResponse = (intent, sentiment = 'neutral') => {
  const base = responseTemplates[intent];
  if (!base) return null;
  
  const responses = {
    enthusiastic: `🎉 I love your energy! Let me show you ${base.response.text}!`,
    curious: `🔍 Great question! Here's what you can do with ${base.response.text}`,
    casual: `💁 Sure! Check out ${base.response.text}`,
    default: base.response.text
  };
  
  return {
    ...base.response,
    text: responses[sentiment] || responses.default
  };
};

// Greeting variations for more natural interaction
const greetingVariations = [
  '👋 Hey! Great to see you! What\'s on your mind today?',
  '🌟 Welcome back! How can I help you connect?',
  '😊 Hi there! Ready to collaborate or find teammates?',
  '🚀 Hey superstar! What would you like to do?',
  '💫 Hello! Let\'s make something awesome happen!'
];

// Help with personality
const helpVariations = [
  {
    intro: '📚 Here\'s what I can help you with:',
    items: [
      '📁 **Groups** - Find or create study groups and collaborate',
      '⭐ **Skills** - Find teammates with complementary skills',
      '📨 **Requests** - Send invitation and manage partnerships',
      '✅ **Tasks** - Organize and track your work items',
      '🚀 **Projects** - Manage team projects from start to finish'
    ]
  }
];

// Intelligent intent detection with fuzzy matching
const detectIntent = (message) => {
  const lowerMsg = message.toLowerCase().trim();
  const words = lowerMsg.split(/\s+/);
  
  // Sentiment detection for better responses
  const sentimentKeywords = {
    enthusiastic: ['please', 'excited', 'amazing', 'awesome', 'love', 'want', '!'],
    curious: ['how', 'what', 'why', 'can', 'could', 'would', '?']
  };
  
  let sentiment = 'neutral';
  for (const [sent, keywords] of Object.entries(sentimentKeywords)) {
    if (keywords.some(k => lowerMsg.includes(k))) {
      sentiment = sent;
      break;
    }
  }

  // Check for exact greetings
  const greetingKeywords = ['hi', 'hello', 'hey', 'greetings', 'hey there', 'hiii', 'helloo', 'howdy'];
  if (greetingKeywords.some(k => lowerMsg.includes(k))) {
    return { type: 'greeting', intent: null, sentiment };
  }

  // Check for help keywords
  const helpKeywords = ['help', 'what can you do', 'features', 'commands', 'guide', 'support', 'how does this work'];
  if (helpKeywords.some(k => lowerMsg.includes(k)) || lowerMsg === '?') {
    return { type: 'help', intent: null, sentiment };
  }

  // Score-based matching with fuzzy logic
  let bestMatch = null;
  let bestScore = 0.4; // Minimum confidence threshold

  for (const [topic, config] of Object.entries(responseTemplates)) {
    let topicScore = 0;
    
    // Check each keyword with fuzzy matching
    for (const keyword of config.keywords) {
      if (lowerMsg.includes(keyword)) {
        // Exact match
        topicScore += 1;
      } else {
        // Fuzzy match for typos
        const similarity = calculateSimilarity(keyword, lowerMsg);
        if (similarity > 0.7) {
          topicScore += similarity * 0.8;
        }
        
        // Check if any word in message is similar to keyword
        for (const word of words) {
          const wordSim = calculateSimilarity(word, keyword);
          if (wordSim > 0.75) {
            topicScore += wordSim * 0.5;
          }
        }
      }
    }
    
    // Weight by priority
    topicScore *= (config.priority / 10);
    
    if (topicScore > bestScore) {
      bestScore = topicScore;
      bestMatch = { topic, config, sentiment };
    }
  }

  if (bestMatch) {
    return {
      type: 'topic',
      intent: bestMatch.topic,
      action: bestMatch.config.action,
      sentiment: bestMatch.sentiment,
      confidence: bestScore
    };
  }

  return { type: 'default', intent: null, sentiment };
};

// Smart suggestion based on context
const generateSmartSuggestion = (intent) => {
  if (responseTemplates[intent]) {
    const suggestions = responseTemplates[intent].suggestions;
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  }
  return 'Need help with anything?';
};

// Main intelligent chat handler
exports.chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    // Detect user intent with confidence scoring
    const intent = detectIntent(message);
    let responseData;

    if (intent.type === 'greeting') {
      // Random greeting variation
      const greeting = greetingVariations[Math.floor(Math.random() * greetingVariations.length)];
      responseData = {
        type: 'suggestion',
        text: greeting,
        actions: [
          { label: '📁 Groups', action: 'view_groups' },
          { label: '⭐ Skills', action: 'view_recommendations' },
          { label: '📨 Requests', action: 'view_requests' },
          { label: '✅ Tasks', action: 'view_tasks' }
        ]
      };
    } else if (intent.type === 'help') {
      // Comprehensive help response
      const helpInfo = helpVariations[0];
      responseData = {
        type: 'suggestion',
        text: helpInfo.intro,
        items: helpInfo.items,
        actions: [
          { label: '👥 Groups', action: 'view_groups' },
          { label: '⭐ Skills', action: 'view_recommendations' },
          { label: '📨 Requests', action: 'view_requests' },
          { label: '✅ Tasks', action: 'view_tasks' },
          { label: '🚀 Projects', action: 'view_projects' }
        ]
      };
    } else if (intent.type === 'topic' && intent.intent && responseTemplates[intent.intent]) {
      // Smart contextual response based on detected topic
      const templateData = responseTemplates[intent.intent];
      responseData = {
        ...templateData.response,
        suggestedAction: intent.action,
        confidence: Math.round(intent.confidence * 100),
        nextAction: generateSmartSuggestion(intent.intent)
      };
    } else {
      // Intelligent fallback with suggestions
      responseData = {
        type: 'suggestion',
        text: '🤔 I\'m not entirely sure, but here\'s what I can help with:',
        actions: [
          { label: '📁 Explore Groups', action: 'view_groups' },
          { label: '⭐ Find Teammates', action: 'view_recommendations' },
          { label: '📨 Check Requests', action: 'view_requests' },
          { label: '✅ Manage Tasks', action: 'view_tasks' },
          { label: '🚀 See Projects', action: 'view_projects' }
        ]
      };
    }

    // Natural typing delay (100-400ms)
    const delay = Math.random() * 300 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));

    res.status(200).json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to process your message. Please try again.',
      error: error.message
    });
  }
};
