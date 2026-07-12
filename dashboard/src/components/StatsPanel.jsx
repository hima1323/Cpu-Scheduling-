import { Clock, Activity, Cpu, RefreshCw, BarChart2 } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub, delay = 0 }) => (
  <div className="stat-card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center gap-3 mb-3">
      <div className="rounded-xl p-2.5" style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">{label}</div>
    </div>
    <div className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {value}
    </div>
    {sub && <div className="text-[11px] text-zinc-600 mt-2">{sub}</div>}
  </div>
);

export default function StatsPanel({ result }) {
  if (!result) return null;

  const stats = [
    {
      icon: Clock,
      label: 'Avg Waiting Time',
      value: result.avg_waiting_time?.toFixed(2) ?? '—',
      color: '#a1a1aa',
      sub: 'Time spent in ready queue',
    },
    {
      icon: Activity,
      label: 'Avg Turnaround',
      value: result.avg_turnaround_time?.toFixed(2) ?? '—',
      color: '#a1a1aa',
      sub: 'End-to-end process lifetime',
    },
    {
      icon: Cpu,
      label: 'CPU Utilization',
      value: `${result.cpu_utilization?.toFixed(1) ?? '—'}%`,
      color: '#a1a1aa',
      sub: `Idle: ${(100 - (result.cpu_utilization ?? 0)).toFixed(1)}%`,
    },
    {
      icon: RefreshCw,
      label: 'Context Switches',
      value: result.total_ctx_switches ?? '—',
      color: '#a1a1aa',
      sub: 'CPU handoffs with overhead',
    },
    {
      icon: BarChart2,
      label: 'Total Time',
      value: result.total_time?.toFixed(2) ?? '—',
      color: '#a1a1aa',
      sub: `${result.processes?.length ?? 0} processes completed`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-5">
      {stats.map((s, i) => <StatCard key={s.label} {...s} delay={i * 60} />)}
    </div>
  );
}
