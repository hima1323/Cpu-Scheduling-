// Color palette for processes — tuned for deep black (#050505) backgrounds
// Slightly more saturated and luminous to pop against the dark aurora theme
const COLORS = [
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#f59e0b', // amber
  '#f472b6', // pink
  '#818cf8', // indigo
  '#fb923c', // orange
  '#a78bfa', // violet
  '#2dd4bf', // teal
  '#f87171', // red
  '#a3e635', // lime
  '#60a5fa', // blue
  '#e879f9', // fuchsia
  '#fbbf24', // yellow
  '#38bdf8', // sky
  '#c084fc', // purple
];

export function processColor(pid) {
  if (pid < 0) return '#1a1a1a'; // context switch = dark
  return COLORS[pid % COLORS.length];
}

export const ALGO_COLORS = {
  FCFS:     '#34d399',
  SJF:      '#22d3ee',
  SRTF:     '#10b981',
  Priority: '#f59e0b',
  RR:       '#f472b6',
  MLQ:      '#a78bfa',
  MLFQ:     '#fb923c',
  Lottery:  '#a3e635',
  EDF:      '#38bdf8',
};

export const ALGO_LABELS = {
  FCFS:     'First-Come First-Served',
  SJF:      'Shortest Job First',
  SRTF:     'Shortest Remaining Time',
  Priority: 'Priority (w/ Aging)',
  RR:       'Round Robin',
  MLQ:      'Multilevel Queue',
  MLFQ:     'Multilevel Feedback Queue',
  Lottery:  'Lottery Scheduling',
  EDF:      'Earliest Deadline First',
};
