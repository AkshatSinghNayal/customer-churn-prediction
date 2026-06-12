import { createBrowserRouter } from 'react-router';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Dashboard } from './pages/Dashboard';
import { Customers } from './pages/Customers';
import { Predictions } from './pages/Predictions';
import { Analytics } from './pages/Analytics';
import { Models } from './pages/Models';
import { Alerts } from './pages/Alerts';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { NotFound } from './pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', Component: Landing },
  { path: '/auth/login', Component: Login },
  { path: '/auth/register', Component: Register },
  {
    path: '/app',
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'dashboard', Component: Dashboard },
      { path: 'customers', Component: Customers },
      { path: 'predictions', Component: Predictions },
      { path: 'analytics', Component: Analytics },
      { path: 'models', Component: Models },
      { path: 'alerts', Component: Alerts },
      { path: 'settings', Component: Settings },
      { path: 'profile', Component: Profile },
    ],
  },
  { path: '*', Component: NotFound },
]);
