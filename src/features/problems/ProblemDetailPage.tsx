import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { problemService } from '../../services/api/problemService';
import { BusinessProblem, SolutionProposal } from '../../types/problem';
import { useAuth } from '../../context/AuthContext';
import { useVenture } from '../../context/VentureContext';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { ProposalSubmitModal } from './ProposalSubmitModal';
import {
  ShieldCheck,
  Calendar,
  AlertCircle,
  FileCheck,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const ProblemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { venture, selectProblem } = useVenture();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<BusinessProblem | null>(null);
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadProblemDetail() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const item = await problemService.getProblemById(id);
        if (!item) {
          throw new Error('Problem not found');
        }
        if (isMounted) {
          setProblem(item);
        }

        // Fetch proposals if enterprise owner or founder authored
        if (user) {
          try {
            const props = await problemService.getProposalsForProblem(id, {
              id: user.id,
              role: user.role,
              organization: user.organization,
              email: user.email,
            });
            if (isMounted) {
              setProposals(props);
            }
          } catch {
            // Role may not have proposal access, ignore silently
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load problem');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadProblemDetail();
    return () => {
      isMounted = false;
    };
  }, [id, user]);

  const handleSelectForVenture = () => {
    if (problem) {
      selectProblem(problem);
      setActionNotice(`"${problem.title}" selected as your active venture problem.`);
      setTimeout(() => navigate('/team'), 800);
    }
  };

  const handleProposalSubmitted = (newProp: SolutionProposal) => {
    setProposals((prev) => [newProp, ...prev]);
    setActionNotice('Proposal submitted successfully! Reviewers will assess your approach.');
  };

  const handleUpdateProposalStatus = async (
    proposalId: string,
    status: 'Shortlisted' | 'Accepted' | 'Rejected'
  ) => {
    try {
      const updated = await problemService.updateProposalStatus(
        { proposalId, status },
        user
          ? { id: user.id, role: user.role, organization: user.organization, email: user.email }
          : undefined
      );
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: updated.status } : p))
      );
      setActionNotice(`Proposal ${proposalId} status updated to "${status}".`);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-xs text-slate-500">
        Loading problem details...
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
        <h1 className="text-xl font-bold text-slate-900">Problem Not Found</h1>
        <p className="text-xs text-slate-500">{error || 'Unable to locate this business case.'}</p>
        <Link to="/problems">
          <Button variant="outline" size="sm">
            Back to Problem Board
          </Button>
        </Link>
      </div>
    );
  }

  const isSelectedForVenture = venture.selectedProblem?.id === problem.id;
  const isCompanyOwner =
    user?.role === 'ENTERPRISE' &&
    user?.organization &&
    problem.companyName.toLowerCase().includes(user.organization.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Link & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/problems"
          className="text-xs font-semibold text-slate-500 hover:text-brand-700 flex items-center gap-1 transition-colors"
        >
          ← Back to Problem Board
        </Link>
        <div className="flex items-center gap-2">
          <Badge variant="purple">{problem.industry}</Badge>
          <Badge variant={problem.confidentialityLevel === 'Public' ? 'brand' : 'warning'}>
            {problem.confidentialityLevel}
          </Badge>
        </div>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Main Problem Header Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-slate-800">{problem.companyName}</span>
              {problem.isVerifiedCompany && (
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
                  Verified Indian Enterprise
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {problem.title}
            </h1>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            {user?.role === 'FOUNDER' && (
              <>
                <Button
                  variant={isSelectedForVenture ? 'secondary' : 'outline'}
                  size="md"
                  onClick={handleSelectForVenture}
                >
                  {isSelectedForVenture ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-400" />
                      <span>Active Venture Problem</span>
                    </>
                  ) : (
                    <span>Select for My Venture</span>
                  )}
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsSubmitModalOpen(true)}
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  <FileCheck className="w-4 h-4 mr-1.5" />
                  <span>Submit Solution Proposal</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Quick Meta Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">
              Reward / Contract
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {formatINR(problem.rewardRange.min)} - {formatINR(problem.rewardRange.max)}
            </span>
            <span className="text-[11px] text-slate-500 block">({problem.rewardRange.type})</span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">
              Review Deadline
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1 text-sm mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              {problem.deadline}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">
              Proposals Received
            </span>
            <span className="font-bold text-slate-900 text-sm">
              {problem.proposalsCount} Solutions
            </span>
            <span className="text-[11px] text-emerald-600 font-medium block">
              Active Evaluation
            </span>
          </div>

          <div>
            <span className="text-slate-400 block font-medium uppercase text-[10px]">
              Confidentiality
            </span>
            <span className="font-bold text-slate-900 text-sm">{problem.confidentialityLevel}</span>
            <span className="text-[11px] text-slate-500 block">Standard Safe Harbour</span>
          </div>
        </div>

        {/* Operational Context & Description */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Executive Summary</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{problem.summary}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">Detailed Operational Context</h2>
          <p className="text-sm text-slate-700 leading-relaxed">{problem.description}</p>
        </div>

        {/* Real-World Operational Constraints */}
        <div className="space-y-3 p-5 rounded-xl bg-amber-50/50 border border-amber-200">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Non-Negotiable Indian Ground Constraints</span>
          </div>
          <ul className="text-xs text-amber-950 space-y-2 mt-2">
            {problem.constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-bold text-amber-600">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Desired Outcome */}
        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Desired Pilot Outcome</h2>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
            {problem.desiredOutcome}
          </p>
        </div>

        {/* Suggested Complementary Roles */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recommended Complementary Roles for this Problem
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            {problem.suggestedRoles.map((role) => (
              <span
                key={role}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 border border-indigo-200 text-indigo-800"
              >
                + {role}
              </span>
            ))}
          </div>
        </div>

        {/* IP Ownership Policy Disclosure */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-emerald-900 block">
              LaunchLoop Intellectual Property Policy & Safeguard
            </span>
            <p className="leading-relaxed text-emerald-800">{problem.ipPolicyNote}</p>
          </div>
        </div>
      </Card>

      {/* Enterprise Owner Proposal Management Section */}
      {isCompanyOwner && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Proposals Submitted for Your Problem
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review, shortlist, and approve pilot proposals from founders.
              </p>
            </div>
            <Badge variant="brand">{proposals.length} Submitted</Badge>
          </div>

          {proposals.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No proposals submitted for this problem yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {proposals.map((prop) => (
                <div key={prop.id} className="py-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{prop.summary}</h3>
                        <Badge
                          variant={
                            prop.status === 'Accepted'
                              ? 'success'
                              : prop.status === 'Shortlisted'
                                ? 'brand'
                                : prop.status === 'Rejected'
                                  ? 'danger'
                                  : 'neutral'
                          }
                        >
                          {prop.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        By <span className="font-semibold text-slate-700">{prop.founderName}</span> • Submitted on {prop.submittedAt}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {prop.status !== 'Shortlisted' && prop.status !== 'Accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateProposalStatus(prop.id, 'Shortlisted')}
                          className="text-xs"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          <span>Shortlist</span>
                        </Button>
                      )}
                      {prop.status !== 'Accepted' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateProposalStatus(prop.id, 'Accepted')}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>Accept & Sign</span>
                        </Button>
                      )}
                      {prop.status !== 'Rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateProposalStatus(prop.id, 'Rejected')}
                          className="text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <p className="text-slate-700">
                      <span className="font-semibold">Approach: </span>
                      {prop.approach}
                    </p>
                    <p className="text-slate-700">
                      <span className="font-semibold">Impact: </span>
                      {prop.expectedImpact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Founder View of their own submitted proposal */}
      {user?.role === 'FOUNDER' && proposals.length > 0 && (
        <Card className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Your Submitted Proposal</h2>
            <Badge variant="brand">{proposals[0].status}</Badge>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">{proposals[0].summary}</h3>
            <p className="text-slate-700 leading-relaxed">{proposals[0].approach}</p>
            <div className="flex items-center gap-1 text-slate-500 pt-2 border-t border-slate-200">
              <Clock className="w-3.5 h-3.5" />
              <span>Status: {proposals[0].status} • Submitted on {proposals[0].submittedAt}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Modal for Submitting Solution Proposal */}
      <ProposalSubmitModal
        problem={problem}
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onSuccess={handleProposalSubmitted}
      />
    </div>
  );
};
export default ProblemDetailPage;
