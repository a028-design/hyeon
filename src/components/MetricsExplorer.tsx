import { useState } from 'react';
import { ESSENTIAL_METRICS } from '../data/financialData';
import { StatusLabel } from './StatusLabel';

interface MetricsExplorerProps {
  onOpenSimulatorWithMetric?: () => void;
}

export function MetricsExplorer({ onOpenSimulatorWithMetric }: MetricsExplorerProps) {
  const [selectedId, setSelectedId] = useState(ESSENTIAL_METRICS[0].id);
  const current = ESSENTIAL_METRICS.find((m) => m.id === selectedId) ?? ESSENTIAL_METRICS[0];

  return (
    <section id="indicators" className="py-16 lg:py-20 border-b border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
            01. 필수 재무제표 지표 5가지
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
            매수 버튼을 누르기 전, 반드시 확인해야 할 5가지 숫자
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            수십 개의 회계 항목을 모두 외울 필요는 없습니다. 아래 다섯 가지 지표를 순서대로 선택해
            계산 원리와 좋은 기업·위험한 기업의 차이를 확인하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left selector list */}
          <div
            role="tablist"
            aria-label="필수 재무제표 지표 선택"
            className="lg:col-span-4 flex flex-col gap-2"
          >
            {ESSENTIAL_METRICS.map((metric) => {
              const isSelected = metric.id === current.id;
              return (
                <button
                  key={metric.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setSelectedId(metric.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 min-h-[44px] ${
                    isSelected
                      ? 'bg-white border-blue-900 shadow-sm'
                      : 'bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                    <span className="font-mono font-medium text-blue-900">{metric.indexLabel}</span>
                    <span>
                      {metric.category} · {metric.statementSource}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-base font-semibold text-slate-950">{metric.name}</span>
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[140px]">
                      {metric.englishName}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right detail stage */}
          <div
            role="tabpanel"
            aria-label={`${current.name} 상세 설명`}
            className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <p className="text-xs text-slate-500 mb-1">
                  {current.indexLabel} · {current.category} · 출처: {current.statementSource}
                </p>
                <h3 className="font-serif text-2xl font-bold text-slate-950">
                  {current.name}
                </h3>
              </div>
              <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="block text-[11px] text-slate-500 mb-0.5">계산 공식</span>
                <code className="font-mono text-xs sm:text-sm font-medium text-slate-900">
                  {current.formula}
                </code>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-base font-semibold text-blue-900">{current.oneLineQuestion}</p>
                <p className="mt-2 text-sm sm:text-[15px] text-slate-700 leading-relaxed">
                  {current.description}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                <p className="text-xs font-semibold text-slate-900 mb-1">초보자를 위한 비유</p>
                <p className="text-sm text-slate-700 leading-relaxed">{current.analogy}</p>
              </div>

              {/* 3-tier benchmark grid */}
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-3">판정 기준 요약</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/40">
                    <StatusLabel status="healthy" customText="양호 기준" />
                    <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {current.benchmarks.healthy}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/40">
                    <StatusLabel status="caution" customText="주의 관찰" />
                    <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {current.benchmarks.caution}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/40">
                    <StatusLabel status="risk" customText="위험 경고" />
                    <p className="mt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {current.benchmarks.risk}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabular 2-company comparison */}
              <div>
                <p className="text-xs font-semibold text-slate-900 mb-3">실전 비교 예시</p>
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                        <th className="py-2.5 px-4 font-medium">가상 기업</th>
                        <th className="py-2.5 px-4 font-medium">지표 수치</th>
                        <th className="py-2.5 px-4 font-medium">판정</th>
                        <th className="py-2.5 px-4 font-medium">해석 포인트</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[current.comparisonExample.companyA, current.comparisonExample.companyB].map(
                        (row) => (
                          <tr key={row.name} className="bg-white">
                            <td className="py-3 px-4 font-medium text-slate-900 whitespace-nowrap">
                              {row.name}
                            </td>
                            <td className="py-3 px-4 font-mono tabular-nums font-semibold text-slate-950 whitespace-nowrap">
                              {row.value}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <StatusLabel status={row.verdict} />
                            </td>
                            <td className="py-3 px-4 text-slate-600 text-xs sm:text-sm">
                              {row.note}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Beginner trap note */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <strong className="font-semibold text-slate-900">초보자 함정 주의: </strong>
                  {current.trapNote}
                </p>
                {onOpenSimulatorWithMetric && (
                  <button
                    type="button"
                    onClick={onOpenSimulatorWithMetric}
                    className="px-4 py-2 text-xs font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                  >
                    계산기로 직접 실험하기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
