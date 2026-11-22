import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { teamService, UpdateProfileSchema } from '../../services/api/teamService';
import { PrimaryRole } from '../../types/team';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { FormInput } from '../../shared/components/forms/FormInput';
import { FormSelect } from '../../shared/components/forms/FormSelect';
import { ExternalLink, CheckCircle2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { label: 'Tech Lead / Fullstack', value: 'Tech Lead / Fullstack' },
  { label: 'AI / Data Engineer', value: 'AI / Data Engineer' },
  { label: 'Product Designer', value: 'Product Designer' },
  { label: 'Growth & Marketing', value: 'Growth & Marketing' },
  { label: 'Operations & Logistics', value: 'Operations & Logistics' },
  { label: 'Finance & Legal', value: 'Finance & Legal' },
];

const RISK_OPTIONS = [
  { label: 'Low (Bootstrapped side-project or salary required)', value: 'Low' },
  { label: 'Medium (Can sustain 6-12 months runway)', value: 'Medium' },
  { label: 'High (All-in full-time, equity-heavy upside)', value: 'High' },
];

export const EditProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Aanya Sharma');
  const [headline, setHeadline] = useState('Founder & Product Architect | Ex-B2B Logistics PM');
  const [city, setCity] = useState('Bengaluru');
  const [languagesText, setLanguagesText] = useState('Hindi, English, Marathi');
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole>('Tech Lead / Fullstack');
  const [skillsText, setSkillsText] = useState('React, TypeScript, Node.js, Hardware-in-the-loop, Cold-chain');
  const [hoursPerWeek, setHoursPerWeek] = useState(35);
  const [equityMin, setEquityMin] = useState(10);
  const [equityMax, setEquityMax] = useState(25);
  const [riskAppetite, setRiskAppetite] = useState<'Low' | 'Medium' | 'High'>('High');
  const [githubUrl, setGithubUrl] = useState('https://github.com/aanya-builds');
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/aanya-sharma');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    async function loadCurrent() {
      if (user) {
        const cand = await teamService.getCandidateById(user.id);
        if (cand) {
          setName(cand.name);
          setHeadline(cand.headline);
          setCity(cand.city);
          setLanguagesText(cand.languages.join(', '));
          setPrimaryRole(cand.primaryRole);
          setSkillsText(cand.skills.join(', '));
          setHoursPerWeek(cand.hoursPerWeek);
          setEquityMin(cand.equityExpectationRange.min);
          setEquityMax(cand.equityExpectationRange.max);
          setRiskAppetite(cand.riskAppetite);
          setGithubUrl(cand.linkedProfiles.github || '');
          setLinkedinUrl(cand.linkedProfiles.linkedin || '');
        }
      }
    }
    loadCurrent();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const languages = languagesText.split(',').map((l) => l.trim()).filter(Boolean);
    const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);

    const payload = {
      id: user?.id || 'usr_founder_01',
      name,
      headline,
      city,
      languages,
      primaryRole,
      skills,
      hoursPerWeek: Number(hoursPerWeek),
      equityMin: Number(equityMin),
      equityMax: Number(equityMax),
      riskAppetite,
      githubUrl: githubUrl || undefined,
      linkedinUrl: linkedinUrl || undefined,
    };

    const validation = UpdateProfileSchema.safeParse(payload);
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
      await teamService.updateProfile(payload);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        navigate('/team');
      }, 1200);
    } catch (err: unknown) {
      setErrors({ form: err instanceof Error ? err.message : 'Failed to update profile' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link to="/team" className="text-xs font-semibold text-slate-500 hover:text-indigo-700">
            ← Back to Team Finder
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Edit Co-Founder & Talent Profile</h1>
          <p className="text-xs text-slate-500 mt-1">
            Keep your skills, commitment hours, and risk appetite updated for complementary matchmaking.
          </p>
        </div>
      </div>

      {isSaved && (
        <div
          role="status"
          className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully! Redirecting to Team Finder...</span>
        </div>
      )}

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-medium">
              {errors.form}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />

            <FormInput
              label="City / Startup Hub"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              placeholder="e.g. Bengaluru, Pune, Delhi NCR"
            />
          </div>

          <FormInput
            label="Professional Headline"
            required
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            error={errors.headline}
            placeholder="e.g. Senior Fullstack Architect | Ex-Swiggy Infra"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              label="Primary Functional Role"
              options={ROLE_OPTIONS}
              value={primaryRole}
              onChange={(e) => setPrimaryRole(e.target.value as PrimaryRole)}
            />

            <FormInput
              label="Spoken Languages (Comma-separated)"
              required
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
              placeholder="e.g. English, Hindi, Telugu"
            />
          </div>

          <FormInput
            label="Core Skills (Comma-separated tags)"
            required
            value={skillsText}
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js, Hardware IoT, PostgreSQL"
            error={errors.skills}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Available Hours / Week"
              type="number"
              min={5}
              max={80}
              required
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              error={errors.hoursPerWeek}
            />

            <FormInput
              label="Min Equity Expectation (%)"
              type="number"
              min={0}
              max={100}
              required
              value={equityMin}
              onChange={(e) => setEquityMin(Number(e.target.value))}
              error={errors.equityMin}
            />

            <FormInput
              label="Max Equity Expectation (%)"
              type="number"
              min={0}
              max={100}
              required
              value={equityMax}
              onChange={(e) => setEquityMax(Number(e.target.value))}
              error={errors.equityMax}
            />
          </div>

          <FormSelect
            label="Risk Stance & Personal Runway"
            options={RISK_OPTIONS}
            value={riskAppetite}
            onChange={(e) => setRiskAppetite(e.target.value as 'Low' | 'Medium' | 'High')}
          />

          {/* External Links with Safe Badges */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              External Profiles (Shown as &quot;Linked&quot;, not verified)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <FormInput
                  label="GitHub Profile URL (Optional)"
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  error={errors.githubUrl}
                />
                {githubUrl && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-medium text-slate-700">
                      Linked Profile
                    </span>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              <div>
                <FormInput
                  label="LinkedIn Profile URL (Optional)"
                  type="url"
                  placeholder="https://linkedin.com/in/your-profile"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  error={errors.linkedinUrl}
                />
                {linkedinUrl && (
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-[10px] bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded font-medium text-indigo-700">
                      Linked Profile
                    </span>
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline flex items-center gap-0.5"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link to="/team">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Save Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
export default EditProfilePage;
