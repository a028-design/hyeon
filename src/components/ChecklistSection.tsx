import { Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { BEGINNER_CHECKLIST } from '../data/financialData';

interface ChecklistSectionProps {
  onNavigateSimulator: () => void;
}

export function ChecklistSection({ onNavigateSimulator }: ChecklistSectionProps) {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const completedCount = checkedIds.length;
  const totalCount = BEGINNER_CHECKLIST.length;
  const isAllDone = completedCount === totalCount;

  return (
    <section id="checklist" className="py-16 lg:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
              04. 실전 투자 전 최종 점검
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
              매수 전 60초 재무 체크리스트
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              실제 종목을 고를 때 아래 6가지 항목을 순서대로 체크해 보세요. 한두 개라도
              충족되지 않는다면 이유를 납득할 때까지 투자를 늦추는 습관이 손실을 줄여 줍니다.
            </p>

            <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs font-medium text-slate-600">점검 진행률</span>
                <span className="font-mono tabular-nums text-sm font-semibold text-slate-950">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-900 transition-transform duration-200 origin-left"
                  style={{
                    transform: `scaleX(${completedCount / totalCount})`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                {isAllDone
                  ? '모든 기본 재무 건전성 항목을 확인했습니다. 이제 기업의 사업 전망과 주가 수준(PER·PBR)을 검토할 단계입니다.'
                  : '각 항목을 클릭해 점검 완료 상태로 표시할 수 있습니다.'}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onNavigateSimulator}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                >
                  자가진단 다시 해보기
                </button>
                {completedCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setCheckedIds([])}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
                  >
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>체크 초기화</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-3">
            {BEGINNER_CHECKLIST.map((item) => {
              const isChecked = checkedIds.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  aria-pressed={isChecked}
                  className={`w-full text-left p-5 rounded-xl border transition-colors cursor-pointer flex items-start gap-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
                    isChecked
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <span
                    className={`mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-emerald-700 border-emerald-700 text-white'
                        : 'bg-white border-slate-300 text-transparent'
                    }`}
                    aria-hidden="true"
                  >
                    <Check className="w-4 h-4" />
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 mb-1">
                      <span className="font-mono font-medium text-blue-900">{item.step}</span>
                      <span>확인 위치 · {item.whereToCheck}</span>
                    </div>
                    <p
                      className={`text-sm sm:text-base font-semibold ${
                        isChecked ? 'text-slate-600 line-through' : 'text-slate-950'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
