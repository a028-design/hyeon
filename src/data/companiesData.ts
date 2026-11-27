import type { MetricStatus } from './financialData';

export type TrafficLightGrade = 'safe' | 'caution' | 'danger';

export interface YearlyFinancial {
  year: string;
  revenue: number; // 조 원
  operatingProfit: number; // 조 원
}

export interface CompanyProfile {
  code: string;
  name: string;
  sector: string;
  marketCapTrillion: number; // 시가총액 (조 원)
  per: number; // 배
  pbr: number; // 배
  roe: number; // %
  operatingMargin: number; // %
  debtRatio: number; // %
  currentRatio: number; // %
  ocfRatio: number; // 순이익 대비 영업현금흐름 (%)
  yearly: YearlyFinancial[]; // 최근 3개년 (2023, 2024, 2025)
  summary3Line: {
    strength: string;
    risk: string;
    oneLiner: string;
  };
}

export interface TrafficLightResult {
  grade: TrafficLightGrade;
  status: MetricStatus;
  label: string;
  headline: string;
  reason: string;
}

/**
 * REQ-03 & REQ-13 공통 신호등 판정 규칙:
 * - 위험(빨강): 영업이익률 < 0% OR 부채비율 > 200% OR 유동비율 < 100%
 * - 주의(노랑): 위험 조건은 없으나, 영업이익률 < 8% OR 부채비율 > 120% OR 유동비율 < 140%
 * - 안전(초록): 영업이익률 >= 8% AND 부채비율 <= 120% AND 유동비율 >= 140%
 */
export function evaluateTrafficLight(
  operatingMargin: number,
  debtRatio: number,
  currentRatio = 150
): TrafficLightResult {
  const dangerReasons: string[] = [];
  if (operatingMargin < 0) dangerReasons.push(`영업이익률 적자(${operatingMargin.toFixed(1)}%)`);
  if (debtRatio > 200) dangerReasons.push(`부채비율 200% 초과(${debtRatio.toFixed(0)}%)`);
  if (currentRatio < 100) dangerReasons.push(`유동비율 100% 미만(${currentRatio.toFixed(0)}%)`);

  if (dangerReasons.length > 0) {
    return {
      grade: 'danger',
      status: 'risk',
      label: '위험',
      headline: '재무 위험 신호가 감지되었습니다',
      reason: `${dangerReasons.join(', ')} 항목이 안전 기준을 크게 벗어나 추가 점검이 필요합니다.`,
    };
  }

  const cautionReasons: string[] = [];
  if (operatingMargin < 8) cautionReasons.push(`영업이익률 8% 미만(${operatingMargin.toFixed(1)}%)`);
  if (debtRatio > 120) cautionReasons.push(`부채비율 120% 초과(${debtRatio.toFixed(0)}%)`);
  if (currentRatio < 140) cautionReasons.push(`유동비율 140% 미만(${currentRatio.toFixed(0)}%)`);

  if (cautionReasons.length > 0) {
    return {
      grade: 'caution',
      status: 'caution',
      label: '주의',
      headline: '일부 재무 지표의 관찰이 필요합니다',
      reason: `치명적 결함은 없으나 ${cautionReasons.join(', ')} 구간으로 동종 업종 평균과 비교가 필요합니다.`,
    };
  }

  return {
    grade: 'safe',
    status: 'healthy',
    label: '안전',
    headline: '수익성과 재무 안정성이 양호합니다',
    reason: '영업이익률 8% 이상, 부채비율 120% 이하, 유동비율 140% 이상 기준을 모두 충족했습니다.',
  };
}

export const SECTORS = [
  '전체 업종',
  '반도체·IT',
  '인터넷·플랫폼',
  '자동차·모빌리티',
  '바이오·헬스케어',
  '유통·소비재',
  '항공·인프라',
] as const;

