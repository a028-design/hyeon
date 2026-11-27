import { ArrowRight, Bookmark, Trash2 } from 'lucide-react';
import { COMPANIES, evaluateTrafficLight } from '../data/companiesData';
import { TrafficLightGraphic } from './TrafficLightGraphic';

interface BookmarkedCompaniesSectionProps {
  bookmarkedCodes: string[];
  onSelectCompany: (code: string) => void;
  onRemoveBookmark: (code: string) => void;
  onExplore: () => void;
}

export function BookmarkedCompaniesSection({
  bookmarkedCodes,
  onSelectCompany,
  onRemoveBookmark,
  onExplore,
}: BookmarkedCompaniesSectionProps) {
  const savedCompanies = COMPANIES.filter((c) => bookmarkedCodes.includes(c.code));

  return (
    <section id="bookmarks" className="py-14 lg:py-16 border-t border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
              개인 관심 목록
            </p>
            <h2 className="font-serif text-2xl font-bold text-slate-950 tracking-tight">
              내가 찜한 기업
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              3분 재무 요약 페이지에서 저장한 기업이 브라우저에 보관되어 언제든 다시 볼 수 있습니다.
            </p>
          </div>

          <button
            type="button"
            onClick={onExplore}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-900 hover:underline whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>더 많은 기업 탐색하기</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {savedCompanies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {savedCompanies.map((company) => {
              const tl = evaluateTrafficLight(
                company.operatingMargin,
                company.debtRatio,
                company.currentRatio
              );
              return (
                <div
                  key={company.code}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs text-slate-500">
                        {company.sector} · <span className="font-mono">{company.code}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(company.code)}
                        aria-label={`${company.name} 찜 해제`}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-serif text-lg font-bold text-slate-950">
                        {company.name}
                      </h3>
                      <TrafficLightGraphic grade={tl.grade} label={tl.label} size="sm" />
                    </div>

                    <p className="font-mono tabular-nums text-xs text-slate-600">
                      영업이익률 {company.operatingMargin.toFixed(1)}% · 부채비율{' '}
                      {company.debtRatio.toFixed(1)}% · PER {company.per.toFixed(1)}배
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectCompany(company.code)}
                    className="mt-4 w-full py-2.5 px-4 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>3분 재무 요약 바로 보기</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                <Bookmark className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  아직 저장한 관심 기업이 없습니다.
                </p>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  3분 재무 요약 페이지 상단의 &lsquo;관심 기업 저장&rsquo; 버튼을 누르면 이곳에 바로 모아볼 수 있습니다.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onExplore}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
            >
              신호등 탐색 열기
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
