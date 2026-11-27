import { Fragment, useEffect, useRef, useState } from 'react';
import { INLINE_TERMS } from '../data/companiesData';

interface InlineTermTooltipProps {
  termKey: keyof typeof INLINE_TERMS | string;
  label?: string;
}

export function InlineTermTooltip({ termKey, label }: InlineTermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const def = INLINE_TERMS[termKey];

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [isOpen]);

  if (!def) {
    return <span>{label ?? termKey}</span>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-expanded={isOpen}
        className="font-medium text-blue-950 border-b border-dotted border-blue-700 hover:text-blue-800 hover:border-blue-900 cursor-help focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 rounded-xs transition-colors"
      >
        {label ?? termKey}
      </button>

      {isOpen && (
        <span
          role="tooltip"
          className="absolute z-30 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 sm:w-72 p-3 rounded-lg bg-slate-900 text-white text-xs leading-relaxed shadow-lg pointer-events-none"
        >
          <span className="block font-semibold text-blue-200 mb-1">{def.term}</span>
          <span className="block text-slate-100">{def.shortDesc}</span>
        </span>
      )}
    </span>
  );
}

const TERM_KEYS = Object.keys(INLINE_TERMS).sort((a, b) => b.length - a.length);
const TERM_REGEX = new RegExp(`(${TERM_KEYS.join('|')})`, 'g');

export function RichTextWithTerms({ text }: { text: string }) {
  const parts = text.split(TERM_REGEX);

  return (
    <>
      {parts.map((part, idx) => {
        if (INLINE_TERMS[part]) {
          return <InlineTermTooltip key={`${part}-${idx}`} termKey={part} />;
        }
        return <Fragment key={idx}>{part}</Fragment>;
      })}
    </>
  );
}