export const COMPANIES: CompanyProfile[] = [
  {
    code: '005930',
    name: '삼성전자',
    sector: '반도체·IT',
    marketCapTrillion: 412.5,
    per: 13.8,
    pbr: 1.18,
    roe: 9.2,
    operatingMargin: 11.4,
    debtRatio: 26.8,
    currentRatio: 254.0,
    ocfRatio: 142,
    yearly: [
      { year: '2023', revenue: 258.9, operatingProfit: 6.6 },
      { year: '2024', revenue: 300.9, operatingProfit: 32.7 },
      { year: '2025', revenue: 324.5, operatingProfit: 37.0 },
    ],
    summary3Line: {
      strength:
        '부채비율이 26.8%로 매우 낮고 유동비율이 254%에 달해 대규모 반도체 투자 중에도 재무 방어력이 탄탄합니다.',
      risk:
        '메모리 반도체 업황 사이클에 따라 영업이익률 변동 폭이 크고 설비투자 비용 부담이 상존합니다.',
      oneLiner:
        '압도적인 현금 체력과 낮은 부채비율 덕분에 불황을 버티는 힘이 강한 대표 대형주입니다.',
    },
  },
  {
    code: '000660',
    name: 'SK하이닉스',
    sector: '반도체·IT',
    marketCapTrillion: 148.2,
    per: 9.4,
    pbr: 1.95,
    roe: 22.4,
    operatingMargin: 31.2,
    debtRatio: 64.5,
    currentRatio: 168.0,
    ocfRatio: 128,
    yearly: [
      { year: '2023', revenue: 32.8, operatingProfit: -7.7 },
      { year: '2024', revenue: 66.2, operatingProfit: 23.5 },
      { year: '2025', revenue: 78.4, operatingProfit: 24.5 },
    ],
    summary3Line: {
      strength:
        '고대역폭메모리(HBM) 수요 확대에 힘입어 영업이익률 31.2%와 높은 ROE를 동시에 달성했습니다.',
      risk:
        '과거 업황 둔화기에 적자를 기록한 이력이 있어 AI 서버 투자 속도 조절 시 실적 민감도가 높습니다.',
      oneLiner:
        '강력한 본업 수익성 회복으로 차입금을 빠르게 줄여나가고 있는 고수익 반도체 기업입니다.',
    },
  },
  {
    code: '035420',
    name: 'NAVER',
    sector: '인터넷·플랫폼',
    marketCapTrillion: 31.4,
    per: 18.6,
    pbr: 1.24,
    roe: 8.6,
    operatingMargin: 18.2,
    debtRatio: 44.2,
    currentRatio: 182.0,
    ocfRatio: 135,
    yearly: [
      { year: '2023', revenue: 9.67, operatingProfit: 1.49 },
      { year: '2024', revenue: 10.73, operatingProfit: 1.98 },
      { year: '2025', revenue: 11.65, operatingProfit: 2.12 },
    ],
    summary3Line: {
      strength:
        '검색·커머스 기반의 꾸준한 매출 성장과 18%대 영업이익률, 안정적인 영업활동현금흐름을 유지하고 있습니다.',
      risk:
        'AI 및 클라우드 인프라 투자 확대로 자본지출이 늘면서 ROE 상승 속도가 다소 완만한 편입니다.',
      oneLiner:
        '현금 창출력 대비 부채비율이 낮아 플랫폼 업종 내 재무 안정성이 돋보이는 기업입니다.',
    },
  },
  {
    code: '035720',
    name: '카카오',
    sector: '인터넷·플랫폼',
    marketCapTrillion: 18.7,
    per: 34.2,
    pbr: 1.62,
    roe: 4.8,
    operatingMargin: 6.4,
    debtRatio: 82.0,
    currentRatio: 136.0,
    ocfRatio: 105,
    yearly: [
      { year: '2023', revenue: 7.56, operatingProfit: 0.46 },
      { year: '2024', revenue: 7.87, operatingProfit: 0.49 },
      { year: '2025', revenue: 8.15, operatingProfit: 0.52 },
    ],
    summary3Line: {
      strength:
        '국민 메신저 기반의 안정적 매출과 플러스(+) 영업활동현금흐름이 기본 체력을 받쳐줍니다.',
      risk:
        '영업이익률 6.4%와 ROE 4.8%로 플랫폼 평균 대비 수익성이 낮고 유동비율도 140%를 밑돌아 점검이 필요합니다.',
      oneLiner:
        '외형 매출은 꾸준히 유지되지만 자본 효율(ROE)과 본업 마진 회복 여부를 지켜봐야 합니다.',
    },
  },
  {
    code: '005380',
    name: '현대차',
    sector: '자동차·모빌리티',
    marketCapTrillion: 51.8,
    per: 5.2,
    pbr: 0.56,
    roe: 12.1,
    operatingMargin: 8.9,
    debtRatio: 116.0,
    currentRatio: 145.0,
    ocfRatio: 112,
    yearly: [
      { year: '2023', revenue: 162.7, operatingProfit: 15.1 },
      { year: '2024', revenue: 175.2, operatingProfit: 14.2 },
      { year: '2025', revenue: 181.6, operatingProfit: 16.2 },
    ],
    summary3Line: {
      strength:
        '고부가가치 차량 비중 확대로 ROE 12.1%와 8.9%의 영업이익률을 기록하며 낮은 PER·PBR을 유지하고 있습니다.',
      risk:
        '금융 자회사 할부 채권 포함 시 부채비율이 116% 수준이며 글로벌 전기차 수요 둔화 변수가 있습니다.',
      oneLiner:
        '수익성과 주주환원 여력이 개선되어 가치주 관점에서 재무 균형이 잡힌 완성차 기업입니다.',
    },
  },
  {
    code: '000270',
    name: '기아',
    sector: '자동차·모빌리티',
    marketCapTrillion: 41.2,
    per: 4.8,
    pbr: 0.78,
    roe: 17.5,
    operatingMargin: 11.8,
    debtRatio: 74.5,
    currentRatio: 164.0,
    ocfRatio: 118,
    yearly: [
      { year: '2023', revenue: 99.8, operatingProfit: 11.6 },
      { year: '2024', revenue: 107.4, operatingProfit: 12.7 },
      { year: '2025', revenue: 112.8, operatingProfit: 13.3 },
    ],
    summary3Line: {
      strength:
        '11.8%의 높은 영업이익률과 17.5%의 ROE, 74.5%의 낮은 부채비율로 수익·안정 지표가 고르게 우수합니다.',
      risk:
        '북미·유럽 시장 비중이 높아 환율 급변과 관세 정책 변화에 따라 분기 마진이 영향을 받을 수 있습니다.',
      oneLiner:
        '완성차 업종 중 가장 가벼운 부채 구조와 두 자릿수 영업이익률을 갖춘 우량 기업입니다.',
    },
  },
  {
    code: '207940',
    name: '삼성바이오로직스',
    sector: '바이오·헬스케어',
    marketCapTrillion: 68.4,
    per: 58.5,
    pbr: 6.12,
    roe: 11.2,
    operatingMargin: 29.5,
    debtRatio: 52.3,
    currentRatio: 194.0,
    ocfRatio: 124,
    yearly: [
      { year: '2023', revenue: 3.69, operatingProfit: 1.11 },
      { year: '2024', revenue: 4.55, operatingProfit: 1.32 },
      { year: '2025', revenue: 5.18, operatingProfit: 1.53 },
    ],
    summary3Line: {
      strength:
        '대규모 위탁생산 수주를 바탕으로 29.5%의 높은 영업이익률과 3년 연속 가파른 매출 성장을 이뤘습니다.',
      risk:
        'PER 58.5배, PBR 6.12배로 주가 밸류에이션 기대감이 높게 반영되어 있어 증설 지연 시 변동성이 큽니다.',
      oneLiner:
        '재무 건전성과 수익성은 매우 탄탄하나 높은 주가 배수(PER)를 함께 고려해야 하는 성장주입니다.',
    },
  },
  {
    code: '068270',
    name: '셀트리온',
    sector: '바이오·헬스케어',
    marketCapTrillion: 38.9,
    per: 42.1,
    pbr: 2.34,
    roe: 6.2,
    operatingMargin: 16.5,
    debtRatio: 38.4,
    currentRatio: 218.0,
    ocfRatio: 92,
    yearly: [
      { year: '2023', revenue: 2.18, operatingProfit: 0.65 },
      { year: '2024', revenue: 3.56, operatingProfit: 0.49 },
      { year: '2025', revenue: 4.12, operatingProfit: 0.68 },
    ],
    summary3Line: {
      strength:
        '부채비율 38.4%와 유동비율 218%로 재무 안전판이 매우 두텁고 16%대 영업이익률을 회복 중입니다.',
      risk:
        '합병 이후 무형자산 상각 비용과 재고자산 회전 속도로 인해 ROE가 6.2% 수준에 머물러 있습니다.',
      oneLiner:
        '재무 구조는 매우 안전하지만 자본 효율성(ROE)과 현금 회수 속도 개선 확인이 필요합니다.',
    },
  },
  {
    code: '003490',
    name: '대한항공',
    sector: '항공·인프라',
    marketCapTrillion: 8.6,
    per: 7.4,
    pbr: 0.85,
    roe: 11.4,
    operatingMargin: 11.9,
    debtRatio: 196.0,
    currentRatio: 112.0,
    ocfRatio: 138,
    yearly: [
      { year: '2023', revenue: 14.58, operatingProfit: 1.59 },
      { year: '2024', revenue: 16.11, operatingProfit: 1.94 },
      { year: '2025', revenue: 16.85, operatingProfit: 2.01 },
    ],
    summary3Line: {
      strength:
        '여객·화물 운임 방어로 영업이익률 11.9%와 풍부한 영업활동현금흐름을 기록하고 있습니다.',
      risk:
        '항공기 리스 부채 반영 특성상 부채비율이 196%로 높고 유동비율(112%)도 여유롭지 않은 편입니다.',
      oneLiner:
        '본업 현금흐름은 양호하나 업종 특성상 높은 부채비율과 유가·환율 변수를 꼭 점검해야 합니다.',
    },
  },
  {
    code: '139480',
    name: '이마트',
    sector: '유통·소비재',
    marketCapTrillion: 1.9,
    per: 16.5,
    pbr: 0.17,
    roe: 1.1,
    operatingMargin: 0.8,
    debtRatio: 152.0,
    currentRatio: 78.0,
    ocfRatio: 84,
    yearly: [
      { year: '2023', revenue: 29.47, operatingProfit: -0.05 },
      { year: '2024', revenue: 29.02, operatingProfit: 0.14 },
      { year: '2025', revenue: 29.35, operatingProfit: 0.23 },
    ],
    summary3Line: {
      strength:
        '연 매출 29조 원대의 거대한 오프라인·유통 인프라와 낮은 PBR(0.17배)의 자산 가치를 보유했습니다.',
      risk:
        '영업이익률 0.8%로 본업 마진이 극도로 얇고 유동비율 78%로 단기 부채 상환 부담이 감지됩니다.',
      oneLiner:
        '매출 규모는 크지만 낮은 수익성과 100% 미만 유동비율 때문에 체질 개선 확인 전 주의가 필요합니다.',
    },
  },
  {
    code: '036570',
    name: '엔씨소프트',
    sector: '인터넷·플랫폼',
    marketCapTrillion: 4.1,
    per: 48.0,
    pbr: 1.32,
    roe: -2.4,
    operatingMargin: -3.2,
    debtRatio: 24.5,
    currentRatio: 295.0,
    ocfRatio: -25,
    yearly: [
      { year: '2023', revenue: 1.78, operatingProfit: 0.14 },
      { year: '2024', revenue: 1.58, operatingProfit: -0.09 },
      { year: '2025', revenue: 1.62, operatingProfit: -0.05 },
    ],
    summary3Line: {
      strength:
        '부채비율 24.5%와 유동비율 295%로 쌓아둔 현금 자산이 풍부해 당장 도산할 위험은 극히 낮습니다.',
      risk:
        '신작 부진과 인건비 부담으로 최근 영업이익률(-3.2%)과 영업활동현금흐름이 적자로 전환되었습니다.',
      oneLiner:
        '곳간의 현금은 넉넉하지만 본업이 적자 구간이므로 영업이익 흑자 전환 확인 후 접근하는 것이 안전합니다.',
    },
  },
  {
    code: '373220',
    name: 'LG에너지솔루션',
    sector: '반도체·IT',
    marketCapTrillion: 89.2,
    per: 94.0,
    pbr: 3.85,
    roe: 2.1,
    operatingMargin: 2.4,
    debtRatio: 96.5,
    currentRatio: 142.0,
    ocfRatio: 78,
    yearly: [
      { year: '2023', revenue: 33.7, operatingProfit: 2.16 },
      { year: '2024', revenue: 25.6, operatingProfit: 0.58 },
      { year: '2025', revenue: 27.4, operatingProfit: 0.66 },
    ],
    summary3Line: {
      strength:
        '대규모 북미 공장 증설에도 부채비율 96.5%와 유동비율 142%를 유지하며 재무 균형을 관리 중입니다.',
      risk:
        '전기차 캐즘(일시적 수요 정체)으로 영업이익률이 2.4%까지 하락해 높은 PER 부담이 커진 상태입니다.',
      oneLiner:
        '재무 안정성은 지켜지고 있으나 본업 마진(영업이익률 8% 이상) 회복 속도를 확인해야 합니다.',
    },
  },
];

