import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PipelineStepper } from '../pipeline/PipelineStepper';
import { useVenture } from '../../context/VentureContext';
import { teamService } from '../../services/api/teamService';
import { UserProfile, PrimaryRole, MatchRecommendation } from '../../types/team';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Badge } from '../../shared/components/ui/Badge';
import { FormSelect } from '../../shared/components/forms/FormSelect';
import { CompatibilityQuizModal } from './CompatibilityQuizModal';
import {
  Users,
  Compass,
  ArrowRight,
  ExternalLink,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
  Play,
  HeartHandshake,
} from 'lucide-react';

const ROLE_OPTIONS = [
  { label: 'All Roles', value: 'ALL' },
  { label: 'Tech Lead / Fullstack', value: 'Tech Lead / Fullstack' },
  { label: 'AI / Data Engineer', value: 'AI / Data Engineer' },
  { label: 'Product Designer', value: 'Product Designer' },
  { label: 'Growth & Marketing', value: 'Growth & Marketing' },
  { label: 'Operations & Logistics', value: 'Operations & Logistics' },
  { label: 'Finance & Legal', value: 'Finance & Legal' },
];

const CITY_OPTIONS = [
  { label: 'All Locations', value: 'ALL' },
  { label: 'Bengaluru', value: 'Bengaluru' },
  { label: 'Pune', value: 'Pune' },
  { label: 'Hyderabad', value: 'Hyderabad' },
  { label: 'Delhi NCR', value: 'Delhi NCR' },
  { label: 'Jaipur', value: 'Jaipur' },
  { label: 'Kolkata', value: 'Kolkata' },
];

