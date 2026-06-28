import { Clock, Activity, Cpu, RefreshCw, BarChart2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="stat-card flex items-start gap-4 animate-slide-up">
    <div className="rounded-xl p-2.5" style={{ background: `${color}22` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div className="flex-1">
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </div>
  </div>
);

export default function StatsPanel({ result }) {
  if (!result) return null;

  const stats = [
    {
      icon: Clock,
      label: 'Avg Waiting Time',
      value: `${result.avg_waiting_time?.toFixed(2) ?? '—'} ms`,
      color: '#6366f1',
      sub: 'Time spent in ready queue',
    },
    {
      icon: Activity,
      label: 'Avg Turnaround Time',
      value: `${result.avg_turnaround_time?.toFixed(2) ?? '—'} ms`,
      color: '#22d3ee',
      sub: 'End-to-end process lifetime',
    },
    {
      icon: Cpu,
      label: 'CPU Utilization',
      value: `${result.cpu_utilization?.toFixed(1) ?? '—'}%`,
      color: '#10b981',
      sub: `Idle: ${(100 - (result.cpu_utilization ?? 0)).toFixed(1)}%`,
    },
    {
      icon: RefreshCw,
      label: 'Context Switches',
      value: result.total_ctx_switches ?? '—',
      color: '#f59e0b',
      sub: 'CPU handoffs with overhead',
    },
    {
      icon: BarChart2,
      label: 'Total Time',
      value: `${result.total_time?.toFixed(2) ?? '—'} ms`,
      color: '#ec4899',
      sub: `${result.processes?.length ?? 0} processes completed`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
      {stats.map(s => <StatCard key={s.label} {...s} />)}
    </div>
  );
}
