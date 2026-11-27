export type MetricStatus = 'healthy' | 'caution' | 'risk';

export interface FinancialMetric {
  id: 'operatingMargin' | 'roe' | 'debtRatio' | 'currentRatio' | 'ocfRatio';
  indexLabel: string;
  name: string;
  englishName: string;
  statementSource: string;
  category: '수익성' | '자본효율' | '재무안정성' | '단기유동성' | '현금창출력';
  oneLineQuestion: string;
  formula: string;
  analogy: string;
  description: string;
  benchmarks: {
    healthy: string;
    caution: string;
    risk: string;
  };
  trapNote: string;
  comparisonExample: {
    unit: string;
    companyA: {
      name: string;
      value: string;
      verdict: MetricStatus;
      note: string;
    };
    companyB: {
      name: string;
      value: string;
      verdict: MetricStatus;
      note: string;
    };
  };
}

export const ESSENTIAL_METRICS: FinancialMetric[] = [
  {
    id: 'operatingMargin',
    indexLabel: '01',
    name: '영업이익률',
    englishName: 'Operating Profit Margin',
    statementSource: '손익계산서',
    category: '수익성',
    oneLineQuestion: '본업으로 물건이나 서비스를 팔아 실제로 얼마나 남기는가?',
    formula: '(영업이익 ÷ 매출액) × 100',
    analogy: '치킨집에서 2만 원짜리 치킨을 팔아 재료비·월세·인건비를 다 빼고 손에 남는 본업 마진입니다.',
    description:
      '매출액이 아무리 커도 영업이익률이 낮으면 경쟁이 치열하거나 원가 통제가 안 된다는 뜻입니다. 부동산 매각 같은 일회성 이익을 제외한 순수 사업 경쟁력을 보여줍니다.',
    benchmarks: {
      healthy: '10% 이상 (IT·플랫폼은 15% 이상 우수)',
      caution: '4% ~ 9% (박리다매 업종은 업계 평균 비교)',
      risk: '0% 미만 영업적자 지속 또는 3년 연속 급락',
    },
    trapNote:
      '당기순이익만 보고 투자했다가 본업은 적자인데 건물 매각 이익으로 흑자처럼 보인 기업을 고르는 실수를 피하려면 반드시 영업이익률을 먼저 확인해야 합니다.',
    comparisonExample: {
      unit: '%',
      companyA: {
        name: '가나다 테크 (안정형)',
        value: '18.4%',
        verdict: 'healthy',
        note: '핵심 제품 가격 결정력 보유, 3년 평균 17%대 유지',
      },
      companyB: {
        name: '라마다 유통 (주의형)',
        value: '1.8%',
        verdict: 'caution',
        note: '매출은 1조 원대지만 판관비 상승으로 마진 급감',
      },
    },
  },
  {
    id: 'roe',
    indexLabel: '02',
    name: '자기자본이익률 (ROE)',
    englishName: 'Return on Equity',
    statementSource: '손익계산서 · 재무상태표',
    category: '자본효율',
    oneLineQuestion: '주주가 맡긴 돈(자본)을 굴려 1년 동안 몇 %를 불렸는가?',
    formula: '(당기순이익 ÷ 자기자본) × 100',
    analogy: '내 돈 1억 원으로 사업을 시작해 1년 뒤 세금까지 다 내고 1,500만 원을 벌었다면 ROE는 15%입니다.',
    description:
      '워런 버핏이 가장 중시하는 지표 중 하나입니다. 예금 금리(약 3~4%)보다 훨씬 높은 수익을 꾸준히 내는 기업일수록 주주 가치를 빠르게 복리로 키울 가능성이 큽니다.',
    benchmarks: {
      healthy: '10% 이상 3년 연속 유지 (15% 이상 최우량)',
      caution: '5% ~ 9% (시중 금리 대비 소폭 우위)',
      risk: '5% 미만 또는 순손실로 마이너스(-)',
    },
    trapNote:
      '빚(부채)을 무리하게 끌어와 자기자본 분모를 줄이면 일시적으로 ROE가 높게 치솟는 착시가 발생합니다. 반드시 부채비율과 나란히 봐야 합니다.',
    comparisonExample: {
      unit: '%',
      companyA: {
        name: '바른 소비재 (안정형)',
        value: '14.2%',
        verdict: 'healthy',
        note: '부채비율 45%의 저부채 상태에서 꾸준히 14%대 수익 창출',
      },
      companyB: {
        name: '무리 건설 (위험형)',
        value: '19.5%',
        verdict: 'risk',
        note: '부채비율 320%의 과도한 차입 레버리지로 부풀려진 수치',
      },
    },
  },
  {
    id: 'debtRatio',
    indexLabel: '03',
    name: '부채비율',
    englishName: 'Debt Ratio',
    statementSource: '재무상태표',
    category: '재무안정성',
    oneLineQuestion: '자기 돈에 비해 남의 돈(빌린 돈)을 얼마나 쓰고 있는가?',
    formula: '(부채총계 ÷ 자기자본) × 100',
    analogy: '내 돈 1억 원에 은행 대출 5,000만 원을 끼고 집을 샀다면 부채비율은 50%입니다.',
    description:
      '경기가 나빠지거나 금리가 오를 때 기업이 버틸 수 있는 맷집을 나타냅니다. 부채가 적을수록 이자 비용 부담이 작아 위기 상황에서 흑자 전환과 배당 여력이 큽니다.',
    benchmarks: {
      healthy: '100% 이하 (무차입 또는 매우 안정적)',
      caution: '100% ~ 200% (업종 특성에 따라 관리 필요)',
      risk: '200% 초과 (이자 보상 여력 급감 및 유상증자 위험)',
    },
    trapNote:
      '조선·항공·선수금 비중이 큰 업종은 선수금(계약 부채) 때문에 부채비율이 높게 잡히기도 합니다. 이자 발생 차입금 비중이 큰지 주석을 확인하면 정확합니다.',
    comparisonExample: {
      unit: '%',
      companyA: {
        name: '성실 반도체장비',
        value: '58.0%',
        verdict: 'healthy',
        note: '순현금 상태 유지로 금리 인상 구간에서도 이자 수익 발생',
      },
      companyB: {
        name: '과열 바이오',
        value: '264.0%',
        verdict: 'risk',
        note: '전환사채 발행 누적으로 재무 부담 및 지분 희석 우려',
      },
    },
  },
  {
    id: 'currentRatio',
    indexLabel: '04',
    name: '유동비율',
    englishName: 'Current Ratio',
    statementSource: '재무상태표',
    category: '단기유동성',
    oneLineQuestion: '1년 안에 갚아야 할 빚을 당장 동원할 수 있는 자산으로 막을 수 있는가?',
    formula: '(유동자산 ÷ 유동부채) × 100',
    analogy: '당장 다음 달부터 1년 내 갚아야 할 카드값·단기대출이 1,000만 원인데, 현금화할 수 있는 자산이 2,000만 원 있으면 유동비율 200%입니다.',
    description:
      '기업의 단기 지급 능력을 점검하는 지표입니다. 아무리 장기 전망이 좋아도 당장 내일 만기가 돌아오는 어음이나 단기차입금을 막지 못하면 기업은 위기에 빠집니다.',
    benchmarks: {
      healthy: '150% 이상 (200% 이상이면 단기 위기 방어력 우수)',
      caution: '100% ~ 149% (단기 자금 회전 점검 필요)',
      risk: '100% 미만 (1년 내 갚을 빚이 유동자산보다 많음)',
    },
    trapNote:
      '유동자산 안에는 현금뿐만 아니라 아직 안 팔린 재고자산도 포함됩니다. 재고가 급증해 유동비율이 높아 보인다면 현금성 자산만 따로 떼어 확인해야 합니다.',
    comparisonExample: {
      unit: '%',
      companyA: {
        name: '탄탄 식품',
        value: '215.0%',
        verdict: 'healthy',
        note: '보유 현금 및 단기금융상품만으로 단기차입금 전액 상환 가능',
      },
      companyB: {
        name: '아슬 기계',
        value: '82.0%',
        verdict: 'risk',
        note: '1년 내 상환 만기 단기차입금 비중 과다로 차환 발행 의존',
      },
    },
  },
  {
    id: 'ocfRatio',
    indexLabel: '05',
    name: '영업활동현금흐름',
    englishName: 'Operating Cash Flow',
    statementSource: '현금흐름표',
    category: '현금창출력',
    oneLineQuestion: '장부상 이익이 아니라 진짜 현금이 통장으로 들어오고 있는가?',
    formula: '영업활동현금흐름(OCF) vs 당기순이익 비율',
    analogy: '장부에선 이번 달 1,000만 원 흑자라고 적혔지만 전부 외상 매출이라면 통장 잔고는 0원입니다. 실제 입금된 현금을 보는 지표입니다.',
    description:
      '회계 장부(손익계산서)는 외상 매출도 이익으로 잡지만, 현금흐름표는 실제 돈의 유출입만 기록합니다. 초보자가 분식회계와 흑자도산 위험 기업을 걸러내는 가장 강력한 방패입니다.',
    benchmarks: {
      healthy: '영업활동현금흐름 플러스(+) & 당기순이익 이상(100%+)',
      caution: '플러스(+)이나 당기순이익의 50% ~ 99% 수준',
      risk: '마이너스(-) 2년 이상 지속 (장부상 흑자라도 현금 고갈 경고)',
    },
    trapNote:
      '대규모 설비 증설이 한창인 해에는 매출채권 증가로 일시적 마이너스가 날 수 있습니다. 단일 분기보다 3개년 누적 영업활동현금흐름이 플러스인지 보세요.',
    comparisonExample: {
      unit: '순이익 대비',
      companyA: {
        name: '든든 소프트웨어',
        value: '132%',
        verdict: 'healthy',
        note: '당기순이익 200억 대비 영업현금흐름 264억 유입',
      },
      companyB: {
        name: '외상 부품사',
        value: '-45%',
        verdict: 'risk',
        note: '당기순이익 100억 흑자이나 외상대금 미회수로 현금 -45억 유출',
      },
    },
  },
];

