import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles, ArrowRight, Lightbulb, CheckCircle2, Users, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../api/api';

const ChatBot = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const timeoutRef = useRef(null);
  
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
      // Send message to backend for intelligent response
      const res = await chatAPI.sendMessage({
        message: trimmedMessage
      });

      // Backend returns rich response object
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
      console.error("Chat Error:", err);
      
      // Fallback response
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'suggestion',
        text: 'I\'m having trouble processing that. Try asking about:',
        actions: [
          { label: 'Groups', action: 'view_groups' },
          { label: 'Skills', action: 'view_recommendations' },
          { label: 'Requests', action: 'view_requests' },
          { label: 'Tasks', action: 'view_tasks' }
        ],
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (action) => {
    // First, simulate user clicking a button by sending a message
    const actionMessages = {
      view_groups: '📁 Show me the groups',
      view_recommendations: '⭐ Find teammates by skills',
      view_requests: '📨 View my requests',
      view_tasks: '✅ Show my tasks',
      view_projects: '🚀 View my projects',
      create_group: '🎉 Create a new group',
      create_task: '📝 Create a task',
      create_project: '🎯 Create a project',
      send_request: '✉️ Send a request'
    };

    const message = actionMessages[action] || '';
    if (message) {
      handleSendMessage(message);
    }

    // Then navigate based on the action
    const navigationMap = {
      view_groups: '/groups',
      view_recommendations: '/recommendations',
      view_requests: '/requests',
      view_tasks: '/taskboard',
      view_projects: '/dashboard/projects',
      create_group: '/create-group',
      create_task: '/taskboard',
      create_project: '/add-project',
      send_request: '/requests'
    };

    const navPath = navigationMap[action];
    if (navPath) {
      // Small delay to show response first
      setTimeout(() => {
        navigate(navPath);
        // Minimize chat so user can see the page
        setIsMinimized(true);
      }, 800);
    }
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

  // Rich Message Renderer with support for advanced response types
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
            <div className={`max-w-sm rounded-2xl rounded-bl-none overflow-hidden ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              <div className={`px-4 py-3 ${isDarkMode ? 'bg-gradient-to-r from-primary/20 to-accent/20 border-b border-slate-700' : 'bg-gradient-to-r from-primary/10 to-accent/10 border-b border-slate-300'}`}>
                <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message.text}</h3>
              </div>
              <div className="p-3 space-y-2">
                {message.features && message.features.map((feature, idx) => {
                  const actionMap = {
                    'Groups': 'view_groups',
                    'Browse Groups': 'view_groups',
                    'Create Groups': 'view_groups',
                    'Real-time Chat': 'view_groups',
                    'Collaborate': 'view_groups',
                    'Skills': 'view_recommendations',
                    'Match Engine': 'view_recommendations',
                    'Compatibility': 'view_recommendations',
                    'Teammate Zoo': 'view_recommendations',
                    'Instant Collab': 'view_recommendations',
                    'Requests': 'view_requests',
                    'Compose Request': 'view_requests',
                    'Inbox': 'view_requests',
                    'Respond': 'view_requests',
                    'Track All': 'view_requests',
                    'Tasks': 'view_tasks',
                    'Create Tasks': 'view_tasks',
                    'Set Deadlines': 'view_tasks',
                    'Prioritize': 'view_tasks',
                    'Track Progress': 'view_tasks',
                    'Projects': 'view_projects',
                    'Organize All': 'view_projects',
                    'Manage Teams': 'view_projects',
                    'Configure': 'view_projects',
                    'Track': 'view_projects'
                  };
                  return (
                    <button
                      key={idx}
                      onClick={() => handleActionClick(actionMap[feature.title] || 'view_groups')}
                      className={`w-full p-3 rounded-lg flex gap-3 transition-all border text-left cursor-pointer group/feature ${isDarkMode ? 'bg-slate-700/30 hover:bg-slate-700/60 border-slate-600 hover:border-primary/50' : 'bg-white/50 hover:bg-white border-slate-300 hover:border-primary/30'}`}
                    >
                      <div className="text-xl flex-shrink-0">{feature.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-100 group-hover/feature:text-primary' : 'text-slate-900 group-hover/feature:text-primary'}`}>{feature.title}</p>
                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-400 group-hover/feature:text-slate-300' : 'text-slate-600 group-hover/feature:text-slate-700'}`}>{feature.desc}</p>
                      </div>
                      <ArrowRight size={14} className={`flex-shrink-0 mt-1 group-hover/feature:translate-x-1 transition-transform ${isDarkMode ? 'text-slate-500 group-hover/feature:text-primary' : 'text-slate-400 group-hover/feature:text-primary'}`} />
                    </button>
                  );
                })}
              </div>
              {message.nextAction && (
                <div className={`px-4 py-2 text-xs italic ${isDarkMode ? 'text-slate-400 border-t border-slate-700' : 'text-slate-600 border-t border-slate-300'}`}>
                  💡 {message.nextAction}
                </div>
              )}
            </div>
          </div>
        );

      case 'suggestion':
        return (
          <div key={message.id} className="flex justify-start animate-in fade-in slide-in-from-bottom-2">
            <div className={`max-w-sm px-4 py-3 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-100 border border-slate-300'}`} style={{ animation: 'slideIn 0.3s ease-out' }}>
              <p className={`font-semibold text-sm mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{message.text}</p>
              
              {/* Render items list if available (for help responses) */}
              {message.items && (
                <div className={`mb-3 pb-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} space-y-1`}>
                  {message.items.map((item, idx) => (
                    <p key={idx} className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {item}
                    </p>
                  ))}
                </div>
              )}
              
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
                    <span className="text-left flex-1">{action.label}</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
                  </button>
                ))}
              </div>
              
              {message.confidence && (
                <p className={`text-xs mt-2 pt-2 border-t ${isDarkMode ? 'text-slate-500 border-slate-700' : 'text-slate-500 border-slate-300'}`}>
                  ✓ Confidence: {message.confidence}%
                </p>
              )}
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
              onClick={() => handleSendMessage()}
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
