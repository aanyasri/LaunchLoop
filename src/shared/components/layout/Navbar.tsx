import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, LogOut, ShieldCheck, UserCheck, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useVenture } from '../../../context/VentureContext';
import { UserRole } from '../../../types/auth';
import { getNavItemsForRole } from '../../../config/navigation';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, switchRole } = useAuth();
  const { venture } = useVenture();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const currentRole = user?.role || 'FOUNDER';
  const navItems = getNavItemsForRole(currentRole);

  const roleStyles: Record<
    UserRole,
    { badgeBg: string; text: string; border: string; label: string; icon: React.ElementType }
  > = {
    FOUNDER: {
      badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      label: 'Founder',
      icon: UserCheck,
    },
    ENTERPRISE: {
      badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      label: 'Company',
      icon: ShieldCheck,
    },
    BACKER: {
      badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
      text: 'text-amber-700',
      border: 'border-amber-200',
      label: 'Backer',
      icon: ShoppingBag,
    },
  };

  const activeRoleStyle = roleStyles[currentRole];
  const RoleIcon = activeRoleStyle.icon;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Tagline */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
                <Layers className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                  Launch<span className="text-brand-600">Loop</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                  INDIA FOUNDER PIPELINE
                </span>
              </div>
            </Link>

            {/* Pipeline Stage Quick Status Pill (Only for Founder) */}
            {isAuthenticated && currentRole === 'FOUNDER' && venture.selectedProblem && (
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium">Step {venture.currentStage}/4:</span>
                <span className="text-emerald-700 truncate max-w-[140px]">
                  {venture.selectedProblem.title}
                </span>
              </div>
            )}
          </div>

          {/* Role-Specific Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? currentRole === 'ENTERPRISE'
                        ? 'bg-indigo-50 text-indigo-700'
                        : currentRole === 'BACKER'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] bg-brand-500 text-white px-1.5 py-0.2 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* Active Role Visual Badge */}
                <div
                  className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${activeRoleStyle.badgeBg}`}
                >
                  <RoleIcon className="w-3.5 h-3.5" />
                  <span>{activeRoleStyle.label}</span>
                </div>

                {/* Role Switcher */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                  {(['FOUNDER', 'ENTERPRISE', 'BACKER'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => switchRole(r)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${user.role === r
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                        }`}
                      title={`Switch to ${r} view`}
                    >
                      {r === 'FOUNDER' ? 'Founder' : r === 'ENTERPRISE' ? 'Company' : 'Backer'}
                    </button>
                  ))}
                </div>

                <div className="hidden lg:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {user.organization || user.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Hamburger */}
                <button
                  onClick={() => setIsMobileOpen((prev) => !prev)}
                  className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                  title={isMobileOpen ? 'Close Menu' : 'Open Menu'}
                  aria-label={isMobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                  aria-expanded={isMobileOpen}
                >
                  {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium bg-brand-600 text-white hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-1 bg-white animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/dashboard'
                  ? location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? currentRole === 'ENTERPRISE'
                        ? 'bg-indigo-50 text-indigo-700'
                        : currentRole === 'BACKER'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-emerald-50 text-emerald-700'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-brand-500 text-white px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
