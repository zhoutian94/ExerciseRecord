import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AppProvider } from './context';
import { Home } from './pages/Home';
import { RecordPage } from './pages/Record';
import { Stats } from './pages/Stats';
import { Settings } from './pages/Settings';
import { Activity, PlusCircle, BarChart3, Settings as SettingsIcon } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: Activity, label: '首页' },
    { path: '/record', icon: PlusCircle, label: '记录' },
    { path: '/stats', icon: BarChart3, label: '统计' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-md mx-auto px-6 h-16 flex items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center flex-1 py-1 ${active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Icon size={24} className={active ? 'mb-1' : 'mb-1 opacity-80'} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto shadow-sm relative">
      <header className="bg-white px-4 h-14 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <h1 className="text-lg font-bold text-gray-900">
          {location.pathname === '/' && '锻炼首页'}
          {location.pathname === '/record' && '记录锻炼'}
          {location.pathname === '/stats' && '运动统计'}
          {location.pathname === '/settings' && '设置'}
        </h1>
        {location.pathname === '/' && (
          <Link to="/settings" className="text-gray-500 hover:text-gray-900 bg-gray-50 p-2 rounded-full">
            <SettingsIcon size={20} />
          </Link>
        )}
        {location.pathname !== '/' && (
          <div className="w-9"></div> // Placeholder to center title in other views if needed, though flex-between handles it.
        )}
      </header>
      <main className="p-4">{children}</main>
      <Navigation />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/record" element={<RecordPage />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}
