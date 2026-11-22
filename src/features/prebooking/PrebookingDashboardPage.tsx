import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PipelineStepper } from '../pipeline/PipelineStepper';
import { useVenture } from '../../context/VentureContext';
import { PrebookingCampaign } from '../../types/prebooking';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import {
  Rocket,
  Lock,
  Copy,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { analyzeCampaignStatus } from '../../utils/prebookingLogic';

export const PrebookingDashboardPage: React.FC = () => {
  const { venture, setPrebookingCampaign } = useVenture();

  // Load campaign from venture state or fallback to primary seed campaign
  const [campaign, setCampaign] = useState<PrebookingCampaign>(() => {
    if (venture.prebookingCampaign) return venture.prebookingCampaign;
    return {
      id: 'camp_01',
      founderId: 'usr_founder_01',
      founderName: 'Aanya Sharma',
      slug: 'agricold-pod',
      title: venture.idea?.productName || 'AgriCold: Solar Pre-cooling Pod for Tomato & Onion Farmers',
      tagline: 'Save 30%+ crop value with decentralized solar cold storage.',
      description:
        venture.selectedProblem?.desiredOutcome ||
        'Designed specifically for Indian farm clusters. Keeps harvested produce at optimal 12°C for up to 48 hours without grid power.',
      targetBackersThreshold: 100,
      currentBackersCount: 68,
      refundableDepositINR: 499,
      fullPriceINR: venture.idea?.priceINR || 18500,
      deadlineDate: '2026-12-31',
      isLaunched: false,
      depositStatus: 'Collecting',
      depositTermsNote:
        'Refundable deposit, automatically refunded if the threshold isn\'t met by the deadline. Held safely by the payment partner.',
      fullPaymentsCount: 14,
      depositOnlyCount: 54,
    };
  });

  const [thresholdInput, setThresholdInput] = useState(campaign.targetBackersThreshold);
  const [depositInput, setDepositInput] = useState(campaign.refundableDepositINR);
  const [deadlineInput, setDeadlineInput] = useState(campaign.deadlineDate);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [launchTriggered, setLaunchTriggered] = useState(campaign.isLaunched);

  useEffect(() => {
    // If simulation report is present, synchronize title & description
    if (venture.simulationResult && !venture.prebookingCampaign) {
      setCampaign((prev) => ({
        ...prev,
        title: venture.simulationResult?.productName || prev.title,
        description: venture.simulationResult?.productDescription || prev.description,
        fullPriceINR: venture.simulationResult?.priceINR || prev.fullPriceINR,
      }));
    }
  }, [venture.simulationResult, venture.prebookingCampaign]);

  const analysis = analyzeCampaignStatus(campaign);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PrebookingCampaign = {
      ...campaign,
      targetBackersThreshold: Number(thresholdInput),
      refundableDepositINR: Number(depositInput),
      deadlineDate: deadlineInput,
    };
    setCampaign(updated);
    setPrebookingCampaign(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleLaunchVenture = () => {
    if (!analysis.isThresholdMet) return;
    const updated = { ...campaign, isLaunched: true };
    setCampaign(updated);
    setPrebookingCampaign(updated);
    setLaunchTriggered(true);
  };

  const handleSimulateAddBacker = () => {
    const updated: PrebookingCampaign = {
      ...campaign,
      currentBackersCount: campaign.currentBackersCount + 5,
      depositOnlyCount: campaign.depositOnlyCount + 4,
      fullPaymentsCount: campaign.fullPaymentsCount + 1,
    };
    if (updated.currentBackersCount >= updated.targetBackersThreshold) {
      updated.depositStatus = 'Threshold Met';
    }
    setCampaign(updated);
    setPrebookingCampaign(updated);
  };

  const copyPublicLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/p/${campaign.slug}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Stepper */}
      <PipelineStepper />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold mb-2">
            <span>Step 4 of LaunchLoop Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Pre-booking & Demand Validation Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Never launch blind: lock in customer conviction through refundable deposits held safely by
            our payment partner. The official launch button unlocks <strong>only</strong> when your threshold
            is reached.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyPublicLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Link Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Public Link</span>
              </>
            )}
          </button>

          <Link to={`/p/${campaign.slug}`}>
            <Button variant="outline" size="sm" className="text-xs">
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {isSaved && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Campaign parameters updated successfully!</span>
        </div>
      )}

      {/* Launch Readiness Hero Banner */}
      <div
        className={`p-6 rounded-2xl border transition-all ${analysis.isThresholdMet
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300'
            : 'bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-200'
          }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${analysis.isThresholdMet
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-900'
                  }`}
              >
                {analysis.isThresholdMet ? 'Threshold Reached • Launch Unlocked' : 'Collecting Refundable Deposits'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {analysis.daysRemaining} days remaining
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{analysis.convictionExplanation}</h2>

            <p className="text-xs text-slate-600 leading-relaxed">
              Customer deposits are held safely by the payment partner. If the deadline expires
              without reaching {campaign.targetBackersThreshold} backers, 100% of deposits are
              automatically refunded.
            </p>
          </div>

          {/* Launch Control CTA */}
          <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
            {launchTriggered ? (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-md text-sm">
                <Rocket className="w-4 h-4" />
                <span>Venture Commercial Launch Active!</span>
              </div>
            ) : (
              <Button
                size="lg"
                variant="primary"
                disabled={!analysis.isThresholdMet}
                onClick={handleLaunchVenture}
                className={
                  analysis.isThresholdMet
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }
              >
                {analysis.isThresholdMet ? (
                  <>
                    <Rocket className="w-5 h-5 mr-2" />
                    <span>Launch Venture Now</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    <span>
                      Locked ({campaign.targetBackersThreshold - campaign.currentBackersCount} more needed)
                    </span>
                  </>
                )}
              </Button>
            )}

            {!analysis.isThresholdMet && (
              <button
                type="button"
                onClick={handleSimulateAddBacker}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium self-end"
                title="Demo simulation helper"
              >
                + Simulate +5 customer pre-bookings
              </button>
            )}
          </div>
        </div>

        {/* Big Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
            <span>
              {campaign.currentBackersCount} of {campaign.targetBackersThreshold} Backers Pledged
            </span>
            <span className="text-brand-700">{analysis.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200/80 h-3.5 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${analysis.isThresholdMet ? 'bg-emerald-600' : 'bg-brand-600'
                }`}
              style={{ width: `${analysis.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Row: Demand Signal Deep-Dive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Metric 1: Total Held by Payment Partner */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Deposits Held by Payment Partner
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {formatINR(analysis.totalDepositAmountHeldINR)}
              </span>
            </div>
            <p className="text-xs text-emerald-700 font-medium mt-1">
              Refundable deposit, automatically refunded if threshold isn&apos;t met
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Held until threshold milestone is reached
          </div>
        </Card>

        {/* Metric 2: Demand Signal Breakdown */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Demand Signal Breakdown
            </span>
            <div className="mt-2 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Refundable Deposits ({formatINR(campaign.refundableDepositINR)}):
                </span>
                <strong className="text-slate-900 font-bold">{campaign.depositOnlyCount}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  Full Prepayments ({formatINR(campaign.fullPriceINR)}):
                </span>
                <strong className="text-emerald-700 font-bold">{campaign.fullPaymentsCount}</strong>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
            Full payments represent 3x conviction multiplier
          </div>
        </Card>

        {/* Metric 3: Market Conviction Score */}
        <Card className="flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Market Conviction Index
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {analysis.marketConvictionScore}
              </span>
              <span className="text-slate-400 font-bold">/ 100</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full"
                style={{ width: `${analysis.marketConvictionScore}%` }}
              />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Weighted by deposit tier commitment
          </div>
        </Card>
      </div>

      {/* Campaign Settings Form */}
      <Card className="p-6">
        <div className="pb-4 mb-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Pre-booking Campaign Configuration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your target customer threshold and refundable reservation price.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Backer Threshold Goal"
              type="number"
              min={10}
              max={1000}
              required
              value={thresholdInput}
              onChange={(e) => setThresholdInput(Number(e.target.value))}
              helperText="Number of backers required to unlock launch."
            />

            <FormInput
              label="Refundable Deposit (INR ₹)"
              type="number"
              min={99}
              required
              value={depositInput}
              onChange={(e) => setDepositInput(Number(e.target.value))}
              helperText="Refundable deposit, automatically refunded if threshold isn't met."
            />

            <FormInput
              label="Threshold Deadline Date"
              type="date"
              required
              value={deadlineInput}
              onChange={(e) => setDeadlineInput(e.target.value)}
              helperText="Auto-refund date if target is not met."
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <Button type="submit" variant="primary" size="sm">
              Save Campaign Settings
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default PrebookingDashboardPage;
