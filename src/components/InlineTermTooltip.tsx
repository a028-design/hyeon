import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { INLINE_TERMS } from '../data/companiesData';

interface InlineTermTooltipProps {
  termKey: keyof typeof INLINE_TERMS | string;
  label?: string;
}

export function InlineTermTooltip({ termKey, label }: InlineTermTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'top' | 'bottom'>('top');
  const [shiftX, setShiftX] = useState(0);
  const containerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const def = INLINE_TERMS[termKey];

  useEffect(() => {
    if (!isOpen) return;

    const handleOutside = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current || !tooltipRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const tipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 12;

    // Flip below if not enough room above trigger
    if (triggerRect.top - tipRect.height - 12 < margin) {
      setPlacement('bottom');
    } else {
      setPlacement('top');
    }

    // Prevent horizontal clipping on mobile viewports
    const desiredCenter = triggerRect.left + triggerRect.width / 2;
    const desiredLeft = desiredCenter - tipRect.width / 2;
    const desiredRight = desiredCenter + tipRect.width / 2;

    let delta = 0;
    if (desiredLeft < margin) {
      delta = margin - desiredLeft;
    } else if (desiredRight > window.innerWidth - margin) {
      delta = window.innerWidth - margin - desiredRight;
    }
    setShiftX(delta);
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
        onBlur={(e) => {
          if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
            setIsOpen(false);
          }
        }}
        aria-expanded={isOpen}
        className="font-medium text-blue-950 border-b border-dotted border-blue-700 hover:text-blue-800 hover:border-blue-900 cursor-help focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 rounded-xs transition-colors"
      >
        {label ?? termKey}
      </button>

      {isOpen && (
        <span
          ref={tooltipRef}
          role="tooltip"
          style={{
            transform: `translateX(calc(-50% + ${shiftX}px))`,
          }}
          className={`absolute z-30 left-1/2 w-64 sm:w-72 p-3 rounded-lg bg-slate-900 text-white text-xs leading-relaxed shadow-lg ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          }`}
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
