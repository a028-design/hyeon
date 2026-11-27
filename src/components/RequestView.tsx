import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { evaluateTrafficLight, type TrafficLightResult } from '../data/companiesData';
import { TrafficLightGraphic } from './TrafficLightGraphic';

interface RequestViewProps {
  initialCompanyName?: string;
}

interface FormErrors {
  companyName?: string;
  ticker?: string;
  email?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RequestView({ initialCompanyName = '' }: RequestViewProps) {
  // REQ-09: Unregistered company analysis request form state
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [ticker, setTicker] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submittedData, setSubmittedData] = useState<{
    companyName: string;
    ticker: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (initialCompanyName) {
      setCompanyName(initialCompanyName);
      setSubmittedData(null);
    }
  }, [initialCompanyName]);

  // REQ-13: Traffic-light rule mini calculator state
  const [calcMargin, setCalcMargin] = useState('12.0');
  const [calcDebt, setCalcDebt] = useState('85');
  const [calcCurrent, setCalcCurrent] = useState('160');
  const [calcResult, setCalcResult] = useState<TrafficLightResult>(() =>
    evaluateTrafficLight(12.0, 85, 160)
  );
  const [calcError, setCalcError] = useState('');

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: FormErrors = {};

    const trimmedName = companyName.trim();
    const trimmedTicker = ticker.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      nextErrors.companyName = '분석을 요청할 기업명을 입력해 주세요.';
    }

    if (trimmedTicker && !/^[0-9A-Za-z]{6}$/.test(trimmedTicker)) {
      nextErrors.ticker = '종목코드는 6자리 숫자 또는 영문 코드로 입력해 주세요. (예: 005930)';
    }

    if (!trimmedEmail) {
      nextErrors.email = '결과 알림을 받을 이메일 주소를 입력해 주세요.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      nextErrors.email = '올바른 이메일 형식이 아닙니다. (예: user@example.com)';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setSubmittedData({
        companyName: trimmedName,
        ticker: trimmedTicker,
        email: trimmedEmail,
      });
      setCompanyName('');
      setTicker('');
      setEmail('');
    }
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const om = Number(calcMargin);
    const dr = Number(calcDebt);
    const cr = Number(calcCurrent);

    if (Number.isNaN(om) || Number.isNaN(dr) || Number.isNaN(cr)) {
      setCalcError('영업이익률, 부채비율, 유동비율 모두 숫자로 입력해 주세요.');
      return;
    }

    setCalcError('');
    setCalcResult(evaluateTrafficLight(om, dr, cr));
  };

  return (
    <section className="py-12 lg:py-16 bg-slate-50 min-h-[75vh]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
            기업 분석 요청 &amp; 판정 기준 안내
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
            찾는 기업이 없다면 직접 요청하고 기준을 체험해 보세요
          </h1>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
            아직 등록되지 않은 상장사 분석을 신청하면 3분 요약 리포트 업데이트 시 안내해 드립니다.
            오른쪽 미니 계산기로 신호등 판정 공식을 직접 테스트해 볼 수도 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* REQ-09: Analysis Request Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-serif text-xl font-bold text-slate-950 mb-1">
              미등록 기업 분석 요청
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-6">
              기업명과 알림 받으실 이메일을 입력해 주세요.
            </p>

            {submittedData && (
              <div
                role="status"
                className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div className="text-sm text-emerald-950">
                  <p className="font-semibold">분석 요청이 정상 접수되었습니다.</p>
                  <p className="mt-1 text-xs text-emerald-900 leading-relaxed">
                    요청 기업: <strong>{submittedData.companyName}</strong>
                    {submittedData.ticker ? ` (${submittedData.ticker})` : ''} · 안내 이메일:{' '}
                    <span className="font-mono">{submittedData.email}</span>
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleRequestSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="req-company-name" className="block text-sm font-medium text-slate-900 mb-1.5">
                  기업명 <span className="text-red-600">*</span>
                </label>
                <input
                  id="req-company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: undefined }));
                  }}
                  placeholder="예: 포스코홀딩스"
                  aria-invalid={Boolean(errors.companyName)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.companyName
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/15'
                  }`}
                />
                {errors.companyName && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.companyName}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="req-ticker" className="block text-sm font-medium text-slate-900 mb-1.5">
                  종목코드 <span className="text-xs font-normal text-slate-500">(선택)</span>
                </label>
                <input
                  id="req-ticker"
                  type="text"
                  value={ticker}
                  onChange={(e) => {
                    setTicker(e.target.value);
                    if (errors.ticker) setErrors((prev) => ({ ...prev, ticker: undefined }));
                  }}
                  placeholder="예: 005490 (6자리)"
                  aria-invalid={Boolean(errors.ticker)}
                  className={`w-full px-3.5 py-2.5 text-sm font-mono rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.ticker
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/15'
                  }`}
                />
                {errors.ticker && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.ticker}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="req-email" className="block text-sm font-medium text-slate-900 mb-1.5">
                  알림 받을 이메일 <span className="text-red-600">*</span>
                </label>
                <input
                  id="req-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="example@email.com"
                  aria-invalid={Boolean(errors.email)}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? 'border-red-500 focus:border-red-600 focus:ring-red-200'
                      : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900/15'
                  }`}
                />
                {errors.email && (
                  <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {errors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
              >
                기업 분석 요청 제출하기
              </button>
            </form>
          </div>

          {/* REQ-13: Traffic-light Rule Guide & Mini Calculator */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <h2 className="font-serif text-xl font-bold text-slate-950 mb-1">
              신호등 판정 기준 미니 계산기
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mb-5">
              임의의 영업이익률·부채비율·유동비율을 입력하고 &lsquo;결과 확인&rsquo;을 눌러 판정 등급을 확인하세요.
            </p>

            {/* Rule Summary */}
            <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
              <p>
                <strong className="text-emerald-800">안전(초록):</strong> 영업이익률 8% 이상 &amp; 부채비율 120% 이하 &amp; 유동비율 140% 이상
              </p>
              <p>
                <strong className="text-amber-800">주의(노랑):</strong> 위험 기준은 피했으나 영업이익률 8% 미만, 부채비율 120% 초과, 유동비율 140% 미만 중 1개 이상 해당
              </p>
              <p>
                <strong className="text-red-800">위험(빨강):</strong> 영업이익률 0% 미만(적자) 또는 부채비율 200% 초과 또는 유동비율 100% 미만
              </p>
            </div>

            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="calc-margin" className="block text-xs font-medium text-slate-700 mb-1">
                    영업이익률 (%)
                  </label>
                  <input
                    id="calc-margin"
                    type="number"
                    step="0.1"
                    value={calcMargin}
                    onChange={(e) => setCalcMargin(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label htmlFor="calc-debt" className="block text-xs font-medium text-slate-700 mb-1">
                    부채비율 (%)
                  </label>
                  <input
                    id="calc-debt"
                    type="number"
                    step="1"
                    value={calcDebt}
                    onChange={(e) => setCalcDebt(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
                <div>
                  <label htmlFor="calc-current" className="block text-xs font-medium text-slate-700 mb-1">
                    유동비율 (%)
                  </label>
                  <input
                    id="calc-current"
                    type="number"
                    step="1"
                    value={calcCurrent}
                    onChange={(e) => setCalcCurrent(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              {calcError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {calcError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-sm font-medium text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer min-h-[42px]"
              >
                결과 확인
              </button>
            </form>

            {/* Immediate Calculation Output */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <TrafficLightGraphic grade={calcResult.grade} label={calcResult.label} />
              <p className="mt-3 text-sm font-bold text-slate-950">{calcResult.headline}</p>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {calcResult.reason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
