import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { ArrowLeft, Bookmark, Check, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  COMPANIES,
  evaluateTrafficLight,
  type CompanyProfile,
} from '../data/companiesData';
import { CompanySearchBar } from './CompanySearchBar';
import { InlineTermTooltip, RichTextWithTerms } from './InlineTermTooltip';
import { TrafficLightGraphic } from './TrafficLightGraphic';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

interface SummaryReportViewProps {
  company: CompanyProfile;
  isBookmarked: boolean;
  onToggleBookmark: (code: string) => void;
  onSelectCompany: (code: string) => void;
  onNotFound: (query: string) => void;
  onBackExplore: () => void;
}

export function SummaryReportView({
  company,
  isBookmarked,
  onToggleBookmark,
  onSelectCompany,
  onNotFound,
  onBackExplore,
}: SummaryReportViewProps) {
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = window.setTimeout(() => setToastVisible(false), 2000);
    return () => window.clearTimeout(timer);
  }, [toastVisible]);

  const trafficLight = evaluateTrafficLight(
    company.operatingMargin,
    company.debtRatio,
    company.currentRatio
  );

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#summary/${company.code}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = shareUrl;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
    } catch {
      // Clipboard fallback ignored; still notify user
    }
    setToastVisible(true);
  };

  // Chart.js 3-Year Revenue & Operating Profit Bar Chart Data (REQ-05)
  const barData = {
    labels: company.yearly.map((y) => `${y.year}년`),
    datasets: [
      {
        label: '매출액 (조 원)',
        data: company.yearly.map((y) => y.revenue),
        backgroundColor: '#1E3A8A',
        borderRadius: 4,
        barPercentage: 0.65,
      },
      {
        label: '영업이익 (조 원)',
        data: company.yearly.map((y) => y.operatingProfit),
        backgroundColor: company.yearly.map((y) =>
          y.operatingProfit >= 0 ? '#059669' : '#DC2626'
        ),
        borderRadius: 4,
        barPercentage: 0.65,
      },
    ],
  };

  const barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          boxWidth: 12,
          usePointStyle: false,
          color: '#334155',
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: '#0F172A',
        padding: 12,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          label: (ctx) => {
            const idx = ctx.dataIndex;
            const datasetIdx = ctx.datasetIndex;
            const currentVal = ctx.parsed.y ?? 0;
            const label = ctx.dataset.label?.replace(' (조 원)', '') ?? '';

            let yoyText = '기준 연도';
            if (idx > 0) {
              const prevVal =
                datasetIdx === 0
                  ? company.yearly[idx - 1].revenue
                  : company.yearly[idx - 1].operatingProfit;

              if (prevVal === 0) {
                yoyText = '전년 0';
              } else if (prevVal < 0 && currentVal > 0) {
                yoyText = '전년 대비 흑자전환';
              } else if (prevVal > 0 && currentVal < 0) {
                yoyText = '전년 대비 적자전환';
              } else {
                const pct = ((currentVal - prevVal) / Math.abs(prevVal)) * 100;
                const sign = pct >= 0 ? '+' : '';
                yoyText = `전년 대비 ${sign}${pct.toFixed(1)}%`;
              }
            }

            return `${label}: ${currentVal.toLocaleString('ko-KR', {
              maximumFractionDigits: 2,
            })}조 원 (${yoyText})`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#475569', font: { size: 12 } },
      },
      y: {
        grid: { color: '#E2E8F0' },
        ticks: {
          color: '#475569',
          font: { size: 11 },
          callback: (val) => `${val}조`,
        },
      },
    },
  };

  // Chart.js Debt Ratio Semicircle Gauge (REQ-05)
  const maxGaugeScale = 250;
  const clampedDebt = Math.min(company.debtRatio, maxGaugeScale);
  const remainingGauge = Math.max(0, maxGaugeScale - clampedDebt);
  const gaugeColor =
    company.debtRatio <= 120
      ? '#059669'
      : company.debtRatio <= 200
        ? '#D97706'
        : '#DC2626';

  const gaugeData = {
    labels: ['부채비율', '여유 구간'],
    datasets: [
      {
        data: [clampedDebt, remainingGauge],
        backgroundColor: [gaugeColor, '#E2E8F0'],
        borderWidth: 0,
      },
    ],
  };

  const gaugeOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: -90,
    cutout: '74%',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ctx.dataIndex === 0
              ? `현재 부채비율: ${company.debtRatio.toFixed(1)}%`
              : `게이지 최대 기준(250%) 대비 잔여 폭`,
        },
      },
    },
  };

  const latestYearly = company.yearly[company.yearly.length - 1];
  const prevYearly = company.yearly[company.yearly.length - 2];
  const revenueGrowth =
    prevYearly && prevYearly.revenue > 0
      ? ((latestYearly.revenue - prevYearly.revenue) / prevYearly.revenue) * 100
      : 0;

  return (
    <section className="py-10 lg:py-14 bg-slate-50 min-h-[75vh]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Top utility bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={onBackExplore}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-950 transition-colors self-start cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            <span>신호등 탐색으로 돌아가기</span>
          </button>

          <div className="w-full md:w-96">
            <CompanySearchBar
              compact
              onSelectCompany={onSelectCompany}
              onNotFound={onNotFound}
              placeholder="다른 기업 검색 (기업명 · 종목코드)"
            />
          </div>
        </div>

        {/* Report Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                <span>{company.sector}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">종목코드 {company.code}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  시가총액 {company.marketCapTrillion.toLocaleString('ko-KR')}조 원
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
                {company.name} 3분 재무 요약
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onToggleBookmark(company.code)}
                aria-pressed={isBookmarked}
                className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
                  isBookmarked
                    ? 'bg-blue-50 border-blue-900 text-blue-900'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark
                  className={`w-4 h-4 ${isBookmarked ? 'fill-blue-900 text-blue-900' : ''}`}
                  aria-hidden="true"
                />
                <span>{isBookmarked ? '찜한 기업 저장됨' : '관심 기업 저장'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[42px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                <Share2 className="w-4 h-4" aria-hidden="true" />
                <span>공유하기</span>
              </button>
            </div>
          </div>

          {/* REQ-03: Comprehensive Traffic Light Banner */}
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <TrafficLightGraphic grade={trafficLight.grade} label={trafficLight.label} />
              <p className="text-base sm:text-lg font-bold text-slate-950 pt-1">
                {trafficLight.headline}
              </p>
              <p className="text-sm text-slate-600 leading-relaxed">{trafficLight.reason}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 shrink-0">
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="영업이익률" />
                </span>
                <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-slate-950">
                  {company.operatingMargin.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="부채비율" />
                </span>
                <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-slate-950">
                  {company.debtRatio.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="유동비율" />
                </span>
                <span className="font-mono tabular-nums text-base sm:text-lg font-bold text-slate-950">
                  {company.currentRatio.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* REQ-04 & REQ-06: 3-Line Financial Summary Card with Inline Tooltips */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
            <h2 className="font-serif text-xl font-bold text-slate-950">
              AI 3줄 재무 요약
            </h2>
            <p className="text-xs text-slate-500">
              점선 밑줄이 있는 재무 용어에 마우스를 올리거나 클릭하면 쉬운 설명이 열립니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/30">
              <p className="text-xs font-bold text-emerald-800 mb-2">[강점]</p>
              <p className="text-sm text-slate-800 leading-relaxed">
                <RichTextWithTerms text={company.summary3Line.strength} />
              </p>
            </div>

            <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/30">
              <p className="text-xs font-bold text-amber-800 mb-2">[리스크]</p>
              <p className="text-sm text-slate-800 leading-relaxed">
                <RichTextWithTerms text={company.summary3Line.risk} />
              </p>
            </div>

            <div className="p-5 rounded-xl border border-blue-200 bg-blue-50/30">
              <p className="text-xs font-bold text-blue-900 mb-2">[종합 한줄]</p>
              <p className="text-sm font-medium text-slate-900 leading-relaxed">
                <RichTextWithTerms text={company.summary3Line.oneLiner} />
              </p>
            </div>
          </div>
        </div>

        {/* REQ-05: 3대 핵심 지표(수익·안정·성장) 시각화 (Chart.js) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* 3-year Revenue & Operating Profit Bar Chart */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-slate-950">
                  최근 3개년 매출액 · 영업이익 추이
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  막대에 마우스를 올리면 연도별 정확한 금액과 전년 대비 증감률이 표시됩니다.
                </p>
              </div>
              <span className="font-mono tabular-nums text-xs font-medium text-blue-900">
                최근 매출 전년 대비 {revenueGrowth >= 0 ? '+' : ''}
                {revenueGrowth.toFixed(1)}%
              </span>
            </div>

            <div className="h-72 w-full">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          {/* Debt Ratio Gauge & Valuation KPIs (PER / PBR / ROE / OCF) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-slate-950 mb-1">
                안정성 게이지 &amp; 핵심 배수
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                <InlineTermTooltip termKey="부채비율" /> 120% 이하 안전 · 200% 초과 위험
              </p>

              <div className="relative h-40 w-full flex items-center justify-center">
                <Doughnut data={gaugeData} options={gaugeOptions} />
                <div className="absolute bottom-3 text-center pointer-events-none">
                  <span className="block text-[11px] text-slate-500">부채비율</span>
                  <span className="font-mono tabular-nums text-2xl font-bold text-slate-950">
                    {company.debtRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="PER" />
                </span>
                <span className="font-mono tabular-nums text-base font-bold text-slate-950">
                  {company.per.toFixed(1)}배
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="PBR" />
                </span>
                <span className="font-mono tabular-nums text-base font-bold text-slate-950">
                  {company.pbr.toFixed(2)}배
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="ROE" />
                </span>
                <span className="font-mono tabular-nums text-base font-bold text-slate-950">
                  {company.roe.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-500">
                  <InlineTermTooltip termKey="영업활동현금흐름" label="현금흐름 비율" />
                </span>
                <span className="font-mono tabular-nums text-base font-bold text-slate-950">
                  {company.ocfRatio}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick switch other companies */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
          <span className="text-xs font-medium text-slate-600">다른 대표 기업 3분 요약 바로 보기</span>
          <div className="flex flex-wrap items-center gap-2">
            {COMPANIES.filter((c) => c.code !== company.code)
              .slice(0, 5)
              .map((other) => (
                <button
                  key={other.code}
                  type="button"
                  onClick={() => onSelectCompany(other.code)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                >
                  {other.name}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* REQ-12: 2-second Toast Notification */}
      {toastVisible && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg"
        >
          <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          <span>링크가 복사되었습니다</span>
        </div>
      )}
    </section>
  );
}
