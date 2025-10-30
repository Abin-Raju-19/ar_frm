import { useState } from 'react';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => setOpen((o) => !o);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { from: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Simple intent-based bot response (can be replaced with backend later)
    const responseText = getBotResponse(trimmed);
    await new Promise((r) => setTimeout(r, 400));
    setMessages((prev) => [...prev, { from: 'bot', text: responseText }]);
    setLoading(false);
  };

  const getBotResponse = (text) => {
    const t = text.toLowerCase();
    if (t.includes('appointment')) {
      return 'You can manage appointments under Dashboard → Appointments. Need help booking?';
    }
    if (t.includes('workout') || t.includes('exercise')) {
      return 'Workouts are in Dashboard → Workouts. I can guide plans if needed.';
    }
    if (t.includes('nutrition') || t.includes('diet')) {
      return 'Nutrition plans live under Dashboard → Nutrition. Want to create one?';
    }
    if (t.includes('payment') || t.includes('subscribe')) {
      return 'Payments and subscriptions are under Dashboard → Payments.';
    }
    if (t.includes('help') || t.includes('support')) {
      return 'Sure! Tell me what part you’re stuck on (appointments, workouts, etc.).';
    }
    return 'Got it! I can help with appointments, workouts, nutrition, and payments.';
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating button */}
      {!open && (
        <button
          onClick={toggleOpen}
          className="rounded-full bg-primary-600 text-white w-14 h-14 shadow-lg hover:bg-primary-700 focus:outline-none"
          aria-label="Open chat"
        >
          <svg className="w-7 h-7 m-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h6m-6 6l-4-4V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H7z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white">
            <span className="font-semibold">Assistant</span>
            <button onClick={toggleOpen} className="text-white/90 hover:text-white">✕</button>
          </div>
          <div className="h-80 overflow-y-auto p-3 space-y-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-md text-sm ${m.from === 'user' ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100' : 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-3 py-2 rounded-md text-sm bg-gray-100 dark:bg-gray-700 animate-pulse">Typing…</div>
              </div>
            )}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
                placeholder="Ask about appointments, workouts, etc."
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-md bg-primary-600 text-white hover:bg-primary-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}