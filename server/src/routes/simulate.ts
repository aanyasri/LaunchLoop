import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { simulateRateLimiter } from '../middleware/rateLimiter.js';
import { simulateWithGemini } from '../services/geminiService.js';

export const simulateRouter = Router();

export const SimulateIdeaSchema = z.object({
  productName: z.string().min(3, 'Product name must be at least 3 characters').max(80),
  targetProblem: z.string().min(10, 'Target problem must be at least 10 characters'),
  description: z.string().min(20, 'Solution description must be at least 20 characters'),
  targetAudience: z.string().min(5, 'Target audience is required'),
  priceINR: z.number().positive('Price must be greater than ₹0'),
});

simulateRouter.post(
  '/',
  simulateRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedInput = SimulateIdeaSchema.parse(req.body);
      const simulation = await simulateWithGemini(validatedInput);

      res.status(200).json({
        success: true,
        data: simulation,
      });
    } catch (err) {
      next(err);
    }
  }
);
