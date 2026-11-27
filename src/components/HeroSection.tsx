import { ArrowRight } from 'lucide-react';
import { COMPANIES, evaluateTrafficLight } from '../data/companiesData';
import { CompanySearchBar } from './CompanySearchBar';
import { ResilientImage } from './ResilientImage';
import { StatusLabel } from './StatusLabel';

interface HeroSectionProps {
  onSelectCompany: (code: string) => void;
  onNotFound: (query: string) => void;
  onExplore: () => void;
  onScrollToIndicators: () => void;
}

const FEATURED_CODES = ['005930', '035420', '000270', '139480'];

export function HeroSection({
  onSelectCompany,
  onNotFound,
  onExplore,
  onScrollToIndicators,
}: HeroSectionProps) {
  const featuredCompanies = COMPANIES.filter((c) => FEATURED_CODES.includes(c.code));

  return (
    <section id="top" className="border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-1">
            <div>
              <p className="text-xs font-medium text-slate-500 tracking-wide mb-3">
                주식 초보자를 위한 3분 재무 분석 · 필수 지표 5가지 &amp; 건전성 신호등
              </p>

              <h1
                className="font-serif font-bold text-slate-950 tracking-tight leading-[1.22] text-balance"
                style={{ fontSize: 'clamp(2.1rem, 3.6vw, 3.1rem)' }}
              >
                숫자 다섯 개로 읽는
                <br />
                3분 기업 가치 판단
              </h1>

              <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                기업명이나 종목코드를 검색하면 최근 3개년 매출·영업이익 차트, 부채비율 게이지,
                PER·PBR, 그리고 신호등 건전성 판정까지 한눈에 확인할 수 있습니다.
              </p>

              {/* REQ-02: Autocomplete Search Bar directly in Hero */}
              <div className="mt-6">
                <CompanySearchBar
                  onSelectCompany={onSelectCompany}
                  onNotFound={onNotFound}
                />
                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>바로 보기:</span>
                  {['005930', '000660', '035420', '005380', '003490'].map((code) => {
                    const c = COMPANIES.find((item) => item.code === code);
                    if (!c) return null;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => onSelectCompany(c.code)}
                        className="text-slate-700 hover:text-blue-900 underline underline-offset-4 decoration-slate-300 cursor-pointer"
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={onExplore}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 min-h-[44px]"
              >
                <span>신호등 기업 전체 탐색</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onScrollToIndicators}
                className="inline-flex items-center px-2 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-950 underline underline-offset-4 decoration-slate-300 hover:decoration-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[44px]"
              >
                필수 재무 지표 5가지 배우기
              </button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] lg:min-h-[380px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src="/src/assets/images/hero_financial_desk_1795762556308.jpg"
                alt="기업 연간 재무보고서와 만년필이 놓인 분석 데스크"
                fallbackTitle="기업 재무제표 리포트 분석 환경"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Featured quick 3-minute summary strip */}
        <div className="mt-10 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featuredCompanies.map((company) => {
            const tl = evaluateTrafficLight(
              company.operatingMargin,
              company.debtRatio,
              company.currentRatio
            );
            return (
              <button
                key={company.code}
                type="button"
                onClick={() => onSelectCompany(company.code)}
                className="group text-left p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-900 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs text-slate-500">{company.code}</span>
                  <StatusLabel status={tl.status} customText={tl.label} />
                </div>
                <p className="text-base font-bold text-slate-950 group-hover:text-blue-900 transition-colors">
                  {company.name}
                </p>
                <p className="mt-1 font-mono tabular-nums text-xs text-slate-600">
                  영업이익률 {company.operatingMargin.toFixed(1)}% · 부채 {company.debtRatio.toFixed(0)}%
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
