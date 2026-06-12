import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Appearance = 'light' | 'dark' | 'system';
export type AccentTheme = 'signal-teal' | 'indigo-pulse' | 'violet-insight' | 'azure-flow' | 'cyan-pulse' | 'slate-graphite';

interface ThemeContextType {
  appearance: Appearance;
  setAppearance: (a: Appearance) => void;
  accentTheme: AccentTheme;
  setAccentTheme: (t: AccentTheme) => void;
  resolvedAppearance: 'light' | 'dark';
}

export const ACCENT_THEMES: Record<AccentTheme, {
  name: string;
  dotLight: string;
  dotDark: string;
  light: { primary: string; deep: string; lightBg: string; glass: string };
  dark: { primary: string; deep: string; glass: string };
}> = {
  'signal-teal': {
    name: 'Signal Teal',
    dotLight: '#009688',
    dotDark: '#4DB6AC',
    light: { primary: '#009688', deep: '#00695C', lightBg: '#E0F2F1', glass: 'rgba(0,150,136,.12)' },
    dark: { primary: '#4DB6AC', deep: '#009688', glass: 'rgba(77,182,172,.16)' },
  },
  'indigo-pulse': {
    name: 'Indigo Pulse',
    dotLight: '#3F51B5',
    dotDark: '#7986CB',
    light: { primary: '#3F51B5', deep: '#283593', lightBg: '#E8EAF6', glass: 'rgba(63,81,181,.12)' },
    dark: { primary: '#7986CB', deep: '#3F51B5', glass: 'rgba(121,134,203,.16)' },
  },
  'violet-insight': {
    name: 'Violet Insight',
    dotLight: '#673AB7',
    dotDark: '#9575CD',
    light: { primary: '#673AB7', deep: '#4527A0', lightBg: '#EDE7F6', glass: 'rgba(103,58,183,.12)' },
    dark: { primary: '#9575CD', deep: '#673AB7', glass: 'rgba(149,117,205,.16)' },
  },
  'azure-flow': {
    name: 'Azure Flow',
    dotLight: '#2196F3',
    dotDark: '#64B5F6',
    light: { primary: '#2196F3', deep: '#1565C0', lightBg: '#E3F2FD', glass: 'rgba(33,150,243,.12)' },
    dark: { primary: '#64B5F6', deep: '#2196F3', glass: 'rgba(100,181,246,.16)' },
  },
  'cyan-pulse': {
    name: 'Cyan Pulse',
    dotLight: '#00BCD4',
    dotDark: '#4DD0E1',
    light: { primary: '#00BCD4', deep: '#00838F', lightBg: '#E0F7FA', glass: 'rgba(0,188,212,.12)' },
    dark: { primary: '#4DD0E1', deep: '#00BCD4', glass: 'rgba(77,208,225,.16)' },
  },
  'slate-graphite': {
    name: 'Slate Graphite',
    dotLight: '#607D8B',
    dotDark: '#90A4AE',
    light: { primary: '#607D8B', deep: '#37474F', lightBg: '#ECEFF1', glass: 'rgba(96,125,139,.12)' },
    dark: { primary: '#90A4AE', deep: '#607D8B', glass: 'rgba(144,164,174,.16)' },
  },
};

const ThemeContext = createContext<ThemeContextType>({
  appearance: 'light',
  setAppearance: () => {},
  accentTheme: 'signal-teal',
  setAccentTheme: () => {},
  resolvedAppearance: 'light',
});

function applyTheme(accentTheme: AccentTheme, resolvedMode: 'light' | 'dark') {
  const theme = ACCENT_THEMES[accentTheme];
  const tokens = resolvedMode === 'dark' ? theme.dark : theme.light;
  const root = document.documentElement;

  root.setAttribute('data-appearance', resolvedMode);

  if (resolvedMode === 'dark') {
    root.classList.add('cs-dark');
    root.classList.remove('cs-light');
  } else {
    root.classList.add('cs-light');
    root.classList.remove('cs-dark');
  }

  root.style.setProperty('--accent-primary', tokens.primary);
  root.style.setProperty('--accent-deep', tokens.deep);
  root.style.setProperty('--accent-glass', tokens.glass);

  if (resolvedMode === 'light') {
    const lt = theme.light;
    root.style.setProperty('--accent-light', lt.lightBg);
    root.style.setProperty('--cs-ink', '#0A1F1C');
    root.style.setProperty('--cs-ink-muted', '#5C6F6C');
    root.style.setProperty('--cs-surface', '#F7FAFA');
    root.style.setProperty('--cs-card', '#FFFFFF');
    root.style.setProperty('--cs-border', 'rgba(0,0,0,0.10)');
    root.style.setProperty('--coral-churn', '#EF5350');
    root.style.setProperty('--amber-watch', '#FFA726');
    root.style.setProperty('--green-safe', '#66BB6A');
  } else {
    root.style.setProperty('--accent-light', tokens.glass);
    root.style.setProperty('--cs-ink', '#EAF2F1');
    root.style.setProperty('--cs-ink-muted', '#9FB3B0');
    root.style.setProperty('--cs-surface', '#121212');
    root.style.setProperty('--cs-card', '#1E1E1E');
    root.style.setProperty('--cs-border', 'rgba(255,255,255,0.08)');
    root.style.setProperty('--coral-churn', '#FF8A80');
    root.style.setProperty('--amber-watch', '#FFD180');
    root.style.setProperty('--green-safe', '#B9F6CA');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>('light');
  const [accentTheme, setAccentThemeState] = useState<AccentTheme>('signal-teal');
  const [resolvedAppearance, setResolvedAppearance] = useState<'light' | 'dark'>('light');

  const resolve = (a: Appearance): 'light' | 'dark' => {
    if (a === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return a;
  };

  useEffect(() => {
    const resolved = resolve(appearance);
    setResolvedAppearance(resolved);
    applyTheme(accentTheme, resolved);
  }, [appearance, accentTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (appearance === 'system') {
        const resolved = resolve('system');
        setResolvedAppearance(resolved);
        applyTheme(accentTheme, resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [appearance, accentTheme]);

  const setAppearance = (a: Appearance) => setAppearanceState(a);
  const setAccentTheme = (t: AccentTheme) => setAccentThemeState(t);

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance, accentTheme, setAccentTheme, resolvedAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
