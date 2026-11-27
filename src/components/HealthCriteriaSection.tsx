import { useState } from 'react';
import { INDUSTRY_PROFILES, type IndustryKey } from '../data/financialData';
import { ResilientImage } from './ResilientImage';
import { StatusLabel } from './StatusLabel';

const READING_STEPS = [
  {
    step: '01. 손익계산서',
    focus: '영업이익률 · ROE',
    summary: '먼저 매출과 영업이익을 통해 회사가 본업에서 꾸준히 돈을 벌고 있는지 확인합니다.',
  },
  {
    step: '02. 재무상태표',
    focus: '부채비율 · 유동비율',
    summary: '다음으로 빌린 빚이 지나치게 많지 않은지, 1년 내 갚을 단기 부채를 막을 현금이 있는지 점검합니다.',
  },
  {
    step: '03. 현금흐름표',
    focus: '영업활동현금흐름',
    summary: '마지막으로 장부상 흑자가 실제 현금 입금으로 이어지는지 검증해 흑자도산 위험을 거릅니다.',
  },
];

export function HealthCriteriaSection() {
  const [activeIndustry, setActiveIndustry] = useState<IndustryKey>('manufacturing');
  const currentProfile =
    INDUSTRY_PROFILES.find((p) => p.key === activeIndustry) ?? INDUSTRY_PROFILES[0];

  return (
    <section id="health-criteria" className="py-16 lg:py-20 border-b border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch mb-14">
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
                02. 기업 재무 건전성 평가 기준
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
                업종에 따라 달라지는 건전성 합격선
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
                재무제표의 3대 축인 손익계산서·재무상태표·현금흐름표는 서로 연결되어 있습니다.
                한 가지 숫자만 보지 않고 세 표를 순서대로 교차 검증할 때 비로소 기업의 체력이 보입니다.
              </p>
            </div>

            <div className="mt-8 divide-y divide-slate-200 border-t border-b border-slate-200">
              {READING_STEPS.map((item) => (
                <div key={item.step} className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                  <div className="w-40 shrink-0">
                    <span className="text-sm font-semibold text-slate-950 block">{item.step}</span>
                    <span className="text-xs font-mono text-blue-900">{item.focus}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="h-full min-h-[260px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <ResilientImage
                src="/src/assets/images/diagram_three_statements_1795762556976.jpg"
                alt="손익계산서, 재무상태표, 현금흐름표의 균형을 표현한 3차원 기하학 도표"
                fallbackTitle="3대 재무제표 균형 구조"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Industry benchmark matrix */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-bold text-slate-950">업종별 재무 건전성 판정 매트릭스</h3>
              <p className="mt-1 text-sm text-slate-600">{currentProfile.summary}</p>
            </div>

            <div
              role="group"
              aria-label="업종 기준 선택"
              className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 rounded-lg shrink-0"
            >
              {INDUSTRY_PROFILES.map((profile) => {
                const isActive = profile.key === activeIndustry;
                return (
                  <button
                    key={profile.key}
                    type="button"
                    onClick={() => setActiveIndustry(profile.key)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
                      isActive
                        ? 'bg-white text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {profile.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 overflow-x-auto bg-white border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
                  <th className="py-3 px-4 font-semibold">평가 영역 · 지표</th>
                  <th className="py-3 px-4 font-semibold">
                    <StatusLabel status="healthy" customText="양호 기준" />
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    <StatusLabel status="caution" customText="주의 관찰" />
                  </th>
                  <th className="py-3 px-4 font-semibold">
                    <StatusLabel status="risk" customText="위험 경고" />
                  </th>
                  <th className="py-3 px-4 font-semibold">평가 이유</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {currentProfile.criteria.map((row) => (
                  <tr key={row.metric} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="block text-xs text-slate-500">{row.pillar}</span>
                      <span className="font-semibold text-slate-950">{row.metric}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-emerald-800 font-medium whitespace-nowrap">
                      {row.healthy}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-amber-800 whitespace-nowrap">
                      {row.caution}
                    </td>
                    <td className="py-3.5 px-4 font-mono tabular-nums text-red-800 whitespace-nowrap">
                      {row.risk}
                    </td>
                    <td className="py-3.5 px-4 text-xs sm:text-sm text-slate-600 min-w-[220px]">
                      {row.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
