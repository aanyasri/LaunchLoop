import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Users,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../shared/components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/50 via-white to-slate-50 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100/80 border border-brand-200 text-xs font-semibold text-brand-800 mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
            <span>The India-First Founder Validation Pipeline</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Never launch blind. <br />
            <span className="text-brand-600 underline decoration-brand-300 decoration-wavy">
              Validate demand before you build.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A single connected pipeline for Indian startup founders: find verified business
            problems, assemble complementary co-founders, stress-test with simulated Indian
            personas, and secure refundable pre-orders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" variant="primary" className="shadow-lg shadow-brand-500/20">
                <span>Enter Founder Pipeline</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/problems">
              <Button size="lg" variant="outline">
                <span>Explore Problem Board</span>
              </Button>
            </Link>
          </div>

          {/* Value Pillars */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-900 block">1. Real Problems</span>
              <span className="text-[11px] text-slate-500">Posted by verified businesses</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-900 block">2. Missing Roles</span>
              <span className="text-[11px] text-slate-500">Complementary talent match</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-900 block">3. Indian Personas</span>
              <span className="text-[11px] text-slate-500">Stress-tested hypothesis</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-900 block">4. Pre-bookings</span>
              <span className="text-[11px] text-slate-500">Refundable deposit demand</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Pipeline Walkthrough */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              The 4-Stage Connected Loop
            </span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">
              From business friction to paying Indian customers
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              Each stage directly carries its data forward so you never start from a blank sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center mb-4">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">1. Problem Board</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Real Indian enterprises post high-friction business pain points with clear
                  constraints, budgets, and pilot contracts.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified companies & clear IP terms</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">2. Team Finder</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  We match on complementary skills—not similarity. Find the exact missing roles your
                  idea needs, take a compatibility quiz, and run a 1-week trial sprint.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Equity, runway & workstyle match</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">3. Idea Simulator</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Generate diverse simulated Indian personas across Metro, Tier-2, and Tier-3
                  cities. Includes sceptical buyers, price sensitivity, and confidence indicators.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Hypothesis testing, not fake proof</span>
              </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">4. Pre-booking</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Set a backer threshold and collect refundable deposits via simulated UPI. Unlock
                  launch only when backer threshold is met.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Refundable deposit held by payment partner</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
