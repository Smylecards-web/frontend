import type { StaticImageData } from "next/image";

import type { OnboardingSlideContent } from "@/content/onboarding-slides";

import { IllustrationFrame } from "./IllustrationFrame";
import { OnboardingCopy } from "./OnboardingCopy";
import { OnboardingDots } from "./OnboardingDots";
import { OnboardingHeader } from "./OnboardingHeader";
import { OnboardingShell } from "./OnboardingShell";

export type OnboardingSlideViewProps = {
  logo: StaticImageData;
  slide: OnboardingSlideContent;
  stepIndex: number;
  totalSteps: number;
};

export function OnboardingSlideView({
  logo,
  slide,
  stepIndex,
  totalSteps,
}: OnboardingSlideViewProps) {
  return (
    <OnboardingShell>
      <OnboardingHeader logo={logo} />
      <main className="flex min-h-0 flex-1 flex-col px-4">
        <div className="flex min-h-0 flex-1 flex-col items-center gap-8 pt-20">
          <IllustrationFrame />
          <OnboardingCopy title={slide.title} description={slide.description} />
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center gap-8 pt-40">
          <OnboardingDots total={totalSteps} activeIndex={stepIndex} />
        </div>
      </main>
    </OnboardingShell>
  );
}
