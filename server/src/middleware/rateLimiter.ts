import rateLimit from 'express-rate-limit';

export const simulateRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 simulations per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many simulation requests from this IP. Please try again after 15 minutes.',
  },
});
