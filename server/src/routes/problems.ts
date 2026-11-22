import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { store } from '../services/dataStore.js';

export const problemsRouter = Router();

export const CreateProblemSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(140),
  companyName: z.string().min(2, 'Company name is required'),
  industry: z.string().min(2, 'Industry is required'),
  summary: z.string().min(20, 'Summary must be at least 20 characters').max(280),
  description: z.string().min(50, 'Operational context must be at least 50 characters'),
  constraints: z.array(z.string()).min(1, 'Specify at least one operational constraint'),
  desiredOutcome: z.string().min(20, 'Desired outcome is required'),
  rewardMin: z.number().positive(),
  rewardMax: z.number().positive(),
  confidentialityLevel: z.enum(['Public', 'NDA Required', 'Invite Only']),
  ipPolicyNote: z.string().min(10),
  suggestedRoles: z.array(z.string()).min(1),
});

// GET /api/problems - Public / All roles
problemsRouter.get('/', (_req: Request, res: Response) => {
  const problems = store.getProblems();
  res.status(200).json({
    success: true,
    data: problems,
  });
});

// POST /api/problems - ENTERPRISE only
problemsRouter.post(
  '/',
  requireRole(['ENTERPRISE']),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = CreateProblemSchema.parse(req.body);

      const created = store.addProblem({
        title: validated.title,
        companyName: req.user?.organization || validated.companyName,
        isVerifiedCompany: true,
        industry: validated.industry,
        summary: validated.summary,
        description: validated.description,
        constraints: validated.constraints,
        desiredOutcome: validated.desiredOutcome,
        rewardRange: {
          min: validated.rewardMin,
          max: validated.rewardMax,
          currency: 'INR',
          type: 'Pilot Contract',
        },
        confidentialityLevel: validated.confidentialityLevel,
        ipPolicyNote: validated.ipPolicyNote,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        suggestedRoles: validated.suggestedRoles,
      });

      res.status(201).json({
        success: true,
        data: created,
      });
    } catch (err) {
      next(err);
    }
  }
);
