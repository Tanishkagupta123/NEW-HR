import { useState, useEffect } from 'react';

export default function GlobalPopup() {
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    const nativeAlert = window.alert;

    window.alert = (message) => {
      const msgStr = String(message || '');
      const isError = /error|failed|unable|invalid|required|missing|cannot|wrong/i.test(msgStr);
      const isSuccess = /success|updated|created|saved|submitted|added|deleted|sent/i.test(msgStr);
      
      const type = isError ? 'error' : isSuccess ? 'success' : 'info';
      const title = isError ? 'Attention Required' : isSuccess ? 'Application Received' : 'Notification';

      setPopup({ message: msgStr, title, type });
    };

    window.showPopup = (message, type = 'info', title = '') => {
      const defaultTitle = type === 'error' ? 'Attention Required' : type === 'success' ? 'Success' : 'Notification';
      setPopup({ message: String(message || ''), title: title || defaultTitle, type });
    };

    return () => {
      window.alert = nativeAlert;
      delete window.showPopup;
    };
  }, []);

  if (!popup) return null;

  const close = () => setPopup(null);

  const getHeaderStyle = () => {
    if (popup.type === 'error') return 'border-red-100 bg-red-50/50 text-red-900';
    if (popup.type === 'success') return 'border-emerald-100 bg-emerald-50/50 text-emerald-900';
    return 'border-violet-100 bg-violet-50/50 text-violet-950';
  };

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onMouseDown={close}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
      >
        <div className={`flex items-center justify-between border-b px-6 py-4 ${getHeaderStyle()}`}>
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full ${popup.type === 'error' ? 'bg-red-500' : popup.type === 'success' ? 'bg-emerald-500' : 'bg-violet-600'}`}></span>
            <h3 className="text-sm font-black uppercase tracking-wider">{popup.title}</h3>
          </div>

          <button
            onClick={close}
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
            onClick={close}
            autoFocus
            className="w-full sm:w-auto min-w-24 rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
