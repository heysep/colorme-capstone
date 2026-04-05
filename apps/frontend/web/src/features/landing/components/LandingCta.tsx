import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/constants/site-config';
import Link from 'next/link';

export function LandingCta() {
  return (
    <section
      id="cta"
      className="px-6 py-40 md:py-60"
      aria-labelledby="cta-heading"
    >
      <div className="group relative mx-auto max-w-7xl overflow-hidden rounded-[4rem] bg-indigo-950 text-center text-white shadow-2xl">
        <div className="absolute inset-0 -z-0">
          <img
            src="/cta_bg_v2.png"
            alt="Premium Abstract Background"
            className="h-full w-full object-cover opacity-70 transition-transform duration-[2000ms] group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary via-primary/60 to-transparent backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative z-10 mx-auto max-w-4xl px-8 py-24 md:py-40">
          <h2
            id="cta-heading"
            className="font-display text-6xl font-black tracking-tighter sm:text-8xl md:text-9xl leading-[0.85]"
          >
            지금 <br /> <span className="text-accent italic">시작</span> 하세요
          </h2>
          <p className="mx-auto mt-12 max-w-xl text-lg font-bold tracking-tight text-white/60 sm:text-2xl">
            AI가 분석해 드리는 나만의 퍼스널 컬러와 가상 피팅을 무료로 체험해보세요.
          </p>
          <div className="mt-20 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                variant="white"
                size="lg"
                className="h-20 w-full rounded-[2rem] px-14 text-xl font-black text-primary transition-all hover:scale-105 active:scale-95"
              >
                {siteConfig.ctaLabel}
              </Button>
            </Link>
            <button
              type="button"
              className="h-20 w-full rounded-[2rem] border-2 border-white/10 bg-white/5 px-14 text-xl font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 active:scale-95 sm:w-auto"
            >
              커뮤니티 가입하기
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
