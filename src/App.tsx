import React, { useEffect, useState } from 'react';
import { 
  RouterProvider, 
  createBrowserRouter, 
  createRoutesFromElements, 
  Route, 
  Navigate, 
  Link,
  Outlet,
  useNavigate,
  useLocation 
} from 'react-router-dom';
import { FileText, Settings as SettingsIcon, Users, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceForm } from './components/InvoiceForm';
import { TeamList } from './components/Teams/TeamList';
import { Settings } from './components/Settings';
import { LoginForm } from './components/Auth/LoginForm';
import { SignUpForm } from './components/Auth/SignUpForm';
import { AuthLayout } from './components/Auth/AuthLayout';
import { useAuthStore } from './store/useAuthStore';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Layout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const menuItems = [
    { path: '/invoices', icon: <FileText size={20} />, label: t('nav.invoices') },
    { path: '/teams', icon: <Users size={20} />, label: t('nav.teams') },
    { path: '/settings', icon: <SettingsIcon size={20} />, label: t('nav.settings') }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-semibold text-primary-500">GERAR INVOICE</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {menuItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.path);
                    }}
                    className={`${
                      location.pathname === item.path
                        ? 'border-primary-500 text-primary-500'
                        : 'border-transparent text-gray-500 hover:border-primary-300 hover:text-primary-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('nav.signOut')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initialize();
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, [initialize]);

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route 
          path="/login" 
          element={<AuthLayout><LoginForm /></AuthLayout>} 
        />
        <Route 
          path="/signup" 
          element={<AuthLayout><SignUpForm /></AuthLayout>} 
        />
        <Route 
          path="/" 
          element={<RequireAuth><Layout /></RequireAuth>}
        >
          <Route index element={<Navigate to="/invoices" />} />
          <Route path="invoices">
            <Route index element={<InvoiceList />} />
            <Route path="new" element={<InvoiceForm />} />
            <Route path=":id" element={<InvoiceForm />} />
          </Route>
          <Route path="teams" element={<TeamList />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Route>
      </>
    )
  );

  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}

export default App;