export interface InlineTermDef {
  term: string;
  shortDesc: string;
}

export const INLINE_TERMS: Record<string, InlineTermDef> = {
  영업이익률: {
    term: '영업이익률',
    shortDesc: '매출액 중 본업으로 벌어들인 영업이익의 비율. 높을수록 가격 경쟁력이 강하며 보통 10% 이상을 양호로 봅니다.',
  },
  부채비율: {
    term: '부채비율',
    shortDesc: '자기자본 대비 빌린 돈(부채)의 비율. 100% 이하면 매우 안정적이며, 200%를 넘으면 이자 부담을 경계해야 합니다.',
  },
  유동비율: {
    term: '유동비율',
    shortDesc: '1년 내 갚을 부채를 현금화 가능한 자산으로 막을 수 있는 비율. 최소 100% 이상, 보통 150% 이상을 안전선으로 봅니다.',
  },
  ROE: {
    term: 'ROE (자기자본이익률)',
    shortDesc: '주주의 자본을 굴려 1년간 몇 %의 순이익을 냈는지 보여주는 지표. 10% 이상을 꾸준히 유지하면 우량 기업으로 봅니다.',
  },
  영업활동현금흐름: {
    term: '영업활동현금흐름',
    shortDesc: '장부상 이익이 아닌 실제 본업 영업으로 회사 통장에 들어온 현금. 플러스(+)이고 당기순이익 이상일수록 안전합니다.',
  },
  PER: {
    term: 'PER (주가수익비율)',
    shortDesc: '현재 주가가 1주당 순이익의 몇 배인지 나타냅니다. 숫자가 낮을수록 이익 대비 주가가 저렴하다는 뜻입니다.',
  },
  PBR: {
    term: 'PBR (주가순자산비율)',
    shortDesc: '회사가 가진 순자산(청산가치) 대비 주가 수준입니다. 1배 미만이면 보유 자산 가치보다 주가가 낮게 거래됨을 뜻합니다.',
  },
};

