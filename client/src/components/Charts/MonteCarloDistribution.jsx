import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MonteCarloDistribution({ monteCarloResults }) {
  if (!monteCarloResults || !monteCarloResults.sampleDistribution) {
    return <div className="text-slate-400 text-sm text-center py-8">Run simulation to view probability distribution</div>;
  }

  const data = monteCarloResults.sampleDistribution;
  const optionKeys = Object.keys(data[0] || {}).filter(k => k !== 'iteration');
  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            {optionKeys.map((key, idx) => (
              <linearGradient key={key} id={`color_${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.4} />
                <stop offset="95%" stopColor={COLORS[idx % COLORS.length]} stopOpacity={0.0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis dataKey="iteration" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
          <YAxis stroke="#64748b" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
          {optionKeys.map((key, idx) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={COLORS[idx % COLORS.length]}
              fillOpacity={1}
              fill={`url(#color_${idx})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
