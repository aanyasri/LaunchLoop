import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PipelineStepper } from '../pipeline/PipelineStepper';
import { problemService } from '../../services/api/problemService';
import { BusinessProblem, IndustrySector } from '../../types/problem';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { useVenture } from '../../context/VentureContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { FormInput } from '../../shared/components/forms/FormInput';
import { FormSelect } from '../../shared/components/forms/FormSelect';
import { Search, ShieldCheck, ArrowRight, CheckCircle2, RotateCcw, AlertTriangle } from 'lucide-react';
import { formatINR } from '../../utils/currency';

const INDUSTRY_OPTIONS = [
  { label: 'All Industries', value: 'ALL' },
  { label: 'AgriTech', value: 'AgriTech' },
  { label: 'FinTech', value: 'FinTech' },
  { label: 'Healthcare', value: 'Healthcare' },
  { label: 'CleanTech & Energy', value: 'CleanTech & Energy' },
  { label: 'Logistics & Supply Chain', value: 'Logistics & Supply Chain' },
  { label: 'Consumer & D2C', value: 'Consumer & D2C' },
];

const CONFIDENTIALITY_OPTIONS = [
  { label: 'All Confidentiality', value: 'ALL' },
  { label: 'Public Problems', value: 'Public' },
  { label: 'NDA Required', value: 'NDA Required' },
];

export const ProblemBoardPage: React.FC = () => {
  const { user } = useAuth();
  const { venture, selectProblem } = useVenture();
  const navigate = useNavigate();

  const [problems, setProblems] = useState<BusinessProblem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [selectedConfidentiality, setSelectedConfidentiality] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    let isMounted = true;
    async function fetchProblems() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await problemService.getProblems({
          query: debouncedSearch,
          industry: selectedIndustry as IndustrySector | 'ALL',
          confidentiality: selectedConfidentiality,
        });
        if (isMounted) {
          setProblems(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load enterprise problems');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchProblems();
    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedIndustry, selectedConfidentiality]);

  const handleSelectProblemForVenture = (problem: BusinessProblem) => {
    selectProblem(problem);
    navigate('/team');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedIndustry('ALL');
    setSelectedConfidentiality('ALL');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pipeline Stepper at the top */}
      <PipelineStepper />

      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-xs text-brand-800 font-semibold mb-2">
            <span>Step 1 of LaunchLoop Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Enterprise Problem Board</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Verified Indian businesses post real operational pain points with allocated pilot
            budgets. Select a problem to seed your complementary team search and customer
            simulations.
          </p>
        </div>

        {user?.role === 'ENTERPRISE' && (
          <Link to="/problems/new" className="shrink-0">
            <Button variant="primary" size="md">
              Post an Enterprise Problem
            </Button>
          </Link>
        )}
      </div>

      {/* Filters Control Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="lg:col-span-2">
            <FormInput
              label="Search Problems (Debounced)"
              placeholder="Search by keywords, crop, technology, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div>
            <FormSelect
              label="Industry Sector"
              options={INDUSTRY_OPTIONS}
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
            />
          </div>

          <div>
            <FormSelect
              label="Confidentiality Level"
              options={CONFIDENTIALITY_OPTIONS}
              value={selectedConfidentiality}
              onChange={(e) => setSelectedConfidentiality(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setProblems([])}
            className="text-xs text-rose-700 underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-6 bg-slate-200 rounded w-3/4" />
              <div className="h-16 bg-slate-100 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </Card>
          ))}
        </div>
      ) : problems.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-white rounded-2xl border border-slate-200 p-8">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900">No Enterprise Problems Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            We couldn&apos;t find any verified problems matching &quot;{debouncedSearch}&quot; in the selected filters.
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters}>
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            <span>Reset Search & Filters</span>
          </Button>
        </div>
      ) : (
        /* Problem Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {problems.map((problem) => {
            const isCurrentlySelected = venture.selectedProblem?.id === problem.id;

            return (
              <Card
                key={problem.id}
                hoverEffect
                className={`flex flex-col justify-between border-2 transition-all ${
                  isCurrentlySelected ? 'border-brand-500 bg-brand-50/10' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Company & Badges Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase">
                        {problem.companyName.substring(0, 2)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-800">
                            {problem.companyName}
                          </span>
                          {problem.isVerifiedCompany && (
                            <span
                              className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full"
                              title="Verified Indian Enterprise"
                            >
                              <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Posted on {problem.createdAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant="purple">{problem.industry}</Badge>
                      <Badge
                        variant={problem.confidentialityLevel === 'Public' ? 'brand' : 'warning'}
                      >
                        {problem.confidentialityLevel}
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <Link to={`/problems/${problem.id}`} className="group block">
                    <h2 className="text-base font-bold text-slate-900 group-hover:text-brand-700 transition-colors leading-snug">
                      {problem.title}
                    </h2>
                  </Link>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {problem.summary}
                  </p>

                  {/* Operational Constraints Preview */}
                  <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Key Real-World Constraints:
                    </span>
                    <ul className="text-[11px] text-slate-600 space-y-0.5">
                      {problem.constraints.slice(0, 2).map((c, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-slate-400">•</span>
                          <span className="truncate">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer with Reward & Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">
                      Reward / Pilot Range
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatINR(problem.rewardRange.min)} - {formatINR(problem.rewardRange.max)}
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1 font-medium">
                      ({problem.rewardRange.type})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/problems/${problem.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        View Brief
                      </Button>
                    </Link>

                    {user?.role === 'FOUNDER' && (
                      <Button
                        size="sm"
                        variant={isCurrentlySelected ? 'secondary' : 'primary'}
                        onClick={() => handleSelectProblemForVenture(problem)}
                        className="text-xs"
                      >
                        {isCurrentlySelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                            <span>Selected</span>
                          </>
                        ) : (
                          <>
                            <span>Select for Venture</span>
                            <ArrowRight className="w-3.5 h-3.5 ml-1" />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default ProblemBoardPage;
