// Color palette for processes (cycles through for large n)
const COLORS = [
  '#6366f1','#22d3ee','#f59e0b','#ec4899','#10b981',
  '#f97316','#a855f7','#14b8a6','#ef4444','#84cc16',
  '#3b82f6','#e879f9','#fb923c','#06b6d4','#d97706',
];

export function processColor(pid) {
  if (pid < 0) return '#1e293b'; // context switch = dark
  return COLORS[pid % COLORS.length];
}

export const ALGO_COLORS = {
  FCFS:     '#6366f1',
  SJF:      '#22d3ee',
  SRTF:     '#10b981',
  Priority: '#f59e0b',
  RR:       '#ec4899',
};

export const ALGO_LABELS = {
  FCFS:     'First-Come First-Served',
  SJF:      'Shortest Job First',
  SRTF:     'Shortest Remaining Time',
  Priority: 'Priority (w/ Aging)',
  RR:       'Round Robin',
};
