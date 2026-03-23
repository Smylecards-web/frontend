type OnboardingCopyProps = {
  title: string;
  description: string;
};

export function OnboardingCopy({ title, description }: OnboardingCopyProps) {
  return (
    <div className="flex max-w-md flex-col gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">
        {title}
      </h1>
      <p className="text-sm leading-relaxed text-white/95 sm:text-base">
        {description}
      </p>
    </div>
  );
}
