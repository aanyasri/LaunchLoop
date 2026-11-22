import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { Layers } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('FOUNDER');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-600 flex items-center justify-center text-white shadow-sm">
            <Layers className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Join the Indian startup pipeline to validate demand before building.
          </p>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormInput
            label="Full Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Priyesh Nair"
          />

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
              I want to use LaunchLoop as
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['FOUNDER', 'ENTERPRISE', 'BACKER'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    role === r
                      ? 'border-brand-600 bg-brand-50 text-brand-800 ring-1 ring-brand-500'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {r === 'FOUNDER' ? 'Founder' : r === 'ENTERPRISE' ? 'Enterprise' : 'Backer'}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-4">
            Get Started
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
