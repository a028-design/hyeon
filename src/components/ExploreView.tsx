import { ArrowRight, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  COMPANIES,
  SECTORS,
  evaluateTrafficLight,
  type TrafficLightGrade,
} from '../data/companiesData';
import { TrafficLightGraphic } from './TrafficLightGraphic';

interface ExploreViewProps {
  onSelectCompany: (code: string) => void;
}

type SignalFilter = 'all' | TrafficLightGrade;
type SortKey = 'revenue-desc' | 'margin-desc' | 'debt-asc';

const SIGNAL_TABS: { key: SignalFilter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'safe', label: '안전' },
  { key: 'caution', label: '주의' },
  { key: 'danger', label: '위험' },
];

export function ExploreView({ onSelectCompany }: ExploreViewProps) {
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('전체 업종');
  const [sortBy, setSortBy] = useState<SortKey>('revenue-desc');

  const filteredAndSorted = useMemo(() => {
    const withGrade = COMPANIES.map((company) => ({
      company,
      tl: evaluateTrafficLight(company.operatingMargin, company.debtRatio, company.currentRatio),
      latestRevenue: company.yearly[company.yearly.length - 1]?.revenue ?? 0,
    }));

    const filtered = withGrade.filter(({ company, tl }) => {
      const matchSignal = signalFilter === 'all' || tl.grade === signalFilter;
      const matchSector = sectorFilter === '전체 업종' || company.sector === sectorFilter;
      return matchSignal && matchSector;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'revenue-desc') {
        return b.latestRevenue - a.latestRevenue;
      }
      if (sortBy === 'margin-desc') {
        return b.company.operatingMargin - a.company.operatingMargin;
      }
      return a.company.debtRatio - b.company.debtRatio;
    });

    return filtered;
  }, [signalFilter, sectorFilter, sortBy]);

  const resetFilters = () => {
    setSignalFilter('all');
    setSectorFilter('전체 업종');
    setSortBy('revenue-desc');
  };

  return (
    <section className="py-12 lg:py-16 bg-slate-50 min-h-[75vh]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
            신호등 탐색
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
            재무 건전성 등급과 업종으로 기업 한눈에 찾기
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            영업이익률·부채비율·유동비율 기준에 따라 자동 판정된 신호등 등급별로 기업을 걸러내고,
            매출·수익성·부채 지표 순으로 정렬해 비교해 보세요.
          </p>
        </div>

        {/* Filter & Sort Toolbar (REQ-07 & REQ-11) */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Signal tabs */}
          <div
            role="tablist"
            aria-label="신호등 등급 필터"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start"
          >
            {SIGNAL_TABS.map((tab) => {
              const isActive = signalFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSignalFilter(tab.key)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-950'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Sector & Sort dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="sector-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                업종
              </label>
              <select
                id="sector-select"
                value={sectorFilter}
                onChange={(e) => setSectorFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-900 cursor-pointer min-h-[40px]"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                정렬
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:border-blue-900 cursor-pointer min-h-[40px]"
              >
                <option value="revenue-desc">매출액 높은순</option>
                <option value="margin-desc">영업이익률순</option>
                <option value="debt-asc">부채비율 낮은순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            총 <strong className="font-mono tabular-nums text-slate-900">{filteredAndSorted.length}</strong>개 기업 표시 중
          </span>
          {(signalFilter !== 'all' || sectorFilter !== '전체 업종') && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-blue-900 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>필터 초기화</span>
            </button>
          )}
        </div>

        {/* Filtered company grid or Empty State */}
        {filteredAndSorted.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAndSorted.map(({ company, tl, latestRevenue }) => (
              <button
                key={company.code}
                type="button"
                onClick={() => onSelectCompany(company.code)}
                className="group text-left bg-white border border-slate-200 hover:border-blue-900 rounded-xl p-6 transition-colors cursor-pointer flex flex-col justify-between focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs text-slate-500">
                      {company.sector} · <span className="font-mono">{company.code}</span>
                    </span>
                    <TrafficLightGraphic grade={tl.grade} label={tl.label} size="sm" />
                  </div>

                  <h2 className="font-serif text-xl font-bold text-slate-950 group-hover:text-blue-900 transition-colors">
                    {company.name}
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                    {company.summary3Line.oneLiner}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="block text-slate-500">최근 매출</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-950">
                        {latestRevenue.toFixed(1)}조
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">영업이익률</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-950">
                        {company.operatingMargin.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="block text-slate-500">부채비율</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-950">
                        {company.debtRatio.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs font-medium text-blue-900">
                    <span>PER {company.per.toFixed(1)}배 · PBR {company.pbr.toFixed(2)}배</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>3분 요약</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <p className="text-base font-semibold text-slate-900">
              선택한 조건에 일치하는 기업이 없습니다.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              신호등 등급이나 업종 필터를 변경해 다른 기업을 확인해 보세요.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>전체 기업 다시 보기</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
