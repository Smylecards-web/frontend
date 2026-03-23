import Image, { type StaticImageData } from "next/image";

type OnboardingHeaderProps = {
  logo: StaticImageData;
  logoAlt?: string;
};

export function OnboardingHeader({
  logo,
  logoAlt = "Smylecards",
}: OnboardingHeaderProps) {
  return (
    <header className="flex shrink-0 justify-center pt-10 pb-6 sm:pt-12 sm:pb-8">
      <Image
        src={logo}
        alt={logoAlt}
        className="h-16 w-auto max-w-[min(92vw,320px)] object-contain sm:h-18"
        priority
        sizes="(max-width: 768px) 92vw, 320px"
      />
    </header>
  );
}
