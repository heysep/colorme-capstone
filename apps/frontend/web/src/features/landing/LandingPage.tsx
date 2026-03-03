import { LandingNavbar } from './components/LandingNavbar';
import { LandingHero } from './components/LandingHero';
import { LandingValueProp } from './components/LandingValueProp';
import { LandingFeatures } from './components/LandingFeatures';
import { LandingCta } from './components/LandingCta';
import { LandingFooter } from './components/LandingFooter';

export function LandingPage() {
  return (
    <>
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingValueProp />
        <LandingFeatures />
        <LandingCta />
        <LandingFooter />
      </main>
    </>
  );
}
