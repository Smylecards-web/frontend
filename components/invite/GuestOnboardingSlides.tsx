"use client";

import Image from "next/image";
import {
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
} from "react";

import logoFull from "@/assets/icons/Logo transparents (1).png";
import {
  appButtonPrimaryFull,
  appOnboardingBody,
  appOnboardingHeadline,
} from "@/lib/appUi";

export type GuestOnboardingSlide = {
  id: string;
  accentWord: string;
  bodyLine: string;
  background: {
    className?: string;
    style?: CSSProperties;
  };
};

type GuestOnboardingSlidesProps = {
  slides: readonly GuestOnboardingSlide[];
  scrollRef: RefObject<HTMLDivElement | null>;
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  isJoining: boolean;
  onSkip: () => void;
};

function OnboardingSlideBackground({
  background,
}: {
  background: GuestOnboardingSlide["background"];
}) {
  const hasImage = Boolean(background.style?.backgroundImage);
  return (
    <div
      className={
        hasImage
          ? "absolute inset-0 bg-cover bg-center bg-no-repeat"
          : `absolute inset-0 bg-gradient-to-br ${background.className ?? ""}`
      }
      style={background.style}
      aria-hidden
    />
  );
}

export function GuestOnboardingSlides({
  slides,
  scrollRef,
  activeIndex,
  onActiveIndexChange,
  isJoining,
  onSkip,
}: GuestOnboardingSlidesProps) {
  const syncIndexFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    const w = el.clientWidth;
    if (w <= 0) {
      return;
    }
    const i = Math.round(el.scrollLeft / w);
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    onActiveIndexChange(clamped);
  }, [onActiveIndexChange, scrollRef, slides.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }
    syncIndexFromScroll();
    el.addEventListener("scroll", syncIndexFromScroll, { passive: true });
    return () => el.removeEventListener("scroll", syncIndexFromScroll);
  }, [scrollRef, syncIndexFromScroll]);

  useEffect(() => {
    const onResize = () => syncIndexFromScroll();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [syncIndexFromScroll]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col bg-zinc-950">
      <div
        ref={scrollRef}
        className="flex min-h-0 w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex w-full min-w-full shrink-0 snap-center snap-always flex-col"
          >
            <OnboardingSlideBackground background={slide.background} />
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/75 to-zinc-950/20"
              aria-hidden
            />
            <div className="relative z-10 flex min-h-[100dvh] flex-col px-6 pb-44 pt-[max(3rem,env(safe-area-inset-top,0px))]">
              <div className="flex shrink-0 justify-center pb-10">
                <Image
                  src={logoFull}
                  alt="Smylecards"
                  className="h-9 w-auto max-w-[min(78vw,240px)] object-contain object-center sm:h-10"
                  priority
                  sizes="(max-width: 640px) 78vw, 240px"
                />
              </div>
              <div className="flex flex-1 flex-col justify-end gap-6">
                <div className="space-y-3">
                  <p className={appOnboardingHeadline}>{slide.accentWord}</p>
                  <p className={appOnboardingBody}>{slide.bodyLine}</p>
                </div>
                <div
                  className="flex w-full gap-1.5 pt-2"
                  role="tablist"
                  aria-label="Onboarding progress"
                >
                  {slides.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-selected={i === activeIndex}
                      className={`h-1 min-h-0 flex-1 rounded-full transition-colors duration-300 ${
                        i <= activeIndex ? "bg-step-active" : "bg-step-inactive"
                      }`}
                      onClick={() => {
                        const root = scrollRef.current;
                        if (!root) {
                          return;
                        }
                        root.scrollTo({
                          left: i * root.clientWidth,
                          behavior: "smooth",
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))] pt-6">
        <div className="pointer-events-auto w-full max-w-lg">
          <button
            type="button"
            disabled={isJoining}
            onClick={onSkip}
            className={appButtonPrimaryFull}
          >
            {isJoining ? "Joining…" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
