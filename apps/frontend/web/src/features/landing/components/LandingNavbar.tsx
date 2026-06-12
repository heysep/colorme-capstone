'use client';

import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants/site-config';
import { authStorage, type MemberSession } from '@/features/auth/lib/auth-storage';
import Link from 'next/link';

const navLinks = [
  { id: 'features', label: '기능' },
] as const;

function handleNavClick(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [member, setMember] = useState<MemberSession | null>(null);

  useEffect(() => {
    setMember(authStorage.getMemberSession());
  }, []);

  const handleLogout = () => {
    authStorage.clearSession();
    setMember(null);
  };

  return (
    <nav
      className="fixed left-6 right-6 top-6 z-50 mx-auto flex max-w-7xl items-center justify-between rounded-full glass px-8 py-4 transition-all duration-300 md:px-12"
      aria-label="메인 네비게이션"
    >
      {/* 로고 */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className="cursor-pointer font-display text-2xl font-black tracking-tighter text-primary transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="text-gradient">{siteConfig.brand}</span>
      </a>

      {/* 데스크톱 네비게이션 */}
      <div className="hidden items-center gap-6 md:flex">
        {navLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => handleNavClick(link.id)}
            className="group relative mr-4 cursor-pointer text-sm font-bold tracking-tight text-muted transition-colors duration-200 hover:text-primary"
          >
            {link.label}
            <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
          </button>
        ))}
        {member ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted">
              <span className="text-primary">{member.userName}</span>님
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="rounded-full px-6 font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
            >
              로그아웃
            </Button>
          </div>
        ) : (
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full px-6 font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
            >
              로그인
            </Button>
          </Link>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={() => handleNavClick('cta')}
          className="rounded-full bg-primary px-8 py-6 font-bold text-white shadow-[0_10px_20px_-5px_rgba(99,102,241,0.4)] transition-all hover:scale-105 hover:shadow-[0_15px_25px_-5px_rgba(99,102,241,0.5)] active:scale-95"
        >
          {siteConfig.ctaLabel}
        </Button>
      </div>

      {/* 모바일 메뉴 버튼 */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="cursor-pointer rounded-full p-2 text-primary transition-colors hover:bg-primary/5 md:hidden"
        aria-expanded={mobileMenuOpen}
        aria-label="메뉴 열기/닫기"
      >
        {mobileMenuOpen ? (
          <X className="h-6 w-6" aria-hidden />
        ) : (
          <Menu className="h-6 w-6" aria-hidden />
        )}
      </button>

      {/* 모바일 메뉴 */}
      {mobileMenuOpen && (
        <div className="absolute left-0 right-0 top-full mt-4 flex flex-col gap-2 rounded-3xl glass p-6 shadow-2xl md:hidden animate-reveal">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => {
                handleNavClick(link.id);
                setMobileMenuOpen(false);
              }}
              className="cursor-pointer rounded-2xl p-4 text-left font-bold text-muted transition-all duration-200 hover:bg-primary/10 hover:text-primary"
            >
              {link.label}
            </button>
          ))}
          {member ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full rounded-2xl py-6 font-bold text-primary transition-all hover:bg-primary/5"
            >
              {member.userName}님 · 로그아웃
            </Button>
          ) : (
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full rounded-2xl py-6 font-bold text-primary transition-all hover:bg-primary/5"
              >
                로그인
              </Button>
            </Link>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              handleNavClick('cta');
              setMobileMenuOpen(false);
            }}
            className="mt-2 w-full rounded-2xl bg-primary py-7 font-bold text-white shadow-xl active:scale-95"
          >
            {siteConfig.ctaLabel}
          </Button>
        </div>
      )}
    </nav>
  );
}
