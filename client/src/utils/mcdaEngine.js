/**
 * Client-Side MCDA (Multi-Criteria Decision Analysis) & Risk Simulation Engine
 */

function randomNormal(mean = 0, stdDev = 1) {
  let u1 = Math.random();
  let u2 = Math.random();
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

export function calculateMCDAScores(decision) {
  const { criteria, options, scenarioModifiers } = decision;

  if (!criteria || !options || criteria.length === 0 || options.length === 0) {
    return { rankings: [], normalizedWeights: {} };
  }

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  const normalizedWeights = {};
  criteria.forEach(c => {
    normalizedWeights[c.id] = totalWeight > 0 ? (c.weight || 0) / totalWeight : 1 / criteria.length;
  });

  const costMultiplier = scenarioModifiers?.costInflationPercent ? (1 + scenarioModifiers.costInflationPercent / 100) : 1;

  const optionResults = options.map(opt => {
    let totalScore = 0;
    const breakdown = {};

    criteria.forEach(crit => {
      let rawScore = opt.scores?.[crit.id] ?? 5;

      if (crit.type === 'cost' && costMultiplier > 1) {
        rawScore = Math.max(1, rawScore / costMultiplier);
      }

      const weightedContrib = rawScore * (normalizedWeights[crit.id] || 0);
      breakdown[crit.id] = parseFloat(weightedContrib.toFixed(2));
      totalScore += weightedContrib;
    });

    const compositeScore = parseFloat(totalScore.toFixed(2));
    const normalizedScore = parseFloat(((compositeScore / 10) * 100).toFixed(1));

    return {
      optionId: opt.id,
      optionName: opt.name,
      compositeScore,
      normalizedScore,
      breakdown,
      risks: opt.risks || []
    };
  });

  optionResults.sort((a, b) => b.compositeScore - a.compositeScore);

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

export function runMonteCarloSimulation(decision, iterations = 1000, volatility = 0.15) {
  const { criteria, options } = decision;

  if (!options || options.length === 0) return { winProbabilities: {}, distribution: [] };

  const winCounts = {};
  options.forEach(o => winCounts[o.id] = 0);

  const simulationRuns = [];
  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  for (let i = 0; i < iterations; i++) {
    let bestOptionId = null;
    let highestScore = -Infinity;
    const runScores = {};

    options.forEach(opt => {
      let simScore = 0;

      criteria.forEach(crit => {
        const baseScore = opt.scores?.[crit.id] ?? 5;
        const normWeight = totalWeight > 0 ? (crit.weight || 0) / totalWeight : 1 / criteria.length;

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

    if (bestOptionId) winCounts[bestOptionId]++;
    if (i < 100) {
      simulationRuns.push({
        iteration: i + 1,
        ...runScores
      });
    }
  }

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

export function calculateSensitivityAnalysis(decision) {
  const { criteria, options } = decision;
  const sensitivityData = [];

  if (!criteria || !options) return [];

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

export function generateFallbackScenarioParse(promptText) {
  return {
    title: 'Strategic Decision: ' + (promptText.slice(0, 45) + (promptText.length > 45 ? '...' : '')),
    problemStatement: promptText.length > 20 ? promptText : 'Structured evaluation of multi-criteria strategic alternatives and risk profiles.',
    industry: 'Strategic Planning & Enterprise Operations',
    criteria: [
      { id: 'crit_cost', name: 'Capital Efficiency & TCO', weight: 0.35, type: 'cost', unit: 'USD' },
      { id: 'crit_impact', name: 'Strategic Business Impact', weight: 0.30, type: 'benefit', unit: 'Score 1-10' },
      { id: 'crit_feasibility', name: 'Technical Feasibility & Velocity', weight: 0.20, type: 'benefit', unit: 'Score 1-10' },
      { id: 'crit_risk', name: 'Risk & Vulnerability Control', weight: 0.15, type: 'benefit', unit: 'Score 1-10' }
    ],
    options: [
      {
        id: 'opt_alpha',
        name: 'Option Alpha: Core SaaS & Product Feature Velocity',
        description: 'Directly reinvest capital into core product feature development and scaling.',
        scores: { crit_cost: 7.5, crit_impact: 9.0, crit_feasibility: 8.5, crit_risk: 8.0 },
        risks: ['Opportunity cost of delayed compliance entry', 'Requires strict roadmap focus']
      },
      {
        id: 'opt_beta',
        name: 'Option Beta: Enterprise Compliance Suite Launch',
        description: 'Build dedicated B2B Enterprise Compliance module to unlock high-ARR deals.',
        scores: { crit_cost: 6.0, crit_impact: 9.5, crit_feasibility: 7.0, crit_risk: 7.5 },
        risks: ['Longer sales cycles', 'Strict regulatory audit burden']
      },
      {
        id: 'opt_gamma',
        name: 'Option Gamma: Strategic Competitor Customer Acquisition',
        description: 'Acquire competitor asset/customer base to immediately expand market share.',
        scores: { crit_cost: 5.0, crit_impact: 8.0, crit_feasibility: 6.5, crit_risk: 5.5 },
        risks: ['Customer migration churn risk', 'Integration complexities']
      }
    ]
  };
}

export function generateFallbackExecutiveAnalysis(decision, mcdaResults, monteCarloResults) {
  const top = mcdaResults?.topOption || { optionId: 'opt_alpha', optionName: 'Leading Alternative', normalizedScore: 85 };
  const winProb = monteCarloResults?.winProbabilities?.[top.optionId] || 75;

  return {
    recommendation: {
      recommendedOptionId: top.optionId,
      recommendedOptionName: top.optionName,
      confidenceScore: Math.round(winProb * 0.9 + 10),
      executiveSummary: `Based on multi-criteria analysis and ${monteCarloResults?.iterations || 1000} Monte Carlo iterations, "${top.optionName}" is recommended with an overall score of ${top.normalizedScore}% and a ${winProb}% simulated probability of outperforming competing alternatives.`
    },
    rationaleBreakdown: [
      {
        title: 'Weighted Composite Performance',
        detail: `Achieved top ranking across normalized utility criteria with strong balance of cost and strategic impact.`
      },
      {
        title: 'Stochastic Risk Resistance',
        detail: `Demonstrated superior resilience under Monte Carlo random variance simulations.`
      }
    ],
    actionPlan: [
      'Finalize resource allocation for primary milestones.',
      'Establish risk mitigation protocols for secondary criteria.',
      'Conduct monthly steering committee reviews to monitor key indicators.'
    ]
  };
}
