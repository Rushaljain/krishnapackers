import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, LogOut, Loader2, Package, Mail, Menu, X, AlertCircle } from 'lucide-react';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Admin layout caught error:", error, errorInfo);
  }
  handleReset = () => {
    try {
      localStorage.removeItem('baachko_email_threads_v3');
      localStorage.removeItem('baachko_email_threads_v2');
      localStorage.removeItem('baachko_email_threads');
    } catch (e) {}
    window.location.reload();
  };
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 max-w-md w-full">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Section Failed to Load</h2>
            <p className="text-xs text-gray-500 mb-6">
              {this.state.error?.message || "An unexpected error occurred while loading this section."}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-[#C95A08] hover:bg-orange-700 text-white font-bold rounded-lg text-sm transition cursor-pointer"
            >
              Reset Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('baachko_admin_sidebar_open');
      if (saved !== null) {
        return saved === 'true';
      }
      return window.innerWidth >= 768;
    }
    return true;
  });

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('baachko_admin_sidebar_open', String(next));
      }
      return next;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/adminpanel/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-8 w-8 text-amber-700" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/adminpanel/login" replace />;
  }

  const navigation = [
    { name: 'Leads & Quotes', href: '/adminpanel', icon: LayoutDashboard },
    { name: 'Mailing Center', href: '/adminpanel/emails', icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex relative overflow-x-hidden">
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Collapsable Sidebar */}
      <aside
        className={`bg-[#0B1730] text-white flex flex-col transition-all duration-300 ease-in-out shrink-0 z-50 fixed inset-y-0 left-0 md:static md:z-auto ${
          isSidebarOpen
            ? 'w-64 translate-x-0 shadow-2xl md:shadow-none'
            : '-translate-x-full w-64 md:translate-x-0 md:w-0 overflow-hidden pointer-events-none'
        }`}
      >
        <div className="w-64 flex flex-col h-full">
          {/* Sidebar Header with Brand */}
          <div className="p-5 border-b border-gray-700 flex items-center">
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition" target="_blank" title="View live website">
              <Package className="text-amber-500 shrink-0" />
              <span className="font-bold text-lg tracking-tight">ERP Admin</span>
            </Link>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive 
                      ? 'bg-amber-700 text-white shadow-sm' 
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer User Info & Sign Out */}
          <div className="p-4 border-t border-gray-700 mt-auto">
            <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 mb-2">
              <div className="truncate">{session.user.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 hover:text-red-300 rounded-lg transition cursor-pointer"
            >
              <LogOut size={20} />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 transition-all duration-300">
        {/* Top Navigation Panel Header */}
        <header className="bg-white border-b border-gray-200 py-3.5 px-4 sm:px-6 md:px-8 flex justify-between items-center shadow-xs z-10">
          <div className="flex items-center gap-3">
            {/* Hamburger in Top Left of Top Nav Panel */}
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-1 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 transition focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 cursor-pointer"
              title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-label={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">
              {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 ${location.pathname === '/adminpanel/emails' ? 'overflow-hidden p-0 bg-white flex flex-col' : 'overflow-auto p-4 sm:p-6 md:p-8 bg-gray-50'}`}>
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
