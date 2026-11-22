import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { problemService, CreateProblemSchema } from '../../services/api/problemService';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { FormSelect } from '../../shared/components/forms/FormSelect';
import { FormTextarea } from '../../shared/components/forms/FormTextarea';
import { ShieldCheck, PlusCircle } from 'lucide-react';
import { IndustrySector } from '../../types/problem';

const INDUSTRY_OPTIONS = [
  { label: 'AgriTech', value: 'AgriTech' },
  { label: 'FinTech', value: 'FinTech' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'CleanTech & Energy', value: 'CleanTech & Energy' },
  { label: 'Logistics & Supply Chain', value: 'Logistics & Supply Chain' },
  { label: 'SaaS & Enterprise', value: 'SaaS & Enterprise' },
  { label: 'Consumer & D2C', value: 'Consumer & D2C' },
];

const CONFIDENTIALITY_OPTIONS = [
  { label: 'Public (Visible to all verified founders)', value: 'Public' },
  { label: 'NDA Required (Brief summary public, details gated)', value: 'NDA Required' },
  { label: 'Invite Only', value: 'Invite Only' },
];

export const CreateProblemPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(user?.organization || 'MahaAgro Logistics Corp');
  const [industry, setIndustry] = useState<IndustrySector>('AgriTech');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [constraintsText, setConstraintsText] = useState(
    'Must function off-grid with under 6 hours daily grid power\nTotal Capex under ₹25,000 INR per unit\nRequires zero specialized software maintenance on site'
  );
  const [desiredOutcome, setDesiredOutcome] = useState('');
  const [rewardMin, setRewardMin] = useState(500000);
  const [rewardMax, setRewardMax] = useState(1800000);
  const [confidentialityLevel, setConfidentialityLevel] = useState<'Public' | 'NDA Required' | 'Invite Only'>('Public');
  const [ipPolicyNote, setIpPolicyNote] = useState(
    'Founder retains background and core technology IP. Enterprise receives first commercial right of refusal for a 12-month pilot contract.'
  );
  const [suggestedRolesText, setSuggestedRolesText] = useState('Tech Lead / Fullstack, Operations & Logistics, Product Designer');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const constraints = constraintsText.split('\n').map((c) => c.trim()).filter(Boolean);
    const suggestedRoles = suggestedRolesText.split(',').map((r) => r.trim()).filter(Boolean);

    const payload = {
      title,
      companyName,
      industry,
      summary,
      description,
      constraints,
      desiredOutcome,
      rewardMin: Number(rewardMin),
      rewardMax: Number(rewardMax),
      confidentialityLevel,
      ipPolicyNote,
      suggestedRoles,
    };

    const validation = CreateProblemSchema.safeParse(payload);
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
      setIsSubmitting(true);
      await problemService.createProblem(
        payload,
        user
          ? { id: user.id, role: user.role, organization: user.organization, email: user.email }
          : undefined
      );
      navigate('/problems');
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to post enterprise problem' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <Link to="/problems" className="text-xs font-semibold text-slate-500 hover:text-brand-700">
          ← Back to Problem Board
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Post an Enterprise Problem Brief</h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish an authentic operational friction point for Indian startup founders with clear constraints and allocated pilot capital.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Company / Enterprise Name"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              error={errors.companyName}
            />

            <FormSelect
              label="Industry Sector"
              options={INDUSTRY_OPTIONS}
              value={industry}
              onChange={(e) => setIndustry(e.target.value as IndustrySector)}
            />
          </div>

          <FormInput
            label="Problem Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Reducing 38% Post-Harvest Perishable Spoilage in Nashik-Mumbai Corridor"
            error={errors.title}
            helperText="Clear, punchy headline identifying the bottleneck and business impact."
          />

          <FormTextarea
            label="Executive Summary"
            required
            rows={2}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Concise overview of the operational challenge and why current market solutions fail..."
            error={errors.summary}
          />

          <FormTextarea
            label="Detailed Operational Context & Scale"
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide real numbers: metric tonnes moved, failure rates, transit conditions, temperature requirements..."
            error={errors.description}
          />

          <FormTextarea
            label="Real-World Constraints (One per line)"
            required
            rows={3}
            value={constraintsText}
            onChange={(e) => setConstraintsText(e.target.value)}
            placeholder="e.g. Must operate off-grid with intermittent rural electricity&#10;Total hardware cost under ₹25,000 INR"
            error={errors.constraints}
            helperText="Specify physical, budget, power, and connectivity constraints on the ground."
          />

          <FormTextarea
            label="Desired Outcome & Prototype Target"
            required
            rows={2}
            value={desiredOutcome}
            onChange={(e) => setDesiredOutcome(e.target.value)}
            placeholder="e.g. A deployable prototype keeping vegetables under 14°C for 48 hours without diesel gensets"
            error={errors.desiredOutcome}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Minimum Pilot Budget (INR ₹)"
              type="number"
              required
              value={rewardMin}
              onChange={(e) => setRewardMin(Number(e.target.value))}
              error={errors.rewardMin}
            />

            <FormInput
              label="Maximum Pilot Contract (INR ₹)"
              type="number"
              required
              value={rewardMax}
              onChange={(e) => setRewardMax(Number(e.target.value))}
              error={errors.rewardMax}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Confidentiality Level"
              options={CONFIDENTIALITY_OPTIONS}
              value={confidentialityLevel}
              onChange={(e) => setConfidentialityLevel(e.target.value as 'Public' | 'NDA Required' | 'Invite Only')}
            />

            <FormInput
              label="Suggested Complementary Roles (Comma-separated)"
              required
              value={suggestedRolesText}
              onChange={(e) => setSuggestedRolesText(e.target.value)}
              placeholder="e.g. Tech Lead / Fullstack, AI / Data Engineer"
              error={errors.suggestedRoles}
            />
          </div>

          <div className="space-y-2">
            <FormTextarea
              label="IP Policy Note (Safeguard for Founders)"
              required
              rows={2}
              value={ipPolicyNote}
              onChange={(e) => setIpPolicyNote(e.target.value)}
              error={errors.ipPolicyNote}
              helperText="Affirm founder retention of core solution IP to encourage high-calibre submissions."
            />
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>LaunchLoop promotes clear IP delineation between enterprise problem owners and technical builders.</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/problems">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>Publish Problem Brief</span>
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default CreateProblemPage;
