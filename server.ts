import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COMPANIES, type CompanyProfile } from './src/data/companiesData.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const IS_PROD = process.env.NODE_ENV === 'production';

// Fixed server-side persistence file (strictly confined under ./data)
const DATA_DIR = path.resolve(__dirname, 'data');
const REQUESTS_FILE = path.resolve(DATA_DIR, 'analysis-requests.json');

interface StoredAnalysisRequest {
  id: string;
  companyName: string;
  ticker: string;
  email: string;
  status: '접수 완료';
  createdAt: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TICKER_REGEX = /^[0-9A-Za-z]{6}$/;

function ensureDataStore(): StoredAnalysisRequest[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(REQUESTS_FILE)) {
      fs.writeFileSync(REQUESTS_FILE, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(REQUESTS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAnalysisRequests(items: StoredAnalysisRequest[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!local || !domain) return '***';
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

// Optional OpenDART corp_code mapping for live financial lookup when DART_API_KEY is configured
const DART_CORP_CODES: Record<string, string> = {
  '005930': '00126380', // 삼성전자
  '000660': '00164779', // SK하이닉스
  '035420': '00266961', // NAVER
  '035720': '00258801', // 카카오
  '005380': '00164742', // 현대차
  '000270': '00106641', // 기아
  '207940': '00877059', // 삼성바이오로직스
  '068270': '00413046', // 셀트리온
  '003490': '00113058', // 대한항공
  '139480': '00858364', // 이마트
  '036570': '00261443', // 엔씨소프트
  '373220': '01515323', // LG에너지솔루션
};

interface DartAccountRow {
  account_nm?: string;
  sj_div?: string;
  thstrm_amount?: string;
}

function parseDartAmountToTrillion(raw?: string): number | null {
  if (!raw) return null;
  const cleaned = Number(raw.replace(/,/g, '').trim());
  if (!Number.isFinite(cleaned)) return null;
  return cleaned / 1_000_000_000_000;
}

async function enrichWithOpenDart(company: CompanyProfile): Promise<{
  company: CompanyProfile;
  source: 'opendart' | 'baseline';
}> {
  const apiKey = process.env.DART_API_KEY?.trim();
  const corpCode = DART_CORP_CODES[company.code];
  if (!apiKey || !corpCode) {
    return { company, source: 'baseline' };
  }

  try {
    const url = new URL('https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json');
    url.searchParams.set('crtfc_key', apiKey);
    url.searchParams.set('corp_code', corpCode);
    url.searchParams.set('bsns_year', '2024');
    url.searchParams.set('reprt_code', '11011');
    url.searchParams.set('fs_div', 'CFS');

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) {
      return { company, source: 'baseline' };
    }

    const data = (await response.json()) as { status?: string; list?: DartAccountRow[] };
    if (data.status !== '000' || !Array.isArray(data.list)) {
      return { company, source: 'baseline' };
    }

    const findAccount = (names: string[], sjDiv?: string): number | null => {
      const row = data.list?.find(
        (item) =>
          (!sjDiv || item.sj_div === sjDiv) &&
          typeof item.account_nm === 'string' &&
          names.some((n) => item.account_nm?.includes(n))
      );
      return parseDartAmountToTrillion(row?.thstrm_amount);
    };

    const revenue = findAccount(['매출액', '영업수익'], 'IS') ?? findAccount(['매출액'], 'CIS');
    const opProfit = findAccount(['영업이익'], 'IS') ?? findAccount(['영업이익'], 'CIS');
    const totalDebt = findAccount(['부채총계'], 'BS');
    const totalEquity = findAccount(['자본총계'], 'BS');
    const currAssets = findAccount(['유동자산'], 'BS');
    const currLiabilities = findAccount(['유동부채'], 'BS');

    const updated: CompanyProfile = {
      ...company,
      operatingMargin:
        revenue && revenue > 0 && opProfit !== null
          ? Number(((opProfit / revenue) * 100).toFixed(1))
          : company.operatingMargin,
      debtRatio:
        totalEquity && totalEquity > 0 && totalDebt !== null
          ? Number(((totalDebt / totalEquity) * 100).toFixed(1))
          : company.debtRatio,
      currentRatio:
        currLiabilities && currLiabilities > 0 && currAssets !== null
          ? Number(((currAssets / currLiabilities) * 100).toFixed(0))
          : company.currentRatio,
    };

    return { company: updated, source: 'opendart' };
  } catch {
    return { company, source: 'baseline' };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      ok: true,
      dartConfigured: Boolean(process.env.DART_API_KEY?.trim()),
    });
  });

  app.get('/api/companies', (_req: Request, res: Response) => {
    res.json({
      companies: COMPANIES,
      source: process.env.DART_API_KEY?.trim() ? 'opendart-ready' : 'baseline',
    });
  });

  app.get('/api/companies/:code', async (req: Request, res: Response) => {
    const code = String(req.params.code ?? '').trim();
    if (!TICKER_REGEX.test(code)) {
      res.status(400).json({ error: '유효한 6자리 종목코드가 아닙니다.' });
      return;
    }

    const found = COMPANIES.find((c) => c.code === code);
    if (!found) {
      res.status(404).json({ error: '일치하는 기업 정보가 없습니다.' });
      return;
    }

    const result = await enrichWithOpenDart(found);
    res.json(result);
  });

  app.get('/api/requests', (_req: Request, res: Response) => {
    const items = ensureDataStore();
    const publicItems = items.slice(0, 20).map((item) => ({
      id: item.id,
      companyName: item.companyName,
      ticker: item.ticker,
      maskedEmail: maskEmail(item.email),
      status: item.status,
      createdAt: item.createdAt,
    }));
    res.json({ requests: publicItems });
  });

  app.post('/api/requests', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown> | undefined;
    const companyName = typeof body?.companyName === 'string' ? body.companyName.trim() : '';
    const ticker = typeof body?.ticker === 'string' ? body.ticker.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';

    const fieldErrors: Record<string, string> = {};

    if (!companyName || companyName.length > 80) {
      fieldErrors.companyName = '분석을 요청할 기업명을 1~80자 이내로 입력해 주세요.';
    }
    if (ticker && !TICKER_REGEX.test(ticker)) {
      fieldErrors.ticker = '종목코드는 6자리 숫자 또는 영문 코드로 입력해 주세요. (예: 005930)';
    }
    if (!email || email.length > 120 || !EMAIL_REGEX.test(email)) {
      fieldErrors.email = '올바른 이메일 형식이 아닙니다. (예: user@example.com)';
    }

    if (Object.keys(fieldErrors).length > 0) {
      res.status(400).json({ errors: fieldErrors });
      return;
    }

    const items = ensureDataStore();
    const newItem: StoredAnalysisRequest = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      companyName,
      ticker,
      email,
      status: '접수 완료',
      createdAt: new Date().toISOString(),
    };

    const nextItems = [newItem, ...items].slice(0, 100);
    saveAnalysisRequests(nextItems);

    res.status(201).json({
      request: {
        id: newItem.id,
        companyName: newItem.companyName,
        ticker: newItem.ticker,
        maskedEmail: maskEmail(newItem.email),
        status: newItem.status,
        createdAt: newItem.createdAt,
      },
    });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ValueNote server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
