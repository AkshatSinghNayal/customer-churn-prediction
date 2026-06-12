import { useState } from 'react';
import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { useTheme } from '../../context/ThemeContext';

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { resolvedAppearance } = useTheme();

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--cs-surface)', color: 'var(--cs-ink)' }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopNav />
        <main
          className="flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--cs-surface)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
