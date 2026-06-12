import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, Bell, User, ChevronDown } from 'lucide-react';
import { AppearanceSwitcher } from '../AppearanceSwitcher';
import { AccentSwitcher } from '../AccentSwitcher';
import { useTheme } from '../../context/ThemeContext';

const profileImage = new URL('../../../../home.png', import.meta.url).href;

export function TopNav() {
  const { resolvedAppearance } = useTheme();
  const [searchVal, setSearchVal] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const isDark = resolvedAppearance === 'dark';

  return (
    <header
      className="h-16 flex items-center px-6 gap-4 flex-shrink-0"
      style={{
        background: isDark ? 'rgba(30,30,30,0.85)' : 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--cs-border)',
      }}
    >
      {/* Search */}
      <div
        className="flex items-center gap-2 flex-1 max-w-sm rounded-lg px-3 py-2"
        style={{ background: 'var(--accent-glass)', border: '1px solid var(--cs-border)' }}
      >
        <Search size={16} style={{ color: 'var(--cs-ink-muted)' }} />
        <input
          value={searchVal}
          onChange={e => setSearchVal(e.target.value)}
          placeholder="Search customers, predictions..."
          className="bg-transparent outline-none flex-1"
          style={{ fontSize: '14px', color: 'var(--cs-ink)' }}
        />
      </div>

      <div className="flex-1" />

      {/* Alerts */}
      <Link to="/app/alerts" className="relative w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)' }}>
        <Bell size={18} />
        <span
          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
          style={{ background: 'var(--coral-churn)' }}
        />
      </Link>

      {/* Theme switchers */}
      <AppearanceSwitcher />
      <AccentSwitcher />

      {/* User avatar */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(o => !o)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{ background: 'var(--accent-glass)', color: 'var(--cs-ink)' }}
        >
          <img
            src={profileImage}
            alt="Akshat Singh Nayal"
            className="w-7 h-7 rounded-full object-cover"
            style={{ border: '1px solid var(--cs-border)' }}
          />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Akshat Singh Nayal</span>
          <ChevronDown size={14} style={{ color: 'var(--cs-ink-muted)' }} />
        </button>
        {showUserMenu && (
          <div
            className="absolute right-0 top-12 z-50 rounded-xl shadow-2xl py-2 min-w-[160px]"
            style={{
              background: isDark ? 'rgba(30,30,30,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(16px)',
              border: '1px solid var(--cs-border)',
            }}
          >
            {[{ label: 'Profile', path: '/app/profile' }, { label: 'Settings', path: '/app/settings' }].map(({ label, path }) => (
              <button
                key={path}
                className="w-full text-left px-4 py-2 transition-colors"
                style={{ color: 'var(--cs-ink)', fontSize: '14px', height: '36px' }}
                onClick={() => { navigate(path); setShowUserMenu(false); }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--accent-glass)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {label}
              </button>
            ))}
            <hr style={{ borderColor: 'var(--cs-border)', margin: '4px 0' }} />
            <button
              className="w-full text-left px-4 py-2 transition-colors"
              style={{ color: 'var(--coral-churn)', fontSize: '14px', height: '36px' }}
              onClick={() => { navigate('/'); setShowUserMenu(false); }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
