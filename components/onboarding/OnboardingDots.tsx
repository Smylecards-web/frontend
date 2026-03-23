type OnboardingDotsProps = {
  total: number;
  activeIndex: number;
};

export function OnboardingDots({ total, activeIndex }: OnboardingDotsProps) {
  return (
    <nav
      className="flex shrink-0 justify-center gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4"
      aria-label="Onboarding steps"
    >
      {Array.from({ length: total }, (_, i) => {
        const active = i === activeIndex;
        return (
          <span
            key={i}
            className={
              active
                ? "h-2 w-2 rounded-full bg-white shadow-sm"
                : "h-2 w-2 rounded-full bg-white/35"
            }
            aria-current={active ? "step" : undefined}
          />
        );
      })}
    </nav>
  );
}
