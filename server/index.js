import app from './src/app.js';

const PORT = process.env.PORT || 5001;

// In Vercel serverless environment, we export the app
// In local/Render environment, we start the server normally
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 OmniDecision AI Server running on http://localhost:${PORT}`);
    console.log(`🧠 AI Engine Status: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5 Active' : 'Heuristic Engine (Key Pending)'}`);
    console.log(`=======================================================`);
  });
}

export default app;
