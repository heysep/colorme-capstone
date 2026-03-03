import { Palette, Shirt, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { siteConfig } from '@/lib/constants/site-config';

const featureIcons = [Palette, Shirt, Sparkles] as const;

export function LandingFeatures() {
  return (
    <section
      id="features"
      className="px-6 py-40 md:py-60"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-24 space-y-6 text-center">
          <span className="text-xs font-black tracking-[0.3em] text-primary uppercase">
            Core Features
          </span>
          <h2
            id="features-heading"
            className="font-display text-5xl font-black tracking-tighter text-foreground sm:text-7xl md:text-8xl"
            style={{ lineHeight: 1 }}
          >
            혁신적인 <span className="text-gradient">AI 경험</span>
          </h2>
        </div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.features.map((feature, index) => {
            const Icon = featureIcons[index];
            return (
              <div
                key={feature.title}
                className="group relative flex h-full flex-col overflow-hidden rounded-[3rem] glass transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={index === 0 ? "/personal_color_diagnosis_1771840981811.png" : index === 1 ? "/virtual_fitting_demo_1771841003290.png" : "/hero_ai_fashion_beauty_1771840966571.png"}
                    alt={feature.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-60" />
                </div>
                <div className="p-12 pt-8">
                  <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-primary/5 text-primary transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-8 w-8" aria-hidden />
                  </div>
                  <h3 className="font-display text-3xl font-black tracking-tight text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-6 flex-1 text-lg font-bold leading-relaxed text-muted">
                    {feature.description}
                  </p>
                  <div className="mt-12 flex items-center gap-3 text-sm font-black text-primary transition-all duration-300 group-hover:gap-5">
                    DETAILS <Sparkles className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
