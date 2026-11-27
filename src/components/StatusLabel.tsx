import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { MetricStatus } from '../data/financialData';

interface StatusLabelProps {
  status: MetricStatus;
  customText?: string;
}

export function StatusLabel({ status, customText }: StatusLabelProps) {
  if (status === 'healthy') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 whitespace-nowrap shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" aria-hidden="true" />
        <span>{customText ?? '양호'}</span>
      </span>
    );
  }

  if (status === 'caution') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 whitespace-nowrap shrink-0">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
        <span>{customText ?? '주의'}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-800 whitespace-nowrap shrink-0">
      <XCircle className="w-3.5 h-3.5 text-red-700 shrink-0" aria-hidden="true" />
      <span>{customText ?? '위험'}</span>
    </span>
  );
}
