import { useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export function ResilientImage({
  src,
  alt,
  className = '',
  fallbackTitle = '재무 분석 시각 자료',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50 border border-slate-200 text-slate-600 p-8 text-center ${className}`}
      >
        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-3 text-blue-900">
          <BarChart3 className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-700">{fallbackTitle}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
