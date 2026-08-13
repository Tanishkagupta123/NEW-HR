import { API_BASE_URL } from '../config/api';
import { useState } from 'react';

export default function HRAssistant() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setAnswer('');

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
        body: JSON.stringify({ question: query.trim(), userType, empId })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Server error');
      }

      const data = await resp.json();
      setAnswer(data.answer || '✅ Backend responded.');
      setQuery('');
    } catch (e) {
      setError(e.message || 'Failed to connect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* ----- Header ----- */}
        <header className="rounded-t-2xl bg-violet-950 px-6 py-3">
          <h1 className="text-lg font-semibold text-white">HR Assistant</h1>
        </header>

        {/* ----- Body ----- */}
        <article className="min-h-[320px] bg-slate-50 p-6">
          {answer ? (
            <div className="space-y-4 text-left">
              <p className="text-base font-medium text-slate-800">
                Response from HR Assistant
              </p>
              <pre className="whitespace-pre-wrap rounded-lg bg-white p-4 text-sm text-slate-800 shadow-sm">
                {answer}
              </pre>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center text-slate-600">
              <p className="text-base font-medium text-slate-800">
                HR Assistant Ready
              </p>
              <p className="mt-2 text-sm">
                Yahan aap HR‑se related sawal puch sakte hain aur turant jawab pa sakte hain.
              </p>
            </div>
          )}
          {error && (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          )}
          {loading && (
            <p className="mt-3 text-center text-sm text-slate-600">Loading...</p>
          )}
        </article>

        {/* ----- Footer (input) ----- */}
        <footer className="rounded-b-2xl bg-white px-6 py-4">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Kuch puchiye..."
              className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 pr-28 text-sm text-slate-900 shadow-sm outline-none transition focus:border-violet-900"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-violet-950 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-violet-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}