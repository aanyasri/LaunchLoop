import React, { useState } from 'react';
import { Modal } from '../../shared/components/feedback/Modal';
import { Button } from '../../shared/components/ui/Button';
import { UserProfile } from '../../types/team';
import { calculateCoFounderCompatibility, CompatibilityResult } from '../../utils/compatibility';
import { HeartHandshake, CheckCircle2, AlertCircle } from 'lucide-react';

interface CompatibilityQuizModalProps {
  candidate: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CompatibilityQuizModal: React.FC<CompatibilityQuizModalProps> = ({
  candidate,
  isOpen,
  onClose,
}) => {
  // Founder's working profile
  const [commitment, setCommitment] = useState<'Full-time now' | 'Part-time transitioning to full-time' | 'Side-project only'>(
    'Full-time now'
  );
  const [salaryRunwayMonths, setSalaryRunwayMonths] = useState<number>(12);
  const [decisionMakingStyle, setDecisionMakingStyle] = useState<'Consensus-driven' | 'Lead-takes-ownership' | 'Data-first rapid iteration'>(
    'Data-first rapid iteration'
  );
  const [riskStance, setRiskStance] = useState<'Bootstrapped steady' | 'VC high-growth aggressive'>(
    'Bootstrapped steady'
  );

  const [result, setResult] = useState<CompatibilityResult | null>(null);

  const handleCompute = (e: React.FormEvent) => {
    e.preventDefault();
    const founderAnswers = {
      commitment,
      salaryRunwayMonths,
      decisionMakingStyle,
      riskStance,
    };

    const evaluated = calculateCoFounderCompatibility(founderAnswers, candidate.compatibilityAnswers);
    setResult(evaluated);
  };

  const resetQuiz = () => {
    setResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Co-Founder Alignment Quiz: ${candidate.name}`}
      description={`Evaluate working style, runway tolerance, and decision-making alignment.`}
      maxWidth="lg"
    >
      {result ? (
        <div className="space-y-6 py-2">
          {/* Result Score Gauge */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-slate-50 border border-indigo-200 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <span>{result.level}</span>
            </div>

            <div className="flex items-center justify-center gap-1">
              <span className="text-5xl font-extrabold text-slate-900">{result.score}</span>
              <span className="text-xl font-bold text-indigo-600">/ 100</span>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              {result.alignmentSummary}
            </p>
          </div>

          {/* Dimension Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
              {result.breakdown.commitmentMatch ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-slate-800 block">Commitment:</span>
                <span className="text-slate-500">
                  You: {commitment} vs {candidate.name}: {candidate.compatibilityAnswers?.commitment || 'N/A'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800 block">Financial Runway:</span>
                <span className="text-slate-500">
                  Δ {result.breakdown.runwayDeltaMonths} months difference (You: {salaryRunwayMonths} mos, {candidate.name}: {candidate.compatibilityAnswers?.salaryRunwayMonths || 12} mos)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
              {result.breakdown.decisionStyleCompatible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-slate-800 block">Decision Rhythm:</span>
                <span className="text-slate-500">{decisionMakingStyle}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2">
              {result.breakdown.riskStanceCompatible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-slate-800 block">Capital Stance:</span>
                <span className="text-slate-500">{riskStance}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={resetQuiz}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Adjust Answers
            </button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCompute} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Your Commitment Stance:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Full-time now',
                'Part-time transitioning to full-time',
                'Side-project only',
              ].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCommitment(c as typeof commitment)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    commitment === c
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Personal Salary Runway without External Funding:
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="1"
                max="24"
                value={salaryRunwayMonths}
                onChange={(e) => setSalaryRunwayMonths(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="font-bold text-slate-900 shrink-0 text-sm w-16 text-right">
                {salaryRunwayMonths} months
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              3. Preferred Decision-Making Style:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                'Data-first rapid iteration',
                'Lead-takes-ownership',
                'Consensus-driven',
              ].map((style) => (
                <button
                  type="button"
                  key={style}
                  onClick={() => setDecisionMakingStyle(style as typeof decisionMakingStyle)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    decisionMakingStyle === style
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              4. Financing & Growth Goal:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Bootstrapped steady',
                'VC high-growth aggressive',
              ].map((stance) => (
                <button
                  type="button"
                  key={stance}
                  onClick={() => setRiskStance(stance as typeof riskStance)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    riskStance === stance
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {stance}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700">
              Calculate Compatibility Score
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
