import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles, ArrowRight, Lightbulb, CheckCircle2, Users, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { chatAPI } from '../api/api';

const ChatBot = () => {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const timeoutRef = useRef(null);
  const [conversationContext, setConversationContext] = useState({
    discussedTopics: [],
    userIntent: null,
    lastTopic: null
  });
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'greeting',
      text: '👋 Hey there, superstar! 🌟',
      subtext: 'I\'m your UniConnect Assistant!',
      timestamp: new Date()
    },
    {
      id: 2,
      type: 'feature',
      text: 'I can help you with:',
      features: [
        { icon: '📁', title: 'Groups', desc: 'Build & collaborate' },
        { icon: '⭐', title: 'Skills', desc: 'Find perfect matches' },
        { icon: '📨', title: 'Requests', desc: 'Manage partnerships' },
        { icon: '✅', title: 'Tasks', desc: 'Organize work' }
      ],
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Enhanced Response System with Rich Message Types
  const botResponses = {
    group: {
      responses: [
        {
          type: 'feature',
          text: '📁 Groups - Collaboration Hub',
          features: [
            { icon: '👥', title: 'Invite Members', desc: 'Add people to your group' },
            { icon: '🎯', title: 'Set Goals', desc: 'Define group objectives' },
            { icon: '📋', title: 'Group Tasks', desc: 'Organize team work' },
            { icon: '💬', title: 'Collaborate', desc: 'Work together seamlessly' }
          ]
        },
        {
          type: 'suggestion',
          text: 'Want to create your first group?',
          actions: [
            { label: 'Create Group', action: 'create_group' },
            { label: 'View Groups', action: 'view_groups' }
          ]
        }
      ]
    },
    skill: {
      responses: [
        {
          type: 'feature',
          text: '⭐ Smart Skill Matching',
          features: [
            { icon: '🤖', title: 'AI Analysis', desc: 'Intelligent matching' },
            { icon: '👥', title: 'Perfect Partners', desc: 'Find like minds' },
            { icon: '📊', title: 'Analytics', desc: 'See compatibility' },
            { icon: '🚀', title: 'Collaboration', desc: 'Start projects' }
          ]
        },
        {
          type: 'suggestion',
          text: 'Ready to find your perfect match?',
          actions: [
            { label: 'View Recommendations', action: 'view_recommendations' },
            { label: 'Explore Skills', action: 'explore_skills' }
          ]
        }
      ]
    },
    request: {
      responses: [
        {
          type: 'feature',
          text: '📨 Requests & Partnerships',
          features: [
            { icon: '✉️', title: 'Send Request', desc: 'Reach out to others' },
            { icon: '📬', title: 'Inbox', desc: 'Manage invitations' },
            { icon: '✅', title: 'Accept/Decline', desc: 'Quick decisions' },
            { icon: '🔔', title: 'Notifications', desc: 'Stay updated' }
          ]
        },
        {
          type: 'suggestion',
          text: 'Start collaborating today!',
          actions: [
            { label: 'View Requests', action: 'view_requests' },
            { label: 'Send Request', action: 'send_request' }
          ]
        }
      ]
    },
    task: {
      responses: [
        {
          type: 'feature',
          text: '✅ Task Management',
          features: [
            { icon: '📝', title: 'Create Tasks', desc: 'Define work items' },
            { icon: '⏰', title: 'Deadlines', desc: 'Set timeframes' },
            { icon: '🎯', title: 'Priorities', desc: 'Focus on important' },
            { icon: '📊', title: 'Track Progress', desc: 'Monitor completion' }
          ]
        },
        {
          type: 'suggestion',
          text: 'Organize your work efficiently!',
          actions: [
            { label: 'View Tasks', action: 'view_tasks' },
            { label: 'Create Task', action: 'create_task' }
          ]
        }
      ]
    },
    project: {
      responses: [
        {
          type: 'feature',
          text: '🚀 Projects - Command Center',
          features: [
            { icon: '📋', title: 'Organize', desc: 'Centralize everything' },
            { icon: '👥', title: 'Teams', desc: 'Manage members' },
            { icon: '⚙️', title: 'Configure', desc: 'Custom settings' },
            { icon: '📈', title: 'Track', desc: 'Monitor progress' }
          ]
        },
        {
          type: 'suggestion',
          text: 'Launch your first project!',
          actions: [
            { label: 'View Projects', action: 'view_projects' },
            { label: 'Create Project', action: 'create_project' }
          ]
        }
      ]
    }
  };

  // Intelligent Intent Detection
  const detectIntent = (text) => {
    const lowerText = text.toLowerCase();
    
    // Topic detection
    if (lowerText.includes('group')) return 'group';
    if (lowerText.includes('skill') || lowerText.includes('match') || lowerText.includes('recommend')) return 'skill';
    if (lowerText.includes('request') || lowerText.includes('invite')) return 'request';
    if (lowerText.includes('task')) return 'task';
    if (lowerText.includes('project')) return 'project';
    if (lowerText.includes('help') || lowerText.includes('?')) return 'help';
    if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('hey')) return 'greeting';
    
    return 'general';
  };

  // Get Smart Response Based on Context
  const getSmartResponse = (text, discussedTopics = conversationContext.discussedTopics) => {
    const intent = detectIntent(text);
    const topic = intent;

    if (botResponses[topic]) {
      const responses = botResponses[topic].responses;
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Smart default with suggestions for undiscussed topics
    const undiscussed = ['group', 'skill', 'request', 'task', 'project'].filter(
      t => !discussedTopics.includes(t)
    );

    return {
      type: 'suggestion',
      text: 'That\'s interesting! 🤔 Want to explore other amazing features?',
      actions: undiscussed.slice(0, 3).map(t => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        action: `learn_${t}`
      }))
    };
  };

  const handleSendMessage = async (messageText = inputValue) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: trimmedMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (messageText === inputValue) {
      setInputValue('');
    }
    setIsTyping(true);

    try {
      // Build history for the AI, skipping the complex UI objects
      const history = messages
        .filter(m => m.type === 'user' || m.type === 'bot')
        .map(m => ({ role: m.type, text: m.text }));

      const res = await chatAPI.sendMessage({
        message: trimmedMessage,
        history: history
      });

      const aiResponseText = res.data?.data?.text || "I'm not sure how to respond to that.";

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: aiResponseText,
        timestamp: new Date()
      }]);
    } catch (err) {
      console.error("AI Chat Error:", err);
      // Fallback message if AI fails or no API key is supplied
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        text: err.response?.data?.message || "Oops! My AI brain is currently offline. Please ensure GEMINI_API_KEY is configured in the backend.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action) => {
    const actionMessages = {
      create_group: '🎉 Let me help you create an amazing group!',
      view_groups: '📁 Check out your groups and find new ones!',
      view_recommendations: '⭐ Let\'s find your perfect collaboration partners!',
      explore_skills: '🔍 Explore different skills and matches!',
      view_requests: '📬 Let\'s check your requests and opportunities!',
      send_request: '✉️ Ready to reach out to someone new?',
      view_tasks: '✅ Organize your work and boost productivity!',
      create_task: '📝 Create a task and stay on top of things!',
      view_projects: '🚀 Manage your projects efficiently!',
      create_project: '🎯 Start a new project today!',
      learn_group: 'Tell me more about groups!',
      learn_skill: 'Tell me about skill matching!',
      learn_request: 'Tell me about requests!',
      learn_task: 'Tell me about tasks!',
      learn_project: 'Tell me about projects!'
    };

    handleSendMessage(actionMessages[action] || '');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center cursor-pointer hover:scale-110 z-50 group`}
        title="Open UniConnect Assistant"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-20 animate-pulse"></div>
        <MessageCircle size={28} className="text-white relative z-10" />
        <Sparkles size={14} className="text-white absolute top-0 right-0 animate-spin z-10" style={{ animationDuration: '3s' }} />
      </button>
    );
  }

  // Rich Message Renderer
  const renderMessage = (message) => {
    switch (message.type) {
      case 'user':
        return (
          <div key={message.id} className="flex justify-end animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-xs px-4 py-3 rounded-2xl text-sm leading-relaxed bg-gradient-to-br from-primary to-accent text-white rounded-br-none shadow-lg hover:shadow-xl transition-shadow`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              {message.text}
            </div>
          </div>
        );

      case 'greeting':
        return (
          <div key={message.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-sm px-5 py-4 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600' : 'bg-gradient-to-br from-slate-100 to-white border border-slate-300'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              <h2 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message.text}</h2>
              <p className={isDarkMode ? 'text-slate-300' : 'text-slate-700'}>{message.subtext}</p>
            </div>
          </div>
        );

      case 'feature':
        return (
          <div key={message.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-sm px-4 py-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              <h3 className={`font-bold mb-3 text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message.text}</h3>
              <div className="grid grid-cols-2 gap-2">
                {message.features && message.features.map((feature, idx) => (
                  <div key={idx} className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700/50 hover:bg-slate-700' : 'bg-white hover:bg-slate-50'} transition-colors border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'} cursor-pointer`}>
                    <div className="text-xl mb-1">{feature.icon}</div>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{feature.title}</p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'suggestion':
        return (
          <div key={message.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-sm px-4 py-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              <p className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message.text}</p>
              <div className="space-y-2">
                {message.actions && message.actions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleActionClick(action.action)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-between group/btn ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-primary/40 to-accent/40 hover:from-primary/60 hover:to-accent/60 text-blue-100 border border-primary/50'
                        : 'bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/40 hover:to-accent/40 text-blue-700 border border-primary/30'
                    }`}
                  >
                    <span>{action.label}</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div key={message.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed rounded-bl-none overflow-hidden ${isDarkMode ? 'bg-slate-800 text-slate-100 border border-slate-700' : 'bg-white text-slate-900 border border-[#e2e8f0] shadow-sm'} transition-colors whitespace-pre-wrap`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              {message.text}
            </div>
          </div>
        );
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 w-96 h-[650px] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 ${
        isDarkMode
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700'
          : 'bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200'
      }`}
      style={{
        backdropFilter: 'blur(10px)',
        background: isDarkMode
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.8))'
          : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))',
        boxShadow: isDarkMode
          ? '0 8px 32px rgba(59, 130, 246, 0.1), 0 2px 8px rgba(0, 0, 0, 0.3)'
          : '0 8px 32px rgba(59, 130, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* Header */}
      <div className={`p-4 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-700 bg-gradient-to-r from-primary/20 to-accent/20' : 'border-slate-200 bg-gradient-to-r from-primary/10 to-accent/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-lg ${isDarkMode ? 'bg-gradient-to-br from-primary to-accent' : 'bg-gradient-to-br from-primary to-accent'}`}>
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              UniConnect Pro
            </h3>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              🟢 Active & Ready
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className={`p-2 rounded-lg transition-all ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className={`flex-1 overflow-y-auto p-4 space-y-3 ${isDarkMode ? 'bg-slate-950/20' : 'bg-white/30'}`}>
            {messages.map(msg => renderMessage(msg))}
            
            {isTyping && (
              <div className="flex justify-start animate-in fade-in">
                <div className={`px-4 py-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-200 border border-slate-300'}`}>
                  <div className="flex gap-1.5 items-center">
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-500' : 'bg-slate-600'}`}></div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-500' : 'bg-slate-600'}`} style={{ animationDelay: '0.1s' }}></div>
                    <div className={`w-2.5 h-2.5 rounded-full animate-bounce ${isDarkMode ? 'bg-slate-500' : 'bg-slate-600'}`} style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t flex gap-2 ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white/50'}`}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Ask me anything..."
              className={`flex-1 px-4 py-2.5 rounded-full text-sm focus:outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-800 border border-slate-600 text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/40'
                  : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/40'
              }`}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 rounded-full bg-gradient-to-br from-primary to-accent text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-in {
          animation: fadeInScale 0.3s ease-out;
        }
        
        .fade-in {
          opacity: 1;
        }
        
        .slide-in-from-bottom-2 {
          transform: none;
        }

        /* Smooth scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? '#475569' : '#cbd5e1'};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? '#64748b' : '#94a3b8'};
        }
      `}</style>
    </div>
  );
};

export default ChatBot;
