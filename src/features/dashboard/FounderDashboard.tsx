import React from 'react';
import { Link } from 'react-router-dom';
import { PipelineStepper } from '../pipeline/PipelineStepper';
import { useVenture } from '../../context/VentureContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { ArrowRight, Compass, Users, Sparkles, ShoppingBag, RotateCcw, Lightbulb } from 'lucide-react';

export const FounderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { venture, resetVenture } = useVenture();

  // Determine next recommended step based on pipeline state
  const getNextAction = () => {
    if (!venture.selectedProblem) {
      return {
        title: 'Step 1: Select a Verified B2B Problem',
        desc: 'Browse enterprise pain points posted by vetted Indian corporations with allocated pilot budgets.',
        actionLabel: 'Browse Problems',
        href: '/problems',
        icon: Compass,
      };
    }
    if ((venture.idea?.filledRoles?.length || 0) < 2) {
      return {
        title: 'Step 2: Assemble Your Complementary Team',
        desc: `Problem "${venture.selectedProblem.title.substring(0, 30)}..." requires missing roles: ${
          venture.idea?.missingRoles.join(', ') || 'Tech Lead, Growth'
        }.`,
        actionLabel: 'Find Complementary Talent',
        href: '/team',
        icon: Users,
      };
    }
    if (!venture.simulationResult) {
      return {
        title: 'Step 3: Stress-Test With Simulated Indian Customers',
        desc: 'Generate demographic personas across Metro, Tier-2, and Tier-3 cities to test willingness to pay before launching.',
        actionLabel: 'Run Customer Simulator',
        href: '/simulate',
        icon: Sparkles,
      };
    }
    return {
      title: 'Step 4: Launch Refundable Pre-booking Campaign',
      desc: 'Lock in real backer intent with small refundable deposits held safely by our payment partner.',
      actionLabel: 'Configure Pre-booking Campaign',
      href: '/prebook',
      icon: ShoppingBag,
    };
  };

  const nextStep = getNextAction();
  const NextIcon = nextStep.icon;

  return (
    <div className="space-y-8">
      {/* Header with Role & Venture Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Founder Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'Founder'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Systematically validate and de-risk your venture before writing code or spending capital.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetVenture}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-rose-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            title="Reset venture state to start over"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Pipeline</span>
          </button>
        </div>
      </div>

      {/* Main Integrated Pipeline Stepper */}
      <PipelineStepper />

      {/* Next Recommended Action Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 md:mt-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Next Recommended Pipeline Action
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">{nextStep.title}</h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl">{nextStep.desc}</p>
          </div>
        </div>
        <Link to={nextStep.href} className="self-end md:self-auto shrink-0">
          <Button variant="primary" size="md" className="bg-emerald-600 hover:bg-emerald-700">
            <NextIcon className="w-4 h-4 mr-1.5" />
            <span>{nextStep.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Pipeline 4-Stage Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Step 1: Problem */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                1. Problem
              </span>
              <Compass className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {venture.selectedProblem ? venture.selectedProblem.title : 'No Problem Selected'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {venture.selectedProblem
                ? venture.selectedProblem.summary
                : 'Browse verified B2B enterprise problems with budget & pilot contracts.'}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/problems">
              <Button size="sm" variant={venture.selectedProblem ? 'outline' : 'primary'} className="w-full">
                <span>{venture.selectedProblem ? 'Change Problem' : 'Browse Problems'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Step 2: Team */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                2. Team
              </span>
              <Users className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {venture.idea?.missingRoles?.length
                ? `Missing: ${venture.idea.missingRoles.join(', ')}`
                : 'Find Complementary Skills'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Match on complementary skills, evaluate risk alignment, and start a 1-week trial sprint.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/team">
              <Button size="sm" variant="outline" className="w-full">
                <span>Match Team</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Step 3: Simulator */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                3. Simulator
              </span>
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {venture.simulationResult
                ? `Score: ${venture.simulationResult.overallScore}/100 (${venture.simulationResult.confidenceLevel})`
                : 'Customer Reaction Panel'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Stress-test with simulated Indian customer personas across income and city tiers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/simulate">
              <Button size="sm" variant="outline" className="w-full">
                <span>{venture.simulationResult ? 'View Report' : 'Run Simulator'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Step 4: Pre-booking */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                4. Pre-booking
              </span>
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {venture.prebookingCampaign
                ? `${venture.prebookingCampaign.currentBackersCount}/${venture.prebookingCampaign.targetBackersThreshold} Backers`
                : 'Refundable Deposits'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lock verified customer conviction with refundable deposits held by the payment partner.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link to="/prebook">
              <Button size="sm" variant="outline" className="w-full">
                <span>Pre-booking Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
