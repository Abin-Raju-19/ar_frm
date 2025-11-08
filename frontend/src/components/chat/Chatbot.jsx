import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth';

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);

  const toggleOpen = () => setOpen((o) => !o);

  // Role-specific greeting and suggestions
  useEffect(() => {
    if (user?.role) {
      const role = user.role;
      let greeting = '';
      let suggestions = [];

      switch (role) {
        case 'admin':
          greeting = 'Hello Admin! I can help you manage users, trainers, appointments, and system settings.';
          suggestions = [
            'How many users are registered?',
            'Show me today\'s appointments',
            'What\'s the system status?',
            'View revenue statistics'
          ];
          break;
        case 'trainer':
          greeting = 'Hello Trainer! I can help you manage your clients, appointments, and workouts.';
          suggestions = [
            'Show my today\'s appointments',
            'How many clients do I have?',
            'View my schedule',
            'Check client progress'
          ];
          break;
        case 'user':
        default:
          greeting = 'Hello! I\'m your fitness assistant. How can I help you today?';
          suggestions = [
            'Book an appointment',
            'View my workouts',
            'Check my nutrition plan',
            'Payment information'
          ];
          break;
      }

      setMessages([{ from: 'bot', text: greeting }]);
      setSuggestedQuestions(suggestions);
    }
  }, [user]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg = { from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Get role-specific response
    const responseText = getRoleBasedResponse(trimmed, user?.role);
    await new Promise((r) => setTimeout(r, 600));
    setMessages((prev) => [...prev, { from: 'bot', text: responseText }]);
    setLoading(false);
  };

  const getRoleBasedResponse = (text, role) => {
    const t = text.toLowerCase();
    
    // Common responses for all roles
    if (t.includes('hello') || t.includes('hi')) {
      return role === 'admin' ? 'Hello Admin! Ready to manage the platform?' :
             role === 'trainer' ? 'Hello Trainer! Ready to help your clients?' :
             'Hello! How can I assist you with your fitness journey?';
    }

    if (t.includes('help') || t.includes('support')) {
      return 'I can help you with various tasks. Try asking about appointments, workouts, nutrition, or system features.';
    }

    // Role-specific responses
    switch (role) {
      case 'admin':
        return getAdminResponse(t);
      case 'trainer':
        return getTrainerResponse(t);
      case 'user':
      default:
        return getUserResponse(t);
    }
  };

  const getAdminResponse = (text) => {
    if (text.includes('user') && (text.includes('count') || text.includes('many'))) {
      return 'I can see you have 150 registered users. 120 are active, 20 are trainers, and 10 are admins.';
    }
    if (text.includes('appointment') || text.includes('booking')) {
      return 'There are 25 appointments scheduled for today. 5 are pending confirmation, 15 are confirmed, and 5 are completed.';
    }
    if (text.includes('revenue') || text.includes('income')) {
      return 'This month\'s revenue is $12,500. That\'s a 15% increase from last month. Subscription revenue: $8,000, Appointment revenue: $4,500.';
    }
    if (text.includes('trainer') && text.includes('performance')) {
      return 'Top performing trainers this month: 1. John Smith (45 sessions), 2. Sarah Johnson (38 sessions), 3. Mike Davis (32 sessions).';
    }
    if (text.includes('system') || text.includes('status')) {
      return 'System Status: ✅ All services operational. Server uptime: 99.9%. Database: Healthy. API: Responsive.';
    }
    if (text.includes('complaint') || text.includes('issue')) {
      return 'You have 3 unresolved complaints. Would you like me to show you the details or help you resolve them?';
    }
    return 'As an admin, you can manage users, view analytics, handle complaints, and monitor system performance. What would you like to do?';
  };

  const getTrainerResponse = (text) => {
    if (text.includes('appointment') || text.includes('schedule')) {
      return 'You have 8 appointments today: 9 AM - Client A, 11 AM - Client B, 2 PM - Client C, 4 PM - Client D, 6 PM - Client E.';
    }
    if (text.includes('client') && (text.includes('count') || text.includes('many'))) {
      return 'You currently have 25 active clients. 5 new clients this month, and your client retention rate is 92%.';
    }
    if (text.includes('rating') || text.includes('review')) {
      return 'Your average rating is 4.8/5 stars! Recent reviews: "Excellent trainer", "Very knowledgeable", "Great motivation".';
    }
    if (text.includes('earning') || text.includes('income')) {
      return 'Your earnings this month: $3,200. You\'ve completed 45 sessions with an average rate of $71 per session.';
    }
    if (text.includes('availability')) {
      return 'Your available slots: Tomorrow 10 AM - 12 PM, 3 PM - 5 PM. Would you like to update your availability?';
    }
    if (text.includes('progress') || text.includes('client')) {
      return 'Client progress updates: 3 clients achieved their monthly goals, 2 clients need motivation, 1 client requested program modification.';
    }
    return 'As a trainer, you can manage appointments, view client progress, update availability, and track your earnings. How can I assist you?';
  };

  const getUserResponse = (text) => {
    if (text.includes('appointment') || text.includes('book')) {
      return 'You can book appointments with our certified trainers. Would you like to see available time slots or book a specific trainer?';
    }
    if (text.includes('workout') || text.includes('exercise')) {
      return 'You have 3 workouts scheduled this week. Your last workout was 2 days ago. Would you like to see your workout plan or schedule a new one?';
    }
    if (text.includes('nutrition') || text.includes('diet')) {
      return 'Your nutrition plan includes 1,800 calories per day. You\'re following the "Weight Loss" plan. Would you like to see today\'s meal suggestions?';
    }
    if (text.includes('subscription') || text.includes('membership')) {
      return 'Your Premium membership expires on March 15, 2024. You have access to all features including personal training and nutrition plans.';
    }
    if (text.includes('progress') || text.includes('result')) {
      return 'Great progress! You\'ve lost 5kg in 6 weeks. Your body fat decreased by 3%. Keep up the excellent work!';
    }
    if (text.includes('payment') || text.includes('bill')) {
      return 'Your monthly subscription is $49.99. Next payment due: February 15, 2024. Payment method: Visa ending in 1234.';
    }
    return 'I can help you with appointments, workouts, nutrition plans, subscriptions, and tracking your progress. What would you like to know?';
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]');
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const clearChat = () => {
    setMessages([{ from: 'bot', text: 'Chat cleared. How can I help you?' }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      {!open && (
        <button
          onClick={toggleOpen}
          className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white w-14 h-14 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none"
          aria-label="Open chat"
        >
          <svg className="w-7 h-7 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <span className="font-semibold text-sm">AI Assistant</span>
                <div className="text-xs text-white/80">Role: {user?.role || 'User'}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={clearChat}
                className="text-white/80 hover:text-white text-sm"
                title="Clear chat"
              >
                🗑️
              </button>
              <button 
                onClick={toggleOpen} 
                className="text-white/80 hover:text-white"
                title="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm ${
                  m.from === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none shadow-sm'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 animate-pulse">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Suggested questions */}
          {suggestedQuestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">Quick questions:</div>
              <div className="flex flex-wrap gap-1">
                {suggestedQuestions.slice(0, 3).map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={`Ask me anything... (Role: ${user?.role || 'User'})`}
              />
              <button
                onClick={sendMessage}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {loading ? '⏳' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
