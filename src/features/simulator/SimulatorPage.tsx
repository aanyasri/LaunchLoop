import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PipelineStepper } from '../pipeline/PipelineStepper';
import { useVenture } from '../../context/VentureContext';
import { simulatorService, SimulateIdeaSchema } from '../../services/api/simulatorService';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { FormTextarea } from '../../shared/components/forms/FormTextarea';
import { Sparkles, ShieldCheck, Compass, ArrowRight, Lightbulb } from 'lucide-react';

export const SimulatorPage: React.FC = () => {
  const { venture, setSimulationResult } = useVenture();
  const navigate = useNavigate();

  // Pre-fill form from VentureContext
  const [productName, setProductName] = useState(
    venture.idea?.productName ||
    (venture.selectedProblem
      ? `AgriCold Modular Pod for ${venture.selectedProblem.title.substring(0, 24)}`
      : 'AgriCold Solar Pre-cooling Pod')
  );
  const [targetProblem, setTargetProblem] = useState(
    venture.selectedProblem?.summary ||
    'Reducing 38% perishable spoilage for smallholder tomato and vegetable farmers in transit.'
  );
  const [description, setDescription] = useState(
    venture.selectedProblem?.desiredOutcome ||
    'Decentralized solar eutectic thermal cooling boxes keeping vegetables at 12°C for 48 hours without grid electricity.'
  );
  const [targetAudience, setTargetAudience] = useState(
    venture.idea?.targetAudience ||
    (venture.selectedProblem
      ? `Indian farm cooperatives, smallholder farmers, and transit logistics in ${venture.selectedProblem.industry}`
      : 'Smallholder tomato/onion farmers in Maharashtra and APMC logistics operators.')
  );
  const [priceINR, setPriceINR] = useState(venture.idea?.priceINR || 18500);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStepText, setSimulationStepText] = useState('');

  useEffect(() => {
    if (venture.selectedProblem && !productName) {
      setProductName(`Solution for ${venture.selectedProblem.title.substring(0, 28)}`);
    }
  }, [venture.selectedProblem, productName]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const payload = {
      productName,
      targetProblem,
      description,
      targetAudience,
      priceINR: Number(priceINR),
    };

    const validation = SimulateIdeaSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSimulating(true);
      setSimulationStepText('Sampling demographic distributions across Metro, Tier-2, Tier-3 cohorts...');
      await new Promise((r) => setTimeout(r, 600));

      setSimulationStepText('Synthesizing reactions from Indian skeptical buyers & regional merchants...');
      await new Promise((r) => setTimeout(r, 600));

      setSimulationStepText('Computing deterministic sentiment agreement and variance...');
      const report = await simulatorService.simulateProductIdea(payload);

      // Save into VentureContext
      setSimulationResult(report);
      navigate(`/simulate/report/${report.id}`);
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Simulation failed' });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pipeline Stepper */}
      <PipelineStepper />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs text-purple-800 font-semibold mb-2">
            <span>Step 3 of LaunchLoop Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Idea Simulator</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Stress-test your product concept against diverse simulated Indian customer personas
            varying by age, income band, city tier, and tech comfort. Includes skeptical personas to
            surface objections before you spend capital.
          </p>
        </div>

        {venture.simulationResult && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/simulate/report/${venture.simulationResult?.id}`)}
          >
            <span>View Latest Report</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        )}
      </div>

      {/* Honest Framing Disclaimer */}
      <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-950 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-purple-900 block">
            Honest Simulation Disclaimer: Hypothesis Generation, Not Proof of Demand
          </span>
          <p className="text-purple-800 leading-relaxed">
            This simulator models Indian customer segments (using Census, NSSO, and UPI adoption
            demographics) to help you discover blind spots, pricing friction, and operational
            objections. It does <strong>not</strong> substitute for real people paying real money—which is
            why Stage 4 requires refundable customer pre-bookings.
          </p>
        </div>
      </div>

      {/* Pre-fill source notification */}
      {venture.selectedProblem && (
        <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-brand-600 shrink-0" />
            <span>
              Pre-filled from Stage 1 Problem: <strong>{venture.selectedProblem.title}</strong>
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Auto-synced</span>
        </div>
      )}

      {/* Main Simulation Form */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSimulate} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormInput
                label="Product / Solution Name"
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                error={errors.productName}
                placeholder="e.g. AgriCold Modular Micro-Pod"
              />
            </div>

            <div>
              <FormInput
                label="Proposed Unit Price (INR ₹)"
                type="number"
                required
                min={1}
                value={priceINR}
                onChange={(e) => setPriceINR(Number(e.target.value))}
                error={errors.priceINR}
                helperText="Simulated personas will evaluate affordability against this price."
              />
            </div>
          </div>

          <FormTextarea
            label="Target Business Problem Being Solved"
            required
            rows={2}
            value={targetProblem}
            onChange={(e) => setTargetProblem(e.target.value)}
            error={errors.targetProblem}
            placeholder="e.g. High perishable vegetable transit loss between rural farm clusters and terminal APMC markets..."
          />

          <FormTextarea
            label="Product Solution & Core Technical Mechanism"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
            placeholder="Explain how the product works, operating model, maintenance expectations, and durability..."
          />

          <FormInput
            label="Target Indian Audience & Demographic Segments"
            required
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            error={errors.targetAudience}
            placeholder="e.g. Tier-2 and Tier-3 farm FPOs, rural transport operators, grocery retailers in Maharashtra"
          />

          {/* Demographic Sampling Note */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700">Demographic Cohorts: </span>
              The panel will simulate reactions across 35% Metro, 45% Tier-2, and 20% Tier-3 Indian
              buyers, testing vernacular comprehension, income band limits, and skeptical adoption
              hurdles.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Mock AI engine interface ready for Gemini API integration
            </span>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSimulating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              <span>Generate Customer Reaction Panel</span>
            </Button>
          </div>
        </form>

        {isSimulating && (
          <div className="mt-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-center space-y-2 animate-in fade-in">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-purple-900">{simulationStepText}</p>
          </div>
        )}
      </Card>
    </div>
  );
};
export default SimulatorPage;
