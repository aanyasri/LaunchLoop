import { createApp } from './app.js';

const port = process.env.PORT || 4000;
const app = createApp();

app.listen(port, () => {
  console.log(`[LaunchLoop Server] Running on http://localhost:${port}`);
  console.log(`[LaunchLoop Server] Frontend Origin: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(
    `[LaunchLoop Server] Gemini API Status: ${
      process.env.GEMINI_API_KEY ? 'Configured (Live AI simulations enabled)' : 'Missing key (Clean fallback to mock personas)'
    }`
  );
});
