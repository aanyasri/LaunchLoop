import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { simulatorService } from '../../services/api/simulatorService';
import { SimulationResult, SimulatedPersona } from '../../types/simulator';
import { useVenture } from '../../context/VentureContext';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import {
  ArrowRight,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  Languages,
  User,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const SimulationReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { venture, setSimulationResult, setPrebookingCampaign } = useVenture();
  const navigate = useNavigate();

  const [report, setReport] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterSentiment, setFilterSentiment] = useState<string>('ALL');

  useEffect(() => {
    let isMounted = true;
    async function loadReport() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        // First check venture state if already present
        if (venture.simulationResult && venture.simulationResult.id === id) {
          if (isMounted) setReport(venture.simulationResult);
        } else {
          const fetched = await simulatorService.getSimulationReport(id);
          if (!fetched) {
            throw new Error('Simulation report not found');
          }
          if (isMounted) setReport(fetched);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load report');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadReport();
    return () => {
      isMounted = false;
    };
  }, [id, venture.simulationResult]);

  const handleProceedToPrebooking = () => {
    if (!report) return;

    // Seed Prebooking campaign from simulation report
    const suggestedDeposit = Math.max(199, Math.round(report.priceINR * 0.05));
    const campaignPayload = {
      id: `camp_${Date.now()}`,
      founderId: 'usr_founder_01',
      founderName: 'Aanya Sharma',
      slug: report.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      title: report.productName,
      tagline: report.productDescription.substring(0, 90),
      description: report.productDescription,
      targetBackersThreshold: 100,
      currentBackersCount: 0,
      refundableDepositINR: suggestedDeposit,
      fullPriceINR: report.priceINR,
      deadlineDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isLaunched: false,
      depositStatus: 'Collecting' as const,
      depositTermsNote: `Refundable deposit of ${formatINR(suggestedDeposit)} held safely by the payment partner, automatically refunded if the threshold isn't met by the deadline.`,
      fullPaymentsCount: 0,
      depositOnlyCount: 0,
    };

    setSimulationResult(report);
    setPrebookingCampaign(campaignPayload);
    navigate('/prebook');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-xs text-slate-500">
        Loading customer reaction report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Simulation Report Not Found</h1>
        <p className="text-xs text-slate-500">{error || 'Unable to retrieve simulation data.'}</p>
        <Link to="/simulate">
          <Button variant="outline" size="sm">
            Run a New Simulation
          </Button>
        </Link>
      </div>
    );
  }

  const filteredPersonas =
    filterSentiment === 'ALL'
      ? report.personas
      : report.personas.filter((p) => p.sentiment === filterSentiment);

  const bullishCount = report.personas.filter((p) => p.sentiment === 'Bullish').length;
  const skepticalCount = report.personas.filter(
    (p) => p.sentiment === 'Sceptical' || p.sentiment === 'Dismissive'
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/simulate"
          className="text-xs font-semibold text-slate-500 hover:text-purple-700 flex items-center gap-1"
        >
          ← Run Another Simulation
        </Link>
        <div className="flex items-center gap-2">
          {report.source === 'gemini' ? (
            <Badge variant="purple">Generated via Gemini API</Badge>
          ) : (
            <Badge variant="neutral">Sample Simulation Data</Badge>
          )}
          <span className="text-xs text-slate-500 font-medium">Generated for:</span>
          <span className="text-xs font-bold text-slate-900">{report.productName}</span>
        </div>
      </div>

      {/* Mandatory Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-950 flex items-start gap-3">
        <HelpCircle className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-purple-900 block uppercase tracking-wider text-[11px]">
            Hypothesis Generation Notice
          </span>
          <p className="leading-relaxed text-purple-900 font-medium">{report.disclaimer}</p>
        </div>
      </div>

      {/* Low Confidence Warning (If Applicable) */}
      {(report.confidenceLevel === 'Low' || report.confidenceLevel === 'Medium') && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-start gap-3 shadow-xs"
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-900 block text-sm">
              Notice: {report.confidenceLevel} Confidence Due to Demographic Disagreement
            </span>
            <p className="leading-relaxed text-amber-900">{report.confidenceReason}</p>
            <p className="text-[11px] text-amber-800 font-medium pt-1">
              Recommended action: Review the &quot;Where Personas Disagree&quot; section below and refine your pricing or regional language strategy before committing to customer acquisition spend.
            </p>
          </div>
        </div>
      )}

      {/* Report Summary Hero Card */}
      <Card className="p-6 sm:p-8 bg-white border-purple-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left: Product & Score Overview */}
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
              Simulated Customer Reaction Report
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {report.productName}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">{report.productDescription}</p>

            <div className="flex items-center gap-3 pt-2 text-xs">
              <span className="text-slate-500">
                Proposed Unit Price:{' '}
                <strong className="text-slate-900">{formatINR(report.priceINR)}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Tested Panel:{' '}
                <strong className="text-slate-900">{report.personas.length} Indian Personas</strong>
              </span>
            </div>
          </div>

          {/* Right: Score Gauge & Confidence Indicator */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 border border-slate-200 shrink-0">
            {/* Overall Score */}
            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Overall Demand Score
              </span>
              <div className="flex items-baseline justify-center gap-1 mt-1">
                <span className="text-5xl font-black text-slate-900">{report.overallScore}</span>
                <span className="text-slate-400 font-bold text-lg">/100</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {bullishCount} Bullish, {skepticalCount} Skeptical
              </span>
            </div>

            <div className="hidden sm:block h-14 w-px bg-slate-200" />

            {/* Confidence Level */}
            <div className="text-center sm:text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Confidence Indicator
              </span>
              <div className="mt-1">
                <Badge
                  variant={
                    report.confidenceLevel === 'High'
                      ? 'success'
                      : report.confidenceLevel === 'Medium'
                        ? 'warning'
                        : 'danger'
                  }
                  size="md"
                  className="text-xs font-bold"
                >
                  {report.confidenceLevel} Confidence
                </Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1 max-w-[180px]">
                Deterministic agreement across cohorts
              </p>
            </div>
          </div>
        </div>

        {/* CTA to Step 4 */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            <span>Next Stage: </span>
            <strong className="text-slate-800">
              Convert simulated hypothesis into verified willingness-to-pay via refundable pre-bookings.
            </strong>
          </div>

          <Button
            size="lg"
            variant="primary"
            onClick={handleProceedToPrebooking}
            className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
          >
            <span>Proceed to Stage 4: Pre-booking</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Consensus, Disagreements, Unmet Needs & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consensus Points */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Areas of Strong Consensus</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {report.consensusPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                <span className="font-bold text-emerald-600">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Where Personas Disagree */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Where Simulated Personas Disagree</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {report.disagreementAreas.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                <span className="font-bold text-amber-600">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Unmet Problems Raised */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Unmet Problems Raised by Personas</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {report.unmetProblemsRaised.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100">
                <span className="font-bold text-rose-600">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Actionable Improvements & Suggested Pivots */}
        <Card className="space-y-3">
          <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            <span>Suggested Actionable Fixes & Pivots</span>
          </div>
          <ul className="text-xs text-slate-700 space-y-2">
            {report.actionableImprovements.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-600">•</span>
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Individual Personas Detailed Panel */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Individual Simulated Persona Reactions</h2>
            <p className="text-xs text-slate-500">
              Examining real-world sentiment, objections, and willingness to pay across Indian demographic bands.
            </p>
          </div>

          {/* Sentiment Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'Bullish', 'Cautious', 'Sceptical', 'Dismissive'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterSentiment(s)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filterSentiment === s
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPersonas.map((persona: SimulatedPersona) => {
            const sentimentVariants = {
              Bullish: 'success',
              Cautious: 'warning',
              Sceptical: 'danger',
              Dismissive: 'neutral',
            } as const;

            return (
              <Card key={persona.id} className="p-5 flex flex-col justify-between space-y-4 border-slate-200">
                <div className="space-y-3">
                  {/* Persona Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{persona.name}</h3>
                        <p className="text-[11px] text-slate-500 leading-tight">
                          {persona.occupation} ({persona.age} yrs)
                        </p>
                      </div>
                    </div>

                    <Badge variant={sentimentVariants[persona.sentiment]}>
                      {persona.sentiment}
                    </Badge>
                  </div>

                  {/* Demographic Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-slate-600">
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100">
                      <MapPin className="w-2.5 h-2.5" />
                      {persona.city} ({persona.cityTier})
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100">
                      <Languages className="w-2.5 h-2.5" />
                      {persona.primaryLanguage}
                    </span>
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-100">
                      {persona.incomeBand}
                    </span>
                  </div>

                  {/* Quote */}
                  <div className="p-3 bg-slate-50 rounded-xl text-xs italic text-slate-700 leading-relaxed border-l-2 border-purple-400">
                    &quot;{persona.reactionQuote}&quot;
                  </div>

                  {/* Primary Objection */}
                  <div className="text-xs space-y-0.5">
                    <span className="font-bold text-slate-700 text-[11px] uppercase block">
                      Primary Objection:
                    </span>
                    <p className="text-rose-700 font-medium text-xs">{persona.primaryObjection}</p>
                  </div>
                </div>

                {/* Willingness to Pay */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Willingness to Pay:</span>
                  <span className="font-extrabold text-slate-900">
                    {formatINR(persona.willingnessToPayINR)}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default SimulationReportPage;
