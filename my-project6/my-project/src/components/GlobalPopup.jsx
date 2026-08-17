import { useState, useEffect } from 'react';

export default function GlobalPopup() {
  const [popup, setPopup] = useState(null); // { message, title, type: 'info'|'success'|'error' }
  const [promptState, setPromptState] = useState(null); // { message, defaultValue, resolve }
  const [promptInput, setPromptInput] = useState('');

  useEffect(() => {
    const nativeAlert = window.alert;
    const nativePrompt = window.prompt;

    // Override window.alert
    window.alert = (message) => {
      const msgStr = String(message || '');
      const isError = /error|failed|unable|invalid|required|missing|cannot|wrong/i.test(msgStr);
      const isSuccess = /success|updated|created|saved|submitted|added|deleted|sent/i.test(msgStr);
      
      const type = isError ? 'error' : isSuccess ? 'success' : 'info';
      const title = isError ? 'Attention Required' : isSuccess ? 'Success' : 'Notification';

      setPopup({ message: msgStr, title, type });
    };

    // Override window.prompt
    window.prompt = (message, defaultValue = '') => {
      return new Promise((resolve) => {
        setPromptInput(defaultValue);
        setPromptState({ message: String(message || 'Please enter details:'), resolve });
      });
    };

    window.showPopup = (message, type = 'info', title = '') => {
      const defaultTitle = type === 'error' ? 'Attention Required' : type === 'success' ? 'Success' : 'Notification';
      setPopup({ message: String(message || ''), title: title || defaultTitle, type });
    };

    return () => {
      window.alert = nativeAlert;
      window.prompt = nativePrompt;
      delete window.showPopup;
    };
  }, []);

  const closePopup = () => setPopup(null);

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    if (promptState?.resolve) promptState.resolve(promptInput);
    setPromptState(null);
    setPromptInput('');
  };

  const handlePromptCancel = () => {
    if (promptState?.resolve) promptState.resolve(null);
    setPromptState(null);
    setPromptInput('');
  };

  return (
    <>
      {/* ALERT POPUP */}
      {popup && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onMouseDown={closePopup}
        >
          <div
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            <div className={`flex items-center justify-between border-b px-6 py-4 ${
              popup.type === 'error' ? 'border-red-100 bg-red-50/50 text-red-900' :
              popup.type === 'success' ? 'border-emerald-100 bg-emerald-50/50 text-emerald-900' :
              'border-violet-100 bg-violet-50/50 text-violet-950'
            }`}>
              <div className="flex items-center gap-2.5">
                <span className={`h-2.5 w-2.5 rounded-full ${
                  popup.type === 'error' ? 'bg-red-500' :
                  popup.type === 'success' ? 'bg-emerald-500' :
                  'bg-violet-600'
                }`}></span>
                <h3 className="text-sm font-black uppercase tracking-wider">{popup.title}</h3>
              </div>

              <button
                onClick={closePopup}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm leading-relaxed text-slate-700 font-medium whitespace-pre-wrap">
                {popup.message}
              </p>
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <button
                type="button"
                onClick={closePopup}
                autoFocus
                className="w-full sm:w-auto min-w-24 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMPT MODAL */}
      {promptState && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onMouseDown={handlePromptCancel}
        >
          <form
            onSubmit={handlePromptSubmit}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-violet-50/50 px-6 py-4 text-violet-950">
              <div className="flex items-center gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-violet-600"></span>
                <h3 className="text-sm font-black uppercase tracking-wider">Input Required</h3>
              </div>
              <button
                type="button"
                onClick={handlePromptCancel}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs font-bold text-slate-700">
                {promptState.message}
              </p>
              <input
                type="text"
                autoFocus
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none transition focus:border-violet-600 focus:bg-white focus:ring-3 focus:ring-violet-100"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <button
                type="button"
                onClick={handlePromptCancel}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-violet-600 px-5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
