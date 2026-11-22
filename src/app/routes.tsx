import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../shared/components/layout/Layout';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

// Lazy loaded routes for optimal bundle splitting
const LandingPage = lazy(() => import('../features/landing/LandingPage'));
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const DashboardPage = lazy(() => import('../features/dashboard/DashboardPage'));
const ProblemBoardPage = lazy(() => import('../features/problems/ProblemBoardPage'));
const ProblemDetailPage = lazy(() => import('../features/problems/ProblemDetailPage'));
const CreateProblemPage = lazy(() => import('../features/problems/CreateProblemPage'));
const TeamFinderPage = lazy(() => import('../features/team/TeamFinderPage'));
const EditProfilePage = lazy(() => import('../features/team/EditProfilePage'));
const TrialSprintPage = lazy(() => import('../features/team/TrialSprintPage'));
const SimulatorPage = lazy(() => import('../features/simulator/SimulatorPage'));
const SimulationReportPage = lazy(() => import('../features/simulator/SimulationReportPage'));
const PrebookingDashboardPage = lazy(
  () => import('../features/prebooking/PrebookingDashboardPage')
);
const PublicPrebookPage = lazy(() => import('../features/prebooking/PublicPrebookPage'));
const MyProblemsPage = lazy(() => import('../features/company/MyProblemsPage'));
const CompanyProposalsPage = lazy(() => import('../features/company/CompanyProposalsPage'));
const DiscoverCampaignsPage = lazy(() => import('../features/backer/DiscoverCampaignsPage'));
const MyPrebookingsPage = lazy(() => import('../features/backer/MyPrebookingsPage'));
const NotFoundPage = lazy(() => import('../features/misc/NotFoundPage'));

const PageLoader: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs text-slate-500 font-medium tracking-wide">Loading LaunchLoop...</span>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/p/:slug" element={<PublicPrebookPage />} />

          {/* Protected Founder Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems"
            element={
              <ProtectedRoute>
                <ProblemBoardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/:id"
            element={
              <ProtectedRoute>
                <ProblemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/problems/new"
            element={
              <ProtectedRoute allowedRoles={['ENTERPRISE', 'FOUNDER']}>
                <CreateProblemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team"
            element={
              <ProtectedRoute>
                <TeamFinderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/profile"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/team/sprint/:id"
            element={
              <ProtectedRoute>
                <TrialSprintPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulate"
            element={
              <ProtectedRoute>
                <SimulatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulate/report/:id"
            element={
              <ProtectedRoute>
                <SimulationReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/prebook"
            element={
              <ProtectedRoute>
                <PrebookingDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Dedicated Company Routes */}
          <Route
            path="/company/problems"
            element={
              <ProtectedRoute allowedRoles={['ENTERPRISE']}>
                <MyProblemsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/company/proposals"
            element={
              <ProtectedRoute allowedRoles={['ENTERPRISE']}>
                <CompanyProposalsPage />
              </ProtectedRoute>
            }
          />

          {/* Dedicated Backer Routes */}
          <Route
            path="/backer/discover"
            element={
              <ProtectedRoute allowedRoles={['BACKER']}>
                <DiscoverCampaignsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/backer/prebookings"
            element={
              <ProtectedRoute allowedRoles={['BACKER']}>
                <MyPrebookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallbacks */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};
