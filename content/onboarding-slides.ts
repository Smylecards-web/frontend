export type OnboardingSlideContent = {
  id: string;
  title: string;
  description: string;
};

export const ONBOARDING_TOTAL_STEPS = 3;

export const onboardingSlides: OnboardingSlideContent[] = [
  {
    id: "manage-events",
    title: "Manage your Events",
    description:
      "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  },
];
