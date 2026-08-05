/**
 * MCDA (Multi-Criteria Decision Analysis) & Risk Simulation Engine
 */

// Helper to generate a random normal variable using Box-Muller transform
function randomNormal(mean = 0, stdDev = 1) {
  let u1 = Math.random();
  let u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Calculate deterministic scores for options given criteria and scores
 */
export function calculateMCDAScores(decision) {
  const { criteria, options, scenarioModifiers } = decision;

  if (!criteria || !options || criteria.length === 0 || options.length === 0) {
    return { rankings: [], normalizedWeights: {} };
  }

  // 1. Normalize weights
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const normalizedWeights = {};
  criteria.forEach(c => {
    normalizedWeights[c.id] = totalWeight > 0 ? (c.weight || 0) / totalWeight : 1 / criteria.length;
  });

  // Apply scenario modifiers if active
  const costMultiplier = scenarioModifiers?.costInflationPercent ? (1 + scenarioModifiers.costInflationPercent / 100) : 1;

  // 2. Score each option
  const optionResults = options.map(opt => {
    let totalScore = 0;
    const breakdown = {};

    criteria.forEach(crit => {
      let rawScore = opt.scores?.[crit.id] ?? 5; // default 5 out of 10

      // If cost criterion and cost inflation modifier is active, penalize raw score
      if (crit.type === 'cost' && costMultiplier > 1) {
        rawScore = Math.max(1, rawScore / costMultiplier);
      }

      // If cost type, in standard scoring higher raw score = better rating or we normalize
      const weightedContrib = rawScore * (normalizedWeights[crit.id] || 0);
      breakdown[crit.id] = parseFloat(weightedContrib.toFixed(2));
      totalScore += weightedContrib;
    });

    const compositeScore = parseFloat(totalScore.toFixed(2));
    const normalizedScore = parseFloat(((compositeScore / 10) * 100).toFixed(1)); // percentage score 0-100%

    return {
      optionId: opt.id,
      optionName: opt.name,
      compositeScore,
      normalizedScore,
      breakdown,
      risks: opt.risks || []
    };
  });

  // Sort descending by composite score
  optionResults.sort((a, b) => b.compositeScore - a.compositeScore);

  // Assign ranks
  const rankings = optionResults.map((res, index) => ({
    rank: index + 1,
    ...res
  }));

  return {
    rankings,
    normalizedWeights,
    topOption: rankings[0] || null
  };
}

/**
 * Run Monte Carlo Simulation (e.g. 1000 iterations with noise/variance)
 */
export function runMonteCarloSimulation(decision, iterations = 1000, volatility = 0.15) {
  const { criteria, options } = decision;

  if (!options || options.length === 0) return { winProbabilities: {}, distribution: [] };

  const winCounts = {};
  options.forEach(o => winCounts[o.id] = 0);

  const simulationRuns = [];

  for (let i = 0; i < iterations; i++) {
    let bestOptionId = null;
    let highestScore = -Infinity;
    const runScores = {};

    // Calculate total weight
    const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

    options.forEach(opt => {
      let simScore = 0;

      criteria.forEach(crit => {
        const baseScore = opt.scores?.[crit.id] ?? 5;
        const normWeight = totalWeight > 0 ? (crit.weight || 0) / totalWeight : 1 / criteria.length;

        // Add stochastic variation to score
        const noise = randomNormal(0, volatility * baseScore);
        const perturbedScore = Math.max(1, Math.min(10, baseScore + noise));

        simScore += perturbedScore * normWeight;
      });

      runScores[opt.id] = simScore;
      if (simScore > highestScore) {
        highestScore = simScore;
        bestOptionId = opt.id;
      }
    });

    winCounts[bestOptionId]++;
    if (i < 100) { // store sample distribution data points for UI chart rendering
      simulationRuns.push({
        iteration: i + 1,
        ...runScores
      });
    }
  }

  // Calculate probabilities and percentiles
  const winProbabilities = {};
  options.forEach(opt => {
    winProbabilities[opt.id] = parseFloat(((winCounts[opt.id] / iterations) * 100).toFixed(1));
  });

  return {
    iterations,
    winProbabilities,
    sampleDistribution: simulationRuns
  };
}

/**
 * Perform Sensitivity Analysis: vary each criterion's weight from 0.0 to 1.0
 */
export function calculateSensitivityAnalysis(decision) {
  const { criteria, options } = decision;
  const sensitivityData = [];

  if (!criteria || !options) return [];

  // Vary weight step by step for the primary criterion
  const steps = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  criteria.forEach(targetCrit => {
    const curvePoints = steps.map(weight => {
      const tempDecision = JSON.parse(JSON.stringify(decision));
      const critRef = tempDecision.criteria.find(c => c.id === targetCrit.id);
      if (critRef) critRef.weight = weight;

      const res = calculateMCDAScores(tempDecision);
      const point = { weightPercent: Math.round(weight * 100) };
      res.rankings.forEach(r => {
        point[r.optionName] = r.compositeScore;
      });
      return point;
    });

    sensitivityData.push({
      criterionId: targetCrit.id,
      criterionName: targetCrit.name,
      points: curvePoints
    });
  });

  return sensitivityData;
}