export type IndustryKey = 'manufacturing' | 'software' | 'capex';

export interface IndustryProfile {
  key: IndustryKey;
  label: string;
  summary: string;
  criteria: {
    pillar: string;
    metric: string;
    healthy: string;
    caution: string;
    risk: string;
    reason: string;
  }[];
}

export const INDUSTRY_PROFILES: IndustryProfile[] = [
  {
    key: 'manufacturing',
    label: '일반 제조 · 소비재',
    summary: '원재료 매입과 재고 관리가 핵심이며 안정적인 현금흐름과 적정 마진 유지가 중요합니다.',
    criteria: [
      {
        pillar: '수익성',
        metric: '영업이익률',
        healthy: '8% 이상',
        caution: '4% ~ 7.9%',
        risk: '4% 미만 또는 적자',
        reason: '원가율과 물류비 변동을 흡수할 최소한의 마진 방어선',
      },
      {
        pillar: '자본효율',
        metric: 'ROE',
        healthy: '10% 이상',
        caution: '5% ~ 9.9%',
        risk: '5% 미만',
        reason: '자본 비용과 물가 상승률을 웃도는 실질 주주 가치 창출',
      },
      {
        pillar: '재무안정성',
        metric: '부채비율',
        healthy: '100% 이하',
        caution: '101% ~ 180%',
        risk: '180% 초과',
        reason: '경기 둔화 시 차입금 이자 비용 증가에 버틸 수 있는 완충력',
      },
      {
        pillar: '단기유동성',
        metric: '유동비율',
        healthy: '150% 이상',
        caution: '100% ~ 149%',
        risk: '100% 미만',
        reason: '원자재 대금 결제와 단기 차입금 상환에 대한 단기 안전판',
      },
      {
        pillar: '현금창출력',
        metric: '영업현금흐름 / 순이익',
        healthy: '100% 이상 (+)',
        caution: '50% ~ 99% (+)',
        risk: '마이너스(-) 지속',
        reason: '재고 적체나 외상매출 부실 없이 현금이 회수되는지 검증',
      },
    ],
  },
  {
    key: 'software',
    label: 'IT · 플랫폼 · 소프트웨어',
    summary: '초기 고정비 이후 매출 증가가 이익으로 직결되므로 높은 영업이익률과 무차입에 가까운 재무구조가 기준입니다.',
    criteria: [
      {
        pillar: '수익성',
        metric: '영업이익률',
        healthy: '15% 이상',
        caution: '7% ~ 14.9%',
        risk: '7% 미만 또는 적자',
        reason: '매출원가가 낮은 구조 특성상 확장성이 마진으로 증명되어야 함',
      },
      {
        pillar: '자본효율',
        metric: 'ROE',
        healthy: '15% 이상',
        caution: '8% ~ 14.9%',
        risk: '8% 미만',
        reason: '설비 투자가 적은 대신 인적·지식 자본의 높은 효율성 요구',
      },
      {
        pillar: '재무안정성',
        metric: '부채비율',
        healthy: '70% 이하',
        caution: '71% ~ 130%',
        risk: '130% 초과',
        reason: '대규모 공장 담보가 없는 만큼 낮은 차입 의존도가 안전 기준',
      },
      {
        pillar: '단기유동성',
        metric: '유동비율',
        healthy: '180% 이상',
        caution: '120% ~ 179%',
        risk: '120% 미만',
        reason: '연구개발 인건비 지출을 안정적으로 버틸 수 있는 현금성 자산',
      },
      {
        pillar: '현금창출력',
        metric: '영업현금흐름 / 순이익',
        healthy: '110% 이상 (+)',
        caution: '70% ~ 109% (+)',
        risk: '마이너스(-) 지속',
        reason: '구독·선수금 유입 특성상 실제 현금 흐름이 순이익보다 커야 이상적',
      },
    ],
  },
  {
    key: 'capex',
    label: '설비투자 · 인프라 · 중공업',
    summary: '대규모 설비·수주 산업 특성상 부채비율 기준은 다소 넓게 보되 현금흐름과 수주 마진의 질을 엄격히 봅니다.',
    criteria: [
      {
        pillar: '수익성',
        metric: '영업이익률',
        healthy: '6% 이상',
        caution: '3% ~ 5.9%',
        risk: '3% 미만 또는 적자',
        reason: '고정비와 감가상각비가 큰 구조에서 안정적 흑자 유지 여부',
      },
      {
        pillar: '자본효율',
        metric: 'ROE',
        healthy: '8% 이상',
        caution: '4% ~ 7.9%',
        risk: '4% 미만',
        reason: '자본 집약적 산업 특성상 사이클 평균 ROE가 시중 금리를 상회해야 함',
      },
      {
        pillar: '재무안정성',
        metric: '부채비율',
        healthy: '150% 이하',
        caution: '151% ~ 220%',
        risk: '220% 초과',
        reason: '선수금·장기시설차입을 감안하되 220% 초과 시 유동성 경계',
      },
      {
        pillar: '단기유동성',
        metric: '유동비율',
        healthy: '120% 이상',
        caution: '95% ~ 119%',
        risk: '95% 미만',
        reason: '운전자본 규모가 커 단기 차입 만기 도래 시 흑자도산 방어선',
      },
      {
        pillar: '현금창출력',
        metric: '영업현금흐름 / 순이익',
        healthy: '90% 이상 (+)',
        caution: '40% ~ 89% (+)',
        risk: '2년 이상 마이너스(-)',
        reason: '감가상각비가 커서 정상 가동 중이라면 영업현금흐름이 탄탄해야 함',
      },
    ],
  },
];

