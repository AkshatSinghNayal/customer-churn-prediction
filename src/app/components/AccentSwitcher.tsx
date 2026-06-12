import { useRef, useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { useTheme, AccentTheme, ACCENT_THEMES } from '../context/ThemeContext';

const THEME_ORDER: AccentTheme[] = [
  'signal-teal', 'indigo-pulse', 'violet-insight', 'azure-flow', 'cyan-pulse', 'slate-graphite',
];

export function AccentSwitcher() {
  const { accentTheme, setAccentTheme, resolvedAppearance } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isDark = resolvedAppearance === 'dark';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:opacity-80"
        style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)' }}
        title="Accent color"
      >
        <Palette size={18} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-12 z-50 rounded-xl shadow-2xl py-2 min-w-[200px]"
          style={{
            background: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--cs-border)',
          }}
        >
          {THEME_ORDER.map(key => {
            const t = ACCENT_THEMES[key];
            const dot = isDark ? t.dotDark : t.dotLight;
            const isActive = accentTheme === key;
            return (
              <button
                key={key}
                onClick={() => { setAccentTheme(key); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2 transition-colors"
                style={{
                  color: 'var(--cs-ink)',
                  background: isActive ? 'var(--accent-glass)' : 'transparent',
                  height: '36px',
                }}
                onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isActive ? 'var(--accent-glass)' : 'transparent'; }}
              >
                <span style={{ fontSize: '14px' }}>{t.name}</span>
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    background: dot,
                    boxShadow: isActive ? `0 0 0 2px var(--accent-deep)` : 'none',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
