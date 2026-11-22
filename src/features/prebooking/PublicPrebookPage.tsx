import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { prebookingService } from '../../services/api/prebookingService';
import { PrebookingCampaign } from '../../types/prebooking';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { FormInput } from '../../shared/components/forms/FormInput';
import { Modal } from '../../shared/components/feedback/Modal';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  CreditCard,
  QrCode,
  Smartphone,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { analyzeCampaignStatus } from '../../utils/prebookingLogic';

export const PublicPrebookPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [campaign, setCampaign] = useState<PrebookingCampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentType, setPaymentType] = useState<'REFUNDABLE_DEPOSIT' | 'FULL_PAYMENT'>(
    'REFUNDABLE_DEPOSIT'
  );
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [backerName, setBackerName] = useState('Vikram Joshi');
  const [backerEmail, setBackerEmail] = useState('vikram.j@outlook.com');
  const [upiId, setUpiId] = useState('vikram@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCampaign() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const data = await prebookingService.getCampaignBySlug(slug);
        if (isMounted) {
          if (!data) {
            // Fallback to first campaign if slug doesn't match
            const all = await prebookingService.getCampaigns();
            setCampaign(all[0] || null);
          } else {
            setCampaign(data);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load campaign');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadCampaign();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    try {
      setIsProcessing(true);
      const amountINR =
        paymentType === 'FULL_PAYMENT' ? campaign.fullPriceINR : campaign.refundableDepositINR;

      await prebookingService.createOrder({
        campaignId: campaign.id,
        backerName,
        backerEmail,
        paymentType,
        amountINR,
        paymentMethod,
        upiId: paymentMethod === 'UPI' ? upiId : undefined,
      });

      // Update local campaign count
      setCampaign((prev) =>
        prev
          ? {
            ...prev,
            currentBackersCount: prev.currentBackersCount + 1,
            depositOnlyCount:
              paymentType === 'REFUNDABLE_DEPOSIT'
                ? prev.depositOnlyCount + 1
                : prev.depositOnlyCount,
            fullPaymentsCount:
              paymentType === 'FULL_PAYMENT'
                ? prev.fullPaymentsCount + 1
                : prev.fullPaymentsCount,
          }
          : null
      );

      setOrderComplete(true);
      setTimeout(() => {
        setIsProcessing(false);
        setIsCheckoutOpen(false);
        setOrderComplete(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-xs text-slate-500">
        Loading product pre-booking page...
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Campaign Not Found</h1>
        <p className="text-xs text-slate-500">{error || 'This pre-booking campaign is not active.'}</p>
        <Link to="/backer/discover">
          <Button variant="outline" size="sm">
            Discover Live Campaigns
          </Button>
        </Link>
      </div>
    );
  }

  const analysis = analyzeCampaignStatus(campaign);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Trust Notice Header */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-xl text-xs flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Verified LaunchLoop Campaign:</strong> Refundable deposit, automatically refunded if {campaign.targetBackersThreshold} backers are not reached by the deadline.
          </span>
        </div>
        <Badge variant="brand">Refundable Deposit Protected</Badge>
      </div>

      {/* Main Campaign Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Story & Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full">
              Customer Pre-order Reservation
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {campaign.title}
            </h1>
            <p className="text-base text-slate-600 leading-relaxed">{campaign.tagline}</p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
              {campaign.founderName.substring(0, 2)}
            </div>
            <div>
              <span className="font-bold text-slate-900 block">Created by {campaign.founderName}</span>
              <span>Founder & Technology Lead</span>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">About the Innovation</h2>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {campaign.description}
            </p>
          </div>

          {/* Refundable Guarantee Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-slate-50 border border-emerald-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>How Your Pre-booking Is Protected</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {campaign.depositTermsNote} If the project reaches its threshold of{' '}
              {campaign.targetBackersThreshold} verified backers by {campaign.deadlineDate}, your
              reservation priority is locked in and credited toward the purchase price.
            </p>
          </div>
        </div>

        {/* Right Column: Reservation & Threshold Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 p-6 space-y-6 border-slate-200 shadow-md">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                Refundable Deposit
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-slate-900">
                  {formatINR(campaign.refundableDepositINR)}
                </span>
                <span className="text-xs text-slate-400 line-through">
                  Full: {formatINR(campaign.fullPriceINR)}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Refundable Deposit Reservation
              </span>
            </div>

            {/* Threshold Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  {campaign.currentBackersCount} backers pledged
                </span>
                <span className="font-bold text-brand-700">{analysis.progressPercentage}%</span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${analysis.progressPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Target: {campaign.targetBackersThreshold} backers</span>
                <span>{analysis.daysRemaining} days remaining</span>
              </div>
            </div>

            {/* Pre-book CTA Button */}
            <Button
              size="lg"
              variant="primary"
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full shadow-lg shadow-brand-500/20"
            >
              <span>Pre-book with Refundable Deposit</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>

            {/* Demand Signal Breakdown */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span>Refundable Deposits ({formatINR(campaign.refundableDepositINR)}):</span>
                <strong className="text-slate-900">{campaign.depositOnlyCount}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Full Upfront Pre-payments ({formatINR(campaign.fullPriceINR)}):</span>
                <strong className="text-emerald-700">{campaign.fullPaymentsCount}</strong>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                Demand Signal: Full prepayments demonstrate high conviction, while refundable deposits
                measure low-friction reservation intent.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Mock Checkout Modal */}
      <Modal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        title="Complete Pre-booking Reservation"
        description="Simulated checkout: refundable deposit, automatically refunded if the threshold isn't met by the deadline."
        maxWidth="md"
      >
        {orderComplete ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pre-booking Confirmed!</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your deposit is safely held by our payment partner. You will receive an SMS and email
              receipt.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-xs">
            {/* Sandbox Notice */}
            <div className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                <strong>Sandbox Payment Flow:</strong> Simulated transaction only. Zero credit card
                numbers or real currency will be charged.
              </span>
            </div>

            {/* Payment Level Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Choose Reservation Tier:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentType('REFUNDABLE_DEPOSIT')}
                  className={`p-3 rounded-xl border text-left transition-all ${paymentType === 'REFUNDABLE_DEPOSIT'
                      ? 'border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-500'
                      : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span className="font-bold text-xs block">
                    Refundable Deposit ({formatINR(campaign.refundableDepositINR)})
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Low friction • Refundable deposit if threshold isn&apos;t reached
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentType('FULL_PAYMENT')}
                  className={`p-3 rounded-xl border text-left transition-all ${paymentType === 'FULL_PAYMENT'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  <span className="font-bold text-xs block">
                    Full Pre-payment ({formatINR(campaign.fullPriceINR)})
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    High market conviction • Priority delivery batch #1
                  </span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="Full Name"
                required
                value={backerName}
                onChange={(e) => setBackerName(e.target.value)}
              />
              <FormInput
                label="Email"
                type="email"
                required
                value={backerEmail}
                onChange={(e) => setBackerEmail(e.target.value)}
              />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Simulated Payment Method:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: Smartphone },
                  { id: 'Card', label: 'Mock Card', icon: CreditCard },
                  { id: 'NetBanking', label: 'NetBanking', icon: QrCode },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                      className={`p-2.5 rounded-lg border text-center font-medium transition-all flex flex-col items-center gap-1 ${paymentMethod === m.id
                          ? 'border-brand-600 bg-brand-50 text-brand-900 ring-1 ring-brand-500'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <Icon className="w-4 h-4 text-slate-600" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'UPI' && (
              <FormInput
                label="Virtual Payment Address (VPA / UPI ID)"
                required
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. yourname@oksbi"
              />
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                  Amount Due
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatINR(
                    paymentType === 'FULL_PAYMENT'
                      ? campaign.fullPriceINR
                      : campaign.refundableDepositINR
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isProcessing}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  Confirm & Pre-book
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
export default PublicPrebookPage;
