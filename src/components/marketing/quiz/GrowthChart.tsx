import { motion } from 'framer-motion';

export default function GrowthChart() {
  const path = 'M 48 168 C 120 168, 150 150, 188 128 C 240 96, 280 78, 332 62 C 390 44, 430 40, 492 36 C 530 34, 560 30, 592 28';

  return (
    <svg className="quiz-chart" viewBox="0 0 700 220" role="img" aria-label="Execution capacity over 4 weeks">
      <defs>
        <linearGradient id="quiz-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dcea0" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#7dcea0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="quiz-chart-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e07a5f" />
          <stop offset="45%" stopColor="#f4d35e" />
          <stop offset="100%" stopColor="#3db89a" />
        </linearGradient>
        <marker id="quiz-chart-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#3db89a" />
        </marker>
      </defs>
      {[48, 220, 392, 564].map((x) => (
        <line key={x} x1={x} y1="28" x2={x} y2="176" stroke="rgba(28,40,55,0.08)" strokeDasharray="3 6" />
      ))}
      <motion.path
        d={`${path} L 592 176 L 48 176 Z`}
        fill="url(#quiz-chart-fill)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.35 }}
      />
      <motion.path
        d={path}
        fill="none"
        stroke="url(#quiz-chart-stroke)"
        strokeWidth="4.5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <circle cx="48" cy="168" r="7" fill="#e07a5f" />
        <rect x="16" y="138" rx="8" width="54" height="20" fill="#e07a5f" />
        <text x="43" y="152" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">Today</text>
      </motion.g>
      <motion.circle cx="220" cy="118" r="7" fill="#f0a35a" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.55 }} />
      <motion.circle cx="392" cy="48" r="8" fill="#f4d35e" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.85 }} />
      <motion.path
        d="M 410 48 L 568 32"
        fill="none"
        stroke="#3db89a"
        strokeWidth="2.6"
        markerEnd="url(#quiz-chart-arrow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.45 }}
      />
      <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
        <circle cx="592" cy="28" r="8" fill="#3db89a" />
        <rect x="548" y="48" rx="8" width="132" height="22" fill="#3db89a" />
        <text x="614" y="63" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">After using Insight</text>
      </motion.g>
      <text x="48" y="204" textAnchor="middle" className="quiz-chart-axis">Week 1</text>
      <text x="220" y="204" textAnchor="middle" className="quiz-chart-axis">Week 2</text>
      <text x="392" y="204" textAnchor="middle" className="quiz-chart-axis">Week 3</text>
      <text x="564" y="204" textAnchor="middle" className="quiz-chart-axis">Week 4</text>
    </svg>
  );
}
