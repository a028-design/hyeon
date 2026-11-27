import { RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  SIMULATOR_PRESETS,
  type MetricStatus,
  type SimulatorInput,
} from '../data/financialData';
import { StatusLabel } from './StatusLabel';

interface EvaluationRow {
  key: keyof SimulatorInput;
  label: string;
  formattedValue: string;
  targetText: string;
  status: MetricStatus;
  normalizedScore: number; // 0 to 100 for radar visualization
  feedback: string;
}

function evaluateMetrics(input: SimulatorInput): {
  rows: EvaluationRow[];
  healthyCount: number;
  cautionCount: number;
  riskCount: number;
  overallStatus: MetricStatus;
  overallTitle: string;
  overallSummary: string;
} {
  // 1. Operating Margin
  const omStatus: MetricStatus =
    input.operatingMargin >= 10 ? 'healthy' : input.operatingMargin >= 4 ? 'caution' : 'risk';
  const omScore = Math.max(5, Math.min(100, ((input.operatingMargin + 10) / 35) * 100));
  const omFeedback =
    omStatus === 'healthy'
      ? '본업에서 충분한 마진을 남기고 있어 원가 변동 방어력이 높습니다.'
      : omStatus === 'caution'
        ? '평균적인 수익성입니다. 경쟁 심화로 마진이 깎이는 추세인지 확인하세요.'
        : '영업이익률이 매우 낮거나 적자 상태입니다. 본업 수익 모델 점검이 시급합니다.';

  // 2. ROE
  const roeStatus: MetricStatus =
    input.roe >= 10 ? 'healthy' : input.roe >= 5 ? 'caution' : 'risk';
  const roeScore = Math.max(5, Math.min(100, ((input.roe + 10) / 35) * 100));
  const roeFeedback =
    roeStatus === 'healthy'
      ? input.debtRatio > 200
        ? 'ROE 수치는 높지만 부채비율이 높아 차입 레버리지 착시 여부를 함께 살펴야 합니다.'
        : '자기자본을 효율적으로 굴려 주주 가치를 빠르게 키우고 있습니다.'
      : roeStatus === 'caution'
        ? '시중 예금 금리를 조금 웃도는 수준입니다. 자본 효율 개선 여지를 확인하세요.'
        : '자본 효율이 낮거나 순손실 구간입니다. 투자 매력도가 떨어질 수 있습니다.';

  // 3. Debt Ratio (lower is healthier)
  const debtStatus: MetricStatus =
    input.debtRatio <= 100 ? 'healthy' : input.debtRatio <= 200 ? 'caution' : 'risk';
  const debtScore = Math.max(5, Math.min(100, ((350 - input.debtRatio) / 320) * 100));
  const debtFeedback =
    debtStatus === 'healthy'
      ? '자기자본 대비 부채 비중이 낮아 금리 상승기에도 재무 부담이 작습니다.'
      : debtStatus === 'caution'
        ? '감내 가능한 수준이나 차입금 이자 비용이 영업이익을 잠식하지 않는지 확인하세요.'
        : '부채비율이 200%를 초과해 이자 부담과 유상증자 등 재무 리스크가 높습니다.';

  // 4. Current Ratio
  const currStatus: MetricStatus =
    input.currentRatio >= 150 ? 'healthy' : input.currentRatio >= 100 ? 'caution' : 'risk';
  const currScore = Math.max(5, Math.min(100, ((input.currentRatio - 30) / 220) * 100));
  const currFeedback =
    currStatus === 'healthy'
      ? '1년 내 만기가 도래하는 부채를 충분히 상환할 단기 유동성을 확보했습니다.'
      : currStatus === 'caution'
        ? '단기 지급 능력은 보통이지만 재고자산이 과도하게 쌓여 있지 않은지 확인하세요.'
        : '유동부채가 유동자산보다 많아 단기 자금 경색 위험이 존재합니다.';

  // 5. Operating Cash Flow vs Net Income Ratio
  const ocfStatus: MetricStatus =
    input.ocfRatio >= 100 ? 'healthy' : input.ocfRatio > 0 ? 'caution' : 'risk';
  const ocfScore = Math.max(5, Math.min(100, ((input.ocfRatio + 60) / 220) * 100));
  const ocfFeedback =
    ocfStatus === 'healthy'
      ? '당기순이익 이상으로 실제 현금이 유입되고 있어 이익의 질이 매우 우수합니다.'
      : ocfStatus === 'caution'
        ? '현금은 플러스(+)이나 순이익보다 적습니다. 매출채권·재고 증가 여부를 확인하세요.'
        : '현금흐름이 마이너스(-)입니다. 흑자 상태라도 현금 고갈(흑자도산) 주의가 필요합니다.';

  const rows: EvaluationRow[] = [
    {
      key: 'operatingMargin',
      label: '영업이익률',
      formattedValue: `${input.operatingMargin.toFixed(1)}%`,
      targetText: '10.0% 이상',
      status: omStatus,
      normalizedScore: omScore,
      feedback: omFeedback,
    },
    {
      key: 'roe',
      label: 'ROE (자기자본이익률)',
      formattedValue: `${input.roe.toFixed(1)}%`,
      targetText: '10.0% 이상',
      status: roeStatus,
      normalizedScore: roeScore,
      feedback: roeFeedback,
    },
    {
      key: 'debtRatio',
      label: '부채비율',
      formattedValue: `${input.debtRatio}%`,
      targetText: '100% 이하',
      status: debtStatus,
      normalizedScore: debtScore,
      feedback: debtFeedback,
    },
    {
      key: 'currentRatio',
      label: '유동비율',
      formattedValue: `${input.currentRatio}%`,
      targetText: '150% 이상',
      status: currStatus,
      normalizedScore: currScore,
      feedback: currFeedback,
    },
    {
      key: 'ocfRatio',
      label: '순이익 대비 영업현금흐름',
      formattedValue: `${input.ocfRatio}%`,
      targetText: '100% 이상 (+)',
      status: ocfStatus,
      normalizedScore: ocfScore,
      feedback: ocfFeedback,
    },
  ];

  const healthyCount = rows.filter((r) => r.status === 'healthy').length;
  const cautionCount = rows.filter((r) => r.status === 'caution').length;
  const riskCount = rows.filter((r) => r.status === 'risk').length;

  let overallStatus: MetricStatus = 'healthy';
  let overallTitle = '전반적 재무 건전성 양호';
  let overallSummary =
    '수익성·안정성·현금흐름의 균형이 잘 잡혀 있습니다. 최근 3년 추세와 밸류에이션(PER/PBR)을 추가로 확인해 보세요.';

  if (riskCount >= 2 || (riskCount === 1 && healthyCount <= 2)) {
    overallStatus = 'risk';
    overallTitle = '재무 위험 신호 감지 (추가 검증 필수)';
    overallSummary =
      '위험 구간에 진입한 지표가 확인됩니다. 초보 투자자라면 원인이 일시적 투자 때문인지 구조적 적자·차입 때문인지 사업보고서 주석 확인 전 매수를 보류하는 편이 안전합니다.';
  } else if (riskCount === 1 || cautionCount >= 2) {
    overallStatus = 'caution';
    overallTitle = '일부 지표 점검 필요';
    overallSummary =
      '핵심 체력은 유지되고 있으나 주의가 필요한 항목이 있습니다. 동종 업계 평균과 비교해 업종 특성인지 개별 기업 약점인지 구분해 보세요.';
  }

  return {
    rows,
    healthyCount,
    cautionCount,
    riskCount,
    overallStatus,
    overallTitle,
    overallSummary,
  };
}

