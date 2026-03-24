import type { GuestOnboardingSlide } from "@/components/invite/GuestOnboardingSlides";

export const GUEST_ONBOARDING_SLIDES = [
  {
    id: "share",
    accentWord: "Share",
    bodyLine: "photos and videos with other guests",
    background: {
      className: "from-violet-950 via-zinc-900 to-zinc-950",
    },
  },
  {
    id: "help",
    accentWord: "Help",
    bodyLine: "creating an unforgettable event",
    background: {
      className: "from-fuchsia-950/80 via-zinc-900 to-zinc-950",
    },
  },
  {
    id: "create",
    accentWord: "Create",
    bodyLine: "wonderful gifts",
    background: {
      className: "from-rose-950/90 via-zinc-900 to-zinc-950",
    },
  },
] as const satisfies readonly GuestOnboardingSlide[];
