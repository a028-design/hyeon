import { FileSearch } from 'lucide-react';

interface NotFoundViewProps {
  searchedQuery?: string;
  onGoRequest: (query?: string) => void;
  onGoHome: () => void;
}

export function NotFoundView({ searchedQuery, onGoRequest, onGoHome }: NotFoundViewProps) {
  return (
    <section className="py-20 bg-slate-50 min-h-[70vh] flex items-center">
      <div className="max-w-xl mx-auto px-6 text-center">
        <div className="mx-auto w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-900 mb-6">
          <FileSearch className="w-7 h-7" aria-hidden="true" />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight">
          일치하는 기업 정보가 없습니다
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          {searchedQuery ? (
            <>
              입력하신 <strong className="text-slate-900">&ldquo;{searchedQuery}&rdquo;</strong>에
              해당하는 기업이 아직 등록되어 있지 않거나 잘못된 경로입니다.
            </>
          ) : (
            '요청하신 페이지 경로 또는 종목코드가 올바르지 않습니다.'
          )}
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onGoRequest(searchedQuery)}
            className="px-6 py-3 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            기업 분석 요청하기
          </button>

          <button
            type="button"
            onClick={onGoHome}
            className="px-5 py-3 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer min-h-[44px]"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </section>
  );
}
