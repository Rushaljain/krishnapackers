import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { LayoutDashboard, Users, Settings, LogOut, Loader2, Package } from 'lucide-react';

export default function AdminLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
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
    { name: 'Dashboard', href: '/adminpanel', icon: LayoutDashboard },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0B1730] text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <Link to="/" className="flex items-center gap-2" target="_blank">
            <Package className="text-amber-500" />
            <span className="font-bold text-lg tracking-tight">ERP Admin</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive 
                    ? 'bg-amber-700 text-white' 
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 px-4 py-3 text-sm text-gray-400 mb-2">
            <div className="truncate">{session.user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 hover:text-red-300 rounded-lg transition"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
          </h1>
        </header>
        <main className="flex-1 overflow-auto p-8 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
