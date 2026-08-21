import { API_BASE_URL } from '../config/api';
import { useState, useRef, useEffect } from 'react';

export default function HRAssistant() {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    const userMessage = query.trim();
    setQuery('');
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);
    setLoading(true);
    setError('');

    // ---- user data ----
    let empId = null;
    let userType = 'EMPLOYEE';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      empId = storedUser.id ?? null;
      userType = (storedUser.role ?? 'employee').toUpperCase();
    } catch (e) {
      console.error('User parse error:', e);
    }

    // ---- request ----
    try {
      const resp = await fetch(`${API_BASE_URL}/hr-assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage, userType, empId })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await resp.json();
      setChatHistory(prev => [...prev, { sender: 'ai', text: data.answer || '✅ Backend responded.' }]);
    } catch (e) {
      setError(e.message || 'Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 md:bg-slate-100 p-2 md:p-4">
      <section className="w-full max-w-2xl h-full md:h-[80vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* ----- Header ----- */}
        <header className="bg-violet-950 px-4 md:px-6 py-3 md:py-4 shrink-0 flex items-center justify-between shadow-sm z-10">
          <div>
            <h1 className="text-lg font-semibold text-white">HR Assistant</h1>
            <p className="text-violet-200 text-xs mt-0.5">Your intelligent HR companion</p>
          </div>
        </header>

        {/* ----- Body ----- */}
        <article className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-4">
          {chatHistory.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center text-violet-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-base font-semibold text-slate-700">How can I help you today?</p>
              <p className="text-sm max-w-xs">Ask me about your profile, leaves, salary, notices, or any HR-related query.</p>
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${msg.sender === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}`}>
                  {msg.sender === 'ai' ? (
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.text}</pre>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-white border border-slate-200 px-5 py-3 rounded-bl-none shadow-sm">
                <div className="flex gap-1.5 items-center h-5">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"></div>
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-center">
              <p className="rounded-full bg-red-50 text-red-600 px-4 py-1.5 text-xs font-medium border border-red-100">{error}</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </article>

        {/* ----- Footer (input) ----- */}
        <footer className="rounded-b-2xl bg-white p-4 border-t border-slate-100 shrink-0">
          <div className="relative flex items-center gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 pr-14 text-sm text-slate-800 shadow-inner outline-none transition focus:border-violet-500 focus:bg-white"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-white transition hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
              </svg>
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}