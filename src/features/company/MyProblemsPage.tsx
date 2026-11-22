import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { problemService } from '../../services/api/problemService';
import { BusinessProblem } from '../../types/problem';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { PlusCircle, ShieldCheck, ArrowRight, Clock, Users, Building2 } from 'lucide-react';
import { formatINR } from '../../utils/currency';

export const MyProblemsPage: React.FC = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState<BusinessProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const allProblems = await problemService.getProblems();
        // Filter by organization if specified, or display all company-owned problems
        const companyProblems = allProblems.filter(
          (p) => !user?.organization || p.companyName.toLowerCase().includes(user.organization.toLowerCase()) || p.companyName === 'Mahindra Logistics Innovation Hub'
        );
        setProblems(companyProblems.length > 0 ? companyProblems : allProblems.slice(0, 3));
      } catch (err) {
        console.error('Failed to load company problems', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [user]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>Company Problem Portfolio</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {user?.organization || 'Enterprise'} Posted Problems
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your open business challenges, track technical proposals, and award pilot contracts.
          </p>
        </div>
        <Link to="/problems/new">
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
            <PlusCircle className="w-4 h-4 mr-1.5" />
            <span>Post a Business Problem</span>
          </Button>
        </Link>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Loading your company problem statements...
        </div>
      ) : problems.length === 0 ? (
        <Card className="p-8 text-center bg-slate-50 border-dashed border-slate-300">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No problems posted yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Post an operational bottleneck or unmet technology challenge to crowdsource validated solutions from vetted Indian founders.
          </p>
          <Link to="/problems/new">
            <Button size="sm" variant="primary" className="bg-indigo-600 hover:bg-indigo-700">
              <PlusCircle className="w-3.5 h-3.5 mr-1" />
              Post Your First Problem
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {problems.map((problem) => (
            <Card
              key={problem.id}
              className="p-5 border-slate-200 hover:border-indigo-300 transition-colors shadow-xs"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="brand">{problem.industry}</Badge>
                    <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {problem.confidentialityLevel}
                    </span>
                    {problem.isVerifiedCompany && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified Enterprise
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600">
                    <Link to={`/problems/${problem.id}`}>{problem.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {problem.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="font-semibold text-slate-800">
                      Budget: {formatINR(problem.rewardRange.min)} - {formatINR(problem.rewardRange.max)}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Posted {problem.createdAt}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      {problem.proposalsCount} proposals received
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/problems/${problem.id}`}>
                    <Button variant="outline" size="sm">
                      <span>View Proposals & Details</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProblemsPage;
