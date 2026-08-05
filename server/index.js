import app from './src/app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 OmniDecision AI Server running on http://localhost:${PORT}`);
  console.log(`🧠 AI Engine Status: ${process.env.GEMINI_API_KEY ? 'Gemini 1.5 Active' : 'Heuristic Engine (Key Pending)'}`);
  console.log(`=======================================================`);
});
