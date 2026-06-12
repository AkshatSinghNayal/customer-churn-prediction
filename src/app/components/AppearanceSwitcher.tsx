import { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, Appearance } from '../context/ThemeContext';

const options: { value: Appearance; label: string; Icon: React.ComponentType<{ size?: number }> }[] = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export function AppearanceSwitcher() {
  const { appearance, setAppearance, resolvedAppearance } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isDark = resolvedAppearance === 'dark';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors hover:opacity-80"
        style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)' }}
        title="Appearance"
      >
        {isDark ? <Moon size={18} /> : <Sun size={18} />}
      </button>
      {open && (
        <div
          className="absolute right-0 top-12 z-50 rounded-xl shadow-2xl py-2 min-w-[180px]"
          style={{
            background: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--cs-border)',
          }}
        >
          {options.map(({ value, label, Icon }) => (
            <button
              key={value}
              onClick={() => { setAppearance(value); setOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2 transition-colors text-left"
              style={{
                color: 'var(--cs-ink)',
                background: appearance === value ? 'var(--accent-glass)' : 'transparent',
                height: '36px',
              }}
              onMouseEnter={e => { if (appearance !== value) (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = appearance === value ? 'var(--accent-glass)' : 'transparent'; }}
            >
              <Icon size={16} />
              <span style={{ fontSize: '14px' }}>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
