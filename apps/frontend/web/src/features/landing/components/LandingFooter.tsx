import { siteConfig } from '@/lib/constants/site-config';

export function LandingFooter() {
  return (
    <footer
      className="bg-foreground px-6 py-20 text-white md:py-32"
      role="contentinfo"
      aria-label="푸터"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-16 md:flex-row md:items-start">
        <div className="flex flex-col items-center gap-8 md:items-start">
          <span className="font-display text-4xl font-black tracking-tighter">
            <span className="text-gradient brightness-150">{siteConfig.brand}</span>
          </span>
          <p className="max-w-xs text-center text-lg font-bold leading-relaxed text-white/40 md:text-left">
            최첨단 AI 기술로 당신의 본연의 아름다움을 발견하고 가장 잘 어울리는 스타일을 제안합니다.
          </p>
        </div>
        <div className="flex flex-col items-center gap-12 md:items-end">
          <div className="flex gap-10">
            {['이용약관', '개인정보', '고객센터'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs font-black tracking-[0.2em] text-white/30 uppercase transition-all hover:text-white hover:tracking-[0.3em]"
              >
                {item}
              </a>
            ))}
          </div>
          <span className="text-[10px] font-black tracking-[0.4em] text-white/20 uppercase">
            {siteConfig.footer.copyright}
          </span>
        </div>
      </div>
    </footer>
  );
}
