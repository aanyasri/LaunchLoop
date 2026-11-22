import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { prebookingService } from '../../services/api/prebookingService';
import { PrebookingCampaign } from '../../types/prebooking';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { ShieldCheck, ArrowRight, Clock, Search, ShoppingBag } from 'lucide-react';
import { formatINR } from '../../utils/currency';
import { analyzeCampaignStatus } from '../../utils/prebookingLogic';

export const DiscoverCampaignsPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PrebookingCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await prebookingService.getCampaigns();
        setCampaigns(data);
      } catch (err) {
        console.error('Failed to load campaigns', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = campaigns.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.founderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-xs text-amber-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Customer Pre-booking Discovery</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Discover Indian Innovations</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Support vetted hardware, SaaS, and consumer breakthroughs. Refundable deposit, automatically refunded if the threshold isn't met by the deadline. Held safely by the payment partner.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Safety Guarantee Banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>Deposit Protection:</strong> Refundable deposit, automatically refunded if the threshold isn't met by the deadline. All deposits are held safely by the payment partner.
          </span>
        </div>
      </div>

      {/* Campaign Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading active pre-booking campaigns...
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-slate-300">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No campaigns match your search</h3>
          <p className="text-xs text-slate-500 mt-1">Try another keyword or clear the search input.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((camp) => {
            const analysis = analyzeCampaignStatus(camp);
            return (
              <Card
                key={camp.id}
                className="flex flex-col justify-between p-6 border-slate-200 hover:border-amber-300 transition-all hover:shadow-md"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        analysis.isThresholdMet
                          ? 'brand'
                          : analysis.isExpired
                          ? 'neutral'
                          : 'brand'
                      }
                    >
                      {analysis.isThresholdMet
                        ? 'Threshold Reached'
                        : analysis.isExpired
                        ? 'Campaign Closed'
                        : 'Pre-booking Live'}
                    </Badge>
                    <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {analysis.daysRemaining}d left
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 line-clamp-1">
                      {camp.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {camp.tagline}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {camp.currentBackersCount} backers
                      </span>
                      <span className="text-slate-500">Goal: {camp.targetBackersThreshold}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          analysis.isThresholdMet ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, analysis.progressPercentage)}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 flex justify-between">
                      <span>{analysis.progressPercentage}% funded</span>
                      <span>By {camp.founderName}</span>
                    </div>
                  </div>
                </div>

                {/* Footer & CTA */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Refundable Deposit
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatINR(camp.refundableDepositINR)}
                    </span>
                  </div>

                  <Link to={`/p/${camp.slug}`}>
                    <Button size="sm" variant="primary" className="bg-amber-600 hover:bg-amber-700">
                      <span>Pre-book</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DiscoverCampaignsPage;
