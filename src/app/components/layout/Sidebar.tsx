import { NavLink, useNavigate } from 'react-router';
import {
  LayoutDashboard, Users, Brain, BarChart3, Cpu, Bell, Settings, User,
  ChevronLeft, ChevronRight, TrendingUp, LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/customers', icon: Users, label: 'Customers' },
  { to: '/app/predictions', icon: Brain, label: 'Predictions' },
  { to: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/app/models', icon: Cpu, label: 'Models' },
  { to: '/app/alerts', icon: Bell, label: 'Alerts' },
];

const BOTTOM_ITEMS = [
  { to: '/app/settings', icon: Settings, label: 'Settings' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { resolvedAppearance } = useTheme();
  const navigate = useNavigate();
  const isDark = resolvedAppearance === 'dark';

  return (
    <aside
      className="flex flex-col h-full transition-all duration-300 relative"
      style={{
        width: collapsed ? '64px' : '220px',
        background: isDark ? '#1A1A2E' : 'var(--cs-card)',
        borderRight: '1px solid var(--cs-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0" style={{ borderBottom: '1px solid var(--cs-border)' }}>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--accent-primary)' }}
        >
          <TrendingUp size={16} color="#fff" />
        </div>
        {!collapsed && (
          <span style={{ color: 'var(--cs-ink)', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px' }}>
            Churn<span style={{ color: 'var(--accent-primary)' }}>Sight</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-all duration-150"
            style={({ isActive }) => ({
              padding: collapsed ? '10px 16px' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'var(--accent-glass)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--cs-ink-muted)',
              borderLeft: isActive ? `3px solid var(--accent-primary)` : '3px solid transparent',
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="py-4" style={{ borderTop: '1px solid var(--cs-border)' }}>
        {BOTTOM_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className="flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-all duration-150"
            style={({ isActive }) => ({
              padding: collapsed ? '10px 16px' : '10px 12px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: isActive ? 'var(--accent-glass)' : 'transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--cs-ink-muted)',
              borderLeft: isActive ? `3px solid var(--accent-primary)` : '3px solid transparent',
            })}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>{label}</span>}
          </NavLink>
        ))}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 mx-2 my-0.5 rounded-lg transition-all duration-150 w-[calc(100%-16px)]"
          style={{
            padding: collapsed ? '10px 16px' : '10px 12px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            color: 'var(--coral-churn)',
            borderLeft: '3px solid transparent',
          }}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span style={{ fontSize: '14px', fontWeight: 500 }}>Logout</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-md"
        style={{ background: 'var(--accent-primary)', color: '#fff' }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
