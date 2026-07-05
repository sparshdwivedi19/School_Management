import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, Sparkles, RotateCcw, ChevronDown } from 'lucide-react';
import PageWrapper from '../../components/layout/PageWrapper';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const AI_MODES = [
  {
    id: 'principal',
    label: 'Principal AI',
    icon: '🎓',
    description: 'School overview, attendance, performance insights',
    color: 'from-purple-500 to-indigo-600',
    placeholder: 'Ask about school performance, fee collection, attendance trends...',
    roles: ['admin', 'principal'],
  },
  {
    id: 'accountant',
    label: 'Financial AI',
    icon: '💰',
    description: 'Fee analysis, expense breakdown, financial health',
    color: 'from-emerald-500 to-teal-600',
    placeholder: 'Ask about fee defaulters, expense categories, collection rates...',
    roles: ['admin', 'principal'],
  },
  {
    id: 'student',
    label: 'Study Coach',
    icon: '📚',
    description: 'Your personal academic assistant',
    color: 'from-blue-500 to-cyan-600',
    placeholder: 'Ask about your grades, attendance, how to improve...',
    roles: ['student', 'admin', 'principal'],
  },
];

const SUGGESTED_QUESTIONS = {
  principal: [
    "What is our fee collection rate this session?",
    "How many students have below 75% attendance?",
    "Which class has the best academic performance?",
    "Give me a school summary report",
  ],
  accountant: [
    "What are the top expense categories this year?",
    "How many fee defaulters do we have?",
    "What is the outstanding fee amount?",
    "Analyze our salary expenditure",
  ],
  student: [
    "How is my attendance this year?",
    "What subjects do I need to improve?",
    "Any tips for scoring better in exams?",
    "What is my fee due amount?",
  ],
};

const MessageBubble = ({ msg, onFeedback }) => {
  const isUser = msg.role === 'user';

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold shadow-md ${
        isUser ? 'bg-primary-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        isUser
          ? 'bg-primary-600 text-white rounded-tr-none'
          : 'glass text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
      }`}>
        {msg.loading ? (
          <div className="flex items-center gap-1.5 h-5">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        ) : (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</div>
        )}

        {/* Feedback */}
        {!isUser && !msg.loading && msg.id && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-xs text-slate-400">Helpful?</span>
            <button
              onClick={() => onFeedback(msg.id, true)}
              className={`p-1 rounded transition-colors ${msg.feedback === 'helpful' ? 'text-green-500' : 'text-slate-400 hover:text-green-500'}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFeedback(msg.id, false)}
              className={`p-1 rounded transition-colors ${msg.feedback === 'not_helpful' ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const AIInsights = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState(() => {
    if (user?.role === 'student') return 'student';
    return 'principal';
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const currentMode = AI_MODES.find(m => m.id === mode) || AI_MODES[0];
  const allowedModes = AI_MODES.filter(m => m.roles.includes(user?.role));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Welcome message on mount / mode change
  useEffect(() => {
    setMessages([{
      id: null,
      role: 'ai',
      content: `Hello! I'm your **${currentMode.label}**. ${currentMode.description}.\n\nAsk me anything or pick a suggestion below! 🚀`,
      loading: false,
    }]);
  }, [mode]);

  const sendMessage = async (text) => {
    const userMessage = text || input.trim();
    if (!userMessage || isStreaming) return;

    setInput('');
    setIsStreaming(true);

    // Add user message
    const userMsg = { id: null, role: 'user', content: userMessage };
    // Add streaming AI placeholder
    const aiMsgId = Date.now();
    const aiMsg = { id: aiMsgId, role: 'ai', content: '', loading: true };
    setMessages(prev => [...prev, userMsg, aiMsg]);

    try {
      const response = await fetch(`${api.defaults.baseURL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ message: userMessage, mode }),
      });

      if (!response.ok) throw new Error('API request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';
      let persistedId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n\n').filter(Boolean);
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.error) {
              fullContent = `⚠️ ${json.error}`;
            } else if (json.insightId) {
              persistedId = json.insightId;
            } else {
              fullContent += json.delta || '';
            }

            setMessages(prev => prev.map(m =>
              m.id === aiMsgId
                ? { ...m, content: fullContent, loading: !json.done, id: persistedId || aiMsgId }
                : m
            ));
          } catch {}
        }
      }
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, content: '⚠️ Failed to connect to AI service. Please try again.', loading: false }
          : m
      ));
    } finally {
      setIsStreaming(false);
      inputRef.current?.focus();
    }
  };

  const handleFeedback = async (insightId, helpful) => {
    try {
      await api.put(`/ai/${insightId}/feedback`, { helpful });
      setMessages(prev => prev.map(m =>
        m.id === insightId ? { ...m, feedback: helpful ? 'helpful' : 'not_helpful' } : m
      ));
    } catch {}
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <PageWrapper title="AI Insights">
      <div className="flex flex-col h-[calc(100vh-180px)] max-h-[800px]">

        {/* Mode Selector */}
        {allowedModes.length > 1 && (
          <div className="relative mb-4 flex-shrink-0">
            <button
              onClick={() => setShowModeMenu(!showModeMenu)}
              className={`w-full glass rounded-xl p-3 flex items-center gap-3 border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-shadow`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentMode.color} flex items-center justify-center text-xl`}>
                {currentMode.icon}
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{currentMode.label}</p>
                <p className="text-xs text-slate-500">{currentMode.description}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showModeMenu ? 'rotate-180' : ''}`} />
            </button>

            {showModeMenu && (
              <div className="absolute top-full mt-1 left-0 right-0 z-10 glass rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                {allowedModes.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setShowModeMenu(false); }}
                    className={`w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${mode === m.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  >
                    <span className="text-xl">{m.icon}</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{m.label}</p>
                      <p className="text-xs text-slate-500">{m.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 min-h-0">
          {messages.map((msg, idx) => (
            <MessageBubble key={idx} msg={msg} onFeedback={handleFeedback} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && !isStreaming && (
          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            {(SUGGESTED_QUESTIONS[mode] || []).map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 text-xs bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-full text-slate-600 dark:text-slate-300 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:text-primary-300 transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex-shrink-0 glass rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-1 shadow-lg">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentMode.placeholder}
              disabled={isStreaming}
              rows={1}
              className="flex-1 px-4 py-3 bg-transparent border-none outline-none resize-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 max-h-32"
              style={{ fieldSizing: 'content' }}
            />
            <div className="flex items-center gap-1 pr-2 pb-2">
              {messages.length > 1 && (
                <button
                  onClick={() => setMessages([])}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                  title="Clear chat"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isStreaming}
                className={`p-2.5 rounded-xl text-white transition-all ${
                  input.trim() && !isStreaming
                    ? `bg-gradient-to-br ${currentMode.color} hover:opacity-90 shadow-md`
                    : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                }`}
              >
                {isStreaming ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-2 flex-shrink-0">
          <Sparkles className="w-3 h-3 inline mr-1" />
          Powered by GPT-4o • Responses based on live school data
        </p>
      </div>
    </PageWrapper>
  );
};

export default AIInsights;
