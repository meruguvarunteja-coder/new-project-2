import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function RadarComparison({ decision }) {
  if (!decision || !decision.criteria || !decision.options) {
    return <div className="text-slate-400 text-sm text-center py-8">Insufficient criteria data for radar chart</div>;
  }

  // Format data for Recharts Radar
  // Each item in radarData corresponds to a criterion, with key-value pairs for each option's score
  const radarData = decision.criteria.map(crit => {
    const item = { subject: crit.name };
    decision.options.forEach(opt => {
      item[opt.name] = opt.scores?.[crit.id] ?? 5;
    });
    return item;
  });

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 10 }} />
          {decision.options.map((opt, idx) => (
            <Radar
              key={opt.id}
              name={opt.name}
              dataKey={opt.name}
              stroke={COLORS[idx % COLORS.length]}
              fill={COLORS[idx % COLORS.length]}
              fillOpacity={0.25}
            />
          ))}
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