export const TeamFinderPage: React.FC = () => {
  const { venture, updateIdea } = useVenture();
  const navigate = useNavigate();

  const [recommendations, setRecommendations] = useState<MatchRecommendation[]>([]);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeQuizCandidate, setActiveQuizCandidate] = useState<UserProfile | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Derive filled & missing roles from venture state
  const filledRoles = (venture.idea?.filledRoles as PrimaryRole[]) || ['Operations & Logistics'];
  const missingRoles = (venture.idea?.missingRoles as PrimaryRole[]) || [
    'Tech Lead / Fullstack',
    'Growth & Marketing',
  ];

  const filledRolesKey = filledRoles.join(',');
  const missingRolesKey = missingRoles.join(',');

  useEffect(() => {
    let isMounted = true;
    async function fetchMatches() {
      setIsLoading(true);
      setError(null);
      try {
        const recs = await teamService.getRecommendations({
          filledRoles,
          missingRoles,
          preferredCity: selectedCityFilter !== 'ALL' ? selectedCityFilter : undefined,
          minHoursPerWeek: 20,
        });

        if (isMounted) {
          let filtered = recs;
          if (selectedRoleFilter !== 'ALL') {
            filtered = filtered.filter((r) => r.profile.primaryRole === selectedRoleFilter);
          }
          setRecommendations(filtered);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch team matches');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    fetchMatches();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filledRolesKey, missingRolesKey, selectedRoleFilter, selectedCityFilter]);

  const handleStartSprint = async (candidate: UserProfile) => {
    try {
      const sprint = await teamService.startTrialSprint(
        candidate.id,
        venture.selectedProblem?.title || 'LaunchLoop Venture'
      );
      // Mark role as filled in venture context
      if (!filledRoles.includes(candidate.primaryRole)) {
        const nextFilled = [...filledRoles, candidate.primaryRole];
        const nextMissing = missingRoles.filter((r) => r !== candidate.primaryRole);
        updateIdea({
          productName: venture.idea?.productName || 'Venture Concept',
          targetProblem: venture.selectedProblem?.summary || 'Target Problem',
          description: venture.selectedProblem?.desiredOutcome || 'Solution Description',
          targetAudience: venture.selectedProblem?.industry || 'Indian Businesses',
          priceINR: venture.idea?.priceINR || 1999,
          filledRoles: nextFilled,
          missingRoles: nextMissing,
        });
      }
      setActionNotice(`1-Week Trial Sprint created with ${candidate.name}! Redirecting...`);
      setTimeout(() => navigate(`/team/sprint/${sprint.id}`), 800);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Pipeline Stepper */}
      <PipelineStepper />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-semibold mb-2">
            <span>Step 2 of LaunchLoop Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Complementary Team Finder</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            We match on <strong>complementary skills</strong>, not similarity. Given your active
            problem and roles already filled, we recommend profiles that fill your exact functional
            gaps.
          </p>
        </div>

        <Link to="/team/profile">
          <Button variant="outline" size="sm">
            <span>Edit My Profile & Runway</span>
          </Button>
        </Link>
      </div>

      {actionNotice && (
        <div
          role="status"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between"
        >
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Missing Role Analysis Card */}
      <Card className="bg-gradient-to-r from-indigo-50/60 via-white to-slate-50 border-indigo-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                Venture Gap Analysis
              </span>
              {venture.selectedProblem && (
                <span className="text-xs text-slate-500 truncate max-w-md">
                  for &quot;{venture.selectedProblem.title}&quot;
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Roles Already Filled ({filledRoles.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {filledRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg"
                    >
                      ✓ {r}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Critical Missing Roles ({missingRoles.length}):
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {missingRoles.map((r) => (
                    <span
                      key={r}
                      className="inline-flex items-center text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg"
                    >
                      + {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {!venture.selectedProblem ? (
              <Link to="/problems">
                <Button size="sm" variant="outline">
                  <Compass className="w-3.5 h-3.5 mr-1" />
                  <span>Select a Problem First</span>
                </Button>
              </Link>
            ) : (
              <Link to="/team/sprint/sprint_101">
                <Button size="sm" variant="outline" className="border-indigo-200 text-indigo-700">
                  <Play className="w-3.5 h-3.5 mr-1" />
                  <span>View Active Trial Sprint</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {/* Filter Bar */}
      <Card className="p-4 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormSelect
            label="Filter by Missing Role"
            options={ROLE_OPTIONS}
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          />
          <FormSelect
            label="Filter by Indian Hub"
            options={CITY_OPTIONS}
            value={selectedCityFilter}
            onChange={(e) => setSelectedCityFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Candidates List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <Card key={n} className="animate-pulse space-y-4">
              <div className="h-6 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
              <div className="h-16 bg-slate-100 rounded w-full" />
            </Card>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-2xl border border-slate-200 p-8">
          <Users className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">No Candidates Found</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your role or location filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => {
            const cand = rec.profile;

            return (
              <Card key={cand.id} hoverEffect className="flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  {/* Card Header with Complementary Match Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900">{cand.name}</h2>
                        <span className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {rec.matchScore}% Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{cand.headline}</p>
                    </div>

                    <Badge variant="purple">{cand.primaryRole}</Badge>
                  </div>

                  {/* "Why this match" explanation box */}
                  <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                    <span className="font-bold text-indigo-900 block text-[11px] uppercase tracking-wider">
                      Why this complementary match:
                    </span>
                    <p className="leading-relaxed text-indigo-800">{rec.matchingReason}</p>
                  </div>

                  {/* Skills tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {cand.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Meta: City, Hours, Equity, Risk */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cand.city}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cand.hoursPerWeek} hrs/wk</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {cand.equityExpectationRange.min}% - {cand.equityExpectationRange.max}% Eq
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-400">Risk:</span>
                      <span>{cand.riskAppetite}</span>
                    </div>
                  </div>

                  {/* Linked Profiles with "Linked" badge (explicitly not verified) */}
                  <div className="flex items-center gap-3 pt-2 text-xs">
                    {cand.linkedProfiles.github && (
                      <a
                        href={cand.linkedProfiles.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
                      >
                        <span>GitHub</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] bg-slate-100 border border-slate-200 px-1 rounded text-slate-500">
                          Linked
                        </span>
                      </a>
                    )}
                    {cand.linkedProfiles.linkedin && (
                      <a
                        href={cand.linkedProfiles.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <span>LinkedIn</span>
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        <span className="text-[10px] bg-indigo-50 border border-indigo-200 px-1 rounded text-indigo-700">
                          Linked
                        </span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveQuizCandidate(cand)}
                    className="text-xs"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                    <span>Compatibility Quiz</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStartSprint(cand)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700"
                  >
                    <span>Start 1-Wk Trial Sprint</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Compatibility Questionnaire Modal */}
      {activeQuizCandidate && (
        <CompatibilityQuizModal
          candidate={activeQuizCandidate}
          isOpen={!!activeQuizCandidate}
          onClose={() => setActiveQuizCandidate(null)}
        />
      )}
    </div>
  );
};
export default TeamFinderPage;
