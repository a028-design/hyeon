import { Search, ArrowRight } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { COMPANIES, evaluateTrafficLight } from '../data/companiesData';
import { StatusLabel } from './StatusLabel';

interface CompanySearchBarProps {
  onSelectCompany: (code: string) => void;
  onNotFound: (query: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export function CompanySearchBar({
  onSelectCompany,
  onNotFound,
  placeholder = '기업명 또는 종목코드 검색 (예: 삼성전자, 005930, 네이버)',
  compact = false,
}: CompanySearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();

  const matches = useMemo(() => {
    if (trimmed.length < 1) return [];
    const lower = trimmed.toLowerCase();
    return COMPANIES.filter(
      (c) =>
        c.name.toLowerCase().includes(lower) ||
        c.code.toLowerCase().includes(lower) ||
        c.sector.toLowerCase().includes(lower)
    ).slice(0, 5);
  }, [trimmed]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleSelect = (code: string) => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);
    onSelectCompany(code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;

    if (activeIndex >= 0 && matches[activeIndex]) {
      handleSelect(matches[activeIndex].code);
      return;
    }

    if (matches.length > 0) {
      handleSelect(matches[0].code);
      return;
    }

    setIsOpen(false);
    onNotFound(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || matches.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? matches.length - 1 : prev - 1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit} role="search" aria-label="기업명 및 종목코드 검색">
        <div
          className={`flex items-center bg-white border border-slate-300 focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/15 rounded-xl transition-all ${
            compact ? 'px-3 py-1.5' : 'px-4 py-2'
          }`}
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.trim().length >= 1);
              setActiveIndex(-1);
            }}
            onFocus={() => {
              if (trimmed.length >= 1) setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="기업명 또는 종목코드"
            aria-autocomplete="list"
            aria-expanded={isOpen && trimmed.length >= 1}
            className={`w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none ${
              compact ? 'text-xs sm:text-sm py-1' : 'text-sm sm:text-base py-1.5'
            }`}
          />
          <button
            type="submit"
            className={`ml-2 bg-blue-900 hover:bg-blue-800 text-white font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs sm:text-sm min-h-[40px]'
            }`}
          >
            검색
          </button>
        </div>
      </form>

      {isOpen && trimmed.length >= 1 && (
        <div
          role="listbox"
          aria-label="자동완성 검색 결과"
          className="absolute z-40 left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
        >
          {matches.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {matches.map((company, idx) => {
                const tl = evaluateTrafficLight(
                  company.operatingMargin,
                  company.debtRatio,
                  company.currentRatio
                );
                const isHighlighted = idx === activeIndex;
                return (
                  <li key={company.code} role="option" aria-selected={isHighlighted}>
                    <button
                      type="button"
                      onClick={() => handleSelect(company.code)}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                        isHighlighted ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-slate-950 truncate">
                            {company.name}
                          </span>
                          <span className="font-mono text-xs text-slate-500">{company.code}</span>
                        </div>
                        <span className="text-xs text-slate-500">{company.sector}</span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <StatusLabel status={tl.status} customText={tl.label} />
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4 flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600">
                &ldquo;<strong className="text-slate-900">{trimmed}</strong>&rdquo;에 일치하는 기업이
                없습니다.
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNotFound(trimmed);
                }}
                className="px-3 py-1.5 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                상세 안내 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
