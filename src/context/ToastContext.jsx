import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let idCounter = 0;

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), duration);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    warning: (msg) => push(msg, 'warning'),
    info: (msg) => push(msg, 'info')
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          maxWidth: 380
        }}
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type] || Info;
          const colorVar =
            t.type === 'success'
              ? '--success'
              : t.type === 'error'
                ? '--danger'
                : t.type === 'warning'
                  ? '--warning'
                  : '--info';
          const softVar = `${colorVar}-soft`;

          return (
            <div
              key={t.id}
              role="status"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderLeft: `3px solid var(${colorVar})`,
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                boxShadow: 'var(--shadow-lg)',
                animation: 'toast-in 0.18s ease'
              }}
            >
              <div
                style={{
                  color: `var(${colorVar})`,
                  background: `var(${softVar})`,
                  borderRadius: 8,
                  padding: 4,
                  display: 'flex',
                  flexShrink: 0
                }}
              >
                <Icon size={16} />
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--foreground)', flex: 1, lineHeight: 1.4 }}>
                {t.message}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                  padding: 2,
                  display: 'flex'
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
