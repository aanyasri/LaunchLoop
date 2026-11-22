import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { problemService } from '../../services/api/problemService';
import { SolutionProposal } from '../../types/problem';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import {
  FileText,
  CheckCircle2,
  ThumbsUp,
  XCircle,
  Clock,
  ArrowRight,
  User,
} from 'lucide-react';

export const CompanyProposalsPage: React.FC = () => {
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const props = await problemService.getProposalsForCompany();
        setProposals(props);
      } catch (err) {
        console.error('Failed to load company proposals', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateStatus = async (
    proposalId: string,
    status: 'Shortlisted' | 'Accepted' | 'Rejected'
  ) => {
    try {
      const updated = await problemService.updateProposalStatus({
        proposalId,
        status,
      });
      setProposals((prev) =>
        prev.map((p) => (p.id === proposalId ? { ...p, status: updated.status } : p))
      );
      setStatusMessage(`Proposal ${proposalId} status updated to "${status}".`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      console.error('Failed to update proposal status', err);
    }
  };

  const filteredProposals =
    filterStatus === 'ALL'
      ? proposals
      : proposals.filter((p) => p.status === filterStatus);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Technical Submissions</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Proposals Received</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review detailed technical architectures and founder proposals submitted for your business challenges.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
          {['ALL', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                filterStatus === status
                  ? 'bg-white text-indigo-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium flex items-center justify-between"
        >
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-indigo-500 hover:text-indigo-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Proposals List */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading incoming technical proposals...
        </div>
      ) : filteredProposals.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-slate-300">
          <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No proposals match &ldquo;{filterStatus}&rdquo;</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Proposals submitted by qualified founders will appear here for technical evaluation.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((prop) => (
            <Card key={prop.id} className="p-6 border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">{prop.summary}</span>
                    <Badge
                      variant={
                        prop.status === 'Accepted'
                          ? 'brand'
                          : prop.status === 'Shortlisted'
                          ? 'purple'
                          : 'neutral'
                      }
                    >
                      {prop.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {prop.founderName}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Submitted {prop.submittedAt}
                    </span>
                    <span>•</span>
                    <Link
                      to={`/problems/${prop.problemId}`}
                      className="text-indigo-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      View Problem Statement <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {prop.status !== 'Shortlisted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(prop.id, 'Shortlisted')}
                      className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                      Shortlist
                    </Button>
                  )}
                  {prop.status !== 'Accepted' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleUpdateStatus(prop.id, 'Accepted')}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Award Pilot
                    </Button>
                  )}
                  {prop.status !== 'Rejected' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(prop.id, 'Rejected')}
                      className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>

              {/* Approach & Impact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Technical Architecture & Approach:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{prop.approach}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <span className="font-semibold text-slate-800 block mb-1">
                    Targeted Business Impact:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{prop.expectedImpact}</p>
                  <div className="mt-2 text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700">Team Structure:</span>{' '}
                    {Array.isArray(prop.teamNeeded) ? prop.teamNeeded.join(', ') : prop.teamNeeded}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompanyProposalsPage;