export interface SimulatorInput {
  operatingMargin: number;
  roe: number;
  debtRatio: number;
  currentRatio: number;
  ocfRatio: number;
}

export interface SimulatorPreset {
  id: string;
  label: string;
  description: string;
  values: SimulatorInput;
}

export const SIMULATOR_PRESETS: SimulatorPreset[] = [
  {
    id: 'solid',
    label: '우량 가치주 예시',
    description: '낮은 부채와 탄탄한 본업 마진, 현금 유입이 일치하는 안정적 기업',
    values: {
      operatingMargin: 14.5,
      roe: 15.0,
      debtRatio: 62,
      currentRatio: 210,
      ocfRatio: 125,
    },
  },
  {
    id: 'leveraged',
    label: '고부채 · 흑자도산 주의',
    description: '장부상 ROE는 높지만 과도한 부채와 마이너스 현금흐름이 겹친 사례',
    values: {
      operatingMargin: 4.5,
      roe: 16.0,
      debtRatio: 255,
      currentRatio: 88,
      ocfRatio: -35,
    },
  },
  {
    id: 'turnaround',
    label: '체질 개선 관찰 기업',
    description: '부채는 관리되나 수익성과 현금 창출력 회복 여부를 더 지켜봐야 하는 단계',
    values: {
      operatingMargin: 5.5,
      roe: 6.5,
      debtRatio: 135,
      currentRatio: 125,
      ocfRatio: 68,
    },
  },
];

