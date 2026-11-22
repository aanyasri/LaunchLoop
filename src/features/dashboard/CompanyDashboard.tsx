import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { problemService } from '../../services/api/problemService';
import { SolutionProposal, BusinessProblem } from '../../types/problem';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { PlusCircle, FileText, CheckCircle2, Clock, ThumbsUp, XCircle, ArrowRight } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const CompanyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<SolutionProposal[]>([]);
  const [problems, setProblems] = useState<BusinessProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [props, probs] = await Promise.all([
          problemService.getProposalsForCompany(),
          problemService.getProblems(),
        ]);
        setProposals(props);
        setProblems(probs);
      } catch (err) {
        console.error('Failed to load company dashboard data', err);
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

  const totalBudget = problems.reduce((sum, p) => sum + p.rewardRange.max, 0);
  const shortlistedCount = proposals.filter((p) => p.status === 'Shortlisted').length;
  const acceptedCount = proposals.filter((p) => p.status === 'Accepted').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Company / Enterprise Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.organization || 'Enterprise Innovation'} Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming startup proposals, shortlist promising teams, and award pilot contracts.
          </p>
        </div>
        <Link to="/problems/new">
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Post a Business Problem</span>
          </Button>
        </Link>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium flex items-center justify-between"
        >
          <span>{statusMessage}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-indigo-500 hover:text-indigo-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-indigo-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Posted Problems
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{problems.length}</span>
            <span className="text-xs text-indigo-600 font-medium">Active in Market</span>
          </div>
        </Card>

        <Card className="border-indigo-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Proposals Received
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">{proposals.length}</span>
            <span className="text-xs text-emerald-600 font-medium">From Indian Founders</span>
          </div>
        </Card>

        <Card className="border-indigo-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Shortlisted / Accepted
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {shortlistedCount + acceptedCount}
            </span>
            <span className="text-xs text-indigo-600 font-medium">
              {acceptedCount} pilot(s) signed
            </span>
          </div>
        </Card>

        <Card className="border-indigo-100 bg-white">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Allocated Pilot Budget
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {formatINR(totalBudget)}
            </span>
            <span className="text-xs text-emerald-600 font-medium">Deposit Ready</span>
          </div>
        </Card>
      </div>

      {/* IP Policy & Safeguard Note */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <div className="p-1 rounded bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
          <FileText className="w-4 h-4" />
        </div>
        <div>
          <span className="font-semibold text-slate-900">LaunchLoop IP Standard: </span>
          Founders retain ownership of pre-existing and core solution IP. Upon accepting a proposal, your enterprise secures a 12-month commercial pilot evaluation license.
        </div>
      </div>

      {/* Proposals Received Management Table */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incoming Solution Proposals</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and act on structured technical proposals from verified startup teams.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'Under Review', 'Shortlisted', 'Accepted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${filterStatus === status
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading proposals...</div>
        ) : filteredProposals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No proposals matching filter &quot;{filterStatus}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredProposals.map((prop) => {
              const matchedProblem = problems.find((p) => p.id === prop.problemId);

              return (
                <div key={prop.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                        Proposed by <span className="font-semibold text-slate-700">{prop.founderName}</span> for{' '}
                        <span className="font-medium text-indigo-700">
                          {matchedProblem?.title || prop.problemId}
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {prop.status !== 'Shortlisted' && prop.status !== 'Accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(prop.id, 'Shortlisted')}
                          className="text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                          <span>Shortlist</span>
                        </Button>
                      )}
                      {prop.status !== 'Accepted' && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateStatus(prop.id, 'Accepted')}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          <span>Accept & Sign Pilot</span>
                        </Button>
                      )}
                      {prop.status !== 'Rejected' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUpdateStatus(prop.id, 'Rejected')}
                          className="text-xs text-rose-600 hover:bg-rose-50"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-100">
                    <div>
                      <span className="font-semibold text-slate-700 block">Proposed Approach:</span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">{prop.approach}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700 block">Expected Business Impact:</span>
                      <p className="text-slate-600 mt-0.5">{prop.expectedImpact}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                      <Clock className="w-3 h-3" />
                      <span>Submitted on {prop.submittedAt}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Your Posted Problems List */}
      <Card>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Your Posted Enterprise Problems</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage live problem briefs visible to Indian founders.
            </p>
          </div>
          <Link to="/problems/new">
            <Button size="sm" variant="outline">
              <span>Post New Problem</span>
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {problems.map((prob) => (
            <div key={prob.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{prob.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{prob.summary}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge variant="purple">{prob.industry}</Badge>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Budget: {formatINR(prob.rewardRange.min)} - {formatINR(prob.rewardRange.max)}
                  </span>
                  <span className="text-[11px] text-slate-400">•</span>
                  <span className="text-[11px] text-indigo-700 font-semibold">
                    {prob.proposalsCount} proposals submitted
                  </span>
                </div>
              </div>
              <Link to={`/problems/${prob.id}`}>
                <Button size="sm" variant="ghost" className="shrink-0 text-xs">
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
