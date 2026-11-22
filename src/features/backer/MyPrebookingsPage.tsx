import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { prebookingService } from '../../services/api/prebookingService';
import { PrebookingCampaign, PrebookingOrder } from '../../types/prebooking';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { ShieldCheck, ArrowRight, RotateCcw, ShoppingBag, Clock } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const MyPrebookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Array<PrebookingOrder & { campaign?: PrebookingCampaign }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const ords = await prebookingService.getOrdersForBacker(user?.email || 'vikram.j@outlook.com');
        setOrders(ords);
      } catch (err) {
        console.error('Failed to load backer orders', err);
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

  const getStatusBadge = (status: PrebookingOrder['status']) => {
    switch (status) {
      case 'Deposit_Secured':
        return <Badge variant="brand">Deposit Held by Partner</Badge>;
      case 'Refunded':
        return <Badge variant="neutral">100% Refunded</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Pre-booking Ledger</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">My Pre-bookings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your refundable deposits and early-adopter orders. All funds remain in payment partner protection until campaign validation.
          </p>
        </div>
        <Link to="/backer/discover">
          <Button variant="primary" className="bg-amber-600 hover:bg-amber-700">
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            <span>Discover More Innovations</span>
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

      {/* Orders List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your pre-booking records...
        </div>
      ) : orders.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-slate-300">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No active pre-bookings</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Discover verified Indian innovations and place a refundable deposit to back products you want to see built.
          </p>
          <Link to="/backer/discover">
            <Button size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700">
              Browse Pre-booking Campaigns
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-5 border-slate-200 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      {order.campaign?.title || `Campaign #${order.campaignId}`}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      Amount: {formatINR(order.amountINR)}
                    </span>
                    <span>•</span>
                    <span className="text-slate-600">
                      {order.paymentType === 'REFUNDABLE_DEPOSIT'
                        ? 'Refundable Deposit'
                        : 'Full Pre-order Payment'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Placed on {order.timestamp}
                    </span>
                    <span>•</span>
                    <span className="text-slate-500">Paid via {order.paymentMethod}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 italic pt-1">
                    Protection status: Refundable deposit held safely by the payment partner.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {order.campaign?.slug && (
                    <Link to={`/p/${order.campaign.slug}`}>
                      <Button size="sm" variant="outline">
                        <span>Campaign Details</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </Link>
                  )}

                  {order.status === 'Deposit_Secured' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelDeposit(order.id)}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      <span>Request Refund</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPrebookingsPage;
