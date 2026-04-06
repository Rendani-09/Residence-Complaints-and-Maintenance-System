import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = user?.role === 'student'
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/submit-complaint', label: 'Submit Complaint' },
        { to: '/my-complaints', label: 'My Complaints' },
      ]
    : [
        { to: '/admin', label: 'Dashboard' },
        { to: '/analytics', label: 'Analytics' },
      ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent md:hidden"
            >
              {mobileOpen ? 'Close' : 'Menu'}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-sm">
                RC
              </div>
              <span className="hidden font-heading font-bold text-foreground sm:block">ResComplaints</span>
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                {user?.firstName?.[0]}{user?.surname?.[0]}
              </div>
              <div className="text-sm">
                <p className="font-medium text-foreground">{user?.firstName} {user?.surname}</p>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="border-t px-4 py-3 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};
