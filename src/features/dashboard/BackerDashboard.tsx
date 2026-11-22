import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { prebookingService } from '../../services/api/prebookingService';
import { PrebookingCampaign, PrebookingOrder } from '../../types/prebooking';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const BackerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Array<PrebookingOrder & { campaign?: PrebookingCampaign }>>([]);
  const [campaigns, setCampaigns] = useState<PrebookingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [camps, ords] = await Promise.all([
          prebookingService.getCampaigns(),
          prebookingService.getOrdersForBacker(user?.email || 'vikram.j@outlook.com'),
        ]);
        setCampaigns(camps);
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load backer dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCancelDeposit = async (orderId: string) => {
    try {
      await prebookingService.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'Refunded' } : o))
      );
      setFeedbackNotice(
        'Refund initiated: Your deposit has been returned to your original UPI/bank account by our payment partner.'
      );
      setTimeout(() => setFeedbackNotice(null), 5000);
    } catch (err) {
      console.error('Failed to cancel order', err);
    }
  };

  const totalDepositsSecured = orders
    .filter((o) => o.status === 'Deposit_Secured')
    .reduce((sum, o) => sum + o.amountINR, 0);

  const activePrebookings = orders.filter((o) => o.status === 'Deposit_Secured').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Customer & Backer Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {user?.name || 'Backer'} 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Back breakthrough Indian innovations with refundable deposits held safely by the payment partner.
          </p>
        </div>
        <Link to="/backer/discover">
          <Button variant="primary" className="bg-amber-600 hover:bg-amber-700">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            <span>Discover Innovations</span>
          </Button>
        </Link>
      </div>

      {feedbackNotice && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Trust & Guarantee Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500 text-white shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold">Refundable Deposit Protection: </span>
            Refundable deposit, automatically refunded if the threshold isn&apos;t met by the deadline. Funds are held safely by the payment partner.
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-amber-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Active Pre-bookings
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{activePrebookings}</span>
            <span className="text-xs text-amber-600 font-medium">Secured by Payment Partner</span>
          </div>
        </Card>

        <Card className="border-amber-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Deposits Held by Payment Partner
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {formatINR(totalDepositsSecured)}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Refundable Deposit</span>
          </div>
        </Card>

        <Card className="border-amber-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Campaigns Reached Threshold
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {campaigns.filter((c) => c.depositStatus === 'Threshold Met').length}
            </span>
            <span className="text-xs text-indigo-600 font-medium">In Commercial Pilot</span>
          </div>
        </Card>
      </div>

      {/* My Pre-bookings List */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Pre-bookings</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time threshold status of the products you have pledged deposits for.
            </p>
          </div>
          <Link to="/backer/prebookings">
            <Button size="sm" variant="outline">
              <span>View Full Ledger</span>
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-xs text-slate-500">Loading your pre-orders...</div>
        ) : orders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-slate-500">You have no active pre-orders yet.</p>
            <Link to="/backer/discover">
              <Button size="sm" variant="primary">
                Browse Indian Products
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {orders.map((ord) => {
              const camp = ord.campaign;
              const isSecured = ord.status === 'Deposit_Secured';
              const progressPct = camp
                ? Math.min(
                    100,
                    Math.round((camp.currentBackersCount / camp.targetBackersThreshold) * 100)
                  )
                : 0;

              return (
                <div key={ord.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">
                          {camp?.title || 'Pre-book Campaign'}
                        </h3>
                        <Badge variant={isSecured ? 'brand' : 'neutral'}>
                          {isSecured ? 'Refundable Deposit Held' : 'Refunded'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Amount: <span className="font-semibold text-slate-800">{formatINR(ord.amountINR)}</span> via{' '}
                        {ord.paymentMethod} • Placed on {new Date(ord.timestamp).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSecured && (
                        <button
                          onClick={() => handleCancelDeposit(ord.id)}
                          className="px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors font-medium"
                          title="Instant return of deposit"
                        >
                          Request Refund
                        </button>
                      )}
                      {camp && (
                        <Link to={`/p/${camp.slug}`}>
                          <Button size="sm" variant="outline" className="text-xs">
                            <span>Product Page</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress bar towards founder threshold */}
                  {camp && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">
                          Threshold progress: {camp.currentBackersCount} of {camp.targetBackersThreshold} backers
                        </span>
                        <span className="font-bold text-slate-800">{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {camp.depositTermsNote}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Featured Live Campaigns */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Featured Live Pre-order Campaigns</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Support real Indian products solving verified B2B and consumer challenges.
            </p>
          </div>
          <Link to="/backer/discover">
            <Button size="sm" variant="ghost">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {campaigns.slice(0, 2).map((c) => {
            const pct = Math.min(100, Math.round((c.currentBackersCount / c.targetBackersThreshold) * 100));

            return (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-amber-300 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Refundable Deposit: {formatINR(c.refundableDepositINR)}
                    </span>
                    <Badge variant={c.depositStatus === 'Threshold Met' ? 'success' : 'neutral'}>
                      {c.depositStatus}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{c.currentBackersCount} backers</span>
                    <span className="font-bold text-amber-700">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <Link to={`/p/${c.slug}`} className="block pt-1">
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <span>View & Pre-book</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
