import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FounderDashboard } from './FounderDashboard';
import { CompanyDashboard } from './CompanyDashboard';
import { BackerDashboard } from './BackerDashboard';
import { AlertCircle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const deniedMessage = (location.state as { deniedMessage?: string })?.deniedMessage;

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'ENTERPRISE':
        return <CompanyDashboard />;
      case 'BACKER':
        return <BackerDashboard />;
      case 'FOUNDER':
      default:
        return <FounderDashboard />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Friendly Access Redirection Banner */}
      {deniedMessage && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 shadow-xs animate-in fade-in"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="font-medium">{deniedMessage}</div>
        </div>
      )}

      {renderDashboardByRole()}
    </div>
  );
};
export default DashboardPage;