export interface GlossaryEntry {
  id: string;
  term: string;
  english: string;
  category: '수익성' | '안정성' | '현금흐름' | '가치평가(밸류에이션)';
  summary: string;
  analogy: string;
  benchmark: string;
  whereToFind: string;
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    id: 'g-om',
    term: '영업이익률',
    english: 'Operating Profit Margin',
    category: '수익성',
    summary: '매출액에서 원가와 인건비·관리비를 모두 뺀 영업이익이 차지하는 비중입니다.',
    analogy: '1만 원짜리 커피를 팔아 원두·우유값과 월세를 제외하고 실제로 1,500원이 남는다면 영업이익률은 15%입니다.',
    benchmark: '일반 제조 8% 이상 양호 / IT·플랫폼 15% 이상 우수 / 0% 미만 위험',
    whereToFind: '손익계산서 (영업이익 ÷ 매출액 × 100)',
  },
  {
    id: 'g-roe',
    term: 'ROE (자기자본이익률)',
    english: 'Return on Equity',
    category: '수익성',
    summary: '기업이 주주의 돈(자기자본)을 활용해 1년 동안 얼마나 효율적으로 순이익을 냈는지 측정합니다.',
    analogy: '내 돈 1억 원을 투자해 1년 뒤 세금까지 내고 1,200만 원을 벌었다면 내 사업의 ROE는 12%입니다.',
    benchmark: '3년 연속 10% 이상 우수 / 시중 예금 금리(3~4%) 미만이면 자본 효율 저하',
    whereToFind: '손익계산서 당기순이익 ÷ 재무상태표 자기자본 × 100',
  },
  {
    id: 'g-debt',
    term: '부채비율',
    english: 'Debt Ratio',
    category: '안정성',
    summary: '회사가 가진 순수 자기자본에 비해 빌린 돈(부채총계)이 얼마나 많은지를 나타내는 안전 지표입니다.',
    analogy: '내 돈 1억 원에 대출 5,000만 원을 더해 집을 샀다면 부채비율은 50%입니다.',
    benchmark: '100% 이하 매우 안전 / 100~200% 보통 / 200% 초과 재무 부담 주의',
    whereToFind: '재무상태표 (부채총계 ÷ 자본총계 × 100)',
  },
  {
    id: 'g-current',
    term: '유동비율',
    english: 'Current Ratio',
    category: '안정성',
    summary: '1년 안에 갚아야 할 단기 빚(유동부채)을 1년 안에 현금화할 수 있는 자산(유동자산)으로 감당할 수 있는지 봅니다.',
    analogy: '올해 갚아야 할 카드값과 단기 대출이 1,000만 원인데 통장과 예금에 1,800만 원이 있다면 유동비율 180%입니다.',
    benchmark: '150% 이상 안전 / 100~149% 보통 / 100% 미만 단기 유동성 경고',
    whereToFind: '재무상태표 (유동자산 ÷ 유동부채 × 100)',
  },
  {
    id: 'g-ocf',
    term: '영업활동현금흐름',
    english: 'Operating Cash Flow',
    category: '현금흐름',
    summary: '장부상 외상 매출이 아니라 실제 영업 활동을 통해 회사 통장으로 들어온 현금의 순유입액입니다.',
    analogy: '장부에선 매출 1억 원 흑자인데 거래처가 돈을 안 줘서 통장 잔고가 줄었다면 현금흐름은 마이너스입니다.',
    benchmark: '플러스(+) 유지 및 당기순이익 이상(100%+)이면 이상적 / 2년 이상 마이너스(-) 주의',
    whereToFind: '현금흐름표 최상단 항목',
  },
  {
    id: 'g-per',
    term: 'PER (주가수익비율)',
    english: 'Price to Earnings Ratio',
    category: '가치평가(밸류에이션)',
    summary: '현재 회사의 시가총액(주가)이 1년간 버는 순이익의 몇 배에 거래되고 있는지 보여줍니다.',
    analogy: '매년 순이익 1,000만 원을 내는 가게를 1억 원에 인수한다면 투자금 회수에 10년(PER 10배)이 걸립니다.',
    benchmark: '동종 업종 평균 및 과거 5년 평균과 비교 (보통 10배 이하는 저평가 후보)',
    whereToFind: '시가총액 ÷ 당기순이익 (또는 주가 ÷ EPS)',
  },
  {
    id: 'g-pbr',
    term: 'PBR (주가순자산비율)',
    english: 'Price to Book-value Ratio',
    category: '가치평가(밸류에이션)',
    summary: '회사가 모든 빚을 갚고 남은 순자산(자본총계) 대비 현재 시가총액이 몇 배인지 나타냅니다.',
    analogy: '1억 원짜리 순자산이 들어있는 금고를 시장에서 7,000만 원에 살 수 있다면 PBR은 0.7배입니다.',
    benchmark: '1.0배 미만이면 자산 가치 대비 저평가 / 단, 적자 지속 기업은 낮은 PBR 함정 주의',
    whereToFind: '시가총액 ÷ 자본총계 (또는 주가 ÷ BPS)',
  },
  {
    id: 'g-revenue',
    term: '매출액',
    english: 'Revenue / Sales',
    category: '수익성',
    summary: '기업이 상품이나 서비스를 판매해 벌어들인 총 금액으로, 사업 규모와 시장 점유율을 보여줍니다.',
    analogy: '가게 손님들이 1년 동안 계산대에서 결제한 총 금액입니다. 비용을 빼기 전의 숫자입니다.',
    benchmark: '최근 3개년 이상 꾸준한 증가 또는 안정적 유지 여부 확인',
    whereToFind: '손익계산서 첫 번째 줄',
  },
  {
    id: 'g-netincome',
    term: '당기순이익',
    english: 'Net Income',
    category: '수익성',
    summary: '영업이익에서 이자 비용, 부동산 매각 등 영업외 손익과 법인세까지 모두 정산한 최종 이익입니다.',
    analogy: '가게 장사로 번 돈에서 대출 이자와 세금까지 전부 내고 마지막에 사장님 주머니에 남는 돈입니다.',
    benchmark: '일회성 자산 매각 이익으로 급증한 경우 영업이익과 반드시 구분해서 확인',
    whereToFind: '손익계산서 맨 아래 줄',
  },
  {
    id: 'g-mcap',
    term: '시가총액',
    english: 'Market Capitalization',
    category: '가치평가(밸류에이션)',
    summary: '현재 주가에 총 발행주식수를 곱한 금액으로, 주식시장에서 평가하는 회사 전체의 몸값입니다.',
    analogy: '1주당 가격이 아니라 회사 통째로 인수할 때 필요한 전체 가격표입니다.',
    benchmark: '1만 원짜리 주식이라도 주식 수가 많으면 시가총액이 수십조 원일 수 있으므로 주가 대신 시가총액을 비교',
    whereToFind: '종목 요약 정보 상단 (현재 주가 × 상장주식수)',
  },
  {
    id: 'g-rights',
    term: '유상증자',
    english: 'Paid-in Capital Increase',
    category: '안정성',
    summary: '회사가 새로 주식을 찍어 팔아 현금을 조달하는 방식입니다. 시설 투자 목적이 아니라 운영자금 부족 때문이라면 주가에 부담이 됩니다.',
    analogy: '기존 동업자 지분(100%)을 쪼개 새 투자자에게 주식을 발행하므로 기존 1주의 가치가 희석됩니다.',
    benchmark: '부채비율이 높고 현금흐름이 적자인 기업이 반복하는 유상증자는 경계 대상',
    whereToFind: 'DART 전자공시 주요사항보고서',
  },
  {
    id: 'g-cb',
    term: '전환사채 (CB)',
    english: 'Convertible Bond',
    category: '안정성',
    summary: '처음에는 회사채(빚)로 발행되지만 나중에 주식으로 바꿀 수 있는 권리가 붙은 채권입니다.',
    analogy: '급전이 필요한 기업이 이자를 낮춰주는 대신 나중에 주식으로 바꿔갈 수 있는 옵션을 얹어 빌리는 돈입니다.',
    benchmark: '연속 적자 기업이 운영자금용 CB를 자주 발행하면 주식 수 증가(오버행) 위험 발생',
    whereToFind: '재무상태표 비유동부채 · 사업보고서 주석',
  },
];
