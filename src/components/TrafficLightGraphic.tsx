import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { TrafficLightGrade } from '../data/companiesData';

interface TrafficLightGraphicProps {
  grade: TrafficLightGrade;
  label: string;
  size?: 'sm' | 'md';
}

export function TrafficLightGraphic({
  grade,
  label,
  size = 'md',
}: TrafficLightGraphicProps) {
  const isSm = size === 'sm';

  const statusBadge =
    grade === 'safe' ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 whitespace-nowrap">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>종합 판정: {label}</span>
      </span>
    ) : grade === 'caution' ? (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 whitespace-nowrap">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
        <span>종합 판정: {label}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 whitespace-nowrap">
        <XCircle className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
        <span>종합 판정: {label}</span>
      </span>
    );

  return (
    <div className="inline-flex items-center gap-3">
      {/* 3-lamp Traffic Light housing */}
      <div
        role="img"
        aria-label={`신호등 상태 ${label}`}
        className={`inline-flex items-center bg-slate-900 rounded-full border border-slate-700 ${
          isSm ? 'gap-1.5 px-2.5 py-1.5' : 'gap-2 px-3 py-2'
        }`}
      >
        <span
          className={`rounded-full transition-opacity ${
            isSm ? 'w-3 h-3' : 'w-4 h-4'
          } ${
            grade === 'danger'
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.85)] opacity-100'
              : 'bg-red-950 opacity-45'
          }`}
          title="위험"
        />
        <span
          className={`rounded-full transition-opacity ${
            isSm ? 'w-3 h-3' : 'w-4 h-4'
          } ${
            grade === 'caution'
              ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)] opacity-100'
              : 'bg-amber-950 opacity-45'
          }`}
          title="주의"
        />
        <span
          className={`rounded-full transition-opacity ${
            isSm ? 'w-3 h-3' : 'w-4 h-4'
          } ${
            grade === 'safe'
              ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.85)] opacity-100'
              : 'bg-emerald-950 opacity-45'
          }`}
          title="안전"
        />
      </div>

      {statusBadge}
    </div>
  );
}
