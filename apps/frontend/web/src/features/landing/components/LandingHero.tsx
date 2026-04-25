'use client';

import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants/site-config';

function scrollToCta() {
  document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' });
}

export function LandingHero() {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pt-32 pb-20 md:pt-40"
      aria-labelledby="hero-heading"
    >
      {/* 배경 장식 요소 */}
      <div className="absolute top-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-indigo-500/10 mix-blend-multiply blur-[120px] animate-float" />
        <div className="absolute top-1/3 -right-20 h-[500px] w-[500px] rounded-full bg-pink-500/10 mix-blend-multiply blur-[120px] animate-float [animation-delay:2s]" />
        <div className="absolute bottom-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-purple-500/10 mix-blend-multiply blur-[120px] animate-float [animation-delay:4s]" />
      </div>

      <div className="absolute top-1/2 left-1/2 -z-20 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 opacity-20 dark:opacity-10">
        <img
          src="/hero_ai_fashion_beauty_1771840966571.png"
          alt="AI Fashion & Beauty"
          className="h-full w-full object-cover blur-3xl scale-110"
        />
      </div>

      <div className="mx-auto max-w-6xl text-center animate-reveal">
        <div className="mb-10 flex justify-center">
          <span className="rounded-full glass px-6 py-2.5 text-[11px] font-black tracking-[0.2em] text-primary uppercase">
            Future of Personal Beauty
          </span>
        </div>
        <h1
          id="hero-heading"
          className="font-display text-6xl font-black tracking-tight text-foreground sm:text-8xl md:text-9xl lg:text-[10rem] leading-[0.85]"
        >
          <span className="block mb-2 text-primary">AI</span>
          <span className="text-gradient">Style Finder</span>
        </h1>
        <p className="mx-auto mt-16 max-w-2xl text-lg font-bold tracking-tight text-muted sm:text-2xl leading-relaxed">
          {siteConfig.valueProp}
        </p>
        <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <Button
            variant="primary"
            size="lg"
            onClick={scrollToCta}
            className="group relative h-20 rounded-3xl px-12 text-xl font-black shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] transition-all hover:scale-105 hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.6)] active:scale-95"
          >
            <span className="relative z-10">{siteConfig.ctaLabel}</span>
            <div className="absolute inset-0 -z-10 rounded-3xl bg-primary/20 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />
          </Button>
          <button
            type="button"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="h-20 rounded-3xl border-2 border-primary/15 bg-white/60 px-12 text-xl font-bold text-primary backdrop-blur-md transition-all hover:bg-primary/5 hover:border-primary/25 active:scale-95 dark:border-primary/25 dark:bg-white/5 dark:hover:bg-white/10"
          >
            기능 살펴보기
          </button>
        </div>
      </div>
    </section>
  );
}
