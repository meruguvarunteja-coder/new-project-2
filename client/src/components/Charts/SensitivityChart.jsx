import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];

export default function SensitivityChart({ sensitivityResults }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!sensitivityResults || sensitivityResults.length === 0) {
    return <div className="text-slate-400 text-sm text-center py-8">No sensitivity data generated</div>;
  }

  const activeCurve = sensitivityResults[selectedIndex] || sensitivityResults[0];
  const optionNames = activeCurve.points?.[0]
    ? Object.keys(activeCurve.points[0]).filter(k => k !== 'weightPercent')
    : [];

  return (
    <div className="w-full">
      {/* Criterion Selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <span className="text-xs text-slate-400 font-medium">Test Weight Sensitivity For:</span>
        {sensitivityResults.map((item, idx) => (
          <button
            key={item.criterionId}
            onClick={() => setSelectedIndex(idx)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedIndex === idx
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {item.criterionName}
          </button>
        ))}
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={activeCurve.points} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="weightPercent" unit="%" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 10 }} />
            <YAxis stroke="#64748b" domain={[0, 10]} tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#f8fafc' }} />
            <Legend wrapperStyle={{ fontSize: '11px' }} />
            {optionNames.map((name, idx) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
