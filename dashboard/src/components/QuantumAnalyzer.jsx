import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import { TrendingDown } from 'lucide-react';

const GEN_TYPES = [
  { value: 'random',     label: 'Random Mixed' },
  { value: 'convoy',     label: 'Convoy Maker' },
  { value: 'starvation', label: 'Starvation Trap' },
  { value: 'cpu_bound',  label: 'CPU-Bound' },
  { value: 'io_bound',   label: 'IO-Bound' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl p-3 text-xs" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="font-bold text-white mb-2">Quantum = {label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="flex justify-between gap-4">
          <span>{p.name}:</span>
          <span className="font-mono font-bold">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function QuantumAnalyzer({ onSweep, sweepData, loading }) {
  const [genType, setGenType] = useState('random');
  const [genN, setGenN]       = useState(8);

  // Find optimal quantum (min avg waiting time)
  const optimal = sweepData
    ? sweepData.reduce((best, cur) =>
        cur.avg_waiting_time < best.avg_waiting_time ? cur : best, sweepData[0])
    : null;

  return (
    <div className="glass rounded-2xl p-6 animate-slide-up">
      <div className="flex items-center gap-3 mb-5">
        <TrendingDown size={20} className="text-zinc-400" />
        <h2 className="text-lg font-bold text-white">Quantum Analyzer</h2>
        <span className="text-zinc-500 text-sm">Round Robin q = 1 → 50</span>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-6 p-4 rounded-xl"
        style={{ background: 'rgba(10,10,10,0.6)', border: '1px solid rgba(255,255,255,0.03)' }}>
        <select value={genType} onChange={e => setGenType(e.target.value)} className="flex-1 min-w-[130px]">
          {GEN_TYPES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <input type="number" value={genN} min={2} max={20}
          onChange={e => setGenN(+e.target.value)} style={{ width: 72 }} placeholder="n" />
        <button className="btn-primary flex items-center gap-2" style={{ padding: '8px 18px' }}
          onClick={() => onSweep(genType, genN)} disabled={loading}>
          {loading ? <span className="spinner scale-75" /> : '▶'}
          Sweep Quantum
        </button>
      </div>

      {optimal && (
        <div className="flex gap-3 mb-5 flex-wrap">
          <div className="stat-card flex-1 min-w-[130px]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Optimal Quantum</div>
            <div className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              q = {optimal.quantum}
            </div>
          </div>
          <div className="stat-card flex-1 min-w-[130px]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Min Avg Wait</div>
            <div className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {optimal.avg_waiting_time.toFixed(2)}
            </div>
            <div className="text-[11px] text-zinc-600 mt-1">ms</div>
          </div>
          <div className="stat-card flex-1 min-w-[130px]">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold mb-2">Min Ctx Switches</div>
            <div className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {sweepData.reduce((m, d) => d.total_ctx_switches < m ? d.total_ctx_switches : m, Infinity)}
            </div>
          </div>
        </div>
      )}

      {sweepData && (
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sweepData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="quantum" stroke="#262626" tick={{ fill: '#52525b', fontSize: 11 }}
                label={{ value: 'Time Quantum (q)', position: 'insideBottom', offset: -4, fill: '#3f3f46', fontSize: 11 }} />
              <YAxis stroke="#262626" tick={{ fill: '#52525b', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8, color: '#71717a' }} />
              {optimal && (
                <ReferenceLine x={optimal.quantum} stroke="#10b981" strokeDasharray="4 3"
                  label={{ value: `Optimal q=${optimal.quantum}`, fill: '#10b981', fontSize: 10 }} />
              )}
              <Line type="monotone" dataKey="avg_waiting_time"    name="Avg Wait Time"
                stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="avg_turnaround_time" name="Avg Turnaround"
                stroke="#22d3ee" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line type="monotone" dataKey="total_ctx_switches"  name="Ctx Switches"
                stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {!sweepData && !loading && (
        <div className="flex items-center justify-center h-40 text-zinc-600 text-sm">
          Select a workload type and click "Sweep Quantum" to analyze
        </div>
      )}
    </div>
  );
}
