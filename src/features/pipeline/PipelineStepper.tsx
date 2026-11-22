import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Compass,
  Users,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useVenture } from '../../context/VentureContext';
import { PipelineStage } from '../../types/pipeline';

interface PipelineStepperProps {
  currentStage?: PipelineStage;
  className?: string;
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ className = '' }) => {
  const { venture } = useVenture();
  const activeStage = venture.currentStage;

  const steps = [
    {
      stage: 1 as PipelineStage,
      title: '1. Find Problem',
      desc: venture.selectedProblem
        ? venture.selectedProblem.title
        : 'Select a verified B2B problem',
      href: '/problems',
      icon: Compass,
      isCompleted: !!venture.selectedProblem,
    },
    {
      stage: 2 as PipelineStage,
      title: '2. Build Team',
      desc: venture.idea?.filledRoles?.length
        ? `${venture.idea.filledRoles.length} role(s) filled`
        : 'Find complementary skills',
      href: '/team',
      icon: Users,
      isCompleted: (venture.idea?.filledRoles?.length || 0) >= 2,
    },
    {
      stage: 3 as PipelineStage,
      title: '3. Simulate Reactions',
      desc: venture.simulationResult
        ? `Score ${venture.simulationResult.overallScore}/100 (${venture.simulationResult.confidenceLevel} conf)`
        : 'Stress-test with simulated Indian customers',
      href: '/simulate',
      icon: Sparkles,
      isCompleted: !!venture.simulationResult,
    },
    {
      stage: 4 as PipelineStage,
      title: '4. Pre-book Demand',
      desc: venture.prebookingCampaign
        ? `${venture.prebookingCampaign.currentBackersCount}/${venture.prebookingCampaign.targetBackersThreshold} pre-booked`
        : 'Collect refundable customer deposits',
      href: '/prebook',
      icon: ShoppingBag,
      isCompleted: venture.prebookingCampaign?.isLaunched || false,
    },
  ];

  return (
    <section
      aria-label="Venture Validation Pipeline Stepper"
      className={`w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 ${className}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
            The LaunchLoop Pipeline
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {venture.selectedProblem ? (
              <>Venture: {venture.selectedProblem.title}</>
            ) : (
              'Start Your Venture Pipeline'
            )}
          </h2>
          <p className="text-xs text-slate-500">
            Never launch blind: verify the problem, assemble complementary talent, stress-test with
            personas, and lock refundable pre-orders.
          </p>
        </div>

        {venture.selectedProblem && (
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium">Stage {activeStage} of 4</span>
            <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-500 h-full transition-all duration-300"
                style={{ width: `${(activeStage / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <nav
        aria-label="Pipeline steps"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCurrent = activeStage === step.stage;
          const isDone = step.isCompleted;

          return (
            <Link
              key={step.stage}
              to={step.href}
              className={`relative flex flex-col p-3.5 rounded-xl border transition-all text-left group ${
                isCurrent
                  ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-xs'
                  : isDone
                    ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                    : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div
                  className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : isCurrent ? (
                  <span className="text-[10px] font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <h3 className="font-semibold text-xs text-slate-900 group-hover:text-brand-700 transition-colors">
                {step.title}
              </h3>
              <p className="text-[11px] text-slate-500 truncate mt-0.5" title={step.desc}>
                {step.desc}
              </p>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-300">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>
    </section>
  );
};
