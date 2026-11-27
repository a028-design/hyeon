/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BookmarkedCompaniesSection } from './components/BookmarkedCompaniesSection';
import { ChecklistSection } from './components/ChecklistSection';
import { ExploreView } from './components/ExploreView';
import { GlossaryView } from './components/GlossaryView';
import { Header, type AppView } from './components/Header';
import { HealthCriteriaSection } from './components/HealthCriteriaSection';
import { HealthSimulator } from './components/HealthSimulator';
import { HeroSection } from './components/HeroSection';
import { MetricsExplorer } from './components/MetricsExplorer';
import { NotFoundView } from './components/NotFoundView';
import { RequestView } from './components/RequestView';
import { SummaryReportView } from './components/SummaryReportView';
import { COMPANIES } from './data/companiesData';

const BOOKMARK_STORAGE_KEY = 'valuenote_bookmarked_companies_v1';

interface RouteState {
  view: AppView;
  companyCode: string;
  notFoundQuery: string;
  requestPrefill: string;
}

function parseHashRoute(hash: string): RouteState {
  const cleaned = hash.replace(/^#/, '').trim();
  if (!cleaned || cleaned === 'home' || cleaned === 'top') {
    return {
      view: 'home',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  if (cleaned === 'explore') {
    return {
      view: 'explore',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  if (cleaned === 'glossary') {
    return {
      view: 'glossary',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  if (cleaned === 'request') {
    return {
      view: 'request',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  if (cleaned === 'summary') {
    return {
      view: 'summary',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  if (cleaned.startsWith('summary/')) {
    const code = decodeURIComponent(cleaned.slice('summary/'.length));
    const found = COMPANIES.find((c) => c.code === code);
    if (found) {
      return {
        view: 'summary',
        companyCode: found.code,
        notFoundQuery: '',
        requestPrefill: '',
      };
    }
    return {
      view: 'not-found',
      companyCode: COMPANIES[0].code,
      notFoundQuery: code,
      requestPrefill: '',
    };
  }

  // Allow in-page anchor hashes on home view
  if (['indicators', 'health-criteria', 'simulator', 'checklist', 'bookmarks'].includes(cleaned)) {
    return {
      view: 'home',
      companyCode: COMPANIES[0].code,
      notFoundQuery: '',
      requestPrefill: '',
    };
  }

  return {
    view: 'not-found',
    companyCode: COMPANIES[0].code,
    notFoundQuery: cleaned,
    requestPrefill: '',
  };
}

export default function App() {
  const [route, setRoute] = useState<RouteState>(() => parseHashRoute(window.location.hash));
  const [bookmarkedCodes, setBookmarkedCodes] = useState<string[]>(() => {
    try {
      const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHashRoute(window.location.hash));
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarkedCodes));
    } catch {
      // Ignore storage quota errors
    }
  }, [bookmarkedCodes]);

  const navigateView = (view: AppView) => {
    if (view === 'summary') {
      const code = route.companyCode || COMPANIES[0].code;
      window.location.hash = `summary/${code}`;
      setRoute((prev) => ({ ...prev, view: 'summary', companyCode: code }));
    } else {
      window.location.hash = view;
      setRoute((prev) => ({ ...prev, view, requestPrefill: '' }));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCompanySummary = (code: string) => {
    const exists = COMPANIES.find((c) => c.code === code);
    if (!exists) {
      openNotFound(code);
      return;
    }
    window.location.hash = `summary/${code}`;
    setRoute((prev) => ({ ...prev, view: 'summary', companyCode: code }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openNotFound = (query: string) => {
    window.location.hash = `not-found/${encodeURIComponent(query)}`;
    setRoute((prev) => ({ ...prev, view: 'not-found', notFoundQuery: query }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToRequestWithPrefill = (prefillName?: string) => {
    window.location.hash = 'request';
    setRoute((prev) => ({
      ...prev,
      view: 'request',
      requestPrefill: prefillName ?? '',
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleBookmark = (code: string) => {
    setBookmarkedCodes((prev) =>
      prev.includes(code) ? prev.filter((item) => item !== code) : [code, ...prev]
    );
  };

  const scrollToHomeSection = (sectionId: string) => {
    if (route.view !== 'home') {
      setRoute((prev) => ({ ...prev, view: 'home' }));
      window.location.hash = 'home';
      window.setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const selectedCompany =
    COMPANIES.find((c) => c.code === route.companyCode) ?? COMPANIES[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header currentView={route.view} onNavigateView={navigateView} />

      <main className="flex-1">
        {route.view === 'home' && (
          <>
            <HeroSection
              onSelectCompany={openCompanySummary}
              onNotFound={openNotFound}
              onExplore={() => navigateView('explore')}
              onScrollToIndicators={() => scrollToHomeSection('indicators')}
            />
            <MetricsExplorer
              onOpenSimulatorWithMetric={() => scrollToHomeSection('simulator')}
            />
            <HealthCriteriaSection />
            <HealthSimulator />
            <ChecklistSection
              onNavigateSimulator={() => scrollToHomeSection('simulator')}
            />
            <BookmarkedCompaniesSection
              bookmarkedCodes={bookmarkedCodes}
              onSelectCompany={openCompanySummary}
              onRemoveBookmark={toggleBookmark}
              onExplore={() => navigateView('explore')}
            />
          </>
        )}

        {route.view === 'summary' && (
          <SummaryReportView
            company={selectedCompany}
            isBookmarked={bookmarkedCodes.includes(selectedCompany.code)}
            onToggleBookmark={toggleBookmark}
            onSelectCompany={openCompanySummary}
            onNotFound={openNotFound}
            onBackExplore={() => navigateView('explore')}
          />
        )}

        {route.view === 'explore' && (
          <ExploreView onSelectCompany={openCompanySummary} />
        )}

        {route.view === 'glossary' && <GlossaryView />}

        {route.view === 'request' && (
          <RequestView initialCompanyName={route.requestPrefill} />
        )}

        {route.view === 'not-found' && (
          <NotFoundView
            searchedQuery={route.notFoundQuery}
            onGoRequest={goToRequestWithPrefill}
            onGoHome={() => navigateView('home')}
          />
        )}
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="font-serif text-base font-bold text-slate-900">밸류노트</p>
            <p className="mt-1.5 text-xs text-slate-500 max-w-xl leading-relaxed">
              본 서비스는 주식 초보자가 3분 만에 기업의 재무제표와 건전성을 이해할 수 있도록 제작된
              교육용 안내서이며, 특정 종목에 대한 매수·매도 권유가 아닙니다.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600">
            <button
              type="button"
              onClick={() => navigateView('home')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              홈
            </button>
            <button
              type="button"
              onClick={() => navigateView('summary')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              3분 재무 요약
            </button>
            <button
              type="button"
              onClick={() => navigateView('explore')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              신호등 탐색
            </button>
            <button
              type="button"
              onClick={() => navigateView('glossary')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              용어 사전
            </button>
            <button
              type="button"
              onClick={() => navigateView('request')}
              className="hover:text-slate-950 transition-colors whitespace-nowrap cursor-pointer"
            >
              분석 요청
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
