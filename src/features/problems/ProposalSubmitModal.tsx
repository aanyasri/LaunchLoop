import React, { useState } from 'react';
import { z } from 'zod';
import { Modal } from '../../shared/components/feedback/Modal';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { FormTextarea } from '../../shared/components/forms/FormTextarea';
import { useAuth } from '../../context/AuthContext';
import { problemService } from '../../services/api/problemService';
import { BusinessProblem, SolutionProposal } from '../../types/problem';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface ProposalSubmitModalProps {
  problem: BusinessProblem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proposal: SolutionProposal) => void;
}

const ProposalFormSchema = z.object({
  summary: z.string().min(10, 'Summary must be at least 10 characters').max(140),
  approach: z.string().min(25, 'Technical approach must be at least 25 characters for review'),
  expectedImpact: z.string().min(15, 'Specify expected business impact and metrics (min 15 chars)'),
  teamNeeded: z.string().min(3, 'Specify team roles needed (e.g. Tech Lead, IoT Specialist)'),
});

export const ProposalSubmitModal: React.FC<ProposalSubmitModalProps> = ({
  problem,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [summary, setSummary] = useState('');
  const [approach, setApproach] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');
  const [teamNeeded, setTeamNeeded] = useState(
    problem.suggestedRoles ? problem.suggestedRoles.join(', ') : 'Tech Lead, Operations'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = ProposalFormSchema.safeParse({
      summary,
      approach,
      expectedImpact,
      teamNeeded,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setIsSubmitting(true);
      const rolesArray = teamNeeded.split(',').map((r) => r.trim()).filter(Boolean);

      const created = await problemService.submitProposal(
        {
          problemId: problem.id,
          founderId: user?.id || 'usr_founder_guest',
          founderName: user?.name || 'Aanya Sharma',
          summary,
          approach,
          expectedImpact,
          teamNeeded: rolesArray,
        },
        user
          ? { id: user.id, role: user.role, organization: user.organization, email: user.email }
          : undefined
      );

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onSuccess(created);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Submit Proposal for ${problem.companyName}`}
      description={`Brief: ${problem.title}`}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Proposal Submitted Successfully!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your structured solution has been delivered to {problem.companyName}&apos;s review panel.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">IP Policy: </span>
              {problem.ipPolicyNote}
            </div>
          </div>

          <FormInput
            label="Solution Headline / Summary"
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="e.g. Decentralized solar eutectic thermal cooling pods for farm clusters"
            error={errors.summary}
            helperText="One clear sentence describing your unique technical approach."
          />

          <FormTextarea
            label="Technical Approach & Architecture"
            required
            rows={4}
            value={approach}
            onChange={(e) => setApproach(e.target.value)}
            placeholder="Explain how your solution works, hardware/software stack, and how you bypass operational constraints..."
            error={errors.approach}
          />

          <FormInput
            label="Expected Measurable Impact"
            required
            value={expectedImpact}
            onChange={(e) => setExpectedImpact(e.target.value)}
            placeholder="e.g. Cut transit spoilage from 38% to under 9%, boosting farmer margins by ₹14/kg"
            error={errors.expectedImpact}
          />

          <FormInput
            label="Team Roles Needed / Already Formed"
            required
            value={teamNeeded}
            onChange={(e) => setTeamNeeded(e.target.value)}
            placeholder="Comma-separated roles, e.g. Tech Lead, IoT Specialist, Operations Lead"
            error={errors.teamNeeded}
            helperText="Enter the functional capabilities required to deliver the pilot."
          />

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Submit Solution Proposal
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
