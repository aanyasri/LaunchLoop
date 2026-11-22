import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../shared/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <span className="text-5xl font-black text-brand-600">404</span>
      <h1 className="text-2xl font-bold text-slate-900 mt-2">Page Not Found</h1>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The pipeline page you requested does not exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button variant="primary" size="sm">
          Return to LaunchLoop Home
        </Button>
      </Link>
    </div>
  );
};
export default NotFoundPage;
