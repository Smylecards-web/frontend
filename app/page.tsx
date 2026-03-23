import logoMark from "@/assets/icons/Logo transparents (1).png";
import { OnboardingSlideView } from "@/components/onboarding";
import {
  ONBOARDING_TOTAL_STEPS,
  onboardingSlides,
} from "@/content/onboarding-slides";

export default function Home() {
  const slide = onboardingSlides[0];

  return (
    <OnboardingSlideView
      logo={logoMark}
      slide={slide}
      stepIndex={0}
      totalSteps={ONBOARDING_TOTAL_STEPS}
    />
  );
}
