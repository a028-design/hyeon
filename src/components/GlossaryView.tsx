import { ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { GLOSSARY_ENTRIES } from '../data/companiesData';

export function GlossaryView() {
  const [keyword, setKeyword] = useState('');
  const [expandedIds, setExpandedIds] = useState<string[]>([GLOSSARY_ENTRIES[0].id]);

  const filteredTerms = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return GLOSSARY_ENTRIES;
    return GLOSSARY_ENTRIES.filter(
      (item) =>
        item.term.toLowerCase().includes(trimmed) ||
        item.english.toLowerCase().includes(trimmed) ||
        item.summary.toLowerCase().includes(trimmed) ||
        item.analogy.toLowerCase().includes(trimmed)
    );
  }, [keyword]);

  const toggleAccordion = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="py-12 lg:py-16 bg-slate-50 min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-8">
          <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
            초보자 용어 사전
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
            어려운 회계·투자 용어를 일상 언어로 풀었습니다
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            궁금한 용어를 입력하면 실시간으로 필터링됩니다. 각 용어를 클릭하면 일상 비유와
            초보자가 참고할 수 있는 기준 수치가 펼쳐집니다.
          </p>
        </div>

        {/* Real-time keyword search input */}
        <div className="mb-6 bg-white border border-slate-300 focus-within:border-blue-900 focus-within:ring-2 focus-within:ring-blue-900/15 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="용어명이나 키워드 검색 (예: 부채, 현금, PER, 마진)"
            aria-label="재무 용어 실시간 검색"
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap cursor-pointer"
            >
              지우기
            </button>
          )}
        </div>

        <p className="mb-4 text-xs text-slate-500">
          검색 결과 <strong className="font-mono tabular-nums text-slate-900">{filteredTerms.length}</strong>건
        </p>

        {/* Accordion term list */}
        {filteredTerms.length > 0 ? (
          <div className="space-y-3">
            {filteredTerms.map((entry) => {
              const isExpanded = expandedIds.includes(entry.id);
              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(entry.id)}
                    aria-expanded={isExpanded}
                    className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-blue-900"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
                        <span>{entry.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{entry.english}</span>
                      </div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-950">{entry.term}</h2>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600">{entry.summary}</p>
                    </div>

                    <ChevronDown
                      className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-5 pt-3 border-t border-slate-100 bg-slate-50/60 space-y-3">
                      <div className="p-4 rounded-lg bg-white border border-slate-200">
                        <span className="block text-xs font-semibold text-blue-900 mb-1">
                          일상 비유로 이해하기
                        </span>
                        <p className="text-sm text-slate-700 leading-relaxed">{entry.analogy}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="block text-xs font-semibold text-slate-900 mb-1">
                            참고 기준 수치
                          </span>
                          <p className="text-slate-700 leading-relaxed">{entry.benchmark}</p>
                        </div>
                        <div className="p-3.5 rounded-lg bg-white border border-slate-200">
                          <span className="block text-xs font-semibold text-slate-900 mb-1">
                            어디서 확인하나요?
                          </span>
                          <p className="font-mono text-xs text-slate-700 leading-relaxed">
                            {entry.whereToFind}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
            <p className="text-sm font-semibold text-slate-900">
              &ldquo;{keyword}&rdquo;에 해당하는 용어가 없습니다.
            </p>
            <p className="mt-1.5 text-xs text-slate-500">
              다른 키워드를 입력하거나 검색어를 지워 전체 용어를 확인해 보세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
