import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';
import { simulateRouter } from './routes/simulate.js';
import { problemsRouter } from './routes/problems.js';
import { campaignsRouter } from './routes/campaigns.js';

dotenv.config();

export function createApp(): Express {
  const app = express();

  // Security: Helmet HTTP headers
  app.use(helmet());

  // Security: CORS configured strictly for frontend origin
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, tests) or matching allowedOrigin
        if (!origin || origin === allowedOrigin || origin.startsWith('http://localhost:')) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy: origin ${origin} not allowed`));
        }
      },
      credentials: true,
    })
  );

  // Security: Restrict maximum request payload size
  app.use(express.json({ limit: '1mb' }));

  // Demo Auth Middleware (inspects Authorization header)
  app.use(authMiddleware);

  // Health check
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      service: 'LaunchLoop API',
      timestamp: new Date().toISOString(),
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    });
  });

  // Endpoints
  app.use('/api/simulate', simulateRouter);
  app.use('/api/problems', problemsRouter);
  app.use('/api/campaigns', campaignsRouter);

  // Global Error Handler (no stack traces)
  app.use(errorHandler);

  return app;
}
