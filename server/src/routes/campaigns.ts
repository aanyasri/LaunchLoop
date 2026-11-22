import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireRole } from '../middleware/auth.js';
import { store } from '../services/dataStore.js';

export const campaignsRouter = Router();

export const CreateCampaignSchema = z.object({
  title: z.string().min(5),
  tagline: z.string().min(10),
  description: z.string().min(20),
  targetBackersThreshold: z.number().int().min(10),
  refundableDepositINR: z.number().positive(),
  fullPriceINR: z.number().positive(),
  deadlineDate: z.string(),
  depositTermsNote: z.string().min(10),
});

export const PrebookOrderSchema = z.object({
  paymentType: z.enum(['REFUNDABLE_DEPOSIT', 'FULL_PAYMENT']),
  amountINR: z.number().positive(),
  paymentMethod: z.enum(['UPI', 'Card', 'NetBanking']),
});

// GET /api/campaigns
campaignsRouter.get('/', (_req: Request, res: Response) => {
  const campaigns = store.getCampaigns();
  res.status(200).json({
    success: true,
    data: campaigns,
  });
});

// POST /api/campaigns - FOUNDER only
campaignsRouter.post(
  '/',
  requireRole(['FOUNDER']),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const validated = CreateCampaignSchema.parse(req.body);
      const slug = validated.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

      const campaign = store.addCampaign({
        founderId: req.user?.id || 'usr_founder_01',
        founderName: req.user?.name || 'Aanya Sharma',
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        title: validated.title,
        tagline: validated.tagline,
        description: validated.description,
        targetBackersThreshold: validated.targetBackersThreshold,
        refundableDepositINR: validated.refundableDepositINR,
        fullPriceINR: validated.fullPriceINR,
        deadlineDate: validated.deadlineDate,
        depositTermsNote: validated.depositTermsNote,
      });

      res.status(201).json({
        success: true,
        data: campaign,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/campaigns/:id/prebook - BACKER only (mock deposit record only, zero real payment data)
campaignsRouter.post(
  '/:id/prebook',
  requireRole(['BACKER']),
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const campaignId = req.params.id;
      const campaign = store.getCampaignById(campaignId);

      if (!campaign) {
        res.status(404).json({
          success: false,
          error: `Campaign with id "${campaignId}" not found.`,
        });
        return;
      }

      const validated = PrebookOrderSchema.parse(req.body);

      // Create deposit record safely without real banking/card numbers
      const order = store.addOrder({
        campaignId: campaign.id,
        backerName: req.user?.name || 'Demo Backer',
        backerEmail: req.user?.email || 'backer@demo.launchloop',
        paymentType: validated.paymentType,
        amountINR: validated.amountINR,
        paymentMethod: validated.paymentMethod,
      });

      res.status(201).json({
        success: true,
        message: 'Pre-booking deposit secured in demo sandbox.',
        data: order,
      });
    } catch (err) {
      next(err);
    }
  }
);
