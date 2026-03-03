import { siteConfig } from '@/lib/constants/site-config';

export function LandingValueProp() {
  return (
    <section className="px-6 py-20" aria-labelledby="value-prop-heading">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[4rem] px-10 py-32 text-center md:py-48 shadow-2xl">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <img
            src="/value_prop_bg_v4.png"
            alt="Premium Abstract Silk"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/70 via-primary/20 to-transparent backdrop-blur-[0.5px]" />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative z-10 animate-reveal">
          <h2
            id="value-prop-heading"
            className="font-display text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl [text-shadow:0_4px_12px_rgba(0,0,0,0.3)]"
            style={{ lineHeight: 1 }}
          >
            나만의 컬러, <br /> 나만의 <span className="text-accent italic drop-shadow-sm">스타일</span>
          </h2>
          <p className="mx-auto mt-16 max-w-2xl text-lg font-bold tracking-tight text-white/95 sm:text-2xl [text-shadow:0_2px_8px_rgba(0,0,0,0.2)]">
            {siteConfig.valueProp}
          </p>
        </div>
      </div>
    </section>
  );
}
