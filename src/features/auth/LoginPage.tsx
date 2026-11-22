import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { Layers, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('aanya@launchloop.in');
  const [selectedRole, setSelectedRole] = useState<UserRole>('FOUNDER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
    navigate(from, { replace: true });
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Log in to Launch<span className="text-brand-600">Loop</span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            India&apos;s structured pipeline for de-risking startup ideas
          </p>
        </div>

        {/* Quick Demo Role Selector */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <span className="block text-xs font-semibold text-slate-700 mb-2">
            One-Click Demo Personas:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('FOUNDER')}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-brand-500 hover:text-brand-700 text-slate-800 shadow-xs flex flex-col items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Founder</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ENTERPRISE')}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-700 text-slate-800 shadow-xs flex flex-col items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Company</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('BACKER')}
              className="px-2.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-700 text-slate-800 shadow-xs flex flex-col items-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
              <span>Backer</span>
            </button>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Email address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Select Operating Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['FOUNDER', 'ENTERPRISE', 'BACKER'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    selectedRole === r
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'FOUNDER' ? 'Founder' : r === 'ENTERPRISE' ? 'Company' : 'Customer'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4">
            Continue to LaunchLoop
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          New to LaunchLoop?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
