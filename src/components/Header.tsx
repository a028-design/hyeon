import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export type AppView = 'home' | 'summary' | 'explore' | 'glossary' | 'request' | 'not-found';

interface HeaderProps {
  currentView: AppView;
  onNavigateView: (view: AppView) => void;
}

const NAV_LINKS: { view: AppView; label: string }[] = [
  { view: 'home', label: '홈' },
  { view: 'summary', label: '3분 재무 요약' },
  { view: 'explore', label: '신호등 탐색' },
  { view: 'glossary', label: '초보자 용어 사전' },
];

export function Header({ currentView, onNavigateView }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: AppView) => {
    setMobileMenuOpen(false);
    onNavigateView(view);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-50/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('home');
            }}
            className="font-serif text-xl font-bold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 rounded"
          >
            밸류노트
          </a>

          {/* Zone 2: Desktop Horizontal GNB (1024px+) */}
          <nav aria-label="주 메뉴" className="hidden lg:flex items-center gap-7">
            {NAV_LINKS.map((link) => {
              const isActive = currentView === link.view;
              return (
                <a
                  key={link.view}
                  href={`#${link.view}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(link.view);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-900 rounded ${
                    isActive
                      ? 'text-blue-900 underline decoration-blue-900'
                      : 'text-slate-600 hover:text-slate-950 decoration-slate-300'
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary CTA on Desktop + Hamburger Button on Mobile/Tablet */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNavClick('request')}
              className="hidden lg:inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900 min-h-[40px]"
            >
              기업 분석 요청
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="메뉴 열기"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-slide-menu"
              className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-slate-200 bg-white text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            id="mobile-slide-menu"
            aria-label="모바일 내비게이션 메뉴"
            className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] bg-white border-l border-slate-200 p-6 flex flex-col justify-between shadow-xl transition-transform duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-serif text-lg font-bold text-slate-950">밸류노트</span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="메뉴 닫기"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-950 cursor-pointer"
                >
                  <X className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>

              <nav className="mt-6 flex flex-col gap-2">
                {NAV_LINKS.map((link) => {
                  const isActive = currentView === link.view;
                  return (
                    <button
                      key={link.view}
                      type="button"
                      onClick={() => handleNavClick(link.view)}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer min-h-[44px] ${
                        isActive
                          ? 'bg-blue-50 text-blue-900 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'
                      }`}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleNavClick('request')}
                className="w-full py-3 px-4 text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              >
                기업 분석 요청하기
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
