import GanttChart from './GanttChart';
import { ALGO_COLORS, ALGO_LABELS } from '../utils/colors';

// Comparison table
function CompareTable({ results }) {
  const metrics = [
    { key: 'avg_waiting_time',    label: 'Avg Wait (ms)',  fmt: v => v.toFixed(2), better: 'low' },
    { key: 'avg_turnaround_time', label: 'Avg TAT (ms)',   fmt: v => v.toFixed(2), better: 'low' },
    { key: 'cpu_utilization',     label: 'CPU Util %',     fmt: v => v.toFixed(1), better: 'high' },
    { key: 'total_ctx_switches',  label: 'Ctx Switches',   fmt: v => v,            better: 'low' },
    { key: 'total_time',          label: 'Total Time (ms)',fmt: v => v.toFixed(2), better: 'low' },
  ];

  return (
    <div className="overflow-x-auto rounded-xl mt-6 animate-fade-in"
      style={{ border: '1px solid rgba(255,255,255,0.03)' }}>
      <table className="theme-table">
        <thead>
          <tr>
            <th className="text-left">Metric</th>
            {results.map(r => (
              <th key={r.algorithm} className="text-center">
                <span className="algo-tag text-white" style={{ background: ALGO_COLORS[r.algorithm] }}>
                  {r.algorithm}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(m => {
            const vals = results.map(r => r[m.key] ?? 0);
            const best = m.better === 'low' ? Math.min(...vals) : Math.max(...vals);
            return (
              <tr key={m.key}>
                <td className="text-zinc-500 text-xs font-medium">{m.label}</td>
                {results.map((r, i) => {
                  const v    = r[m.key] ?? 0;
                  const win  = Math.abs(v - best) < 0.01;
                  return (
                    <td key={r.algorithm} className="text-center font-mono text-sm"
                      style={{ color: win ? '#10b981' : '#71717a', fontWeight: win ? 700 : 400 }}>
                      {m.fmt(v)}
                      {win && <span className="ml-1 text-xs">★</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ArenaView({ results }) {
  if (!results || results.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-bold text-white">⚔️ Arena Mode</h2>
        <span className="text-zinc-500 text-sm">All algorithms, same workload</span>
      </div>

      <CompareTable results={results} />

      <div className="mt-6 space-y-4">
        {results.map(r => (
          <div key={r.algorithm} className="glass rounded-2xl p-5">
            <GanttChart
              result={r}
              label={r.algorithm}
              accentColor={ALGO_COLORS[r.algorithm]}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
}