export interface ChecklistItem {
  id: string;
  step: string;
  title: string;
  detail: string;
  whereToCheck: string;
}

export const BEGINNER_CHECKLIST: ChecklistItem[] = [
  {
    id: 'check-1',
    step: '1단계',
    title: '최근 3개년 매출과 영업이익이 함께 우상향하거나 유지되는가?',
    detail: '단 1년 반짝 실적이 아니라 최소 3년 추세에서 본업 경쟁력이 꺾이지 않았는지 확인합니다.',
    whereToCheck: '손익계산서 (연간 추이)',
  },
  {
    id: 'check-2',
    step: '2단계',
    title: '영업이익률이 동종 업계 평균 이상이며 급락 징후가 없는가?',
    detail: '매출만 커지고 마진이 줄어든다면 단가 인하 압박이나 비용 통제 실패 신호일 수 있습니다.',
    whereToCheck: '손익계산서 · 업종 비교',
  },
  {
    id: 'check-3',
    step: '3단계',
    title: 'ROE 10% 이상이 과도한 빚(레버리지) 없이 만들어진 결과인가?',
    detail: '부채비율이 100% 이하이면서 ROE 10% 이상을 내는 기업이 진짜 자본 효율이 높은 기업입니다.',
    whereToCheck: 'ROE & 부채비율 교차 확인',
  },
  {
    id: 'check-4',
    step: '4단계',
    title: '부채비율 200% 이하, 유동비율 100% 이상으로 단기 위기 방어가 되는가?',
    detail: '1년 내 갚아야 할 빚을 감당할 유동자산이 충분해야 유상증자나 급작스런 자금 경색을 피합니다.',
    whereToCheck: '재무상태표 (유동자산/부채)',
  },
  {
    id: 'check-5',
    step: '5단계',
    title: '당기순이익만큼 영업활동현금흐름(+)이 실제로 들어오는가?',
    detail: '장부상 흑자인데 현금흐름이 2년 이상 마이너스(-)라면 외상매출 부실이나 재고 누적 가능성이 큽니다.',
    whereToCheck: '현금흐름표 최상단',
  },
  {
    id: 'check-6',
    step: '6단계',
    title: '최근 1년간 전환사채(CB)·신주인수권부사채(BW) 남발 이력이 없는가?',
    detail: '본업 현금이 부족해 고금리 사채를 반복 발행하는 기업은 기존 주주 가치가 희석될 위험이 높습니다.',
    whereToCheck: 'DART 공시 · 주석 사항',
  },
];
