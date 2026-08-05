import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export default function TradeOffFrontier({ mcdaResults }) {
  if (!mcdaResults || !mcdaResults.rankings) {
    return <div className="text-slate-400 text-sm text-center py-8">No trade-off data available</div>;
  }

  // Scatter plot comparing composite score vs risk factor vs rank
  const scatterData = mcdaResults.rankings.map(r => ({
    name: r.optionName,
    compositeScore: r.compositeScore,
    riskCount: r.risks?.length || 1,
    rank: r.rank
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            type="number"
            dataKey="riskCount"
            name="Risk Factors"
            unit=" risks"
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'Identified Risk Factors (Lower is Better)', position: 'bottom', offset: 0, fill: '#64748b', fontSize: 11 }}
          />
          <YAxis
            type="number"
            dataKey="compositeScore"
            name="Score"
            domain={[0, 10]}
            stroke="#94a3b8"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            label={{ value: 'Weighted Composite Score (Higher is Better)', angle: -90, position: 'left', fill: '#64748b', fontSize: 11 }}
          />
          <ZAxis type="number" dataKey="rank" range={[100, 300]} name="Rank" />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }}
          />
          <Scatter name="Decision Options" data={scatterData} fill="#6366f1">
            <LabelList dataKey="name" position="top" style={{ fill: '#38bdf8', fontSize: '11px', fontWeight: 'bold' }} />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