function RadarBalanceChart({ rows }: { rows: EvaluationRow[] }) {
  const size = 260;
  const center = size / 2;
  const maxRadius = 86;

  const getPoint = (index: number, valuePercent: number) => {
    const angle = (Math.PI * 2 * index) / rows.length - Math.PI / 2;
    const r = (valuePercent / 100) * maxRadius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const gridLevels = [33, 66, 100];
  const healthyBaseline = rows.map((_, idx) => getPoint(idx, 68));
  const dataPoints = rows.map((row, idx) => getPoint(idx, row.normalizedScore));

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ' Z';

  const shortLabels = ['영업이익률', 'ROE', '부채안정', '유동성', '현금흐름'];

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-[260px] h-auto"
        role="img"
        aria-label="5대 재무 지표 균형 분포 차트"
      >
        {/* Grid rings */}
        {gridLevels.map((lvl) => {
          const pts = rows.map((_, idx) => getPoint(idx, lvl));
          return (
            <path
              key={lvl}
              d={toPath(pts)}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Axis spokes */}
        {rows.map((_, idx) => {
          const outer = getPoint(idx, 100);
          return (
            <line
              key={idx}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#E2E8F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Healthy threshold reference polygon */}
        <path
          d={toPath(healthyBaseline)}
          fill="rgba(5, 150, 105, 0.06)"
          stroke="#059669"
          strokeWidth="1.25"
          strokeDasharray="4 3"
        />

        {/* Current company polygon */}
        <path
          d={toPath(dataPoints)}
          fill="rgba(30, 58, 138, 0.16)"
          stroke="#1E3A8A"
          strokeWidth="2"
        />

        {/* Vertex dots */}
        {dataPoints.map((pt, idx) => (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r="3.5"
            fill="#1E3A8A"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        ))}

        {/* Axis labels */}
        {rows.map((_, idx) => {
          const angle = (Math.PI * 2 * idx) / rows.length - Math.PI / 2;
          const labelR = maxRadius + 24;
          const x = center + labelR * Math.cos(angle);
          const y = center + labelR * Math.sin(angle);
          return (
            <text
              key={idx}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-700 text-[10px] font-medium"
            >
              {shortLabels[idx]}
            </text>
          );
        })}
      </svg>

      <div className="mt-2 flex items-center gap-5 text-[11px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-900 inline-block" aria-hidden="true" />
          입력 기업 수치
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="w-3 h-0.5 border-t border-dashed border-emerald-700 inline-block"
            aria-hidden="true"
          />
          권장 양호 기준선
        </span>
      </div>
    </div>
  );
}

export function HealthSimulator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SIMULATOR_PRESETS[0].id);
  const [values, setValues] = useState<SimulatorInput>(SIMULATOR_PRESETS[0].values);

  const evaluation = useMemo(() => evaluateMetrics(values), [values]);

  const handlePresetClick = (presetId: string) => {
    const found = SIMULATOR_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(found.id);
      setValues({ ...found.values });
    }
  };

  const handleChange = (field: keyof SimulatorInput, nextVal: number) => {
    setSelectedPresetId('custom');
    setValues((prev) => ({
      ...prev,
      [field]: nextVal,
    }));
  };

  const handleReset = () => {
    handlePresetClick(SIMULATOR_PRESETS[0].id);
  };

  const sliderConfigs: {
    key: keyof SimulatorInput;
    label: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    hint: string;
  }[] = [
    {
      key: 'operatingMargin',
      label: '영업이익률',
      unit: '%',
      min: -10,
      max: 35,
      step: 0.5,
      hint: '권장 10% 이상',
    },
    {
      key: 'roe',
      label: 'ROE (자기자본이익률)',
      unit: '%',
      min: -15,
      max: 35,
      step: 0.5,
      hint: '권장 10% 이상',
    },
    {
      key: 'debtRatio',
      label: '부채비율',
      unit: '%',
      min: 10,
      max: 350,
      step: 5,
      hint: '권장 100% 이하',
    },
    {
      key: 'currentRatio',
      label: '유동비율',
      unit: '%',
      min: 30,
      max: 300,
      step: 5,
      hint: '권장 150% 이상',
    },
    {
      key: 'ocfRatio',
      label: '당기순이익 대비 영업현금흐름',
      unit: '%',
      min: -80,
      max: 200,
      step: 5,
      hint: '권장 100% 이상 (+)',
    },
  ];

  return (
    <section id="simulator" className="py-16 lg:py-20 border-b border-slate-200 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-blue-900 tracking-wide mb-2">
              03. 기업 재무 건전성 자가진단 시뮬레이터
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-slate-950 tracking-tight text-balance">
              관심 기업의 수치를 입력해 바로 검증해 보세요
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              네이버 증권이나 전자공시(DART)에서 확인한 최근 연간 지표 5가지를 조절하면
              건전성 판정과 주의 포인트를 즉시 계산해 줍니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>초기화</span>
          </button>
        </div>

        {/* Two-zone sandbox layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Zone: Presets & Labeled Sliders */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6">
            <div className="pb-5 border-b border-slate-200">
              <p className="text-xs font-semibold text-slate-900 mb-3">유형별 예시 불러오기</p>
              <div className="flex flex-wrap gap-2">
                {SIMULATOR_PRESETS.map((preset) => {
                  const isActive = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePresetClick(preset.id)}
                      className={`px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 ${
                        isActive
                          ? 'bg-blue-900 text-white border-blue-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-6">
              {sliderConfigs.map((cfg) => {
                const currentVal = values[cfg.key];
                const inputId = `slider-${cfg.key}`;
                return (
                  <div key={cfg.key}>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <label htmlFor={inputId} className="text-sm font-medium text-slate-900">
                        {cfg.label}
                      </label>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] text-slate-500">{cfg.hint}</span>
                        <span className="font-mono tabular-nums text-sm font-semibold text-blue-900">
                          {cfg.step < 1 ? currentVal.toFixed(1) : currentVal}
                          {cfg.unit}
                        </span>
                      </div>
                    </div>

                    <input
                      id={inputId}
                      type="range"
                      min={cfg.min}
                      max={cfg.max}
                      step={cfg.step}
                      value={currentVal}
                      onChange={(e) => handleChange(cfg.key, Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900"
                    />

                    <div className="mt-1 flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
                      <span>
                        {cfg.min}
                        {cfg.unit}
                      </span>
                      <span>
                        {cfg.max}
                        {cfg.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Zone: Live Diagnostic Result Stage */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pb-6 border-b border-slate-200">
              <div className="md:col-span-7">
                <div className="mb-2">
                  <StatusLabel status={evaluation.overallStatus} />
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950">
                  {evaluation.overallTitle}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {evaluation.overallSummary}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-600 font-mono tabular-nums">
                  <span>
                    양호 <strong className="text-emerald-800">{evaluation.healthyCount}개</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    주의 <strong className="text-amber-800">{evaluation.cautionCount}개</strong>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    위험 <strong className="text-red-800">{evaluation.riskCount}개</strong>
                  </span>
                </div>
              </div>

              <div className="md:col-span-5">
                <RadarBalanceChart rows={evaluation.rows} />
              </div>
            </div>

            {/* Detailed row-by-row diagnostic table */}
            <div className="mt-6 divide-y divide-slate-200">
              {evaluation.rows.map((row) => (
                <div key={row.key} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-sm font-semibold text-slate-900">{row.label}</span>
                      <span className="text-xs text-slate-400">기준 {row.targetText}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono tabular-nums text-sm font-semibold text-slate-950">
                        {row.formattedValue}
                      </span>
                      <StatusLabel status={row.status} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{row.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
